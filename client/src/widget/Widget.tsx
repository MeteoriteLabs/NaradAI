import { useEffect, useRef } from "react";
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

  // Track if we've already auto-started for this widget open session
  const hasAutoStartedRef = useRef(false);
  const wasOpenRef = useRef(false);
  const hasRequestedMicPermissionRef = useRef(false);
  const hasAutoOpenedRef = useRef(false);

  // Reset auto-start and auto-opened flags when widget closes
  useEffect(() => {
    if (!legacyVoice.isOpen && wasOpenRef.current) {
      hasAutoStartedRef.current = false;
      hasAutoOpenedRef.current = false;
    }
    wasOpenRef.current = legacyVoice.isOpen;
  }, [legacyVoice.isOpen]);

  // Track if greeting has been requested for this session
  const hasRequestedGreetingRef = useRef(false);

  // Reset greeting flag when widget closes
  useEffect(() => {
    if (!legacyVoice.isOpen) {
      hasRequestedGreetingRef.current = false;
    }
  }, [legacyVoice.isOpen]);

  // Request mic permission early on page load (before widget opens)
  useEffect(() => {
    if (!hasRequestedMicPermissionRef.current && legacyVoice.agentData) {
      hasRequestedMicPermissionRef.current = true;
      console.log('[Narada Stream] Pre-requesting microphone permission...');
      navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      })
        .then(stream => {
          console.log('[Narada Stream] Microphone permission granted early');
          // Stop the stream immediately - we just needed permission
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(err => {
          console.log('[Narada Stream] Microphone permission not granted:', err.message);
        });
    }
  }, [legacyVoice.agentData]);

  // Auto-open widget if agent's autoStart setting is enabled
  // Step 1: Connect to streaming when autoStart is enabled
  useEffect(() => {
    if (
      legacyVoice.agentData?.autoStart && 
      !hasAutoOpenedRef.current && 
      !legacyVoice.isOpen &&
      !streamingVoice.isConnected
    ) {
      console.log('[Narada Stream] Auto-start enabled, connecting to streaming...');
      streamingVoice.connect();
    }
  }, [legacyVoice.agentData, legacyVoice.isOpen, streamingVoice.isConnected, streamingVoice.connect]);

  // Step 2: Open widget once streaming is connected
  useEffect(() => {
    if (
      legacyVoice.agentData?.autoStart && 
      !hasAutoOpenedRef.current && 
      !legacyVoice.isOpen &&
      streamingVoice.isConnected
    ) {
      hasAutoOpenedRef.current = true;
      console.log('[Narada Stream] Streaming connected, auto-opening widget...');
      legacyVoice.openWidget();
    }
  }, [legacyVoice.agentData, legacyVoice.isOpen, streamingVoice.isConnected, legacyVoice.openWidget]);

  // Reconnect streaming voice when widget opens (in case it was disconnected)
  useEffect(() => {
    if (legacyVoice.isOpen && !streamingVoice.isConnected) {
      console.log('[Narada Stream] Widget opened, reconnecting...');
      streamingVoice.connect();
    }
  }, [legacyVoice.isOpen, streamingVoice.isConnected, streamingVoice.connect]);

  // Auto-start handling: ALWAYS start streaming when widget opens (no click needed)
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    const shouldAutoStart = 
      legacyVoice.isOpen && 
      streamingVoice.isConnected && 
      !streamingVoice.isStreaming && 
      !hasAutoStartedRef.current;
    
    if (shouldAutoStart) {
      hasAutoStartedRef.current = true;
      console.log('[Narada Stream] Auto-starting voice (no click needed)...');
      // Small delay to ensure AudioContext is ready after user interaction
      timeout = setTimeout(async () => {
        // Guard against calling if already streaming (idempotent safety)
        if (!streamingVoice.isStreaming) {
          // Start streaming (requests mic permission)
          await streamingVoice.startStreaming();
        }
      }, 100);
    }
    
    // Always return cleanup to clear any scheduled timeout
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [legacyVoice.isOpen, streamingVoice.isConnected, streamingVoice.isStreaming, streamingVoice.startStreaming]);

  // Request greeting once session is ready and streaming is active (always greet since we auto-start)
  useEffect(() => {
    if (
      legacyVoice.isOpen &&
      streamingVoice.isSessionReady &&
      streamingVoice.isStreaming &&
      !hasRequestedGreetingRef.current
    ) {
      hasRequestedGreetingRef.current = true;
      console.log('[Narada Stream] Session ready, requesting AI greeting...');
      streamingVoice.requestGreeting();
    }
  }, [legacyVoice.isOpen, streamingVoice.isSessionReady, streamingVoice.isStreaming, streamingVoice.requestGreeting]);

  // Handle close: disconnect everything when closing widget
  const handleClose = () => {
    console.log('[Narada Stream] Closing widget, disconnecting...');
    streamingVoice.disconnect();
    legacyVoice.closeWidget();
  };

  if (!legacyVoice.agentData) {
    return null;
  }

  const widgetDesign = (legacyVoice.agentData.widgetDesign || "voice-bar") as WidgetDesign;
  const { Component, Trigger } = WIDGET_DESIGNS[widgetDesign] || WIDGET_DESIGNS["voice-bar"];

  const designProps: WidgetDesignProps = {
    isRecording: streamingVoice.isStreaming,
    isPlaying: streamingVoice.isAISpeaking,
    isSpeaking: streamingVoice.isAISpeaking,
    isMuted: streamingVoice.isMuted,
    onRecordToggle: streamingVoice.toggleStreaming,
    onMuteToggle: streamingVoice.toggleMute,
    onClose: handleClose,
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
    isMuted: false, // Legacy doesn't support mute yet
    onRecordToggle: voiceAgent.toggleRecording,
    onMuteToggle: () => {}, // No-op for legacy
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
