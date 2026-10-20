import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function BuyStorage({ navigate, language }: any) {
  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handlePay = (plan: string) => {
    alert(`Initiating Pesapal Payment for ${plan}...\n\n(We will connect this to the real Pesapal API soon!)`);
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-y-auto">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Buy Storage", "Gura Storage")}</h1>
      </header>

      <div className="p-4 pb-10 space-y-4">
        
        {/* FREE PLAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-extrabold text-gray-800 text-lg">Free Plan</h3>
          <p className="text-xs text-gray-500 mt-1 mb-4">Basic sales tracking</p>
          <ul className="text-xs text-gray-600 space-y-2 mb-4">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> Record Sales</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-green-500" /> See Today's Total Sales</li>
            <li className="flex items-center gap-2 text-gray-400"><CheckCircle2 size={14} className="text-gray-300" /> No Profit Tracking</li>
            <li className="flex items-center gap-2 text-gray-400"><CheckCircle2 size={14} className="text-gray-300" /> No Stock Analytics</li>
          </ul>
          <button disabled className="w-full py-3 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm">
            Current Plan (2 Days Left)
          </button>
        </div>

        {/* WEEKLY PLAN */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#FF9800] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
          <h3 className="font-extrabold text-[#FF9800] text-lg">Weekly Unlimited</h3>
          <p className="text-xs text-gray-500 mt-1 mb-2">Unlock all analytics & stock</p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-2xl font-extrabold text-gray-800">3,000 UGX</span>
            <span className="text-xs text-gray-500 mb-1">/ week</span>
          </div>
          <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
            Less than 428 UGX per day!
          </p>
          <button onClick={() => handlePay("Weekly Plan")} className="w-full py-3 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
            Pay with Pesapal
          </button>
        </div>

        {/* MONTHLY PLAN */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-extrabold text-[#0055FF] text-lg">Monthly Unlimited</h3>
          <p className="text-xs text-gray-500 mt-1 mb-2">Best value for serious shops</p>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-2xl font-extrabold text-gray-800">10,000 UGX</span>
            <span className="text-xs text-gray-500 mb-1">/ month</span>
          </div>
          <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
            Only 333 UGX per day!
          </p>
          <button onClick={() => handlePay("Monthly Plan")} className="w-full py-3 bg-[#0055FF] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
            Pay with Pesapal
          </button>
        </div>

      </div>
    </div>
  );
}
