export type WidgetDesign = "voice-bar" | "floating-bubble" | "corner-card";

export interface VoiceAgentState {
  isOpen: boolean;
  isRecording: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  isConnected: boolean;
  audioLevel: number;
  transcript?: string;
}

export interface VoiceAgentActions {
  toggleRecording: () => Promise<void>;
  openWidget: () => void;
  closeWidget: () => void;
  sendMessage: (message: string) => void;
}

export interface AgentConfig {
  id: string;
  name: string;
  persona?: string;
  voiceStyle?: string;
  widgetDesign?: WidgetDesign;
  widgetColor?: string;
  autoStart?: boolean;
}

export interface WidgetDesignProps {
  isRecording: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  isMuted?: boolean;
  onRecordToggle: () => void;
  onMuteToggle?: () => void;
  onClose: () => void;
  agentName: string;
  audioLevel: number;
  transcript?: string;
  widgetColor?: string;
}

export interface WidgetTriggerProps {
  onClick: () => void;
  agentName: string;
  widgetColor?: string;
}

export interface WebSocketMessage {
  type: string;
  content?: string;
  audioData?: string;
  format?: string;
  steps?: Array<{
    selector: string;
    tooltip_text?: string;
    title?: string;
  }>;
  agent?: AgentConfig;
}
