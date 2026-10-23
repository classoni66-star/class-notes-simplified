import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Star, Crown, CheckCircle2, Ticket } from "lucide-react";

export default function BuyStorage({ navigate, language, businessInfo }: any) {
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucher, setShowVoucher] = useState(false);
  
  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const now = Date.now();
    if (premiumUntil > now) {
      setPremiumDaysLeft(Math.ceil((premiumUntil - now) / (1000 * 60 * 60 * 24)));
    }
  }, []);

  const handlePay = async (plan: string, amount: number) => {
    try {
      // Show a loading state
      alert(`Connecting to Pesapal for ${plan} (UGX ${amount.toLocaleString()})... Please wait.`);
      
      // Call the REAL backend API
      const response = await fetch("/api/pesapal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          description: plan,
          phone: businessInfo?.phone || "0700000000",
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Pesapal Checkout
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        alert("No redirect URL returned from Pesapal.");
      }
    } catch (error: any) {
      alert("Payment failed: " + error.message + "\n\nPlease check your internet connection or try again.");
    }
  };

  const handleRedeemVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    let daysToAdd = 0;

    if (code === "SMARTSALE-7") daysToAdd = 7;
    else if (code === "SMARTSALE-30") daysToAdd = 30;
    else if (code === "OWNER-UNLIMITED") daysToAdd = 365;
    else return alert("Invalid voucher code.");

    const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
    const newPremium = Math.max(Date.now(), currentPremium) + (daysToAdd * 24 * 60 * 60 * 1000);
    localStorage.setItem("smartsale_premium_until", newPremium.toString());

    alert(`🎉 Success! ${daysToAdd} days of Premium unlocked.`);
    window.location.reload();
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
        
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown size={32} className="text-[#FF9800]" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">SmartSale Premium</h2>
          <p className="text-xs text-gray-600 mt-1 mb-4 px-2 leading-relaxed">
            Manage your business with less stress. Know how your business is performing. Unlock unlimited calculations, analytics, and storage.
          </p>
          
          {premiumDaysLeft > 0 ? (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col items-center">
              <CheckCircle2 size={32} className="text-green-500 mb-2" />
              <h3 className="text-green-800 font-bold text-lg">You are Premium!</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                You have <strong>{premiumDaysLeft} days</strong> remaining.
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

        <div className="space-y-4">
          
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-extrabold text-gray-800 text-base">Daily Unlimited</h3>
            </div>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-2xl font-extrabold text-gray-800">1,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
            <button onClick={() => handlePay("Daily Plan", 1000)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 1,000 UGX via Pesapal
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#FF9800] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={18} className="text-[#FF9800]" fill="currentColor" />
              <h3 className="font-extrabold text-[#FF9800] text-base">Weekly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">5,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ week</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 29%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
              Less than 714 UGX per day!
            </p>
            <button onClick={() => handlePay("Weekly Plan", 5000)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 5,000 UGX via Pesapal
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-[#0055FF]" />
              <h3 className="font-extrabold text-[#0055FF] text-base">Monthly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">20,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ month</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 33%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold mb-4 bg-green-50 inline-block px-2 py-1 rounded">
              Only 666 UGX per day!
            </p>
            <button onClick={() => handlePay("Monthly Plan", 20000)} className="w-full py-2.5 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">
              Pay 20,000 UGX via Pesapal
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          {!showVoucher ? (
            <button onClick={() => setShowVoucher(true)} className="w-full py-3 text-gray-500 font-bold text-sm flex justify-center items-center gap-2">
              <Ticket size={16} /> Have an offline voucher code?
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Ticket size={16} /> Redeem Voucher</h3>
              <p className="text-[10px] text-blue-600 mb-3">If you paid an agent with cash, enter your code here to unlock Premium without internet.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. SMARTSALE-7"
                  className="flex-1 p-3 bg-white border border-blue-200 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#0055FF]"
                />
                <button onClick={handleRedeemVoucher} className="bg-[#0055FF] text-white px-4 rounded-xl font-bold shadow-md active:scale-95">
                  Unlock
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
                                }
