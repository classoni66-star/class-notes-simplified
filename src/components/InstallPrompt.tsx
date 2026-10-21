import { useState, useEffect } from "react";
import { Download, X, Info } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); 
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) {
      setIsVisible(false);
      return; 
    }

    const handler = (e: Event) => {
      e.preventDefault();
      console.log("Native install prompt fired!");
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // If Chrome still refuses, show the manual instructions
      setShowManualInstructions(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-[75px] left-4 right-4 bg-white border-2 border-[#FF9800] p-4 rounded-2xl shadow-2xl flex flex-col gap-3 z-[100]">
      
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

      {showManualInstructions ? (
        <div className="bg-orange-50 p-2 rounded-lg border border-orange-200 mt-1">
          <div className="flex items-start gap-1">
            <Info size={14} className="text-[#FF9800] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-gray-700 font-medium leading-snug">
              If the popup didn't appear, tap the <strong>3 dots (⋮)</strong> at the top right of your browser and select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className="w-full bg-[#FF9800] text-white text-sm font-bold py-2.5 rounded-xl shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          <Download size={16} /> Add to Home Screen
        </button>
      )}
    </div>
  );
      }
