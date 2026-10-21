import { useState, useEffect } from "react";
import { Gift, User, ArrowUpRight, PlusCircle, Package, BarChart3, Home as HomeIcon } from "lucide-react";
import InstallPrompt from "../components/InstallPrompt";

export default function Home({ navigate, businessInfo, language }: any) {
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [todayDate, setTodayDate] = useState("");
  
  const [stats, setStats] = useState({
    sales: 0,
    profit: 0,
    debtors: 0,
    creditors: 0,
    stock: 0
  });

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Time logic: Morning (5AM-12PM), Afternoon (12PM-5PM), Evening (5PM-5AM)
    if (hour >= 5 && hour < 12) setTimeOfDay("morning");
    else if (hour >= 12 && hour < 17) setTimeOfDay("afternoon");
    else setTimeOfDay("evening");

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    setTodayDate(now.toLocaleDateString('en-GB', options));
  }, []);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const todayStr = new Date().toDateString();

    const todaySales = savedSales.filter((sale: any) => new Date(sale.date).toDateString() === todayStr);

    let totalSales = 0;
    let totalProfit = 0;

    todaySales.forEach((sale: any) => {
      totalSales += Number(sale.total) || 0;
      const sellPrice = Number(sale.sellingPrice) || 0;
      const buyPrice = Number(sale.buyingPrice) || 0;
      const qty = Number(sale.quantity) || 0;
      
      const itemProfit = (sellPrice - buyPrice) * qty;
      if (!isNaN(itemProfit)) {
        totalProfit += itemProfit;
      }
    });

    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
    const activeDebtors = savedDebtors.filter((d: any) => Number(d.amountOwed) > 0).length;
    
    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]");
    const activeCreditors = savedCreditors.filter((c: any) => Number(c.amountOwed) > 0).length;
    
    const savedPriceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    
    setStats({
      sales: totalSales,
      profit: totalProfit,
      debtors: activeDebtors,
      creditors: activeCreditors, 
      stock: savedPriceList.length
    });
    
  }, [businessInfo]);

  // Translation helper
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

  // Dynamic Greeting
  const greeting = timeOfDay === "morning" 
    ? t("Good morning", "Oraire gye") 
    : timeOfDay === "afternoon" 
    ? t("Good afternoon", "Osiiba gye") 
    : t("Good evening", "Okwera gye");

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      
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
          
          {/* 👇 UPDATED TO GO PREMIUM */}
          <button onClick={() => navigate("buyStorage")} className="text-[10px] font-bold text-white bg-[#0055FF] px-3 py-1 rounded shadow-sm active:scale-95 transition-transform">
            Go Premium
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col justify-between p-4 pb-[75px]">
        
        <div className="grid grid-cols-2 gap-2.5">
          
          <div onClick={() => navigate("analytics")} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Sales", "Okutunda")}</p>
            <p className="text-base font-extrabold text-gray-800 mt-0.5">{formatMoney(stats.sales)}</p>
            <div className="flex items-center gap-1 mt-1 text-green-500">
              <ArrowUpRight size={12} />
              <span className="text-[9px] font-bold">Today</span>
            </div>
          </div>

          <div onClick={() => navigate("analytics")} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Profit", "Amagoba")}</p>
            <p className="text-base font-extrabold text-[#0055FF] mt-0.5">{formatMoney(stats.profit)}</p>
            <div className="flex items-center gap-1 mt-1 text-green-500">
              <ArrowUpRight size={12} />
              <span className="text-[9px] font-bold">Today</span>
            </div>
          </div>

          <div onClick={() => navigate("analytics")} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Debtors", "Babanja")}</p>
            <p className="text-lg font-extrabold text-red-500 mt-0.5">{stats.debtors}</p>
            <p className="text-[9px] text-gray-400 font-bold mt-1">Tap to view</p>
          </div>

          <div onClick={() => navigate("analytics")} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between cursor-pointer active:scale-95 transition-transform">
            <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Creditors", "Abakuguzi")}</p>
            <p className="text-lg font-extrabold text-orange-500 mt-0.5">{stats.creditors}</p>
            <p className="text-[9px] text-gray-400 font-bold mt-1">Tap to view</p>
          </div>

          <div onClick={() => navigate("stock")} className="col-span-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer active:scale-95 transition-transform">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">{t("Stock", "Okugula")}</p>
              <p className="text-base font-extrabold text-gray-800 mt-0.5">{stats.stock} Items</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
              <Package size={16} />
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
            <a 
              href="https://wa.me/256708032236" 
              target="_blank" 
              rel="noreferrer"
              className="bg-[#0055FF] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
            >
              Chat Us
            </a>
          </div>
        </div>

      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-[65px] z-30 pb-1">
        <button onClick={() => navigate("stock")} className="flex flex-col items-center gap-1 text-gray-400">
          <Package size={20} />
          <span className="text-[9px] font-bold">{t("Stock", "Okugula")}</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 text-[#FF9800]">
          <HomeIcon size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold">{t("Home", "Aha")}</span>
        </button>

        <button onClick={() => navigate("priceList")} className="flex flex-col items-center gap-1 text-gray-400">
          <span className="text-lg">🏷️</span>
          <span className="text-[9px] font-bold">{t("Prices", "Ebihenda")}</span>
        </button>
        <button onClick={() => navigate("analytics")} className="flex flex-col items-center gap-1 text-gray-400">
          <BarChart3 size={20} />
          <span className="text-[9px] font-bold">{t("Analytics", "Okwefumiiriza")}</span>
        </button>
      </nav>

      <InstallPrompt />

    </div>
  );
                                          }
