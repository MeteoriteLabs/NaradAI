import { useState } from "react";

interface FloatingBubbleProps {
  isRecording: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  onRecordToggle: () => void;
  onClose: () => void;
  agentName: string;
  audioLevel: number;
  transcript?: string;
}

interface FloatingBubbleTriggerProps {
  onClick: () => void;
  agentName: string;
}

export function FloatingBubble({
  isRecording,
  isPlaying,
  isSpeaking,
  onRecordToggle,
  onClose,
  agentName,
  audioLevel,
  transcript,
}: FloatingBubbleProps) {
  return (
    <div 
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "12px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {transcript && (
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "16px",
            maxWidth: "280px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "#1f2937" }}>{agentName}</span>
          </div>
          <p style={{ fontSize: "14px", color: "#4b5563", margin: 0, lineHeight: "1.5" }}>
            {transcript}
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
        {(isRecording || isSpeaking) && (
          <div
            style={{
              background: "rgba(139, 92, 246, 0.1)",
              borderRadius: "20px",
              padding: "6px 12px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: isRecording ? "#ef4444" : "#8b5cf6",
                animation: "pulse 1.5s infinite",
              }}
            />
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              {isRecording ? "Listening..." : "Speaking..."}
            </span>
          </div>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={onRecordToggle}
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "none",
              background: isRecording 
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, #8b5cf6, #6366f1)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(139, 92, 246, 0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isRecording ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>

          <button
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
              transition: "background 0.2s",
              alignSelf: "flex-end",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#6b7280">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
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

export function FloatingBubbleTrigger({ onClick, agentName }: FloatingBubbleTriggerProps) {
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
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </button>
    </div>
  );
}
