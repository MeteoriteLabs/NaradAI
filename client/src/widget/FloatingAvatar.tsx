import { MessageCircle, X, Mic, MicOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface FloatingAvatarProps {
  isOpen: boolean;
  onToggle: () => void;
  isRecording: boolean;
  onRecordToggle: () => void;
  agentName: string;
}

export function FloatingAvatar({
  isOpen,
  onToggle,
  isRecording,
  onRecordToggle,
  agentName,
}: FloatingAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col items-end gap-2">
          <Button
            size="icon"
            variant="default"
            onClick={onRecordToggle}
            className={`h-12 w-12 rounded-full shadow-lg transition-all hover-elevate active-elevate-2 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                : ""
            }`}
            data-testid="button-voice"
          >
            {isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
          <Button
            size="icon"
            variant="default"
            onClick={onToggle}
            className="h-14 w-14 rounded-full shadow-lg hover-elevate active-elevate-2"
            data-testid="button-close-chat"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isHovered && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-card border rounded-lg shadow-lg whitespace-nowrap">
              <p className="text-sm font-medium">Chat with {agentName}</p>
            </div>
          )}
          <Button
            size="icon"
            variant="default"
            onClick={onToggle}
            className="h-14 w-14 rounded-full shadow-lg hover-elevate active-elevate-2"
            data-testid="button-open-chat"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
