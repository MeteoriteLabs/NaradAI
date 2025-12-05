import { VoiceBar, VoiceBarTrigger } from "./VoiceBar";
import { FloatingBubble, FloatingBubbleTrigger } from "./FloatingBubble";
import { CornerCard, CornerCardTrigger } from "./CornerCard";
import { LeadForm } from "./LeadForm";
import { JoyrideFlowWrapper } from "./JoyrideFlowWrapper";
import { useVoiceAgent } from "./core";
import type { WidgetDesign, WidgetDesignProps, WidgetTriggerProps } from "./core/types";

interface WidgetProps {
  agentId: string;
  websocketUrl: string;
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

export function Widget({ agentId, websocketUrl }: WidgetProps) {
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
  } = useVoiceAgent({ agentId, websocketUrl });

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
