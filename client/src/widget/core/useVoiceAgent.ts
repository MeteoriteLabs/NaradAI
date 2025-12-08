import { useState, useRef, useCallback, useEffect } from "react";
import type { VoiceAgentState, AgentConfig, WebSocketMessage } from "./types";
import type { LeadFormData } from "../LeadForm";
import { Step } from "react-joyride";

interface UseVoiceAgentOptions {
  agentId: string;
  websocketUrl: string;
  apiBase?: string;
  continuousListening?: boolean;
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
  continuousListening = true,
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
  const hasAutoStartedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isWidgetOpenRef = useRef(false);
  const recordingAbortedRef = useRef(false);

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
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    setAudioLevel(0);
  };

  const wsRef = useRef<WebSocket | null>(null);
  
  useEffect(() => {
    wsRef.current = ws;
  }, [ws]);

  const sendAudioToServer = (audioBlob: Blob) => {
    console.log('[Narada] Sending audio to server, size:', audioBlob.size);
    const reader = new FileReader();
    reader.onload = () => {
      const currentWs = wsRef.current;
      if (currentWs && currentWs.readyState === WebSocket.OPEN && reader.result) {
        const base64Audio = (reader.result as string).split(",")[1];
        console.log('[Narada] Sending audio data via WebSocket');
        currentWs.send(
          JSON.stringify({
            type: "audio",
            audioData: base64Audio,
          })
        );
      } else {
        console.error('[Narada] WebSocket not ready, state:', currentWs?.readyState);
      }
    };
    reader.onerror = (err) => {
      console.error('[Narada] FileReader error:', err);
    };
    reader.readAsDataURL(audioBlob);
  };

  const startContinuousRecording = useCallback(async () => {
    if (isRecording || streamRef.current) return;
    
    console.log('[Narada] Starting continuous recording...');
    recordingAbortedRef.current = false;
    setIsRecording(true);
    setTranscript(undefined);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recordingAbortedRef.current || !isWidgetOpenRef.current) {
        console.log('[Narada] Recording aborted during getUserMedia, stopping stream');
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        return;
      }
      
      streamRef.current = stream;
      console.log('[Narada] Microphone access granted for continuous listening');
      startAudioVisualization(stream);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/wav';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Send each audio chunk immediately as it becomes available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const audioBlob = new Blob([event.data], { type: mimeType });
          console.log('[Narada] Sending audio chunk, size:', audioBlob.size);
          sendAudioToServer(audioBlob);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[Narada] MediaRecorder stopped');
      };

      mediaRecorder.onerror = (event) => {
        console.error('[Narada] MediaRecorder error:', event);
      };

      // Send audio chunks every 3 seconds for continuous processing
      mediaRecorder.start(3000);
      console.log('[Narada] Continuous recording started');
    } catch (error) {
      console.error("[Narada] Error accessing microphone:", error);
      setIsRecording(false);
      stopAudioVisualization();
    }
  }, [isRecording]);

  const stopContinuousRecording = useCallback(() => {
    console.log('[Narada] Stopping continuous recording...');
    recordingAbortedRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
    stopAudioVisualization();
  }, []);

  const toggleRecording = useCallback(async () => {
    console.log('[Narada] Toggle recording, current state:', isRecording);
    
    if (isRecording) {
      stopContinuousRecording();
    } else {
      await startContinuousRecording();
    }
  }, [isRecording, startContinuousRecording, stopContinuousRecording]);

  const openWidget = useCallback(() => {
    isWidgetOpenRef.current = true;
    setIsOpen(true);
  }, []);

  const closeWidget = useCallback(() => {
    isWidgetOpenRef.current = false;
    setIsOpen(false);
    stopContinuousRecording();
    hasAutoStartedRef.current = false;
  }, [stopContinuousRecording]);

  useEffect(() => {
    return () => {
      stopContinuousRecording();
    };
  }, [stopContinuousRecording]);

  // Auto-start continuous recording when widget opens
  useEffect(() => {
    if (isOpen && isConnected && continuousListening && !hasAutoStartedRef.current && !isRecording) {
      hasAutoStartedRef.current = true;
      console.log('[Narada] Auto-starting continuous listening...');
      startContinuousRecording();
    }
  }, [isOpen, isConnected, continuousListening, isRecording, startContinuousRecording]);

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
