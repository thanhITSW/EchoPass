import { buildMediaPath, uploadFile } from "@/lib/storage";

export async function generateSpeech(input: {
  userId: string;
  capsuleId: string;
  text: string;
}): Promise<string> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!voiceId || !apiKey) {
    throw new Error("ElevenLabs is not configured");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: input.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`ElevenLabs error: ${message}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const path = buildMediaPath(input.userId, input.capsuleId, "future-letter.mp3");

  return uploadFile(path, audioBuffer, "audio/mpeg");
}
