const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech";
const DEFAULT_VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Sarah - a natural conversational voice

interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

interface SynthesizeOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: VoiceSettings;
}

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

export function getElevenLabsApiKey(): string {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY environment variable is not set. " +
      "Please add your ElevenLabs API key to use voice synthesis."
    );
  }
  return apiKey;
}

export async function synthesizeWithElevenLabs(
  text: string,
  options: SynthesizeOptions = {}
): Promise<Buffer> {
  const apiKey = getElevenLabsApiKey();
  
  const voiceId = options.voiceId || DEFAULT_VOICE_ID;
  const modelId = options.modelId || "eleven_multilingual_v2";
  const voiceSettings = options.voiceSettings || DEFAULT_VOICE_SETTINGS;

  const url = `${ELEVENLABS_API_URL}/${voiceId}/stream`;

  console.log(`[ElevenLabs] Synthesizing text with voice: ${voiceId}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: voiceSettings,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[ElevenLabs] API error (${response.status}):`, errorText);
    throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  
  console.log(`[ElevenLabs] Successfully synthesized ${audioBuffer.length} bytes of audio`);
  
  return audioBuffer;
}

export const ELEVENLABS_VOICES: Record<string, string> = {
  sarah: "EXAVITQu4vr4xnSDxMaL",
  charlie: "IKne3meq5aSn9XLyUdCD",
  emily: "LcfcDJNUP1GQjkzn1xUU",
  jessica: "cgSgspJ2msm6clMCkdW9",
  brian: "nPczCjzI2devNBz1zQrb",
  aria: "9BWtsMINqrJLrRacOk9x",
  roger: "CwhRBWXzGAHq8TQ4Fs17",
  drew: "29vD33N1CtxCmqQRPOHJ",
};

export function mapOpenAIVoiceToElevenLabs(openaiVoice?: string | null): string {
  const voiceMap: Record<string, string> = {
    alloy: ELEVENLABS_VOICES.sarah,
    echo: ELEVENLABS_VOICES.charlie,
    fable: ELEVENLABS_VOICES.emily,
    onyx: ELEVENLABS_VOICES.brian,
    nova: ELEVENLABS_VOICES.aria,
    shimmer: ELEVENLABS_VOICES.jessica,
  };
  
  return voiceMap[openaiVoice || "alloy"] || ELEVENLABS_VOICES.sarah;
}
