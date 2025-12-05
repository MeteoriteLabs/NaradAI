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

export function Widget({ agentId, websocketUrl, streamingWebsocketUrl, apiBase, useStreaming = false }: WidgetProps) {
  // Use legacy batch mode for backward compatibility
  const legacyVoice = useVoiceAgent({ agentId, websocketUrl, apiBase });
  
  // Use streaming mode when enabled and URL is available
  const streamingVoice = useStreamingVoice({
    agentId,
    wsUrl: streamingWebsocketUrl || websocketUrl,
    onTranscript: (text, isFinal) => {
      console.log('[Narada] Transcript:', text, isFinal ? '(final)' : '(partial)');
    },
    onAIResponse: (text) => {
      console.log('[Narada] AI Response:', text);
    },
    onError: (error) => {
      console.error('[Narada] Streaming error:', error);
    },
  });

  // Determine which mode to use
  const shouldUseStreaming = useStreaming && streamingWebsocketUrl;
  
  // Unified state from either mode
  const {
    isOpen,
    isRecording,
    isPlaying,
    isSpeaking,
    audioLevel,
    transcript,
    agentData,
    toggleRecording,
    openWidget,
    closeWidget,
    isLeadFormOpen,
    setIsLeadFormOpen,
    joyrideSteps,
    runJoyride,
    handleFlowComplete,
    handleStepChange,
    submitLead,
  } = shouldUseStreaming ? {
    // Map streaming state to legacy interface
    isOpen: legacyVoice.isOpen,
    isRecording: streamingVoice.isStreaming,
    isPlaying: streamingVoice.isAISpeaking,
    isSpeaking: streamingVoice.isAISpeaking,
    audioLevel: streamingVoice.audioLevel,
    transcript: streamingVoice.partialTranscript || streamingVoice.transcript || undefined,
    agentData: legacyVoice.agentData,
    toggleRecording: streamingVoice.toggleStreaming,
    openWidget: legacyVoice.openWidget,
    closeWidget: legacyVoice.closeWidget,
    isLeadFormOpen: legacyVoice.isLeadFormOpen,
    setIsLeadFormOpen: legacyVoice.setIsLeadFormOpen,
    joyrideSteps: legacyVoice.joyrideSteps,
    runJoyride: legacyVoice.runJoyride,
    handleFlowComplete: legacyVoice.handleFlowComplete,
    handleStepChange: legacyVoice.handleStepChange,
    submitLead: legacyVoice.submitLead,
  } : legacyVoice;

  if (!agentData) {
    return null;
  }

  const widgetDesign = (agentData.widgetDesign || "voice-bar") as WidgetDesign;
  const { Component, Trigger } = WIDGET_DESIGNS[widgetDesign] || WIDGET_DESIGNS["voice-bar"];

  const designProps: WidgetDesignProps = {
    isRecording,
    isPlaying,
    isSpeaking,
    onRecordToggle: toggleRecording,
    onClose: closeWidget,
    agentName: agentData.name,
    audioLevel,
    transcript,
    widgetColor: agentData.widgetColor,
  };

  const triggerProps: WidgetTriggerProps = {
    onClick: openWidget,
    agentName: agentData.name,
    widgetColor: agentData.widgetColor,
  };

  return (
    <>
      {isOpen ? <Component {...designProps} /> : <Trigger {...triggerProps} />}

      {isLeadFormOpen && (
        <LeadForm
          onSubmit={submitLead}
          onClose={() => setIsLeadFormOpen(false)}
        />
      )}

      {runJoyride && (
        <JoyrideFlowWrapper
          steps={joyrideSteps}
          onFlowComplete={handleFlowComplete}
          onStepChange={handleStepChange}
          run={runJoyride}
        />
      )}
    </>
  );
}
