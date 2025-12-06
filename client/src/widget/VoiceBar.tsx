import { useState } from "react";
import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import { WaveformMicButton } from "./core/components";

const VOICE_BAR_STYLES = {
  container: {
    position: "fixed" as const,
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    fontFamily: "Inter, system-ui, sans-serif",
  },
};

function MicIcon({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function VoiceBar({
  isRecording,
  isSpeaking,
  onRecordToggle,
  onClose,
  audioLevel,
  widgetColor,
}: WidgetDesignProps) {
  return (
    <div style={VOICE_BAR_STYLES.container}>
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

export function VoiceBarTrigger({ onClick, agentName, widgetColor }: WidgetTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const primaryColor = widgetColor || "#8b5cf6";

  return (
    <div style={VOICE_BAR_STYLES.container}>
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 20px",
          borderRadius: "9999px",
          border: `1px solid ${isHovered ? `${primaryColor}80` : "rgba(255, 255, 255, 0.1)"}`,
          background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: isHovered
            ? `0 8px 32px ${primaryColor}4D`
            : "0 8px 32px rgba(0, 0, 0, 0.3)",
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: isHovered ? "scale(1.02)" : "scale(1)",
        }}
        data-testid="button-voice-trigger"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: primaryColor,
            boxShadow: `0 4px 12px ${primaryColor}4D`,
          }}
        >
          <MicIcon size={20} color="#ffffff" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            height: "24px",
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: "3px",
                borderRadius: "9999px",
                background: `${primaryColor}99`,
                height: `${12 + Math.sin(i) * 8}px`,
                animation: isHovered
                  ? `narada-pulse 0.5s ease-in-out ${i * 0.1}s infinite alternate`
                  : "none",
              }}
            />
          ))}
        </div>

        <span
          style={{
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(255, 255, 255, 0.9)",
          }}
        >
          Talk to {agentName}
        </span>
      </button>

      <style>{`
        @keyframes narada-pulse {
          0% { transform: scaleY(0.6); }
          100% { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}
