// AudioWorklet processor code as inline string
// This will be loaded via Blob URL for cross-origin compatibility

export const audioProcessorCode = `
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048;
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) {
      return true;
    }

    const inputChannel = input[0];

    for (let i = 0; i < inputChannel.length; i++) {
      this.buffer[this.bufferIndex++] = inputChannel[i];

      if (this.bufferIndex >= this.bufferSize) {
        const int16Buffer = this.float32ToInt16(this.buffer);
        this.port.postMessage({
          type: 'audio',
          audioData: int16Buffer.buffer
        }, [int16Buffer.buffer]);

        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
      }
    }

    return true;
  }

  float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
`;

// Helper to create Blob URL from worklet code
export function createWorkletBlobUrl(): string {
  const blob = new Blob([audioProcessorCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
}
