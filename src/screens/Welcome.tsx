import { useState } from "react";
import { motion } from "framer-motion";
import { Butterfly, ChevronRight } from "lucide-react";

export default function Welcome({ navigate, language, setLanguage, startDemo }: any) {
  const [showDemo, setShowDemo] = useState(false);

  // Translation Helper
  const t = (en: string, run: string) => (language === "run" ? run : en);

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 relative">
      
      {/* Language Selector at top right */}
      <div className="absolute top-6 right-6 flex bg-white rounded-full shadow-sm border border-gray-200 p-1">
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === "en" ? "bg-[#FF9800] text-white" : "text-gray-500"}`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage("run")}
          className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${language === "run" ? "bg-[#FF9800] text-white" : "text-gray-500"}`}
        >
          Runyankole
        </button>
      </div>

      {/* Branding */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 relative"
      >
        {/* Using an emoji as a placeholder for the Bright Orange/Blue Butterfly SVG */}
        <span className="text-6xl drop-shadow-md">🦋</span>
      </motion.div>

      <h1 className="text-3xl font-extrabold text-gray-800 mb-2 text-center">
        SmartSale
      </h1>
      <p className="text-gray-500 text-center mb-10 text-sm font-medium px-4">
        {t("Manage your business with less stress", "Manage your business with less stress (Runyankole translation here)")}
      </p>

      {/* Main Action Buttons */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate("onboarding")}
          className="w-full bg-[#FF9800] text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex justify-between px-6 items-center"
        >
          <span>{t("Start My Journey", "Tandika Urugendo Rwangye")}</span>
          <ChevronRight size={20} />
        </button>

        <button
          onClick={() => setShowDemo(!showDemo)}
          className="w-full bg-white text-gray-600 py-3 rounded-2xl font-semibold text-sm shadow-sm border border-gray-200 active:scale-95 transition-transform"
        >
          {t("Try Demo", "Linga Demo")}
        </button>
      </div>

      {/* 🦋 SECRET OWNER DEMO MENU */}
      {showDemo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-4 p-4 bg-gray-800 rounded-xl w-full max-w-xs shadow-2xl"
        >
          <p className="text-white text-xs text-center font-bold mb-3 uppercase tracking-wider">Owner Demo Mode</p>
          <div className="space-y-2">
            <button
              onClick={() => startDemo("new")}
              className="w-full bg-[#0055FF] text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
            >
              Simulate New User
            </button>
            <button
              onClick={() => startDemo("returning")}
              className="w-full bg-[#10B981] text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
            >
              Simulate Returning User (Morning)
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <div className="absolute bottom-6 text-center w-full">
        <p className="text-[10px] text-gray-400 font-medium">
          Made in Uganda 🇺🇬 | smartsale.ug
        </p>
      </div>
    </div>
  );
        }
