import { useState, useRef, useCallback, useEffect } from "react";
import type { VoiceAgentState, AgentConfig, WebSocketMessage } from "./types";
import type { LeadFormData } from "../LeadForm";
import { Step } from "react-joyride";

interface UseVoiceAgentOptions {
  agentId: string;
  websocketUrl: string;
  apiBase?: string;
  onFlowStart?: (steps: Step[]) => void;
  onLeadCapture?: () => void;
}

interface UseVoiceAgentReturn extends VoiceAgentState {
  agentData: AgentConfig | null;
  toggleRecording: () => Promise<void>;
  openWidget: () => void;
  closeWidget: () => void;
  sendMessage: (message: string) => void;
  isLeadFormOpen: boolean;
  setIsLeadFormOpen: (open: boolean) => void;
  joyrideSteps: Step[];
  runJoyride: boolean;
  handleFlowComplete: () => void;
  handleStepChange: (index: number) => void;
  submitLead: (data: LeadFormData) => void;
}

export function useVoiceAgent({
  agentId,
  websocketUrl,
  apiBase = '',
  onFlowStart,
  onLeadCapture,
}: UseVoiceAgentOptions): UseVoiceAgentReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<string | undefined>();
  const [agentData, setAgentData] = useState<AgentConfig | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [joyrideSteps, setJoyrideSteps] = useState<Step[]>([]);
  const [runJoyride, setRunJoyride] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Use public widget endpoint for agent config
    const agentUrl = apiBase ? `${apiBase}/api/widget/agents/${agentId}` : `/api/widget/agents/${agentId}`;
    fetch(agentUrl)
      .then((res) => res.json())
      .then((data) => setAgentData(data))
      .catch((err) => console.error("Failed to fetch agent:", err));
  }, [agentId, apiBase]);

  const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
    switch (data.type) {
      case "message":
        setTranscript(data.content);
        setTimeout(() => setTranscript(undefined), 5000);
        break;
      case "start_flow":
        if (data.steps) {
          const steps: Step[] = data.steps.map((step, index) => ({
            target: step.selector,
            content: step.tooltip_text || step.title || "",
            title: step.title,
            placement: "auto" as const,
            disableBeacon: index === 0,
          }));
          setJoyrideSteps(steps);
          setRunJoyride(true);
          onFlowStart?.(steps);
        }
        break;
      case "capture_lead":
        setIsLeadFormOpen(true);
        onLeadCapture?.();
        break;
      case "audio":
        playAudio(data.audioData || "", data.format || "wav");
        break;
      case "speaking_start":
        setIsSpeaking(true);
        setIsPlaying(true);
        break;
      case "speaking_end":
        setIsSpeaking(false);
        setIsPlaying(false);
        break;
      case "connected":
        console.log("Connected to voice agent:", data.agent?.name);
        break;
    }
  }, [onFlowStart, onLeadCapture]);

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
  }, [agentData, agentId, websocketUrl, handleWebSocketMessage]);

  const playAudio = (base64Audio: string, format: string = "wav") => {
    setIsPlaying(true);
    setIsSpeaking(true);
    const mimeType = format === "mp3" ? "audio/mpeg" : "audio/wav";
    const audio = new Audio(`data:${mimeType};base64,${base64Audio}`);
    audio.onended = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
    };
    audio.play().catch((err) => {
      console.error("Audio playback error:", err);
      setIsPlaying(false);
      setIsSpeaking(false);
    });
  };

  const startAudioVisualization = (stream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const updateLevel = () => {
      if (!analyserRef.current) return;

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  };

  const stopAudioVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
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

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      stopAudioVisualization();
    } else {
      setIsRecording(true);
      setTranscript(undefined);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        startAudioVisualization(stream);

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        const audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          sendAudioToServer(audioBlob);
          stream.getTracks().forEach((track) => track.stop());
          stopAudioVisualization();
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
        stopAudioVisualization();
      }
    }
  }, [isRecording, ws, isConnected]);

  const openWidget = useCallback(() => setIsOpen(true), []);

  const closeWidget = useCallback(() => {
    setIsOpen(false);
    if (isRecording) {
      toggleRecording();
    }
  }, [isRecording, toggleRecording]);

  const sendMessage = useCallback(
    (message: string) => {
      if (ws && isConnected) {
        ws.send(
          JSON.stringify({
            type: "text",
            content: message,
          })
        );
      }
    },
    [ws, isConnected]
  );

  const handleFlowComplete = useCallback(() => {
    setRunJoyride(false);
    setTranscript("Great! You've completed the guided tour.");
    setTimeout(() => setTranscript(undefined), 3000);
  }, []);

  const handleStepChange = useCallback(
    (index: number) => {
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
    },
    [joyrideSteps, ws, isConnected]
  );

  const submitLead = useCallback(
    (data: LeadFormData) => {
      if (ws && isConnected) {
        ws.send(
          JSON.stringify({
            type: "lead_captured",
            leadData: data,
          })
        );
      }
      setIsLeadFormOpen(false);
      setTranscript("Thank you! We'll get back to you soon.");
      setTimeout(() => setTranscript(undefined), 3000);
    },
    [ws, isConnected]
  );

  return {
    isOpen,
    isRecording,
    isPlaying,
    isSpeaking,
    isConnected,
    audioLevel,
    transcript,
    agentData,
    toggleRecording,
    openWidget,
    closeWidget,
    sendMessage,
    isLeadFormOpen,
    setIsLeadFormOpen,
    joyrideSteps,
    runJoyride,
    handleFlowComplete,
    handleStepChange,
    submitLead,
  };
}
