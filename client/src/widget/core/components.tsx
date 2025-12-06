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

// Waveform Mic Button - Shows animated waveform inside the mic button
// Different colors: User speaking = green/teal, AI speaking = purple/violet
interface WaveformMicButtonProps {
  isUserSpeaking: boolean;
  isAISpeaking: boolean;
  audioLevel?: number;
  onClick: () => void;
  onClose: () => void;
  size?: "sm" | "md" | "lg" | "xl";
  primaryColor?: string;
}

export function WaveformMicButton({
  isUserSpeaking,
  isAISpeaking,
  audioLevel = 0,
  onClick,
  onClose,
  size = "lg",
  primaryColor = DEFAULT_PRIMARY_COLOR,
}: WaveformMicButtonProps) {
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(5).fill(0.2));
  
  const sizes = {
    sm: { button: 48, barWidth: 3, barGap: 2, barMaxHeight: 16 },
    md: { button: 56, barWidth: 3, barGap: 2, barMaxHeight: 20 },
    lg: { button: 72, barWidth: 4, barGap: 3, barMaxHeight: 28 },
    xl: { button: 88, barWidth: 5, barGap: 3, barMaxHeight: 36 },
  };

  const { button: buttonSize, barWidth, barGap, barMaxHeight } = sizes[size];
  
  const isActive = isUserSpeaking || isAISpeaking;
  
  // Waveform colors based on who is speaking
  // User speaking: green/teal tones
  // AI speaking: purple/violet tones
  const getBarColor = (index: number, barHeight: number) => {
    if (isUserSpeaking) {
      // Teal/green gradient for user
      return `hsl(${160 + index * 5}, 70%, ${45 + barHeight * 15}%)`;
    } else if (isAISpeaking) {
      // Purple/violet gradient for AI
      return `hsl(${260 + index * 5}, 75%, ${50 + barHeight * 15}%)`;
    }
    // Inactive: muted gray
    return "rgba(255, 255, 255, 0.4)";
  };

  // Animate waveform based on audio level or random for AI
  useEffect(() => {
    if (!isActive) {
      setWaveformBars(Array(5).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      if (isUserSpeaking) {
        // Use audio level with some variation
        const baseLevel = Math.max(0.15, audioLevel);
        setWaveformBars(prev => prev.map(() => 
          baseLevel * 0.5 + Math.random() * baseLevel * 0.8
        ));
      } else if (isAISpeaking) {
        // Smooth wave animation for AI speaking
        setWaveformBars(prev => prev.map(() => 
          0.3 + Math.random() * 0.7
        ));
      }
    }, 80);

    return () => clearInterval(interval);
  }, [isActive, isUserSpeaking, isAISpeaking, audioLevel]);

  // Background gradient based on state
  const getBackgroundGradient = () => {
    if (isUserSpeaking) {
      return "linear-gradient(135deg, #14b8a6, #0d9488)"; // Teal for user
    } else if (isAISpeaking) {
      return `linear-gradient(135deg, ${primaryColor}, ${DEFAULT_SECONDARY_COLOR})`; // Purple for AI
    }
    return `linear-gradient(135deg, ${primaryColor}, ${DEFAULT_SECONDARY_COLOR})`; // Default purple
  };

  // Glow effect based on state
  const getBoxShadow = () => {
    if (isUserSpeaking) {
      return "0 8px 32px rgba(20, 184, 166, 0.5), 0 0 0 4px rgba(20, 184, 166, 0.2)";
    } else if (isAISpeaking) {
      return "0 8px 32px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(139, 92, 246, 0.2)";
    }
    return `0 8px 24px ${primaryColor}66`;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          borderRadius: "50%",
          border: "none",
          background: getBackgroundGradient(),
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: getBoxShadow(),
          transition: "transform 0.2s, box-shadow 0.3s, background 0.3s",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        data-testid="button-waveform-mic"
      >
        {/* Waveform bars inside the button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: `${barGap}px`,
            height: `${barMaxHeight}px`,
          }}
        >
          {waveformBars.map((barHeight, i) => (
            <div
              key={i}
              style={{
                width: `${barWidth}px`,
                borderRadius: "9999px",
                transition: "all 0.08s ease-out",
                height: `${Math.max(4, barHeight * barMaxHeight)}px`,
                backgroundColor: getBarColor(i, barHeight),
              }}
            />
          ))}
        </div>
      </button>
      
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
          transition: "background 0.2s, transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#f3f4f6";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#ffffff";
          e.currentTarget.style.transform = "scale(1)";
        }}
        data-testid="button-waveform-close"
      >
        <CloseIcon size={14} color="#6b7280" />
      </button>
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

// Dual Waveform Control - Shows separate mic button and AI waveform indicator
// Mic button on left (user's voice), AI waveform on right
interface DualWaveformControlProps {
  isRecording: boolean;  // Mic is active/listening
  isAISpeaking: boolean;  // AI is talking
  audioLevel?: number;  // User's audio level (0-1)
  onClick: () => void;  // Toggle mic
  onClose: () => void;  // Close widget
  primaryColor?: string;
}

export function DualWaveformControl({
  isRecording,
  isAISpeaking,
  audioLevel = 0,
  onClick,
  onClose,
  primaryColor = DEFAULT_PRIMARY_COLOR,
}: DualWaveformControlProps) {
  const [userWaveform, setUserWaveform] = useState<number[]>(Array(4).fill(0.15));
  const [aiWaveform, setAiWaveform] = useState<number[]>(Array(4).fill(0.15));

  // Animate user waveform based on audio level
  useEffect(() => {
    if (!isRecording) {
      setUserWaveform(Array(4).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      const baseLevel = Math.max(0.2, audioLevel);
      setUserWaveform(prev => prev.map(() => 
        baseLevel * 0.4 + Math.random() * baseLevel * 0.8
      ));
    }, 80);

    return () => clearInterval(interval);
  }, [isRecording, audioLevel]);

  // Animate AI waveform when AI is speaking
  useEffect(() => {
    if (!isAISpeaking) {
      setAiWaveform(Array(4).fill(0.15));
      return;
    }

    const interval = setInterval(() => {
      setAiWaveform(prev => prev.map(() => 
        0.3 + Math.random() * 0.7
      ));
    }, 80);

    return () => clearInterval(interval);
  }, [isAISpeaking]);

  const barMaxHeight = 20;
  const barWidth = 3;
  const barGap = 2;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
        borderRadius: "9999px",
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Mic Button with User Waveform */}
      <button
        onClick={onClick}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          background: isRecording 
            ? "linear-gradient(135deg, #14b8a6, #0d9488)"  // Teal when active
            : "linear-gradient(135deg, #374151, #1f2937)",  // Gray when inactive
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isRecording 
            ? "0 4px 16px rgba(20, 184, 166, 0.5)"
            : "0 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "all 0.2s ease",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
        data-testid="button-mic-control"
      >
        {isRecording ? (
          // Waveform bars when recording
          <div style={{ display: "flex", alignItems: "center", gap: `${barGap}px` }}>
            {userWaveform.map((barHeight, i) => (
              <div
                key={i}
                style={{
                  width: `${barWidth}px`,
                  borderRadius: "9999px",
                  transition: "all 0.08s ease-out",
                  height: `${Math.max(4, barHeight * barMaxHeight)}px`,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              />
            ))}
          </div>
        ) : (
          // Mic icon when not recording
          <MicIcon size={22} />
        )}
      </button>

      {/* Status label */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "60px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: isRecording 
              ? "rgba(20, 184, 166, 1)"  // Teal when mic active
              : isAISpeaking 
                ? "rgba(139, 92, 246, 1)"  // Purple when AI speaking
                : "rgba(255, 255, 255, 0.5)",  // Gray when idle
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {isRecording ? "You" : isAISpeaking ? "AI" : "Tap mic"}
        </span>
        <span
          style={{
            fontSize: "9px",
            color: "rgba(255, 255, 255, 0.4)",
            marginTop: "2px",
          }}
        >
          {isRecording ? "Speaking" : isAISpeaking ? "Speaking" : "to start"}
        </span>
      </div>

      {/* AI Waveform Indicator */}
      <div
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          background: isAISpeaking 
            ? `linear-gradient(135deg, ${primaryColor}, ${DEFAULT_SECONDARY_COLOR})`  // Purple when speaking
            : "linear-gradient(135deg, #374151, #1f2937)",  // Gray when quiet
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isAISpeaking 
            ? `0 4px 16px ${primaryColor}66`
            : "0 2px 8px rgba(0, 0, 0, 0.3)",
          transition: "all 0.3s ease",
        }}
        data-testid="indicator-ai-waveform"
      >
        {isAISpeaking ? (
          // Animated waveform when AI speaking
          <div style={{ display: "flex", alignItems: "center", gap: `${barGap}px` }}>
            {aiWaveform.map((barHeight, i) => (
              <div
                key={i}
                style={{
                  width: `${barWidth}px`,
                  borderRadius: "9999px",
                  transition: "all 0.08s ease-out",
                  height: `${Math.max(4, barHeight * barMaxHeight)}px`,
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                }}
              />
            ))}
          </div>
        ) : (
          // AI icon when quiet
          <AIIcon size={20} />
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255, 255, 255, 0.1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "4px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }}
        data-testid="button-dual-close"
      >
        <CloseIcon size={14} color="rgba(255, 255, 255, 0.7)" />
      </button>
    </div>
  );
}

function AIIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" opacity={0.6}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  );
}

export { MicIcon, CloseIcon };
