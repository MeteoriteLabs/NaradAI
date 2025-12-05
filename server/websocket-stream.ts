import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";
import { storage } from "./storage";

const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";

interface StreamingClient extends WebSocket {
  agentId?: string;
  openaiWs?: WebSocket;
  context?: {
    url?: string;
    userAgent?: string;
  };
}

export function setupStreamingWebSocket(server: Server) {
  const wss = new WebSocketServer({ 
    noServer: true,
  });

  console.log("[Stream] WebSocket server initialized on /ws-stream");

  // Handle upgrade requests explicitly
  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
    
    if (pathname === "/ws-stream") {
      console.log("[Stream] Upgrade request for /ws-stream");
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
    // Let other upgrade requests (like Vite HMR) pass through
  });

  wss.on("connection", (clientWs: StreamingClient, req) => {
    console.log("[Stream] New client connection from:", req.url);

    clientWs.on("message", async (data: Buffer | ArrayBuffer) => {
      // Check if binary (audio data) or text (JSON message)
      if (data instanceof Buffer && !isJsonMessage(data)) {
        // Binary audio data - forward to OpenAI
        handleAudioData(clientWs, data);
      } else {
        // JSON message
        try {
          const message = JSON.parse(data.toString());
          await handleClientMessage(clientWs, message);
        } catch (error) {
          console.error("[Stream] Failed to parse message:", error);
          sendError(clientWs, "Invalid message format");
        }
      }
    });

    clientWs.on("close", () => {
      console.log("[Stream] Client disconnected");
      // Close OpenAI connection if exists
      if (clientWs.openaiWs) {
        clientWs.openaiWs.close();
      }
    });

    clientWs.on("error", (error) => {
      console.error("[Stream] Client WebSocket error:", error);
    });
  });

  return wss;
}

function isJsonMessage(data: Buffer): boolean {
  try {
    const str = data.toString();
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

async function handleClientMessage(clientWs: StreamingClient, message: any) {
  console.log("[Stream] Client message:", message.type);

  switch (message.type) {
    case "session.init":
      await initSession(clientWs, message);
      break;

    case "input_audio.start":
      // Client started streaming audio
      if (clientWs.openaiWs?.readyState === WebSocket.OPEN) {
        console.log("[Stream] Client started audio input");
      }
      break;

    case "input_audio.commit":
      // Client finished speaking, commit the audio buffer
      if (clientWs.openaiWs?.readyState === WebSocket.OPEN) {
        clientWs.openaiWs.send(JSON.stringify({
          type: "input_audio_buffer.commit"
        }));
        console.log("[Stream] Committed audio buffer");
      }
      break;

    case "response.cancel":
      // Client interrupted the AI response
      if (clientWs.openaiWs?.readyState === WebSocket.OPEN) {
        clientWs.openaiWs.send(JSON.stringify({
          type: "response.cancel"
        }));
        clientWs.openaiWs.send(JSON.stringify({
          type: "input_audio_buffer.clear"
        }));
        console.log("[Stream] Cancelled response and cleared buffer");
      }
      break;

    default:
      console.warn("[Stream] Unknown message type:", message.type);
  }
}

async function initSession(clientWs: StreamingClient, message: any) {
  const { agentId, context } = message;
  clientWs.agentId = agentId;
  clientWs.context = context;

  console.log("[Stream] Initializing session for agent:", agentId);

  // Get agent info
  const agent = await storage.getAgent(agentId);
  if (!agent) {
    sendError(clientWs, "Agent not found");
    return;
  }

  // Get knowledge base for context
  const knowledge = await storage.getKnowledgeItems(agentId);
  const flows = await storage.getFlows(agentId);

  // Build system instructions
  const systemInstructions = buildSystemInstructions(agent, knowledge, flows, context);

  // Connect to OpenAI Realtime API
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    sendError(clientWs, "OpenAI API key not configured");
    return;
  }

  try {
    const openaiWs = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    clientWs.openaiWs = openaiWs;

    openaiWs.on("open", () => {
      console.log("[Stream] Connected to OpenAI Realtime API");

      // Configure the session
      openaiWs.send(JSON.stringify({
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: systemInstructions,
          voice: mapVoiceStyle(agent.voiceStyle),
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          tools: [
            {
              type: "function",
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
              type: "function",
              name: "capture_lead",
              description: "Capture user contact information",
              parameters: {
                type: "object",
                properties: {},
              },
            },
          ],
        },
      }));

      // Notify client that session is ready
      clientWs.send(JSON.stringify({
        type: "session.ready",
        agent: {
          id: agent.id,
          name: agent.name,
        },
      }));
    });

    openaiWs.on("message", (data) => {
      handleOpenAIMessage(clientWs, data.toString(), agent, flows);
    });

    openaiWs.on("error", (error) => {
      console.error("[Stream] OpenAI WebSocket error:", error);
      sendError(clientWs, "Connection to AI service failed");
    });

    openaiWs.on("close", () => {
      console.log("[Stream] OpenAI WebSocket closed");
    });

  } catch (error) {
    console.error("[Stream] Failed to connect to OpenAI:", error);
    sendError(clientWs, "Failed to connect to AI service");
  }
}

function handleAudioData(clientWs: StreamingClient, audioData: Buffer) {
  if (!clientWs.openaiWs || clientWs.openaiWs.readyState !== WebSocket.OPEN) {
    return;
  }

  // Convert to base64 and send to OpenAI
  const base64Audio = audioData.toString("base64");
  
  clientWs.openaiWs.send(JSON.stringify({
    type: "input_audio_buffer.append",
    audio: base64Audio,
  }));
}

async function handleOpenAIMessage(
  clientWs: StreamingClient,
  data: string,
  agent: any,
  flows: any[]
) {
  try {
    const event = JSON.parse(data);
    
    switch (event.type) {
      case "session.created":
        console.log("[Stream] OpenAI session created");
        break;

      case "session.updated":
        console.log("[Stream] OpenAI session updated");
        break;

      case "input_audio_buffer.speech_started":
        console.log("[Stream] User started speaking");
        clientWs.send(JSON.stringify({ type: "user.speaking_start" }));
        break;

      case "input_audio_buffer.speech_stopped":
        console.log("[Stream] User stopped speaking");
        clientWs.send(JSON.stringify({ type: "user.speaking_stop" }));
        break;

      case "conversation.item.input_audio_transcription.completed":
        // Send partial/final transcript to client
        if (event.transcript) {
          clientWs.send(JSON.stringify({
            type: "transcript.final",
            text: event.transcript,
          }));
        }
        break;

      case "response.audio_transcript.delta":
        // AI response text delta
        if (event.delta) {
          clientWs.send(JSON.stringify({
            type: "response.text.delta",
            text: event.delta,
          }));
        }
        break;

      case "response.audio_transcript.done":
        // Full AI response text
        if (event.transcript) {
          clientWs.send(JSON.stringify({
            type: "response.text",
            text: event.transcript,
          }));
        }
        break;

      case "response.audio.delta":
        // Audio chunk from AI - send as binary
        if (event.delta) {
          const audioBuffer = Buffer.from(event.delta, "base64");
          clientWs.send(audioBuffer);
        }
        break;

      case "response.created":
        clientWs.send(JSON.stringify({ type: "response.start" }));
        break;

      case "response.done":
        clientWs.send(JSON.stringify({ type: "response.end" }));
        
        // Log conversation
        if (clientWs.agentId && event.response?.output) {
          const transcripts: any[] = [];
          for (const output of event.response.output) {
            if (output.type === "message" && output.content) {
              for (const content of output.content) {
                if (content.transcript) {
                  transcripts.push({
                    role: output.role,
                    text: content.transcript,
                    timestamp: new Date().toISOString(),
                  });
                }
              }
            }
          }
          if (transcripts.length > 0) {
            await storage.createConversation({
              agentId: clientWs.agentId,
              transcript: transcripts,
            });
          }
        }
        break;

      case "response.function_call_arguments.done":
        // Handle function calls
        await handleFunctionCall(clientWs, event, agent, flows);
        break;

      case "error":
        console.error("[Stream] OpenAI error:", event.error);
        sendError(clientWs, event.error?.message || "AI service error");
        break;

      default:
        // Log other events for debugging
        if (event.type && !event.type.startsWith("rate_limits")) {
          console.log("[Stream] OpenAI event:", event.type);
        }
    }
  } catch (error) {
    console.error("[Stream] Failed to handle OpenAI message:", error);
  }
}

async function handleFunctionCall(
  clientWs: StreamingClient,
  event: any,
  agent: any,
  flows: any[]
) {
  const functionName = event.name;
  const callId = event.call_id;
  
  let args: any = {};
  try {
    args = JSON.parse(event.arguments || "{}");
  } catch (e) {
    console.error("[Stream] Failed to parse function arguments");
  }

  console.log("[Stream] Function call:", functionName, args);

  let result: any;

  switch (functionName) {
    case "start_flow": {
      const flowName = args.flow_name;
      const flow = flows.find(
        (f) => f.name.toLowerCase() === flowName?.toLowerCase()
      );

      if (flow) {
        const steps = await storage.getSteps(flow.id);
        
        if (steps.length === 0) {
          result = { success: false, message: `Flow "${flowName}" has no steps.` };
        } else {
          clientWs.send(JSON.stringify({
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
          }));

          result = {
            success: true,
            message: `Started "${flow.name}" tour with ${steps.length} steps.`,
          };
        }
      } else {
        result = {
          success: false,
          message: `Flow "${flowName}" not found.`,
        };
      }
      break;
    }

    case "capture_lead": {
      clientWs.send(JSON.stringify({ type: "capture_lead" }));
      result = { success: true, message: "Lead capture form displayed." };
      break;
    }

    default:
      result = { success: false, message: "Unknown function" };
  }

  // Send function result back to OpenAI
  if (clientWs.openaiWs?.readyState === WebSocket.OPEN) {
    clientWs.openaiWs.send(JSON.stringify({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(result),
      },
    }));

    // Trigger response generation
    clientWs.openaiWs.send(JSON.stringify({
      type: "response.create",
    }));
  }
}

function buildSystemInstructions(
  agent: any,
  knowledge: any[],
  flows: any[],
  context?: any
): string {
  let instructions = `You are ${agent.name}, a helpful voice AI assistant.`;
  
  if (agent.persona) {
    instructions += ` ${agent.persona}`;
  }

  instructions += "\n\nSpeak naturally and conversationally. Keep responses concise and helpful.";

  if (knowledge.length > 0) {
    instructions += "\n\nKnowledge Base:\n";
    knowledge.forEach((item) => {
      instructions += `Q: ${item.question}\nA: ${item.answer}\n\n`;
    });
  }

  if (flows.length > 0) {
    instructions += "\n\nAvailable Guided Tours:\n";
    flows.forEach((flow) => {
      instructions += `- ${flow.name}: ${flow.pageUrl || "General tour"}\n`;
    });
    instructions += "\nYou can start a tour by calling start_flow with the flow name when users ask for help navigating.";
  }

  if (context?.url) {
    instructions += `\n\nUser is currently on: ${context.url}`;
  }

  instructions += "\n\nYou can capture leads by calling capture_lead when users want to connect or get more information.";

  return instructions;
}

function mapVoiceStyle(voiceStyle?: string | null): string {
  // Map TTS voices to Realtime API voices
  const voiceMap: Record<string, string> = {
    alloy: "alloy",
    echo: "echo",
    fable: "fable",
    onyx: "onyx",
    nova: "nova",
    shimmer: "shimmer",
  };
  return voiceMap[voiceStyle || "alloy"] || "alloy";
}

function sendError(clientWs: StreamingClient, message: string) {
  clientWs.send(JSON.stringify({
    type: "error",
    message,
  }));
}
