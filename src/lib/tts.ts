import { ProsodyOptions } from "edge-tts-universal";
import { EdgeTTS } from "edge-tts-universal/browser";

export async function getTTSAudioUrl(
  text: string,
  short_name: string,
  options: ProsodyOptions | undefined = undefined,
) {
  const tts = new EdgeTTS(text, short_name, options);
  try {
    const result = await tts.synthesize();
    return URL.createObjectURL(result.audio);
  } catch (e) {
    throw e;
  }
}
