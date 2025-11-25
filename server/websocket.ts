import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface WebSocketClient extends WebSocket {
  agentId?: string;
  context?: {
    url?: string;
    userAgent?: string;
    eventTags?: string[];
  };
  conversationHistory?: ChatCompletionMessageParam[];
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocketClient) => {
    console.log("New WebSocket connection");
    ws.conversationHistory = [];

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        await handleMessage(ws, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Failed to process message",
          })
        );
      }
    });

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}

async function handleMessage(ws: WebSocketClient, message: any) {
  switch (message.type) {
    case "init":
      await handleInit(ws, message);
      break;
    case "message":
      await handleChatMessage(ws, message);
      break;
    case "audio":
      await handleAudioMessage(ws, message);
      break;
    case "lead_captured":
      await handleLeadCaptured(ws, message);
      break;
    case "step_completed":
      await handleStepCompleted(ws, message);
      break;
    default:
      console.warn("Unknown message type:", message.type);
  }
}

async function handleInit(ws: WebSocketClient, message: any) {
  const { agentId, context } = message;
  ws.agentId = agentId;
  ws.context = context;
  ws.conversationHistory = [];

  const agent = await storage.getAgent(agentId);
  if (!agent) {
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Agent not found",
      })
    );
    return;
  }

  ws.send(
    JSON.stringify({
      type: "connected",
      agent: {
        id: agent.id,
        name: agent.name,
      },
    })
  );

  await sendGreeting(ws, agent);
}

async function sendGreeting(ws: WebSocketClient, agent: any) {
  if (!ws.agentId) return;

  const knowledge = await storage.getKnowledgeItems(ws.agentId);
  const flows = await storage.getFlows(ws.agentId);

  const systemPrompt = buildSystemPrompt(agent, knowledge, flows, ws.context);

  ws.conversationHistory = [
    { role: "system", content: systemPrompt },
  ];

  const greeting = `Hi! I'm ${agent.name}. How can I help you today?`;

  ws.send(
    JSON.stringify({
      type: "message",
      content: greeting,
    })
  );

  ws.conversationHistory.push({
    role: "assistant",
    content: greeting,
  });
}

function buildSystemPrompt(
  agent: any,
  knowledge: any[],
  flows: any[],
  context?: any
): string {
  let systemPrompt = `You are ${agent.name}, an AI assistant.`;
  if (agent.persona) {
    systemPrompt += `\n\nPersona: ${agent.persona}`;
  }

  if (knowledge.length > 0) {
    systemPrompt += `\n\nKnowledge Base:\n`;
    knowledge.forEach((item) => {
      systemPrompt += `Q: ${item.question}\nA: ${item.answer}\n\n`;
    });
  }

  if (flows.length > 0) {
    systemPrompt += `\n\nAvailable Guided Tours:\n`;
    flows.forEach((flow) => {
      systemPrompt += `- ${flow.name}: ${flow.pageUrl || "General tour"}\n`;
    });
  }

  if (context?.url) {
    systemPrompt += `\n\nUser is currently on: ${context.url}`;
  }

  systemPrompt += `\n\nYou have access to the following functions:
- start_flow(flow_name): Start a guided tour for the user
- capture_lead(): Prompt the user to provide their contact information`;

  return systemPrompt;
}

async function handleChatMessage(ws: WebSocketClient, message: any) {
  if (!ws.agentId || !ws.conversationHistory) {
    return;
  }

  const agent = await storage.getAgent(ws.agentId);
  if (!agent) {
    return;
  }

  ws.conversationHistory.push({
    role: "user",
    content: message.content,
  });

  try {
    const flows = await storage.getFlows(ws.agentId);
    await processOpenAIResponse(ws, flows, agent);
  } catch (error) {
    console.error("OpenAI API error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to generate response",
      })
    );
  }
}

async function processOpenAIResponse(
  ws: WebSocketClient,
  flows: any[],
  agent: any
) {
  if (!ws.conversationHistory) return;

  while (true) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: ws.conversationHistory,
      functions: [
        {
          name: "start_flow",
          description: "Start a guided product tour or walkthrough flow",
          parameters: {
            type: "object",
            properties: {
              flow_name: {
                type: "string",
                description: "Name of the flow to start",
              },
            },
            required: ["flow_name"],
          },
        },
        {
          name: "capture_lead",
          description: "Capture user contact information",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      ],
      function_call: "auto",
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.function_call) {
      ws.conversationHistory.push({
        role: "assistant",
        content: null,
        function_call: responseMessage.function_call,
      });

      const functionResult = await executeFunctionCall(
        ws,
        responseMessage.function_call,
        flows,
        agent
      );

      ws.conversationHistory.push({
        role: "function",
        name: responseMessage.function_call.name,
        content: JSON.stringify(functionResult),
      });

      continue;
    } else if (responseMessage.content) {
      ws.send(
        JSON.stringify({
          type: "message",
          content: responseMessage.content,
        })
      );

      ws.conversationHistory.push({
        role: "assistant",
        content: responseMessage.content,
      });

      if (ws.agentId && ws.conversationHistory.length > 2) {
        const userMessages = ws.conversationHistory.filter(
          (m) => m.role === "user"
        );
        const lastUserMessage = userMessages[userMessages.length - 1];
        await storage.createConversation({
          agentId: ws.agentId,
          userMessage: (lastUserMessage?.content as string) || "",
          agentResponse: responseMessage.content,
        });
      }

      break;
    } else {
      break;
    }
  }
}

async function executeFunctionCall(
  ws: WebSocketClient,
  functionCall: any,
  flows: any[],
  agent: any
): Promise<any> {
  const functionName = functionCall.name;
  const args = JSON.parse(functionCall.arguments);

  switch (functionName) {
    case "start_flow": {
      const flowName = args.flow_name;
      const flow = flows.find(
        (f) => f.name.toLowerCase() === flowName.toLowerCase()
      );

      if (flow) {
        const steps = await storage.getSteps(flow.id);
        
        if (steps.length === 0) {
          return {
            success: false,
            message: `Flow "${flowName}" has no steps configured.`,
          };
        }

        ws.send(
          JSON.stringify({
            type: "start_flow",
            flowId: flow.id,
            flowName: flow.name,
            steps: steps.map((step) => ({
              id: step.id,
              selector: step.selector,
              title: step.title,
              tooltip_text: step.tooltipText,
              voice_script: step.voiceScript,
            })),
          })
        );

        if (ws.agentId) {
          await storage.createConversation({
            agentId: ws.agentId,
            userMessage: "Start flow: " + flowName,
            agentResponse: `Started flow: ${flow.name}`,
            flowsTriggered: [flow.id],
          });
        }

        return {
          success: true,
          message: `Started flow: ${flow.name}`,
          steps: steps.length,
        };
      } else {
        return {
          success: false,
          message: `Flow "${flowName}" not found. Available flows: ${flows
            .map((f) => f.name)
            .join(", ")}`,
        };
      }
    }

    case "capture_lead": {
      ws.send(
        JSON.stringify({
          type: "capture_lead",
        })
      );

      return {
        success: true,
        message: "Lead capture form opened",
      };
    }

    default:
      return {
        success: false,
        message: "Unknown function",
      };
  }
}

async function handleAudioMessage(ws: WebSocketClient, message: any) {
  if (!ws.agentId) {
    return;
  }

  try {
    const audioBuffer = Buffer.from(message.audioData, "base64");
    
    const audioBlob = new Blob([audioBuffer], { type: "audio/wav" });
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    ws.send(
      JSON.stringify({
        type: "transcription",
        text: transcription.text,
      })
    );

    await handleChatMessage(ws, {
      type: "message",
      content: transcription.text,
    });
  } catch (error) {
    console.error("Audio transcription error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to process audio",
      })
    );
  }
}

async function handleLeadCaptured(ws: WebSocketClient, message: any) {
  if (!ws.agentId) {
    return;
  }

  const { leadData } = message;

  try {
    await storage.createLead({
      agentId: ws.agentId,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone || "",
      notes: leadData.notes || "",
      source: ws.context?.url || "widget",
    });

    ws.send(
      JSON.stringify({
        type: "lead_captured_success",
      })
    );

    ws.send(
      JSON.stringify({
        type: "message",
        content: "Thank you! Your information has been received. We'll get back to you soon!",
      })
    );

    if (ws.conversationHistory) {
      ws.conversationHistory.push({
        role: "assistant",
        content: "Lead information captured successfully.",
      });
    }
  } catch (error) {
    console.error("Lead capture error:", error);
    ws.send(
      JSON.stringify({
        type: "error",
        message: "Failed to capture lead",
      })
    );
  }
}

async function handleStepCompleted(ws: WebSocketClient, message: any) {
  console.log("Step completed:", message.stepIndex);
}
