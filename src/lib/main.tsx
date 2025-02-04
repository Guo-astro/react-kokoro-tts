import { useRef, useState, useEffect, FormEvent, ChangeEvent } from "react";
import { motion } from "motion/react";

interface WorkerMessageEventData {
  status: string;
  audio?: string;
  text?: string;
  data?: unknown;
}

interface Result {
  text: string;
  src: string;
}
interface KokoroComponentProps {
  workerUrl: string;
}

export function KokoroComponent({ workerUrl }: KokoroComponentProps) {
  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  const [inputText, setInputText] = useState<string>(
    "Life is like a box of chocolates. You never know what you're gonna get."
  );
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>("af");

  const [status, setStatus] = useState<string | null>(null);
  // Removed setError since it's never used
  const [error] = useState<string | null>(null);
  // Removed setLoadingMessage since it's never used
  const [loadingMessage] = useState<string>(
    "Loading model (only downloaded once)..."
  );

  const [results, setResults] = useState<Result[]>([]);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(workerUrl, {
        type: "module", // adjust if needed based on your worker script
      });
    }

    const onMessageReceived = (e: MessageEvent<WorkerMessageEventData>) => {
      switch (e.data.status) {
        case "ready":
          setStatus("ready");
          break;
        case "complete": {
          const { audio, text } = e.data;
          if (audio && text) {
            setResults((prev) => [{ text, src: audio }, ...prev]);
          }
          setStatus("ready");
          break;
        }
        default:
          break;
      }
    };

    const onErrorReceived = (e: ErrorEvent) => {
      console.error("Worker error:", e);
    };

    worker.current.addEventListener("message", onMessageReceived);
    worker.current.addEventListener("error", onErrorReceived);

    return () => {
      if (worker.current) {
        worker.current.removeEventListener("message", onMessageReceived);
        worker.current.removeEventListener("error", onErrorReceived);
      }
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("running");

    worker.current?.postMessage({
      type: "generate",
      text: inputText.trim(),
      voice: selectedSpeaker,
    });
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const handleSpeakerChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSpeaker(e.target.value);
  };

  return (
    <div
      className="relative w-full min-h-screen bg-gradient-to-br 
                 from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 
                 flex flex-col items-center justify-center p-4 overflow-hidden font-sans"
    >
      {" "}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: status === null ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="absolute w-screen h-screen justify-center flex flex-col items-center z-10 
        bg-gray-800/95 dark:bg-gray-200/95 backdrop-blur-md"
        style={{ pointerEvents: status === null ? "auto" : "none" }}
      >
        <div className="w-[250px] h-[250px] border-4 border-white shadow-[0_0_0_5px_#4973ff] rounded-full overflow-hidden">
          <div className="loading-wave"></div>
        </div>
        <p
          className={`text-3xl my-5 text-center ${
            error ? "text-red-500" : "text-white dark:text-gray-800"
          }`}
        >
          {error ?? loadingMessage}
        </p>
      </motion.div>
      <div className="max-w-3xl w-full space-y-8 relative z-[2]">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-100 dark:text-gray-900 mb-2 drop-shadow-lg font-heading">
            Kokoro Text-to-Speech
          </h1>
          <p className="text-2xl text-gray-300 font-semibold font-subheading">
            Powered by&nbsp;
            <a
              href="https://github.com/hexgrad/kokoro"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Kokoro
            </a>
            &nbsp;and&nbsp;
            <a
              href="https://huggingface.co/docs/transformers.js"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Transformers.js
            </a>
          </p>
        </div>
        <div className="bg-gray-800/50 dark:bg-gray-200/50 backdrop-blur-sm border border-gray-700 dark:border-gray-300 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              placeholder="Enter text..."
              value={inputText}
              onChange={handleTextChange}
              className="w-full min-h-[100px] max-h-[300px] bg-gray-700/50 dark:bg-gray-200/50 
                         backdrop-blur-sm border-2 border-gray-600 dark:border-gray-400 
                         rounded-xl resize-y text-gray-100 dark:text-gray-900 placeholder-gray-400 
                         px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={Math.min(8, inputText.split("\n").length)}
            />
            <div className="flex flex-col items-center space-y-4">
              <select
                value={selectedSpeaker}
                onChange={handleSpeakerChange}
                className="w-full bg-gray-700/50 dark:bg-gray-200/50 backdrop-blur-sm border-2 border-gray-600 dark:border-gray-400 
                           rounded-xl text-gray-100 dark:text-gray-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="af">Default (American Female)</option>
                <option value="af_bella">Bella (American Female)</option>
                <option value="af_nicole">Nicole (American Female)</option>
                <option value="af_sarah">Sarah (American Female)</option>
                <option value="af_sky">Sky (American Female)</option>
                <option value="am_adam">Adam (American Male)</option>
                <option value="am_michael">Michael (American Male)</option>
                <option value="bf_emma">Emma (British Female)</option>
                <option value="bf_isabella">Isabella (British Female)</option>
                <option value="bm_george">George (British Male)</option>
                <option value="bm_lewis">Lewis (British Male)</option>
              </select>
              <button
                type="submit"
                className="inline-flex justify-center items-center px-6 py-2 text-lg font-semibold 
                           bg-gradient-to-t from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 
                           transition-colors duration-300 rounded-xl text-white disabled:opacity-50"
                disabled={status === "running" || inputText.trim() === ""}
              >
                {status === "running" ? "Generating..." : "Generate"}
              </button>
            </div>
          </form>
        </div>

        {results.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-h-[250px] overflow-y-auto px-2 mt-4 space-y-6 relative z-[2]"
          >
            {results.map((result, i) => (
              <div key={i}>
                <div
                  className="text-white dark:text-gray-900 bg-gray-800/70 dark:bg-gray-200/70 
                                backdrop-blur-sm border border-gray-700 dark:border-gray-300 rounded-lg p-4 z-10 relative"
                >
                  <span className="absolute right-5 font-bold">
                    #{results.length - i}
                  </span>
                  <p className="mb-3 max-w-[95%]">{result.text}</p>
                  <audio controls src={result.src} className="w-full">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      <div className="bg-[#015871] pointer-events-none absolute left-0 w-full h-[5%] bottom-[-50px]">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}
