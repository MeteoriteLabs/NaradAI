import { VoiceBar, VoiceBarTrigger } from "./VoiceBar";
import { FloatingBubble, FloatingBubbleTrigger } from "./FloatingBubble";
import { CornerCard, CornerCardTrigger } from "./CornerCard";
import { LeadForm } from "./LeadForm";
import { JoyrideFlowWrapper } from "./JoyrideFlowWrapper";
import { useVoiceAgent } from "./core";
import { useStreamingVoice } from "./core/useStreamingVoice";
import type { WidgetDesign, WidgetDesignProps, WidgetTriggerProps } from "./core/types";

interface WidgetProps {
  agentId: string;
  websocketUrl: string;
  streamingWebsocketUrl?: string;
  apiBase?: string;
  useStreaming?: boolean;
}

const WIDGET_DESIGNS: Record<
  WidgetDesign,
  {
    Component: React.ComponentType<WidgetDesignProps>;
    Trigger: React.ComponentType<WidgetTriggerProps>;
  }
> = {
  "voice-bar": { Component: VoiceBar, Trigger: VoiceBarTrigger },
  "floating-bubble": { Component: FloatingBubble, Trigger: FloatingBubbleTrigger },
  "corner-card": { Component: CornerCard, Trigger: CornerCardTrigger },
};

// Streaming widget wrapper - uses streaming voice hook
function StreamingWidget({ agentId, streamingWebsocketUrl, apiBase, websocketUrl }: WidgetProps) {
  // Get agent data from legacy hook (for agent info, flows, lead forms, etc.)
  const legacyVoice = useVoiceAgent({ agentId, websocketUrl, apiBase });
  
  // Use streaming voice hook for voice interaction
  const streamingVoice = useStreamingVoice({
    agentId,
    wsUrl: streamingWebsocketUrl!,
    onTranscript: (text: string, isFinal: boolean) => {
      console.log('[Narada Stream] Transcript:', text, isFinal ? '(final)' : '(partial)');
    },
    onAIResponse: (text: string) => {
      console.log('[Narada Stream] AI Response:', text);
    },
    onError: (error: string) => {
      console.error('[Narada Stream] Error:', error);
    },
  });

  if (!legacyVoice.agentData) {
    return null;
  }

  const widgetDesign = (legacyVoice.agentData.widgetDesign || "voice-bar") as WidgetDesign;
  const { Component, Trigger } = WIDGET_DESIGNS[widgetDesign] || WIDGET_DESIGNS["voice-bar"];

  const designProps: WidgetDesignProps = {
    isRecording: streamingVoice.isStreaming,
    isPlaying: streamingVoice.isAISpeaking,
    isSpeaking: streamingVoice.isAISpeaking,
    onRecordToggle: streamingVoice.toggleStreaming,
    onClose: legacyVoice.closeWidget,
    agentName: legacyVoice.agentData.name,
    audioLevel: streamingVoice.audioLevel,
    transcript: streamingVoice.partialTranscript || streamingVoice.transcript || undefined,
    widgetColor: legacyVoice.agentData.widgetColor,
  };

  const triggerProps: WidgetTriggerProps = {
    onClick: legacyVoice.openWidget,
    agentName: legacyVoice.agentData.name,
    widgetColor: legacyVoice.agentData.widgetColor,
  };

  return (
    <>
      {legacyVoice.isOpen ? <Component {...designProps} /> : <Trigger {...triggerProps} />}

      {legacyVoice.isLeadFormOpen && (
        <LeadForm
          onSubmit={legacyVoice.submitLead}
          onClose={() => legacyVoice.setIsLeadFormOpen(false)}
        />
      )}

      {legacyVoice.runJoyride && (
        <JoyrideFlowWrapper
          steps={legacyVoice.joyrideSteps}
          onFlowComplete={legacyVoice.handleFlowComplete}
          onStepChange={legacyVoice.handleStepChange}
          run={legacyVoice.runJoyride}
        />
      )}
    </>
  );
}

// Legacy widget - uses batch audio processing
function LegacyWidget({ agentId, websocketUrl, apiBase }: WidgetProps) {
  const voiceAgent = useVoiceAgent({ agentId, websocketUrl, apiBase });

  if (!voiceAgent.agentData) {
    return null;
  }

  const widgetDesign = (voiceAgent.agentData.widgetDesign || "voice-bar") as WidgetDesign;
  const { Component, Trigger } = WIDGET_DESIGNS[widgetDesign] || WIDGET_DESIGNS["voice-bar"];

  const designProps: WidgetDesignProps = {
    isRecording: voiceAgent.isRecording,
    isPlaying: voiceAgent.isPlaying,
    isSpeaking: voiceAgent.isSpeaking,
    onRecordToggle: voiceAgent.toggleRecording,
    onClose: voiceAgent.closeWidget,
    agentName: voiceAgent.agentData.name,
    audioLevel: voiceAgent.audioLevel,
    transcript: voiceAgent.transcript,
    widgetColor: voiceAgent.agentData.widgetColor,
  };

  const triggerProps: WidgetTriggerProps = {
    onClick: voiceAgent.openWidget,
    agentName: voiceAgent.agentData.name,
    widgetColor: voiceAgent.agentData.widgetColor,
  };

  return (
    <>
      {voiceAgent.isOpen ? <Component {...designProps} /> : <Trigger {...triggerProps} />}

      {voiceAgent.isLeadFormOpen && (
        <LeadForm
          onSubmit={voiceAgent.submitLead}
          onClose={() => voiceAgent.setIsLeadFormOpen(false)}
        />
      )}

      {voiceAgent.runJoyride && (
        <JoyrideFlowWrapper
          steps={voiceAgent.joyrideSteps}
          onFlowComplete={voiceAgent.handleFlowComplete}
          onStepChange={voiceAgent.handleStepChange}
          run={voiceAgent.runJoyride}
        />
      )}
    </>
  );
}

// Main Widget component - chooses streaming or legacy mode
export function Widget(props: WidgetProps) {
  const { useStreaming, streamingWebsocketUrl } = props;
  
  // Use streaming mode only if explicitly enabled AND streaming URL is provided
  if (useStreaming && streamingWebsocketUrl) {
    console.log('[Narada] Using streaming mode');
    return <StreamingWidget {...props} />;
  }
  
  console.log('[Narada] Using legacy mode');
  return <LegacyWidget {...props} />;
}
