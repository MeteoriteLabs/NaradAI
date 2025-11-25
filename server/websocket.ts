import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { storage } from "./storage";
import OpenAI, { toFile } from "openai";
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
  lastUserMessage?: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocketClient) => {
    console.log("New WebSocket connection");
    ws.conversationHistory = [];
    ws.lastUserMessage = undefined;

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

  await storage.createConversation({
    agentId: ws.agentId,
    userMessage: "[Widget Connected]",
    agentResponse: greeting,
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

  ws.lastUserMessage = message.content;

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
      model: "gpt-3.5-turbo-0125",
      messages: ws.conversationHistory,
      tools: [
        {
          type: "function",
          function: {
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
        },
        {
          type: "function",
          function: {
            name: "capture_lead",
            description: "Capture user contact information",
            parameters: {
              type: "object",
              properties: {},
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const responseMessage = completion.choices[0].message;

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      ws.conversationHistory.push({
        role: "assistant",
        content: responseMessage.content,
        tool_calls: responseMessage.tool_calls,
      });

      for (const toolCall of responseMessage.tool_calls) {
        const functionResult = await executeFunctionCall(
          ws,
          {
            name: toolCall.function.name,
            arguments: toolCall.function.arguments,
          },
          flows,
          agent
        );

        ws.conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(functionResult),
        });
      }

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

      if (ws.agentId && ws.lastUserMessage) {
        await storage.createConversation({
          agentId: ws.agentId,
          userMessage: ws.lastUserMessage,
          agentResponse: responseMessage.content,
        });
        ws.lastUserMessage = undefined;
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
  let args;
  
  try {
    args = JSON.parse(functionCall.arguments);
  } catch (error) {
    return {
      success: false,
      message: "Invalid function arguments",
    };
  }

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

        return {
          success: true,
          message: `Successfully started the "${flow.name}" guided tour with ${steps.length} steps. The user can now see the interactive walkthrough.`,
          flowId: flow.id,
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
        message: "Lead capture form has been displayed to the user. They can now provide their contact information.",
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
    
    const audioFile = await toFile(audioBuffer, "widget-audio.webm", {
      type: "audio/webm",
    });

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
  if (!ws.agentId || !ws.conversationHistory) {
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

    const formSubmissionMessage = `[User submitted lead form: Name: ${leadData.name}, Email provided]`;
    
    ws.conversationHistory.push({
      role: "user",
      content: formSubmissionMessage,
    });

    ws.send(
      JSON.stringify({
        type: "lead_captured_success",
      })
    );

    const confirmationMessage = `Thank you, ${leadData.name}! Your information has been received. We'll get back to you soon!`;

    ws.send(
      JSON.stringify({
        type: "message",
        content: confirmationMessage,
      })
    );

    ws.conversationHistory.push({
      role: "assistant",
      content: confirmationMessage,
    });

    const originalUserMessage = ws.lastUserMessage || "User requested to connect";
    
    await storage.createConversation({
      agentId: ws.agentId,
      userMessage: originalUserMessage,
      agentResponse: confirmationMessage,
    });
    
    ws.lastUserMessage = undefined;
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
