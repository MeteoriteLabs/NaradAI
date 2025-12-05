import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, MessageCircle, Volume2, Check } from "lucide-react";

interface WidgetPreviewSectionProps {
  agentId: string;
  agentName?: string;
}

type WidgetDesign = "voice-bar" | "floating-bubble" | "corner-card";

const designs: { id: WidgetDesign; name: string; description: string }[] = [
  {
    id: "voice-bar",
    name: "Voice Bar",
    description: "Modern floating bar at the bottom with animated voice waves",
  },
  {
    id: "floating-bubble",
    name: "Floating Bubble",
    description: "Classic chat bubble in the corner with voice support",
  },
  {
    id: "corner-card",
    name: "Corner Card",
    description: "Expanded card widget with full conversation view",
  },
];

function VoiceBarPreview({ agentName, isActive }: { agentName: string; isActive: boolean }) {
  return (
    <div className="relative h-48 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
        Your Website
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div 
          className="flex items-center gap-3 px-4 py-2.5 rounded-full shadow-xl border backdrop-blur-lg"
          style={{
            background: "linear-gradient(135deg, rgba(17, 17, 27, 0.95) 0%, rgba(30, 30, 50, 0.95) 100%)",
            borderColor: isActive ? "rgba(139, 92, 246, 0.5)" : "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600">
            <Mic className="w-4 h-4 text-white" />
          </div>
          
          <div className="flex items-center gap-[2px] h-6 px-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="w-[2px] rounded-full transition-all duration-100"
                style={{
                  height: `${isActive ? 8 + Math.random() * 16 : 6}px`,
                  backgroundColor: isActive ? "#8b5cf6" : "#6b7280",
                }}
              />
            ))}
          </div>
          
          <span className="text-xs text-white/80 whitespace-nowrap">
            Talk to {agentName}
          </span>
        </div>
      </div>
    </div>
  );
}

function FloatingBubblePreview({ agentName, isActive }: { agentName: string; isActive: boolean }) {
  return (
    <div className="relative h-48 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
        Your Website
      </div>
      
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        {isActive && (
          <div className="bg-card border rounded-lg shadow-lg p-3 max-w-[160px]">
            <p className="text-xs font-medium mb-1">{agentName}</p>
            <p className="text-xs text-muted-foreground">How can I help?</p>
          </div>
        )}
        <div 
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center ${
            isActive ? "bg-violet-600" : "bg-primary"
          }`}
        >
          {isActive ? (
            <Volume2 className="w-5 h-5 text-white animate-pulse" />
          ) : (
            <MessageCircle className="w-5 h-5 text-primary-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}

function CornerCardPreview({ agentName, isActive }: { agentName: string; isActive: boolean }) {
  return (
    <div className="relative h-48 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
        Your Website
      </div>
      
      <div className="absolute bottom-3 right-3">
        <div className="w-44 bg-card border rounded-lg shadow-xl overflow-hidden">
          <div className="bg-primary px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Mic className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-primary-foreground">{agentName}</span>
          </div>
          <div className="p-2 space-y-1.5">
            {isActive ? (
              <>
                <div className="flex gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex-shrink-0" />
                  <div className="bg-muted rounded-lg p-1.5 text-[10px]">
                    How can I assist you?
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded text-[10px] text-muted-foreground">
                  <Mic className="w-2.5 h-2.5" />
                  Listening...
                </div>
              </>
            ) : (
              <div className="text-center py-2 text-[10px] text-muted-foreground">
                Click to start
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetPreviewSection({ agentId, agentName = "AI Assistant" }: WidgetPreviewSectionProps) {
  const [selectedDesign, setSelectedDesign] = useState<WidgetDesign>("voice-bar");
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const renderPreview = () => {
    switch (selectedDesign) {
      case "voice-bar":
        return <VoiceBarPreview agentName={agentName} isActive={isPreviewActive} />;
      case "floating-bubble":
        return <FloatingBubblePreview agentName={agentName} isActive={isPreviewActive} />;
      case "corner-card":
        return <CornerCardPreview agentName={agentName} isActive={isPreviewActive} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
            <CardDescription>
              See how your voice agent will appear on your website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {renderPreview()}
            
            <div className="flex justify-center gap-2">
              <Button
                variant={isPreviewActive ? "default" : "outline"}
                size="sm"
                onClick={() => setIsPreviewActive(!isPreviewActive)}
                data-testid="button-toggle-preview"
              >
                {isPreviewActive ? "Active State" : "Idle State"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Choose Design</CardTitle>
            <CardDescription>
              Select the widget style that best fits your website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={selectedDesign}
              onValueChange={(value) => setSelectedDesign(value as WidgetDesign)}
              className="space-y-3"
            >
              {designs.map((design) => (
                <div
                  key={design.id}
                  className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    selectedDesign === design.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedDesign(design.id)}
                  data-testid={`design-option-${design.id}`}
                >
                  <RadioGroupItem value={design.id} id={design.id} className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor={design.id} className="font-medium cursor-pointer">
                      {design.name}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {design.description}
                    </p>
                  </div>
                  {selectedDesign === design.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              ))}
            </RadioGroup>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> The Voice Bar design is currently active. 
                Additional designs will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customization</CardTitle>
          <CardDescription>
            Customize colors and behavior (Coming Soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="w-8 h-8 rounded-full bg-violet-600 mb-2" />
              <p className="text-sm font-medium">Primary Color</p>
              <p className="text-xs text-muted-foreground">Violet (default)</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="w-8 h-8 rounded-lg bg-slate-900 mb-2" />
              <p className="text-sm font-medium">Background</p>
              <p className="text-xs text-muted-foreground">Dark glass</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 h-8 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-1 bg-violet-400 rounded-full" style={{ height: `${8 + i * 4}px` }} />
                ))}
              </div>
              <p className="text-sm font-medium">Wave Animation</p>
              <p className="text-xs text-muted-foreground">Enabled</p>
            </div>
            <div className="p-4 border rounded-lg bg-muted/30">
              <div className="flex items-center gap-1 h-8 mb-2">
                <Volume2 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Auto-Greeting</p>
              <p className="text-xs text-muted-foreground">Enabled</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
