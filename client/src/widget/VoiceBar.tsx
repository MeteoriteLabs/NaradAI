import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, X, Volume2 } from "lucide-react";

interface VoiceBarProps {
  isRecording: boolean;
  isPlaying: boolean;
  isSpeaking: boolean;
  onRecordToggle: () => void;
  onClose: () => void;
  agentName: string;
  audioLevel: number;
  transcript?: string;
}

function SoundWave({ isActive, audioLevel }: { isActive: boolean; audioLevel: number }) {
  const bars = 12;
  
  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: bars }).map((_, i) => {
        const baseHeight = isActive ? 0.3 + Math.random() * 0.7 : 0.15;
        const height = isActive 
          ? Math.max(0.15, baseHeight * (audioLevel / 100)) 
          : 0.15;
        const delay = i * 0.05;
        
        return (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-75"
            style={{
              height: `${Math.max(4, height * 32)}px`,
              backgroundColor: isActive ? "#8b5cf6" : "#6b7280",
              animationDelay: `${delay}s`,
              transform: isActive ? "scaleY(1)" : "scaleY(0.5)",
            }}
          />
        );
      })}
    </div>
  );
}

function AnimatedWaveform({ isActive }: { isActive: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(16).fill(0.2));
  
  useEffect(() => {
    if (!isActive) {
      setBars(Array(16).fill(0.2));
      return;
    }
    
    const interval = setInterval(() => {
      setBars(prev => prev.map(() => 0.2 + Math.random() * 0.8));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  return (
    <div className="flex items-center justify-center gap-[2px] h-10 px-4">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full transition-all duration-100 ease-out"
          style={{
            height: `${height * 40}px`,
            backgroundColor: isActive 
              ? `hsl(${260 + i * 3}, 80%, ${50 + height * 20}%)`
              : "#4b5563",
          }}
        />
      ))}
    </div>
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
}: VoiceBarProps) {
  const isActive = isRecording || isPlaying || isSpeaking;
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div 
        className="flex items-center gap-4 px-4 py-3 rounded-full shadow-2xl border backdrop-blur-lg transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
          borderColor: isActive ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)",
          boxShadow: isActive 
            ? "0 8px 32px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)"
            : "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
      >
        <button
          onClick={onRecordToggle}
          className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30"
              : "bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/30"
          }`}
          data-testid="button-voice-record"
        >
          {isRecording ? (
            <MicOff className="w-5 h-5 text-white" />
          ) : (
            <Mic className="w-5 h-5 text-white" />
          )}
        </button>

        <div className="flex flex-col items-center min-w-[200px]">
          {transcript ? (
            <p className="text-sm text-white/90 text-center max-w-[200px] truncate">
              {transcript}
            </p>
          ) : (
            <>
              <AnimatedWaveform isActive={isActive} />
              <p className="text-xs text-white/60 mt-1">
                {isRecording 
                  ? "Listening..." 
                  : isSpeaking 
                    ? "Speaking..." 
                    : `Ask ${agentName}`}
              </p>
            </>
          )}
        </div>

        {isSpeaking && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600/20">
            <Volume2 className="w-5 h-5 text-violet-400 animate-pulse" />
          </div>
        )}

        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          data-testid="button-voice-close"
        >
          <X className="w-4 h-4 text-white/70" />
        </button>
      </div>

      {isRecording && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 animate-pulse"
            style={{ width: `${Math.max(20, audioLevel)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function VoiceBarTrigger({ 
  onClick, 
  agentName 
}: { 
  onClick: () => void; 
  agentName: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border backdrop-blur-lg transition-all duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
          borderColor: isHovered ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)",
          boxShadow: isHovered 
            ? "0 8px 32px rgba(139, 92, 246, 0.3)"
            : "0 8px 32px rgba(0, 0, 0, 0.3)",
        }}
        data-testid="button-voice-trigger"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-600 shadow-lg shadow-violet-600/30">
          <Mic className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex items-center gap-[2px] h-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-violet-400/60"
              style={{
                height: `${12 + Math.sin(i) * 8}px`,
                animation: isHovered ? `pulse 0.5s ease-in-out ${i * 0.1}s infinite alternate` : "none",
              }}
            />
          ))}
        </div>
        
        <span className="text-sm font-medium text-white/90">
          Talk to {agentName}
        </span>
      </button>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scaleY(0.6); }
          100% { transform: scaleY(1.4); }
        }
      `}</style>
    </div>
  );
}
