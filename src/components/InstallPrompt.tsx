import { useState } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  // Force it to be visible no matter what
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleInstall = () => {
    alert("To install: Tap the 3 dots (⋮) at the top right of Chrome and select 'Add to Home screen' or 'Install app'.");
  };

  return (
    <div className="absolute bottom-[75px] left-4 right-4 bg-white border-2 border-red-500 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 z-[9999]">
      
      <button 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-400 p-1 bg-gray-50 rounded-full"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-2xl">🦋</span>
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-gray-800 leading-tight">Install SmartSale</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">SmartSale works better as an app on your home screen.</p>
        </div>
      </div>

      <button
        onClick={handleInstall}
        className="w-full bg-[#FF9800] text-white text-sm font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
      >
        <Download size={16} /> Add to Home Screen
      </button>
    </div>
  );
}
