import { useState, useEffect } from "react";
import { Download, X, Info } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true); 
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // 1. If already installed, hide immediately
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
      return;
    }

    // 2. Catch the native install event
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener("beforeinstallprompt", handler);
    
    // 3. Hide if installed
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
      // Try native popup
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      // If Chrome blocks it, show the manual fallback immediately
      setShowManual(true);
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

      {showManual ? (
        <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mt-1">
          <div className="flex items-start gap-2">
            <Info size={16} className="text-[#0055FF] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] text-gray-800 font-bold mb-1">To install, tap your browser menu:</p>
              <p className="text-[10px] text-gray-600 leading-snug">
                1. Tap the <strong>3 dots (⋮)</strong> at the top right.<br/>
                2. Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.
              </p>
            </div>
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
