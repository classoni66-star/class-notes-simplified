import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return; 

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem("smartsale_installed", "true");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-[75px] left-4 right-4 bg-white border-2 border-[#FF9800] p-4 rounded-2xl shadow-2xl flex flex-col gap-3 z-[100]">
      
      {/* Close Button (Just in case they want to dismiss it for now) */}
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
