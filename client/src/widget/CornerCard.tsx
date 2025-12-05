import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import { MicButton, CloseButton, AgentAvatar, Waveform, MuteButton } from "./core/components";

const CARD_STYLES = {
  container: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    zIndex: 9999,
    width: "320px",
    background: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    padding: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  agentName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#ffffff",
  },
  body: {
    padding: "16px",
    minHeight: "120px",
  },
  footer: {
    padding: "16px",
    borderTop: "1px solid #e5e7eb",
    background: "#f9fafb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
};

export function CornerCard({
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
    <div style={CARD_STYLES.container}>
      <div style={CARD_STYLES.header}>
        <div style={CARD_STYLES.headerContent}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MicIcon size={18} />
          </div>
          <span style={CARD_STYLES.agentName}>{agentName}</span>
        </div>
        <CloseButton onClick={onClose} variant="transparent" size="sm" />
      </div>

      <div style={CARD_STYLES.body}>
        {transcript ? (
          <div style={{ display: "flex", gap: "12px" }}>
            <AgentAvatar size={32} />
            <div
              style={{
                background: "#f3f4f6",
                borderRadius: "12px",
                padding: "12px 16px",
                flex: 1,
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#374151",
                  margin: 0,
                  lineHeight: "1.5",
                }}
              >
                {transcript}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100px",
              color: "#9ca3af",
            }}
          >
            <MicIcon size={32} color="#9ca3af" />
            <span style={{ fontSize: "13px", marginTop: "8px" }}>
              Click the mic to start talking
            </span>
          </div>
        )}
      </div>

      <div style={CARD_STYLES.footer}>
        {isMuted && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
            <span style={{ fontSize: "13px", color: "#ef4444" }}>
              Muted
            </span>
          </div>
        )}

        {!isMuted && isSpeaking && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Waveform isActive={true} barCount={5} height={20} />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Speaking...
            </span>
          </div>
        )}

        {!isMuted && isRecording && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#ef4444",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: "13px", color: "#6b7280" }}>
              Listening...
            </span>
          </div>
        )}

        <MicButton isRecording={isRecording} onClick={onRecordToggle} size="md" />
        <MuteButton isMuted={isMuted} onClick={onMuteToggle} size="md" />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export function CornerCardTrigger({ onClick, agentName }: WidgetTriggerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <button
        onClick={onClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
          border: "none",
          borderRadius: "12px",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 12px 32px rgba(139, 92, 246, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 8px 24px rgba(139, 92, 246, 0.4)";
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
