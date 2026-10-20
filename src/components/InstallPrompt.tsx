import { useState, useEffect } from "react";
import { Download } from "lucide-react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the app is already installed (standalone mode)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return; // Don't show if already installed

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
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
    <div className="fixed bottom-20 left-4 right-4 bg-[#FF9800] text-white p-3 rounded-xl shadow-lg flex justify-between items-center z-50">
      <div className="flex items-center gap-2">
        <Download size={20} />
        <p className="text-sm font-bold">Install SmartSale</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setIsVisible(false)}
          className="text-xs font-bold underline opacity-80"
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          className="bg-white text-[#FF9800] text-xs font-extrabold px-3 py-1.5 rounded-lg"
        >
          Install
        </button>
      </div>
    </div>
  );
      }
