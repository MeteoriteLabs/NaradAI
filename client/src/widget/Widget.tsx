import { useState, useEffect, useRef } from "react";
import { VoiceBar, VoiceBarTrigger } from "./VoiceBar";
import { LeadForm, LeadFormData } from "./LeadForm";
import { JoyrideFlowWrapper } from "./JoyrideFlowWrapper";
import { Step } from "react-joyride";

interface WidgetProps {
  agentId: string;
  websocketUrl: string;
}

export function Widget({ agentId, websocketUrl }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [agentData, setAgentData] = useState<any>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [joyrideSteps, setJoyrideSteps] = useState<Step[]>([]);
  const [runJoyride, setRunJoyride] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then((res) => res.json())
      .then((data) => setAgentData(data))
      .catch((err) => console.error("Failed to fetch agent:", err));
  }, [agentId]);

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
        setTranscript(data.content);
        setTimeout(() => setTranscript(undefined), 3000);
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
      case "speaking_start":
        setIsSpeaking(true);
        break;
      case "speaking_end":
        setIsSpeaking(false);
        break;
    }
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
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
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

  const handleRecordToggle = async () => {
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
    setIsPlaying(true);
    setIsSpeaking(true);
    const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
    audio.onended = () => {
      setIsPlaying(false);
      setIsSpeaking(false);
    };
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
    setTranscript("Thank you! We'll get back to you soon.");
    setTimeout(() => setTranscript(undefined), 3000);
  };

  const handleFlowComplete = () => {
    setRunJoyride(false);
    setTranscript("Great! You've completed the guided tour.");
    setTimeout(() => setTranscript(undefined), 3000);
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

  const handleClose = () => {
    setIsOpen(false);
    if (isRecording) {
      handleRecordToggle();
    }
  };

  if (!agentData) {
    return null;
  }

  return (
    <>
      {isOpen ? (
        <VoiceBar
          isRecording={isRecording}
          isPlaying={isPlaying}
          isSpeaking={isSpeaking}
          onRecordToggle={handleRecordToggle}
          onClose={handleClose}
          agentName={agentData.name}
          audioLevel={audioLevel}
          transcript={transcript}
        />
      ) : (
        <VoiceBarTrigger
          onClick={() => setIsOpen(true)}
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
