import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Star, Crown, CheckCircle2 } from "lucide-react";

export default function BuyStorage({ navigate, language }: any) {
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);
  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const now = Date.now();
    if (premiumUntil > now) {
      setPremiumDaysLeft(Math.ceil((premiumUntil - now) / (1000 * 60 * 60 * 24)));
    }
  }, []);

  const handlePay = (plan: string, amount: number) => {
    alert(`Initiating Pesapal Payment for the ${plan} (UGX ${amount.toLocaleString()})...\n\n(We will connect this to the real Pesapal API soon!)`);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-y-auto">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">Go Premium</h1>
      </header>

      <div className="p-4 pb-12 space-y-4">
        
        <div className="text-center mb-2">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown size={32} className="text-[#FF9800]" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">SmartSale Premium</h2>
          <p className="text-xs text-gray-500 mt-1 mb-4">Manage your business with less stress.</p>
          
          {/* DYNAMIC STATUS CARD */}
          {premiumDaysLeft > 0 ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col items-center">
              <CheckCircle2 size={32} className="text-green-500 mb-2" />
              <h3 className="text-green-800 font-bold text-lg">You are Premium!</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                You have <strong>{premiumDaysLeft} days</strong> remaining.
              </p>
              <p className="text-green-700 text-xs mt-2 font-bold bg-green-100 px-2 py-1 rounded">
                Buy more below to extend your access
              </p>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-left space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <p className="text-sm font-bold text-gray-700">Unlimited records storage</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                <p className="text-sm font-bold text-gray-700">Unlimited analytics (See how your business is performing)</p>
              </div>
            </div>
          )}
        </div>

        {/* PLANS ARE NOW ALWAYS VISIBLE */}
        <div className="space-y-4">
          {/* DAILY PLAN */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-extrabold text-gray-800 text-base">Daily Unlimited</h3>
            </div>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-2xl font-extrabold text-gray-800">500 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
            <button onClick={() => handlePay("Daily Plan", 500)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 500 UGX
            </button>
          </div>

          {/* WEEKLY PLAN */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#FF9800] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={18} className="text-[#FF9800]" fill="currentColor" />
              <h3 className="font-extrabold text-[#FF9800] text-base">Weekly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">2,500 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ week</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 29%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
              Less than 357 UGX per day!
            </p>
            <button onClick={() => handlePay("Weekly Plan", 2500)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 2,500 UGX
            </button>
          </div>

          {/* MONTHLY PLAN */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-[#0055FF]" />
              <h3 className="font-extrabold text-[#0055FF] text-base">Monthly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">7,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ month</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 53%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
              Only 233 UGX per day!
            </p>
            <button onClick={() => handlePay("Monthly Plan", 7000)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 7,000 UGX
            </button>
          </div>
        </div>

      </div>
    </div>
  );
                }
