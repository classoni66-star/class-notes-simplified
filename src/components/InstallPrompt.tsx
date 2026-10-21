import { useState, useEffect } from "react";
import { Download, X, Info, MoreVertical } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    // 1. If already installed, hide completely
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
      setShowManual(true);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end justify-center pb-6 px-4">
      
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative animate-slide-up shadow-2xl">
        
        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-gray-400 p-1 bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>

        {/* Icon and Text */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center shadow-sm mb-4 border border-orange-100">
            <span className="text-4xl">🦋</span>
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">Install SmartSale</h2>
          <p className="text-xs text-gray-500 mt-2 px-4 leading-relaxed">
            SmartSale works better as an app on your home screen. Get faster access and offline support.
          </p>
        </div>

        {/* Action Area */}
        {showManual ? (
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Info size={18} className="text-[#0055FF]" />
              <h3 className="font-bold text-[#0055FF] text-sm">How to Install</h3>
            </div>
            <div className="space-y-3 mt-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                <p className="text-xs text-gray-700">Tap the <strong>3 dots</strong> menu <MoreVertical size={14} className="inline text-gray-600"/> at the top right of your browser.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0055FF] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                <p className="text-xs text-gray-700">Select <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong>.</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-[#FF9800] text-white text-base font-bold py-4 rounded-xl shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex justify-center items-center gap-2"
          >
            <Download size={20} /> Install App Now
          </button>
        )}

      </div>
    </div>
  );
        }
