import { KokoroTTS } from "kokoro-js";

let tts = null;

(async () => {
  const model_id = "onnx-community/Kokoro-82M-ONNX";
  tts = await KokoroTTS.from_pretrained(model_id, {
    dtype: "q8", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
  });

  self.postMessage({ status: "ready" });
})();

self.addEventListener("message", async (e) => {
  // Ensure tts is initialized before processing messages
  if (!tts) {
    console.error("TTS model not loaded yet.");
    return;
  }

  const { text, voice } = e.data;

  try {
    // Generate speech
    const audio = await tts.generate(text, { voice });

    // Convert the generated audio to a Blob
    const blob = audio.toBlob();

    // Send the audio file back to the main thread
    self.postMessage({ status: "complete", audio: URL.createObjectURL(blob), text });
  } catch (error) {
    console.error("Error generating speech:", error);
    self.postMessage({ status: "error", error: error.toString() });
  }
});
