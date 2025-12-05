import { useState, useEffect } from "react";

const DEFAULT_PRIMARY_COLOR = "#8b5cf6";
const DEFAULT_SECONDARY_COLOR = "#6366f1";

interface MicButtonProps {
  isRecording: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  primaryColor?: string;
  className?: string;
}

export function MicButton({
  isRecording,
  onClick,
  size = "md",
  primaryColor = DEFAULT_PRIMARY_COLOR,
  className = "",
}: MicButtonProps) {
  const sizes = {
    sm: { button: 40, icon: 16 },
    md: { button: 48, icon: 20 },
    lg: { button: 56, icon: 24 },
  };

  const { button: buttonSize, icon: iconSize } = sizes[size];

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: "50%",
        border: "none",
        background: isRecording
          ? "linear-gradient(135deg, #ef4444, #dc2626)"
          : `linear-gradient(135deg, ${primaryColor}, ${DEFAULT_SECONDARY_COLOR})`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isRecording
          ? "0 8px 24px rgba(239, 68, 68, 0.4)"
          : `0 8px 24px ${primaryColor}66`,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      data-testid="button-voice-record"
    >
      {isRecording ? (
        <MicOffIcon size={iconSize} />
      ) : (
        <MicIcon size={iconSize} />
      )}
    </button>
  );
}

interface CloseButtonProps {
  onClick: () => void;
  variant?: "dark" | "light" | "transparent";
  size?: "sm" | "md";
}

export function CloseButton({
  onClick,
  variant = "dark",
  size = "md",
}: CloseButtonProps) {
  const sizeValues = {
    sm: { button: 32, icon: 14 },
    md: { button: 40, icon: 16 },
  };

  const { button: buttonSize, icon: iconSize } = sizeValues[size];

  const variantStyles = {
    dark: {
      background: "rgba(255, 255, 255, 0.1)",
      hoverBg: "rgba(255, 255, 255, 0.2)",
      iconColor: "rgba(255, 255, 255, 0.7)",
    },
    light: {
      background: "#ffffff",
      hoverBg: "#f3f4f6",
      iconColor: "#6b7280",
    },
    transparent: {
      background: "rgba(255, 255, 255, 0.2)",
      hoverBg: "rgba(255, 255, 255, 0.3)",
      iconColor: "#ffffff",
    },
  };

  const style = variantStyles[variant];

  return (
    <button
      onClick={onClick}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: "50%",
        border: variant === "light" ? "1px solid #e5e7eb" : "none",
        background: style.background,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: variant === "light" ? "0 2px 8px rgba(0, 0, 0, 0.08)" : "none",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = style.hoverBg;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = style.background;
      }}
      data-testid="button-voice-close"
    >
      <CloseIcon size={iconSize} color={style.iconColor} />
    </button>
  );
}

interface StatusIndicatorProps {
  isRecording: boolean;
  isSpeaking: boolean;
  isMuted?: boolean;
}

export function StatusIndicator({ isRecording, isSpeaking, isMuted }: StatusIndicatorProps) {
  if (!isRecording && !isSpeaking && !isMuted) return null;

  let statusText = "Ready";
  let statusColor = "#8b5cf6";
  
  if (isMuted) {
    statusText = "Muted";
    statusColor = "#ef4444";
  } else if (isRecording) {
    statusText = "Listening...";
    statusColor = "#ef4444";
  } else if (isSpeaking) {
    statusText = "Speaking...";
    statusColor = "#8b5cf6";
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: isMuted ? "rgba(239, 68, 68, 0.1)" : "rgba(139, 92, 246, 0.1)",
        borderRadius: "20px",
        padding: "6px 12px",
      }}
    >
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: statusColor,
          animation: isMuted ? "none" : "widgetPulse 1.5s infinite",
        }}
      />
      <span style={{ fontSize: "12px", color: "#6b7280" }}>
        {statusText}
      </span>
      <style>{`
        @keyframes widgetPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

interface MuteButtonProps {
  isMuted: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
}

export function MuteButton({ isMuted, onClick, size = "md" }: MuteButtonProps) {
  const sizes = {
    sm: { button: 32, icon: 14 },
    md: { button: 40, icon: 16 },
    lg: { button: 48, icon: 20 },
  };

  const { button: buttonSize, icon: iconSize } = sizes[size];

  return (
    <button
      onClick={onClick}
      style={{
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        borderRadius: "50%",
        border: "none",
        background: isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(139, 92, 246, 0.2)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
        e.currentTarget.style.background = isMuted ? "rgba(239, 68, 68, 0.3)" : "rgba(139, 92, 246, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.background = isMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(139, 92, 246, 0.2)";
      }}
      data-testid="button-voice-mute"
    >
      {isMuted ? (
        <VolumeOffIcon size={iconSize} color="#ef4444" />
      ) : (
        <VolumeIcon size={iconSize} color="#8b5cf6" />
      )}
    </button>
  );
}

function VolumeIcon({ size = 16, color = "#8b5cf6" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  );
}

function VolumeOffIcon({ size = 16, color = "#ef4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  );
}

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  primaryColor?: string;
}

export function Waveform({
  isActive,
  barCount = 16,
  height = 40,
  primaryColor = DEFAULT_PRIMARY_COLOR,
}: WaveformProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.2));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.2));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "2px",
        height: `${height}px`,
        padding: "0 16px",
      }}
    >
      {bars.map((barHeight, i) => (
        <div
          key={i}
          style={{
            width: "3px",
            borderRadius: "9999px",
            transition: "all 0.1s ease-out",
            height: `${barHeight * height}px`,
            backgroundColor: isActive
              ? `hsl(${260 + i * 3}, 80%, ${50 + barHeight * 20}%)`
              : "#4b5563",
          }}
        />
      ))}
    </div>
  );
}

interface TranscriptBubbleProps {
  transcript: string;
  agentName: string;
  variant?: "dark" | "light";
}

export function TranscriptBubble({
  transcript,
  agentName,
  variant = "light",
}: TranscriptBubbleProps) {
  const styles = {
    dark: {
      background: "rgba(255, 255, 255, 0.1)",
      textColor: "rgba(255, 255, 255, 0.9)",
    },
    light: {
      background: "#ffffff",
      textColor: "#4b5563",
    },
  };

  const style = styles[variant];

  return (
    <div
      style={{
        background: style.background,
        borderRadius: "12px",
        padding: "16px",
        maxWidth: "280px",
        boxShadow: variant === "light" ? "0 10px 40px rgba(0, 0, 0, 0.15)" : "none",
        border: variant === "light" ? "1px solid #e5e7eb" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <AgentAvatar size={24} />
        <span
          style={{
            fontSize: "13px",
            fontWeight: "600",
            color: variant === "dark" ? "#ffffff" : "#1f2937",
          }}
        >
          {agentName}
        </span>
      </div>
      <p
        style={{
          fontSize: "14px",
          color: style.textColor,
          margin: 0,
          lineHeight: "1.5",
        }}
      >
        {transcript}
      </p>
    </div>
  );
}

interface AgentAvatarProps {
  size?: number;
}

export function AgentAvatar({ size = 32 }: AgentAvatarProps) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
    </div>
  );
}

function MicIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}

function MicOffIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function CloseIcon({ size = 16, color = "#6b7280" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
    </svg>
  );
}

export function ChatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
  );
}

export { MicIcon, CloseIcon };
