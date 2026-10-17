import { useState } from "react";
import { Upload } from "lucide-react";

interface Props {
  setScreen: (s: string) => void;
  onNotesSet: (notes: string) => void;
}

export default function UploadNotes({ setScreen, onNotesSet }: Props) {
  const [notes, setNotes] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsExtracting(true);

    try {
      // Dynamically load pdfjs-dist from CDN to avoid npm install issues
      if (!(window as any).pdfjsLib) {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
        
        // Setup worker
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const pdfjsLib = (window as any).pdfjsLib;
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      setNotes(fullText);
    } catch (err) {
      alert("Failed to read PDF. Please make sure it has selectable text (not a scanned image).");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleGenerate = () => {
    if (!notes.trim()) {
      alert("Please upload a PDF or paste some notes first.");
      return;
    }
    onNotesSet(notes);
    setScreen("loading");
  };

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-10">
      <h2 className="text-white text-center text-xl font-bold mb-2">
        Upload your notes
      </h2>
      <p className="text-white/60 text-sm text-center mb-6">
        Upload a PDF or paste text below.
      </p>

      {/* File Uploader */}
      <div className="mb-4">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-2xl cursor-pointer hover:bg-white/5 transition-colors">
          <Upload className="text-white/60 mb-2" size={24} />
          <span className="text-white/80 text-sm font-semibold">
            {fileName ? fileName : "Tap to upload PDF"}
          </span>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {isExtracting && (
        <p className="text-classoni-yellow text-xs text-center animate-pulse mb-2">
          Extracting text from PDF... Please wait.
        </p>
      )}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Or paste your notes here..."
        className="flex-1 w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl p-4 focus:outline-none focus:border-classoni-yellow resize-none"
      />

      <div className="flex-shrink-0 py-6 space-y-3">
        <button
          onClick={handleGenerate}
          disabled={isExtracting}
          className={`w-full rounded-full py-4 font-bold text-lg shadow-lg ${
            isExtracting ? "bg-white/20 text-white/50" : "bg-classoni-yellow text-classoni-navy"
          }`}
        >
          Generate Lesson
        </button>
        <button
          onClick={() => setScreen("source")}
          className="w-full bg-transparent text-white/50 text-sm font-semibold py-2"
        >
          ← Back
        </button>
      </div>
    </div>
  );
                                  }
