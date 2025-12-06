import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import { DualWaveformControl } from "./core/components";

const CARD_STYLES = {
  container: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
    fontFamily: "Inter, system-ui, sans-serif",
  },
};

export function CornerCard({
  isRecording,
  isSpeaking,
  onRecordToggle,
  onClose,
  audioLevel,
  widgetColor,
}: WidgetDesignProps) {
  return (
    <div style={CARD_STYLES.container}>
      <DualWaveformControl
        isRecording={isRecording}
        isAISpeaking={isSpeaking}
        audioLevel={audioLevel}
        onClick={onRecordToggle}
        onClose={onClose}
        primaryColor={widgetColor}
      />
    </div>
  );
}

export function CornerCardTrigger({ onClick, agentName, widgetColor }: WidgetTriggerProps) {
  const primaryColor = widgetColor || "#8b5cf6";
  
  return (
    <div style={CARD_STYLES.container}>
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background: `linear-gradient(135deg, ${primaryColor}, #6366f1)`,
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: `0 8px 24px ${primaryColor}66`,
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = `0 12px 32px ${primaryColor}80`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = `0 8px 24px ${primaryColor}66`;
        }}
        data-testid="button-voice-trigger"
      >
        <MicIcon size={18} />
        <span
          style={{
            fontSize: "14px",
            fontWeight: "500",
            color: "#ffffff",
          }}
        >
          Talk to {agentName}
        </span>
      </button>
    </div>
  );
}

function MicIcon({
  size = 20,
  color = "#ffffff",
}: {
  size?: number;
  color?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}
