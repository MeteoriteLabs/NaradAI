import { useState } from "react";
import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import {
  WaveformMicButton,
  ChatIcon,
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
};

export function FloatingBubble({
  isRecording,
  isSpeaking,
  onRecordToggle,
  onClose,
  audioLevel,
  widgetColor,
}: WidgetDesignProps) {
  return (
    <div style={WIDGET_STYLES.container}>
      <WaveformMicButton
        isUserSpeaking={isRecording}
        isAISpeaking={isSpeaking}
        audioLevel={audioLevel}
        onClick={onRecordToggle}
        onClose={onClose}
        size="lg"
        primaryColor={widgetColor}
      />
    </div>
  );
}

export function FloatingBubbleTrigger({
  onClick,
  agentName,
  widgetColor,
}: WidgetTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = widgetColor || "#8b5cf6";

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
          background: `linear-gradient(135deg, ${primaryColor}, #6366f1)`,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: `0 8px 24px ${primaryColor}66`,
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
