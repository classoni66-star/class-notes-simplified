import { ArrowLeft } from "lucide-react";

export default function Analytics({ navigate, language }: any) {
  const t = (en: string, run: string) => (language === "run" ? run : en);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Analytics", "Okwefumiiriza")}</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Business Insights</h2>
        <p className="text-sm text-gray-500 mb-6">
          This is where you will see your sales history, debtors, and monthly summary.
        </p>
        <p className="text-xs text-orange-500 font-bold bg-orange-50 px-4 py-2 rounded-lg">
          Building this next...
        </p>
      </div>
    </div>
  );
      }
