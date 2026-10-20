import { useState, useEffect } from "react";
import { Gift, User, ArrowUpRight, PlusCircle, Package, BarChart3 } from "lucide-react";

// 🦋 Custom Brand Butterfly (Orange & Blue)
const BrandButterfly = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 12C12 12 8 4 3 6C-1 8 2 16 7 18C11 19.5 12 12 12 12Z" fill="#FF9800" />
    <path d="M12 12C12 12 16 4 21 6C25 8 22 16 17 18C13 19.5 12 12 12 12Z" fill="#0055FF" />
    <path d="M12 10C12 10 10 16 8 20C6 23 11 23 12 19C13 23 18 23 16 20C14 16 12 10 12 10Z" fill="#0055FF" opacity="0.8" />
    <circle cx="12" cy="12" r="1.5" fill="#0A1F44" />
  </svg>
);

export default function Home({ navigate, businessInfo, language }: any) {
  const [greeting, setGreeting] = useState("Hello");
  const [todayDate, setTodayDate] = useState("");

  // Get the time of day and today's date
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setTodayDate(now.toLocaleDateString('en-GB', options));
  }, []);

  const t = (en: string, run: string) => (language === "run" ? run : en);

  if (!businessInfo) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <p className="text-gray-500 mb-4">No business data found.</p>
        <button onClick={() => navigate("welcome")} className="bg-[#FF9800] text-white px-6 py-2 rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  // Pull fake data if in Demo mode, otherwise default to 0
  const salesToday = businessInfo.isDemo ? 150000 : 0;
  const profitToday = businessInfo.isDemo ? 25000 : 0;
  const stockToday = businessInfo.isDemo ? 120 : 0;
  const debtorsTotal = businessInfo.isDemo ? 3 : 0;
  const creditorsTotal = businessInfo.isDemo ? 1 : 0;

  const formatMoney = (amount: number) => `UGX ${amount.toLocaleString()}`;

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6] overflow-y-auto">
      
      {/* HEADER */}
      <header className="bg-white px-5 py-4 flex justify-between items-start shadow-sm sticky top-0 z-10">
        <div>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">{greeting}</p>
          <h1 className="text-xl font-extrabold text-gray-800">{businessInfo.name}</h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">{todayDate}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("rewards")} className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
            <Gift size={20} />
          </button>
          <button onClick={() => navigate("profile")} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <User size={20} />
          </button>
        </div>
      </header>

      <div className="p-5 space-y-4 pb-20">
        
        {/* STORAGE BAR */}
        <div className="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
              <BrandButterfly className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Free Plan</p>
              <p className="text-xs font-bold text-gray-700">2 Days Unlimited</p>
            </div>
          </div>
          <button className="bg-[#0055FF] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm">
            Buy Storage
          </button>
        </div>

        {/* MAIN STATS GRID */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Sales */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-[11px] text-gray-500 font-bold uppercase">{t("Sales", "Okutunda")}</p>
            <p className="text-lg font-extrabold text-gray-800 mt-1">{formatMoney(salesToday)}</p>
            <div className="flex items-center gap-1 mt-2 text-green-500">
              <ArrowUpRight size={14} />
              <span className="text-[10px] font-bold">+12% vs yesterday</span>
            </div>
          </div>

          {/* Profit */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <p className="text-[11px] text-gray-500 font-bold uppercase">{t("Profit", "Amagoba")}</p>
            <p className="text-lg font-extrabold text-gray-800 mt-1">{formatMoney(profitToday)}</p>
            <div className="flex items-center gap-1 mt-2 text-green-500">
              <ArrowUpRight size={14} />
              <span className="text-[10px] font-bold">+5% vs yesterday</span>
            </div>
          </div>

          {/* Debtors */}
          <div onClick={() => navigate("debtors")} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[11px] text-gray-500 font-bold uppercase">{t("Debtors", "Babanja")}</p>
            <p className="text-2xl font-extrabold text-red-500 mt-1">{debtorsTotal}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-2">Tap to view</p>
          </div>

          {/* Creditors */}
          <div onClick={() => navigate("creditors")} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[11px] text-gray-500 font-bold uppercase">{t("Creditors", "Abakuguzi")}</p>
            <p className="text-2xl font-extrabold text-orange-500 mt-1">{creditorsTotal}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-2">Tap to view</p>
          </div>

          {/* Stock (New) */}
          <div onClick={() => navigate("stock")} className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
            <div>
              <p className="text-[11px] text-gray-500 font-bold uppercase">{t("Stock", "Okugula")}</p>
              <p className="text-xl font-extrabold text-gray-800 mt-1">{stockToday} Items</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
              <Package size={20} />
            </div>
          </div>

        </div>

        {/* ACTION FLOW (Add Sale -> Suggestions) */}
        <div className="pt-2">
          {/* Add Sale Button - Now Centered in flow */}
          <button 
            onClick={() => navigate("addSale")}
            className="w-full bg-[#FF9800] text-white py-4 rounded-2xl font-extrabold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex justify-center items-center gap-2"
          >
            <PlusCircle size={22} />
            {t("Tunda (Add Sale)", "Tunda")}
          </button>

          {/* Suggestion Box - Moved below Add Sale */}
          <div className="mt-4 bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-blue-800">Have a suggestion?</h3>
              <p className="text-[11px] text-blue-600 mt-1">Help us improve SmartSale.</p>
            </div>
            <a 
              href="https://wa.me/256708032236" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0055FF] text-white text-xs font-bold px-4 py-2 rounded-lg"
            >
              Chat Us
            </a>
          </div>
        </div>

      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[72px] z-30">
        <button onClick={() => navigate("stock")} className="flex flex-col items-center gap-1 text-gray-400">
          <Package size={22} />
          <span className="text-[10px] font-bold">{t("Stock", "Okugula")}</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#FF9800]">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
             <BrandButterfly className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">{t("Home", "Aha")}</span>
        </button>
        <button onClick={() => navigate("priceList")} className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">🏷️</span>
          <span className="text-[10px] font-bold">{t("Prices", "Ebihenda")}</span>
        </button>
        <button onClick={() => navigate("analytics")} className="flex flex-col items-center gap-1 text-gray-400">
          <BarChart3 size={22} />
          <span className="text-[10px] font-bold">{t("Analytics", "Okwefumiiriza")}</span>
        </button>
      </nav>

    </div>
  );
                                                 }
