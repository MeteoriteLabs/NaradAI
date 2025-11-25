import { useState, useEffect, useCallback } from "react";
import { FloatingAvatar } from "./FloatingAvatar";
import { ChatInterface, Message } from "./ChatInterface";
import { LeadForm, LeadFormData } from "./LeadForm";
import { JoyrideFlowWrapper } from "./JoyrideFlowWrapper";
import { Step } from "react-joyride";

interface WidgetProps {
  agentId: string;
  websocketUrl: string;
}

export function Widget({ agentId, websocketUrl }: WidgetProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [joyrideSteps, setJoyrideSteps] = useState<Step[]>([]);
  const [runJoyride, setRunJoyride] = useState(false);

  // Fetch agent data
  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then((res) => res.json())
      .then((data) => setAgentData(data))
      .catch((err) => console.error("Failed to fetch agent:", err));
  }, [agentId]);

  // WebSocket connection
  useEffect(() => {
    if (!agentData) return;

    const websocket = new WebSocket(websocketUrl);

    websocket.onopen = () => {
      setIsConnected(true);
      websocket.send(
        JSON.stringify({
          type: "init",
          agentId,
          context: {
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
        })
      );
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onclose = () => {
      setIsConnected(false);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [agentData, agentId, websocketUrl]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case "message":
        addMessage("assistant", data.content);
        break;
      case "start_flow":
        if (data.steps) {
          const steps: Step[] = data.steps.map((step: any, index: number) => ({
            target: step.selector,
            content: step.tooltip_text || step.title,
            title: step.title,
            placement: "auto" as const,
            disableBeacon: index === 0,
          }));
          setJoyrideSteps(steps);
          setRunJoyride(true);
        }
        break;
      case "capture_lead":
        setIsLeadFormOpen(true);
        break;
      case "audio":
        playAudio(data.audioData);
        break;
    }
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (content: string) => {
    addMessage("user", content);
    if (ws && isConnected) {
      ws.send(
        JSON.stringify({
          type: "message",
          content,
        })
      );
    }
  };

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          sendAudioToServer(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();

        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 10000);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setIsRecording(false);
      }
    }
  };

  const sendAudioToServer = (audioBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (ws && isConnected && reader.result) {
        const base64Audio = (reader.result as string).split(",")[1];
        ws.send(
          JSON.stringify({
            type: "audio",
            audioData: base64Audio,
          })
        );
      }
    };
    reader.readAsDataURL(audioBlob);
  };

  const playAudio = (base64Audio: string) => {
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audio.play();
  };

  const handleLeadSubmit = (data: LeadFormData) => {
    if (ws && isConnected) {
      ws.send(
        JSON.stringify({
          type: "lead_captured",
          leadData: data,
        })
      );
    }
    setIsLeadFormOpen(false);
    addMessage("assistant", "Thank you! We'll get back to you soon.");
  };

  const handleFlowComplete = () => {
    setRunJoyride(false);
    addMessage("assistant", "Great! You've completed the guided tour.");
  };

  const handleStepChange = (index: number) => {
    if (joyrideSteps[index]?.title) {
      if (ws && isConnected) {
        ws.send(
          JSON.stringify({
            type: "step_completed",
            stepIndex: index - 1,
          })
        );
      }
    }
  };

  if (!agentData) {
    return null;
  }

  return (
    <>
      <FloatingAvatar
        isOpen={isChatOpen || isLeadFormOpen}
        onToggle={() => {
          setIsChatOpen(!isChatOpen);
          setIsLeadFormOpen(false);
        }}
        isRecording={isRecording}
        onRecordToggle={handleRecordToggle}
        agentName={agentData.name}
      />

      {isChatOpen && !isLeadFormOpen && (
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          agentName={agentData.name}
        />
      )}

      {isLeadFormOpen && (
        <LeadForm
          onSubmit={handleLeadSubmit}
          onClose={() => setIsLeadFormOpen(false)}
        />
      )}

      {runJoyride && (
        <JoyrideFlowWrapper
          steps={joyrideSteps}
          onFlowComplete={handleFlowComplete}
          onStepChange={handleStepChange}
          run={runJoyride}
        />
      )}
    </>
  );
}
