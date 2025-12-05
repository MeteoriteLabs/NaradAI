import { useState } from "react";
import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import {
  MicButton,
  CloseButton,
  StatusIndicator,
  TranscriptBubble,
  ChatIcon,
  MuteButton,
} from "./core/components";

const WIDGET_STYLES = {
  container: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-end",
    gap: "12px",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "8px",
  },
  controls: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
};

export function FloatingBubble({
  isRecording,
  isSpeaking,
  isMuted,
  onRecordToggle,
  onMuteToggle,
  onClose,
  agentName,
  transcript,
}: WidgetDesignProps) {
  return (
    <div style={WIDGET_STYLES.container}>
      {transcript && (
        <TranscriptBubble
          transcript={transcript}
          agentName={agentName}
          variant="light"
        />
      )}

      <div style={WIDGET_STYLES.buttonGroup}>
        <StatusIndicator isRecording={isRecording} isSpeaking={isSpeaking} isMuted={isMuted} />

        <div style={WIDGET_STYLES.controls}>
          <MicButton
            isRecording={isRecording}
            onClick={onRecordToggle}
            size="lg"
          />
          <MuteButton
            isMuted={isMuted}
            onClick={onMuteToggle}
            size="md"
          />
          <CloseButton onClick={onClose} variant="light" size="md" />
        </div>
      </div>
    </div>
  );
}

export function FloatingBubbleTrigger({
  onClick,
  agentName,
}: WidgetTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {isHovered && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "8px",
            padding: "8px 12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e5e7eb",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "13px", color: "#4b5563" }}>
            Talk to {agentName}
          </span>
        </div>
      )}

      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          border: "none",
          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "scale(0.95)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = isHovered ? "scale(1.05)" : "scale(1)";
        }}
        data-testid="button-voice-trigger"
      >
        <ChatIcon size={24} />
      </button>
    </div>
  );
}
