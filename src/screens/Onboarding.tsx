import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Star, Crown, CheckCircle2, Ticket, Phone, MessageCircle, X } from "lucide-react";

export default function BuyStorage({ navigate, language, businessInfo }: any) {
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, amount: number } | null>(null);
  
  const t = (en: string, run: string) => (language === "run" ? run : en);
  
  const OWNER_PHONE = "256708032236"; 
  const MOMO_NUMBER = "0708032236 (Classoni)";

  useEffect(() => {
    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const now = Date.now();
    if (premiumUntil > now) {
      // Calculate days OR hours left
      const msLeft = premiumUntil - now;
      if (msLeft < 24 * 60 * 60 * 1000) {
        setPremiumDaysLeft(Math.ceil(msLeft / (1000 * 60 * 60))); // Show hours
      } else {
        setPremiumDaysLeft(Math.ceil(msLeft / (1000 * 60 * 60 * 24))); // Show days
      }
    }
  }, []);

  const handlePay = async (plan: string, amount: number) => {
    try {
      alert(`Connecting to Pesapal for ${plan} (UGX ${amount.toLocaleString()})... Please wait.`);
      
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
      
      if (data.error) throw new Error(data.error);

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      }
    } catch (error: any) {
      alert("Online payment failed: " + error.message + "\n\nPlease use the Voucher option below to pay via MTN or Cash.");
    }
  };

  const handleRedeemVoucher = () => {
    const code = voucherCode.trim().toUpperCase();
    let hoursToAdd = 0;

    // SECRET CODES (You can adjust these)
    if (code === "SMARTSALE-DAY") hoursToAdd = 24;
    else if (code === "SMARTSALE-WEEK") hoursToAdd = 24 * 7;
    else if (code === "SMARTSALE-MONTH") hoursToAdd = 24 * 30;
    else if (code === "OWNER-UNLIMITED") hoursToAdd = 24 * 365;
    else return alert("Invalid voucher code. Please check the spelling.");

    const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
    const newPremium = Math.max(Date.now(), currentPremium) + (hoursToAdd * 60 * 60 * 1000);
    localStorage.setItem("smartsale_premium_until", newPremium.toString());

    alert(`🎉 Success! Premium unlocked.`);
    window.location.reload();
  };

  const handleWhatsApp = () => {
    if (!selectedPlan) return;
    const message = encodeURIComponent(
      `Hello Classoni! I want to pay for SmartSale Premium.\n\nBusiness Name: ${businessInfo?.name || "N/A"}\nPlan: ${selectedPlan.name}\nAmount: UGX ${selectedPlan.amount.toLocaleString()}\n\nI have just sent the Mobile Money. Please send my voucher code.`
    );
    window.open(`https://wa.me/${OWNER_PHONE}?text=${message}`, "_blank");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-y-auto relative">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">Go Premium</h1>
      </header>

      <div className="p-4 pb-24 space-y-4">
        
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Crown size={32} className="text-[#FF9800]" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800">Unlock SmartSale Premium</h2>
          <p className="text-xs text-gray-600 mt-1 mb-4 px-2 leading-relaxed">
            Manage your business with less stress. Know how your business is performing. Unlock unlimited calculations, analytics, and storage.
          </p>
          
          {premiumDaysLeft > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col items-center">
              <CheckCircle2 size={32} className="text-green-500 mb-2" />
              <h3 className="text-green-800 font-bold text-lg">You are Premium!</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                You have <strong>{premiumDaysLeft} {premiumDaysLeft <= 24 ? 'Hours' : 'Days'}</strong> remaining.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          
          {/* DAILY PLAN - 500 UGX */}
          <div onClick={() => setSelectedPlan({name: "Daily Unlimited", amount: 500})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-extrabold text-gray-800 text-base">Daily Unlimited</h3>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-gray-800">500 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
          </div>

          {/* WEEKLY PLAN - 3000 UGX */}
          <div onClick={() => setSelectedPlan({name: "Weekly Unlimited", amount: 3000})} className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden active:scale-95 transition-transform cursor-pointer">
            <div className="absolute top-0 right-0 bg-[#FF9800] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={18} className="text-[#FF9800]" fill="currentColor" />
              <h3 className="font-extrabold text-[#FF9800] text-base">Weekly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">3,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ week</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 14%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-2 py-1 rounded">
              Less than 429 UGX per day!
            </p>
          </div>

          {/* MONTHLY PLAN - 10000 UGX */}
          <div onClick={() => setSelectedPlan({name: "Monthly Unlimited", amount: 10000})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-[#0055FF]" />
              <h3 className="font-extrabold text-[#0055FF] text-base">Monthly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">10,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ month</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 33%</span>
            </div>
            <p className="text-[10px] text-green-600 font-bold bg-green-50 inline-block px-2 py-1 rounded">
              Only 333 UGX per day!
            </p>
          </div>
        </div>

        {/* VOUCHER SECTION */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {!showVoucherInput ? (
            <button onClick={() => setShowVoucherInput(true)} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2">
              <Ticket size={18} /> I already have a Voucher Code
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Ticket size={16} /> Enter Voucher Code</h3>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. SMARTSALE-WEEK"
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

      {/* PAYMENT MODAL */}
      {selectedPlan && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pb-0">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up relative">
            <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500">
              <X size={20} />
            </button>
            
            <div className="text-center mb-4">
              <h2 className="text-xl font-extrabold text-gray-800">Pay via Pesapal</h2>
              <p className="text-xs text-gray-500 mt-1">We currently support Airtel Money online.</p>
            </div>

            <button onClick={() => handlePay(selectedPlan.name, selectedPlan.amount)} className="w-full bg-[#FF9800] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 mb-4">
              Pay {selectedPlan.amount.toLocaleString()} UGX via Airtel
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase">OR USE MTN/CASH</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 text-center">
              <p className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider mb-1">Send Exactly</p>
              <p className="text-2xl font-extrabold text-gray-800 mb-1">UGX {selectedPlan.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">To MTN/Airtel: <strong className="text-gray-800">{MOMO_NUMBER}</strong></p>
            </div>

            <button onClick={handleWhatsApp} className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 mb-3">
              <MessageCircle size={18} /> Chat Owner to get Voucher
            </button>
          </div>
        </div>
      )}
    </div>
  );
        }
