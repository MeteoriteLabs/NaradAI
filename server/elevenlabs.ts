const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

interface ElevenLabsConfig {
  voiceId: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

export async function synthesizeWithElevenLabs(
  text: string,
  config: ElevenLabsConfig
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const {
    voiceId,
    modelId = "eleven_turbo_v2_5",
    stability = 0.5,
    similarityBoost = 0.75,
  } = config;

  console.log("[ElevenLabs] Synthesizing text with voice:", voiceId);

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ElevenLabs] API error:", response.status, errorText);
    throw new Error(`ElevenLabs API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  
  console.log("[ElevenLabs] Successfully synthesized", audioBuffer.length, "bytes of audio");
  
  return audioBuffer;
}

export async function synthesizeWithElevenLabsStream(
  text: string,
  config: ElevenLabsConfig
): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY not configured");
  }

  const {
    voiceId,
    modelId = "eleven_turbo_v2_5",
    stability = 0.5,
    similarityBoost = 0.75,
  } = config;

  console.log("[ElevenLabs] Streaming synthesis with voice:", voiceId);

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}/stream`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[ElevenLabs] Stream API error:", response.status, errorText);
    throw new Error(`ElevenLabs Stream API error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);
  
  console.log("[ElevenLabs] Stream synthesized", audioBuffer.length, "bytes of audio");
  
  return audioBuffer;
}

export function mapOpenAIVoiceToElevenLabs(openaiVoice: string): string {
  const voiceMap: Record<string, string> = {
    alloy: "EXAVITQu4vr4xnSDxMaL",
    echo: "IKne3meq5aSn9XLyUdCD",
    fable: "XB0fDUnXU5powFXDhCwa",
    onyx: "TX3LPaxmHKxFdv7VOQHJ",
    nova: "pFZP5JQG7iQjIQuC4Bku",
    shimmer: "bIHbv24MWmeRgasZH58o",
  };
  return voiceMap[openaiVoice] || "EXAVITQu4vr4xnSDxMaL";
}
