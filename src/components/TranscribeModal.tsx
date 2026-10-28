import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Mic, AlertCircle, Loader2 } from 'lucide-react';

// ------------------------------------------------------------------
// 1. Load Transformers.js from jsDelivr (much more reliable than esm.sh)
// ------------------------------------------------------------------
const TRANSFORMERS_CDN =
  'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

let pipeline: any = null;
let env: any = null;

const loadTransformers = async () => {
  if (pipeline) return { pipeline, env };

  const module = await import(
    /* @vite-ignore */
    `${TRANSFORMERS_CDN}/dist/transformers.min.js`
  );
  pipeline = module.pipeline;
  env = module.env;

  // ------------------------------------------------------------------
  // 2. Critical environment settings for mobile / offline use
  // ------------------------------------------------------------------
  // We are not hosting models locally, so skip the local check.
  env.allowLocalModels = false;

  // Allow the browser to cache the model & WASM files after first download.
  // This is essential for offline use and saves data on repeat uses.
  env.useBrowserCache = true;

  // Force a single WASM thread – avoids SharedArrayBuffer/CORS issues on
  // many mobile browsers and prevents the “stuck on downloading” loop.
  if (env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.numThreads = 1;
  }

  return { pipeline, env };
};

// ------------------------------------------------------------------
// 3. Component
// ------------------------------------------------------------------
interface TranscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
}

export default function TranscribeModal({
  isOpen,
  onClose,
  onTranscript,
}: TranscribeModalProps) {
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'downloading' | 'transcribing' | 'done' | 'error'
  >('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [transcript, setTranscript] = useState('');
  const transcriberRef = useRef<any>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setProgress(0);
      setErrorMessage('');
      setTranscript('');
    }
  }, [isOpen]);

  // ------------------------------------------------------------------
  // 4. Main transcription flow
  // ------------------------------------------------------------------
  const handleStartTranscription = async () => {
    setStatus('loading');
    setErrorMessage('');
    setProgress(0);

    try {
      // Load the library from CDN
      const { pipeline: createPipeline, env } = await loadTransformers();

      // If we already have a transcriber instance, reuse it (model is cached)
      if (transcriberRef.current) {
        setStatus('transcribing');
        await runTranscription(transcriberRef.current);
        return;
      }

      // ----------------------------------------------------------------
      // 5. Create the ASR pipeline (this is where the model downloads)
      // ----------------------------------------------------------------
      setStatus('downloading');

      // Use the smaller English‑only model to reduce download size.
      // If you need multilingual support, change to 'Xenova/whisper-tiny'.
      const modelId = 'Xenova/whisper-tiny.en';

      const transcriber = await createPipeline(
        'automatic-speech-recognition',
        modelId,
        {
          quantized: true, // smaller quantized weights
          progress_callback: (data: any) => {
            // `data` contains { status, progress, file, ... }
            if (data.status === 'progress') {
              // progress is a percentage (0–100)
              setProgress(Math.round(data.progress));
            }
            if (data.status === 'done') {
              // One file finished; keep the bar at 100 for that file
              setProgress(100);
            }
          },
        }
      );

      transcriberRef.current = transcriber;
      setStatus('transcribing');
      await runTranscription(transcriber);
    } catch (err: any) {
      console.error('Transcription failed:', err);
      setStatus('error');
      setErrorMessage(
        'Could not load the AI model. Please check your internet connection, ' +
          'then try again. The model will be cached after the first successful download.'
      );
    }
  };

  const runTranscription = async (transcriber: any) => {
    // In a real implementation you would record audio via the MediaRecorder API
    // and pass the audio Blob/File to the transcriber.
    // For this handover the placeholder below demonstrates the call.
    //
    // const audioBlob = await recordAudio(); // your existing recorder logic
    // const result = await transcriber(audioBlob);
    // setTranscript(result.text);
    // onTranscript(result.text);
    //
    // Because the recorder logic is outside the scope of this fix, we simulate
    // a successful transcription after a short delay so you can test the UI.
    await new Promise((resolve) => setTimeout(resolve, 800));
    const fakeText = 'This is a simulated transcription. Replace with real audio.';
    setTranscript(fakeText);
    onTranscript(fakeText);
    setStatus('done');
  };

  // ------------------------------------------------------------------
  // 6. Render (UI kept exactly as described)
  // ------------------------------------------------------------------
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-t-3xl bg-white shadow-xl"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* -------------------- Banner -------------------- */}
          <div className="flex items-center justify-between rounded-t-3xl bg-[#0055FF] px-5 py-4 text-white">
            <div className="flex items-center gap-2">
              <Mic size={20} />
              <span className="font-semibold">Voice to Sale</span>
            </div>
            <button onClick={onClose} className="rounded-full p-1 hover:bg-white/20">
              <X size={20} />
            </button>
          </div>

          {/* -------------------- Body -------------------- */}
          <div className="px-5 py-6">
            {status === 'idle' && (
              <div className="text-center">
                <p className="mb-4 text-gray-600">
                  Tap the button and speak your sale. The AI will turn it into text.
                </p>
                <button
                  onClick={handleStartTranscription}
                  className="w-full rounded-xl bg-[#FF9800] py-3 font-semibold text-white shadow hover:bg-[#e68a00]"
                >
                  Start Recording
                </button>
              </div>
            )}

            {(status === 'loading' || status === 'downloading') && (
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 animate-spin text-[#0055FF]" size={32} />
                <p className="text-sm font-medium text-gray-700">
                  {status === 'loading'
                    ? 'Loading AI library…'
                    : `Downloading AI model… ${progress}%`}
                </p>
                {status === 'downloading' && (
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-[#0055FF] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  First time may take a few minutes on mobile data.
                </p>
              </div>
            )}

            {status === 'transcribing' && (
              <div className="text-center">
                <Loader2 className="mx-auto mb-3 animate-spin text-[#FF9800]" size={32} />
                <p className="text-sm font-medium text-gray-700">Transcribing…</p>
              </div>
            )}

            {status === 'done' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Check className="text-green-600" size={24} />
                </div>
                <p className="mb-2 text-sm font-medium text-gray-700">Transcription complete</p>
                <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                  {transcript}
                </p>
                <button
                  onClick={onClose}
                  className="mt-4 w-full rounded-xl bg-[#0055FF] py-2 text-sm font-semibold text-white"
                >
                  Use this text
                </button>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <X className="text-red-600" size={24} />
                </div>
                <p className="text-sm font-medium text-red-600">Something went wrong</p>
                <p className="mt-2 text-xs text-gray-500">{errorMessage}</p>
                <button
                  onClick={handleStartTranscription}
                  className="mt-4 w-full rounded-xl bg-[#FF9800] py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
