import { useState, useEffect } from "react";
import { Gift, User, ArrowUpRight, PlusCircle, Package, BarChart3, Home as HomeIcon, Lock, Play, MinusCircle, Plus } from "lucide-react";
import InstallPrompt from "../components/InstallPrompt";
import TrafficModal from "./TrafficModal";
import FinanceModal from "./FinanceModal";

export default function Home({ navigate, businessInfo, language }: any) {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [todayDate, setTodayDate] = useState("");
  const [isPremium, setIsPremium] = useState(true);
  const [isTrafficOpen, setIsTrafficOpen] = useState(false);
  const [financeModalType, setFinanceModalType] = useState<"fund" | "spend" | null>(null);
  
  const [stats, setStats] = useState({
    sales: 0, profit: 0, debtors: 0, creditors: 0, stock: 0, cashAtHand: 0
  });

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    setTodayDate(now.toLocaleDateString('en-GB', options));

    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    setIsPremium(premiumUntil > Date.now());
  }, []);

  const calculateStats = () => {
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const todayStr = new Date().toDateString();
    const todaySales = savedSales.filter((sale: any) => new Date(sale.date).toDateString() === todayStr);

    let totalSales = 0;
    let totalProfit = 0;
    let cashSales = 0;
    let newDebts = 0;

    const savedPriceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    const hasConfirmedPrices = savedPriceList.some((item: any) => item.buyingPrice > 0 && item.sellingPrice > 0);

    todaySales.forEach((sale: any) => {
      totalSales += Number(sale.total) || 0;
      if (sale.isPaid) cashSales += Number(sale.total) || 0;
      else newDebts += Number(sale.total) || 0;
      
      const sellPrice = Number(sale.sellingPrice) || 0;
      const buyPrice = Number(sale.buyingPrice) || 0;
      const qty = Number(sale.quantity) || 0;
      const itemProfit = (sellPrice - buyPrice) * qty;
      
      if (hasConfirmedPrices && !isNaN(itemProfit)) {
        totalProfit += itemProfit;
      } else {
        totalProfit = -1; // Indicate profit not ready
      }
    });

    // Funds & Expenses
    const todayFunds = JSON.parse(localStorage.getItem("smartsale_funds") || "[]")
      .filter((f: any) => new Date(f.date).toDateString() === todayStr)
      .reduce((sum: number, f: any) => sum + Number(f.amount), 0);

    const todayExpenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]")
      .filter((e: any) => new Date(e.date).toDateString() === todayStr)
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    // Yesterday's Cash (Simulated as 0 for now, we will store it explicitly later)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayCash = Number(localStorage.getItem(`smartsale_cash_${yesterday.toDateString()}`) || 0);

    // Cash at Hand Math
    const cashAtHand = yesterdayCash + cashSales + todayFunds - todayExpenses;

    // Store today's cash for tomorrow
    localStorage.setItem(`smartsale_cash_${new Date().toDateString()}`, cashAtHand.toString());

    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
    const activeDebtors = savedDebtors.filter((d: any) => Number(d.amountOwed) > 0).length;
    
    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]");
    const activeCreditors = savedCreditors.filter((c: any) => Number(c.amountOwed) > 0).length;
    
    const savedInitialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const allSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const allRemovals = JSON.parse(localStorage.getItem("smartsale_removals") || "[]");

    let totalStockLeft = 0;
    savedPriceList.forEach((item: any) => {
      const initialEntry = savedInitialStock.find((s: any) => s.itemId === item.id);
      const initial = initialEntry ? Number(initialEntry.quantity) : 0;
      const itemSales = allSales.filter((s: any) => s.itemName === item.name);
      const sold = itemSales.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
      const itemRemovals = allRemovals.filter((r: any) => r.itemId === item.id);
      const removed = itemRemovals.reduce((sum: number, r: any) => sum + Number(r.quantity), 0);
      const current = initial - sold - removed;
      if (current > 0) totalStockLeft += current; 
    });
    
    setStats({
      sales: totalSales, profit: totalProfit, debtors: activeDebtors, creditors: activeCreditors, stock: totalStockLeft, cashAtHand: cashAtHand
    });
  };

  useEffect(() => {
    calculateStats();
  }, [businessInfo, financeModalType]); // Recalculate when modal opens/closes

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

  const formatMoney = (amount: number) => `UGX ${Math.round(amount).toLocaleString()}`;
  const greeting = timeOfDay === "morning" ? t("Good morning", "Oraire gye") : timeOfDay === "afternoon" ? t("Good afternoon", "Osiiba gye") : t("Good evening", "Okwera gye");

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden relative">
      
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div>
          <p className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">{greeting}</p>
          <h1 className="text-lg font-extrabold text-gray-800 leading-tight">{businessInfo.name}</h1>
          <p className="text-[10px] text-gray-400 font-medium mt-1">{todayDate}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex gap-2 mb-1">
            <button onClick={() => navigate("rewards")} className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
              <Gift size={16} />
            </button>
            <button onClick={() => navigate("profile")} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              <User size={16} />
            </button>
          </div>
          <button onClick={() => navigate("buyStorage")} className="text-[10px] font-bold text-white bg-[#0055FF] px-3 py-1 rounded shadow-sm active:scale-95 transition-transform">
            Go Premium
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-between p-4 pb-[75px] overflow-y-auto">
        
        <div className="space-y-2.5">
          
          {/* CASH AT HAND CARD */}
          <div className="bg-[#0055FF] p-4 rounded-xl shadow-lg text-white flex justify-between items-center">
             <div>
               <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{t("Cash at Hand", "Sente eziri mu mukono")}</p>
               <p className="text-2xl font-extrabold mt-1">{formatMoney(stats.cashAtHand)}</p>
             </div>
             <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold">$</span>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div onClick={() => navigate("analytics")} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
              <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Sales", "Okutunda")}</p>
              <p className="text-base font-extrabold text-gray-800 mt-0.5">{formatMoney(stats.sales)}</p>
            </div>

            <div onClick={() => navigate("analytics")} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${!isPremium ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Profit", "Amagoba")}</p>
                {!isPremium && <Lock size={12} className="text-red-400" />}
              </div>
              <p className="text-base font-extrabold text-[#0055FF] mt-0.5">
                {isPremium ? (stats.profit === -1 ? "Confirm Prices" : formatMoney(stats.profit)) : "UGX ***"}
              </p>
            </div>

            <div onClick={() => navigate("analytics")} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${!isPremium ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Debtors", "Babanja")}</p>
                {!isPremium && <Lock size={12} className="text-red-400" />}
              </div>
              <p className="text-lg font-extrabold text-red-500 mt-0.5">{isPremium ? stats.debtors : "***"}</p>
            </div>

            <div onClick={() => navigate("analytics")} className={`bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform ${!isPremium ? 'opacity-70' : ''}`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Creditors", "Abakuguzi")}</p>
                {!isPremium && <Lock size={12} className="text-red-400" />}
              </div>
              <p className="text-lg font-extrabold text-orange-500 mt-0.5">{isPremium ? stats.creditors : "***"}</p>
            </div>

            <div onClick={() => navigate("stock")} className={`col-span-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer active:scale-95 transition-transform ${!isPremium ? 'opacity-70' : ''}`}>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Stock", "Okugula")}</p>
                <p className="text-base font-extrabold text-gray-800 mt-0.5">
                  {isPremium ? `${stats.stock} Items` : "Locked"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
                {isPremium ? <Package size={16} /> : <Lock size={16} className="text-red-400" />}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-2">
          <button 
            onClick={() => navigate("addSale")}
            className="w-full bg-[#FF9800] text-white py-3.5 rounded-2xl font-extrabold text-lg shadow-lg shadow-orange-500/30 active:scale-95 transition-transform flex justify-center items-center gap-2"
          >
            <PlusCircle size={20} />
            {t("Add Sale", "Tunda")}
          </button>

          <div className="mt-3 bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex justify-between items-center">
            <div>
              <h3 className="text-[11px] font-bold text-blue-800">Have a suggestion?</h3>
              <p className="text-[9px] text-blue-600">Help us improve SmartSale.</p>
            </div>
            <a href="https://wa.me/256708032236" target="_blank" rel="noreferrer" className="bg-[#0055FF] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg">Chat Us</a>
          </div>
        </div>

      </div>

      {/* FLOATING LEFT BUTTONS (Fund & Spend) */}
      <div className="fixed bottom-[210px] left-4 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setFinanceModalType("fund")}
          className="w-12 h-12 bg-green-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-green-500/40 active:scale-95 transition-transform border-4 border-white"
        >
          <Plus size={18} />
        </button>
        <button 
          onClick={() => setFinanceModalType("spend")}
          className="w-12 h-12 bg-red-500 text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-red-500/40 active:scale-95 transition-transform border-4 border-white"
        >
          <MinusCircle size={18} />
        </button>
      </div>

      {/* FLOATING TRAFFIC BUTTON (Right) */}
      <button 
        onClick={() => setIsTrafficOpen(true)}
        className="fixed bottom-[210px] right-4 w-14 h-14 bg-[#0055FF] text-white rounded-full flex flex-col items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform z-40 border-4 border-white"
      >
        <Play size={18} fill="currentColor" className="ml-1" />
        <span className="text-[8px] font-bold mt-0.5">Traffic</span>
      </button>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[65px] z-30 pb-1">
        <button onClick={() => navigate("stock")} className="flex flex-col items-center gap-1 text-gray-400">
          {isPremium ? <Package size={20} /> : <Lock size={20} className="text-red-300" />}
          <span className="text-[9px] font-bold">{t("Stock", "Okugula")}</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 text-[#FF9800]">
          <HomeIcon size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">{t("Home", "Aha")}</span>
        </button>

        <button onClick={() => navigate("priceList")} className="flex flex-col items-center gap-1 text-gray-400">
          {isPremium ? <span className="text-lg">🏷️</span> : <Lock size={20} className="text-red-300" />}
          <span className="text-[9px] font-bold">{t("Prices", "Ebihenda")}</span>
        </button>
        
        <button onClick={() => navigate("analytics")} className="flex flex-col items-center gap-1 text-gray-400">
          {isPremium ? <BarChart3 size={20} /> : <Lock size={20} className="text-red-300" />}
          <span className="text-[9px] font-bold">{t("Analytics", "Okwefumiiriza")}</span>
        </button>
      </nav>

      <InstallPrompt />
      <TrafficModal isOpen={isTrafficOpen} onClose={() => setIsTrafficOpen(false)} navigate={navigate} />
      <FinanceModal isOpen={!!financeModalType} type={financeModalType} onClose={() => setFinanceModalType(null)} />
    </div>
  );
    }
