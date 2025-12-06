import { useState, useRef, useCallback, useEffect } from "react";
import { createWorkletBlobUrl } from "./audio-processor.worklet";

interface StreamingVoiceState {
  isStreaming: boolean;
  isConnected: boolean;
  isAISpeaking: boolean;
  isMuted: boolean;
  transcript: string;
  partialTranscript: string;
  audioLevel: number;
  error: string | null;
}

interface UseStreamingVoiceOptions {
  agentId: string;
  wsUrl: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onAIResponse?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useStreamingVoice(options: UseStreamingVoiceOptions) {
  const { agentId, wsUrl, onTranscript, onAIResponse, onError } = options;

  const [state, setState] = useState<StreamingVoiceState>({
    isStreaming: false,
    isConnected: false,
    isAISpeaking: false,
    isMuted: false,
    transcript: "",
    partialTranscript: "",
    audioLevel: 0,
    error: null,
  });

  // Ref to track muted state for worklet message handler
  const isMutedRef = useRef(false);

  // Refs for audio components
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Audio playback refs
  const playbackContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  
  // Jitter buffer refs for smooth audio playback
  const playbackCursorRef = useRef<number>(0); // Scheduled end time of last chunk
  const bufferedDurationRef = useRef<number>(0); // Total buffered audio duration
  const isBufferingRef = useRef(true); // Whether we're still prebuffering
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]); // Track scheduled sources
  
  // Jitter buffer configuration
  const PREBUFFER_THRESHOLD = 0.35; // Wait for 350ms of audio before starting playback
  const MIN_SCHEDULE_AHEAD = 0.02; // Schedule at least 20ms ahead of current time

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    console.log("[Narada Stream] Connecting to WebSocket:", wsUrl);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      console.log("[Narada Stream] WebSocket connected");
      setState(s => ({ ...s, isConnected: true, error: null }));
      
      // Send session init
      ws.send(JSON.stringify({
        type: "session.init",
        agentId,
      }));
    };

    ws.onmessage = async (event) => {
      if (event.data instanceof ArrayBuffer) {
        // Binary audio data from TTS
        await handleAudioChunk(event.data);
      } else {
        // JSON message
        try {
          const msg = JSON.parse(event.data);
          handleServerMessage(msg);
        } catch (e) {
          console.error("[Narada Stream] Failed to parse message:", e);
        }
      }
    };

    ws.onerror = (event) => {
      console.error("[Narada Stream] WebSocket error:", event);
      setState(s => ({ ...s, error: "Connection error" }));
      onError?.("Connection error");
    };

    ws.onclose = () => {
      console.log("[Narada Stream] WebSocket closed");
      setState(s => ({ ...s, isConnected: false }));
    };

    wsRef.current = ws;
  }, [wsUrl, agentId, onError]);

  // Handle server messages
  const handleServerMessage = useCallback((msg: any) => {
    console.log("[Narada Stream] Server message:", msg.type);
    
    switch (msg.type) {
      case "transcript.partial":
        setState(s => ({ ...s, partialTranscript: msg.text }));
        onTranscript?.(msg.text, false);
        break;
        
      case "transcript.final":
        setState(s => ({ 
          ...s, 
          transcript: msg.text,
          partialTranscript: "" 
        }));
        onTranscript?.(msg.text, true);
        break;
        
      case "response.start":
        // Reset jitter buffer state for new AI response
        scheduledSourcesRef.current.forEach(source => {
          try {
            source.stop();
          } catch (e) {
            // Ignore errors from already stopped sources
          }
        });
        scheduledSourcesRef.current = [];
        audioQueueRef.current = [];
        isBufferingRef.current = true;
        bufferedDurationRef.current = 0;
        playbackCursorRef.current = 0;
        console.log("[Narada Stream] Reset jitter buffer for new response");
        setState(s => ({ ...s, isAISpeaking: true }));
        break;
        
      case "response.text":
        onAIResponse?.(msg.text);
        break;
        
      case "response.end":
        setState(s => ({ ...s, isAISpeaking: false }));
        break;
        
      case "error":
        setState(s => ({ ...s, error: msg.message }));
        onError?.(msg.message);
        break;
    }
  }, [onTranscript, onAIResponse, onError]);

  // Handle incoming audio chunks for playback with jitter buffering
  const handleAudioChunk = useCallback(async (audioData: ArrayBuffer) => {
    if (!playbackContextRef.current) {
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      console.log("[Narada Stream] Created playback AudioContext");
      
      // Create gain node for volume control
      gainNodeRef.current = playbackContextRef.current.createGain();
      gainNodeRef.current.connect(playbackContextRef.current.destination);
      gainNodeRef.current.gain.value = isMutedRef.current ? 0 : 1;
      
      // Reset jitter buffer state for new audio session
      isBufferingRef.current = true;
      bufferedDurationRef.current = 0;
      playbackCursorRef.current = 0;
      scheduledSourcesRef.current = [];
    }

    // Resume AudioContext if suspended (required after user interaction in some browsers)
    if (playbackContextRef.current.state === "suspended") {
      await playbackContextRef.current.resume();
      console.log("[Narada Stream] Resumed AudioContext");
    }

    try {
      // Decode PCM16 to AudioBuffer
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const audioBuffer = playbackContextRef.current.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      // Add to queue and track buffered duration
      audioQueueRef.current.push(audioBuffer);
      bufferedDurationRef.current += audioBuffer.duration;
      
      // If still prebuffering, check if we have enough audio to start
      if (isBufferingRef.current) {
        console.log("[Narada Stream] Buffering: %.3fs / %.3fs", bufferedDurationRef.current, PREBUFFER_THRESHOLD);
        if (bufferedDurationRef.current >= PREBUFFER_THRESHOLD) {
          console.log("[Narada Stream] Prebuffer complete, starting scheduled playback");
          isBufferingRef.current = false;
          // Initialize cursor slightly ahead of current time
          playbackCursorRef.current = playbackContextRef.current.currentTime + MIN_SCHEDULE_AHEAD;
          scheduleAllBufferedAudio();
        }
      } else {
        // Already playing - schedule this new chunk immediately
        scheduleNextChunk();
      }
    } catch (e) {
      console.error("[Narada Stream] Audio decode error:", e);
    }
  }, []);

  // Schedule a single audio chunk at the playback cursor position
  const scheduleNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      return;
    }

    if (!playbackContextRef.current || !gainNodeRef.current) {
      console.error("[Narada Stream] No playback context or gain node");
      return;
    }

    const buffer = audioQueueRef.current.shift()!;
    const source = playbackContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(gainNodeRef.current);
    
    // Calculate when to start this chunk
    // Use the cursor, but if we've fallen behind, jump to current time + small offset
    const currentTime = playbackContextRef.current.currentTime;
    const scheduledStart = Math.max(playbackCursorRef.current, currentTime + MIN_SCHEDULE_AHEAD);
    
    // Update cursor for next chunk
    playbackCursorRef.current = scheduledStart + buffer.duration;
    
    // Track this source for cleanup
    scheduledSourcesRef.current.push(source);
    
    // Clean up ended sources from tracking array
    source.onended = () => {
      const idx = scheduledSourcesRef.current.indexOf(source);
      if (idx > -1) {
        scheduledSourcesRef.current.splice(idx, 1);
      }
      // Update playing state when all scheduled audio is done
      if (scheduledSourcesRef.current.length === 0 && audioQueueRef.current.length === 0) {
        isPlayingRef.current = false;
      }
    };
    
    // Schedule the audio to play at the calculated time
    source.start(scheduledStart);
    isPlayingRef.current = true;
    
    console.log("[Narada Stream] Scheduled chunk at %.3fs, duration: %.3fs, queue: %d", 
      scheduledStart, buffer.duration, audioQueueRef.current.length);
  }, []);

  // Schedule all currently buffered audio chunks
  const scheduleAllBufferedAudio = useCallback(() => {
    console.log("[Narada Stream] Scheduling %d buffered chunks", audioQueueRef.current.length);
    while (audioQueueRef.current.length > 0) {
      scheduleNextChunk();
    }
  }, [scheduleNextChunk]);

  // Legacy function kept for compatibility
  const playNextInQueue = useCallback(() => {
    scheduleNextChunk();
  }, [scheduleNextChunk]);

  // Start streaming
  const startStreaming = useCallback(async () => {
    console.log("[Narada Stream] Starting streaming...");
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("[Narada Stream] WebSocket not connected");
      setState(s => ({ ...s, error: "Not connected" }));
      return;
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      streamRef.current = stream;
      console.log("[Narada Stream] Microphone access granted");

      // Create AudioContext
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      
      // Set up audio level visualization
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start level monitoring
      startLevelMonitoring();

      // Load and connect AudioWorklet
      const workletUrl = createWorkletBlobUrl();
      await audioContextRef.current.audioWorklet.addModule(workletUrl);
      URL.revokeObjectURL(workletUrl);

      const workletNode = new AudioWorkletNode(audioContextRef.current, "audio-capture-processor");
      workletNodeRef.current = workletNode;

      // Handle audio data from worklet
      workletNode.port.onmessage = (event) => {
        // Only send audio if not muted
        if (event.data.type === "audio" && wsRef.current?.readyState === WebSocket.OPEN && !isMutedRef.current) {
          // Send binary audio data directly
          wsRef.current.send(event.data.audioData);
        }
      };

      // Connect audio graph
      source.connect(workletNode);

      // Notify server streaming started
      wsRef.current.send(JSON.stringify({ type: "input_audio.start" }));

      setState(s => ({ ...s, isStreaming: true, error: null }));
      console.log("[Narada Stream] Streaming started");
    } catch (error) {
      console.error("[Narada Stream] Failed to start streaming:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to access microphone";
      setState(s => ({ ...s, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [onError]);

  // Stop streaming
  const stopStreaming = useCallback(() => {
    console.log("[Narada Stream] Stopping streaming...");

    // Stop level monitoring
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Disconnect worklet
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Notify server
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "input_audio.commit" }));
    }

    setState(s => ({ ...s, isStreaming: false, audioLevel: 0 }));
    console.log("[Narada Stream] Streaming stopped");
  }, []);

  // Interrupt AI response
  const interruptAI = useCallback(() => {
    console.log("[Narada Stream] Interrupting AI...");
    
    // Stop all scheduled audio sources
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
    });
    scheduledSourcesRef.current = [];
    
    // Clear audio queue and reset jitter buffer state
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    isBufferingRef.current = true;
    bufferedDurationRef.current = 0;
    playbackCursorRef.current = 0;

    // Notify server to cancel
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "response.cancel" }));
    }

    setState(s => ({ ...s, isAISpeaking: false }));
  }, []);

  // Audio level monitoring
  const startLevelMonitoring = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      const normalizedLevel = Math.min(average / 128, 1);
      
      setState(s => ({ ...s, audioLevel: normalizedLevel }));
      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  // Toggle streaming (convenience method)
  const toggleStreaming = useCallback(() => {
    if (state.isStreaming) {
      stopStreaming();
    } else {
      startStreaming();
    }
  }, [state.isStreaming, startStreaming, stopStreaming]);

  // Mute/unmute audio (both input and output)
  const toggleMute = useCallback(() => {
    const newMutedState = !isMutedRef.current;
    isMutedRef.current = newMutedState;
    
    // Update gain node for output muting
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        newMutedState ? 0 : 1,
        playbackContextRef.current?.currentTime || 0
      );
    }
    
    console.log("[Narada Stream] Muted:", newMutedState);
    setState(s => ({ ...s, isMuted: newMutedState }));
  }, []);

  // Set mute state directly
  const setMuted = useCallback((muted: boolean) => {
    isMutedRef.current = muted;
    
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        muted ? 0 : 1,
        playbackContextRef.current?.currentTime || 0
      );
    }
    
    console.log("[Narada Stream] Set muted:", muted);
    setState(s => ({ ...s, isMuted: muted }));
  }, []);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    // Auto-connect when component mounts
    console.log("[Narada Stream] Hook mounted, connecting...");
    connect();
    
    return () => {
      console.log("[Narada Stream] Hook unmounting, cleaning up...");
      stopStreaming();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (playbackContextRef.current) {
        playbackContextRef.current.close();
        playbackContextRef.current = null;
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  // Full cleanup - stops everything and disconnects
  const disconnect = useCallback(() => {
    console.log("[Narada Stream] Disconnecting and cleaning up...");
    
    // Stop streaming first
    stopStreaming();
    
    // Stop all scheduled audio sources
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
    });
    scheduledSourcesRef.current = [];
    
    // Stop any playing audio (legacy)
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch (e) {
        // Ignore errors from already stopped sources
      }
      currentSourceRef.current = null;
    }
    
    // Clear audio queue and reset jitter buffer state
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    isBufferingRef.current = true;
    bufferedDurationRef.current = 0;
    playbackCursorRef.current = 0;
    
    // Close playback context
    if (playbackContextRef.current) {
      playbackContextRef.current.close();
      playbackContextRef.current = null;
      gainNodeRef.current = null;
    }
    
    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset state
    setState(s => ({
      ...s,
      isConnected: false,
      isStreaming: false,
      isAISpeaking: false,
      audioLevel: 0,
    }));
    
    console.log("[Narada Stream] Fully disconnected");
  }, [stopStreaming]);

  return {
    ...state,
    connect,
    disconnect,
    startStreaming,
    stopStreaming,
    toggleStreaming,
    toggleMute,
    setMuted,
    interruptAI,
  };
}
