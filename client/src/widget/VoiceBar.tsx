import { useState } from "react";
import { WidgetDesignProps, WidgetTriggerProps } from "./core/types";
import { Waveform } from "./core/components";

const VOICE_BAR_STYLES = {
  container: {
    position: "fixed" as const,
    bottom: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  bar: (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "12px 16px",
    borderRadius: "9999px",
    backdropFilter: "blur(12px)",
    background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
    border: `1px solid ${isActive ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
    boxShadow: isActive
      ? "0 8px 32px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)"
      : "0 8px 32px rgba(0, 0, 0, 0.3)",
    transition: "all 0.3s ease",
  }),
  micButton: (isRecording: boolean) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    background: isRecording ? "#ef4444" : "#8b5cf6",
    boxShadow: isRecording
      ? "0 4px 12px rgba(239, 68, 68, 0.3)"
      : "0 4px 12px rgba(139, 92, 246, 0.3)",
    transition: "all 0.3s ease",
  }),
  content: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    minWidth: "200px",
  },
  transcript: {
    fontSize: "14px",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
    margin: 0,
  },
  statusText: {
    fontSize: "12px",
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: "4px",
  },
  speakingIndicator: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.2)",
  },
  closeButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  audioLevelBar: {
    position: "absolute" as const,
    bottom: "-4px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "64px",
    height: "4px",
    borderRadius: "9999px",
    overflow: "hidden",
    background: "rgba(139, 92, 246, 0.2)",
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

function MicOffIcon({ size = 20, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
      <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function VolumeIcon({ size = 20, color = "#a78bfa" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function CloseIcon({ size = 16, color = "rgba(255, 255, 255, 0.7)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function VoiceBar({
  isRecording,
  isPlaying,
  isSpeaking,
  onRecordToggle,
  onClose,
  agentName,
  audioLevel,
  transcript,
}: WidgetDesignProps) {
  const isActive = isRecording || isPlaying || isSpeaking;

  return (
    <div style={VOICE_BAR_STYLES.container}>
      <div style={VOICE_BAR_STYLES.bar(isActive)}>
        <button
          onClick={onRecordToggle}
          style={VOICE_BAR_STYLES.micButton(isRecording)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          data-testid="button-voice-record"
        >
          {isRecording ? (
            <MicOffIcon size={20} color="#ffffff" />
          ) : (
            <MicIcon size={20} color="#ffffff" />
          )}
        </button>

        <div style={VOICE_BAR_STYLES.content}>
          {transcript ? (
            <p style={VOICE_BAR_STYLES.transcript}>{transcript}</p>
          ) : (
            <>
              <Waveform isActive={isActive} barCount={16} height={40} />
              <span style={VOICE_BAR_STYLES.statusText}>
                {isRecording
                  ? "Listening..."
                  : isSpeaking
                    ? "Speaking..."
                    : `Ask ${agentName}`}
              </span>
            </>
          )}
        </div>

        {isSpeaking && (
          <div style={VOICE_BAR_STYLES.speakingIndicator}>
            <VolumeIcon size={20} />
          </div>
        )}

        <button
          onClick={onClose}
          style={VOICE_BAR_STYLES.closeButton}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
          }}
          data-testid="button-voice-close"
        >
          <CloseIcon size={16} />
        </button>
      </div>

      {isRecording && (
        <div style={VOICE_BAR_STYLES.audioLevelBar}>
          <div
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #8b5cf6, #a855f7)",
              width: `${Math.max(20, audioLevel)}%`,
              transition: "width 0.1s ease",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function VoiceBarTrigger({ onClick, agentName }: WidgetTriggerProps) {
  const [isHovered, setIsHovered] = useState(false);

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
          border: `1px solid ${isHovered ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
          background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: isHovered
            ? "0 8px 32px rgba(139, 92, 246, 0.3)"
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
            background: "#8b5cf6",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
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
                background: "rgba(139, 92, 246, 0.6)",
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
