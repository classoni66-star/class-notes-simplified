import { useState, useEffect } from "react";
import {
  ArrowLeft, Zap, Star, Crown, CheckCircle2, Ticket,
  MessageCircle, X, CreditCard, KeyRound
} from "lucide-react";

export default function BuyStorage({ navigate, language, businessInfo }: any) {
  const [premiumDisplay, setPremiumDisplay] = useState("Free Plan");
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, amount: number, hours: number } | null>(null);

  const [ownerTaps, setOwnerTaps] = useState(0);
  const [showOwnerGen, setShowOwnerGen] = useState(false);
  const [targetPhone, setTargetPhone] = useState("");
  const [targetPlan, setTargetPlan] = useState<"D" | "W" | "M">("W");
  const [generatedCode, setGeneratedCode] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);
  const OWNER_PHONE = "256708032236";
  const MOMO_NUMBER = "0708032236 (Classoni)";

  useEffect(() => {
    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const now = Date.now();

    if (premiumUntil > now) {
      const msLeft = premiumUntil - now;
      const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
      const hoursLeft = Math.ceil(msLeft / (1000 * 60 * 60));

      if (daysLeft > 1) setPremiumDisplay(`${daysLeft} Days`);
      else if (hoursLeft > 1) setPremiumDisplay(`${hoursLeft} Hours`);
      else setPremiumDisplay("Less than 1 Hour");
    } else {
      setPremiumDisplay("Free Plan");
    }
  }, []);

  const handlePay = async (plan: string, amount: number) => {
    try {
      localStorage.setItem("smartsale_pending_plan", JSON.stringify({ name: plan, amount: amount }));
      alert(`Connecting to Pesapal for ${plan} (UGX ${amount.toLocaleString()})... Please wait.`);

      const response = await fetch("/api/pesapal/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount, description: plan, phone: businessInfo?.phone || "0700000000" }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.redirect_url) window.location.href = data.redirect_url;

    } catch (error: any) {
      alert("Online payment failed: " + error.message + "\n\nPlease use the manual MTN option below to pay.");
    }
  };

  const handleRedeemVoucher = () => {
    const cleanCode = voucherCode.trim();
    const customerPhone = businessInfo?.phone?.trim() || "";
    if (!customerPhone) return alert("Please set your phone number in your profile first.");
    if (cleanCode.length !== 6) return alert("Voucher code must be exactly 6 numbers.");

    const usedVouchers = JSON.parse(localStorage.getItem("smartsale_used_vouchers") || "[]");
    if (usedVouchers.includes(cleanCode)) {
      return alert("❌ This voucher code has already been used on this phone.");
    }

    const dailyCode = generateNumericHash(customerPhone + "D" + SECRET_KEY);
    const weeklyCode = generateNumericHash(customerPhone + "W" + SECRET_KEY);
    const monthlyCode = generateNumericHash(customerPhone + "M" + SECRET_KEY);

    let hoursToAdd = 0;

    if (cleanCode === dailyCode) hoursToAdd = 24;
    else if (cleanCode === weeklyCode) hoursToAdd = 24 * 7;
    else if (cleanCode === monthlyCode) hoursToAdd = 24 * 30;
    else return alert("❌ Invalid voucher code for this phone number. Please check the numbers and try again.");

    const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
    const newPremium = Math.max(Date.now(), currentPremium) + (hoursToAdd * 60 * 60 * 1000);
    localStorage.setItem("smartsale_premium_until", newPremium.toString());

    usedVouchers.push(cleanCode);
    localStorage.setItem("smartsale_used_vouchers", JSON.stringify(usedVouchers));

    alert(`🎉 Success! Premium unlocked.`);
    window.location.reload();
  };

  const handleSecretTap = () => {
    const newTaps = ownerTaps + 1;
    setOwnerTaps(newTaps);
    if (newTaps >= 5) {
      setShowOwnerGen(true);
      setOwnerTaps(0);
    }
  };

  const generateVoucher = () => {
    if (!targetPhone || targetPhone.length < 9) return alert("Enter a valid phone number");
    const hash = generateNumericHash(targetPhone.trim() + targetPlan + SECRET_KEY);
    setGeneratedCode(hash);
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
            Manage your business with less stress. Unlock unlimited calculations, analytics, and storage.
          </p>

          {premiumDisplay !== "Free Plan" && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-sm mb-6 flex flex-col items-center">
              <CheckCircle2 size={32} className="text-green-500 mb-2" />
              <h3 className="text-green-800 font-bold text-lg">You are Premium!</h3>
              <p className="text-green-600 text-sm font-medium mt-1">
                You have <strong>{premiumDisplay}</strong> remaining.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">

          {/* DAILY PLAN */}
          <div onClick={() => setSelectedPlan({name: "Daily Unlimited", amount: 500, hours: 24})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-extrabold text-gray-800 text-base">Daily Unlimited</h3>
              <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded ml-auto">Most convenient</span>
            </div>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-extrabold text-gray-800">500 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
            <p className="text-[10px] text-gray-500 font-medium">
              Best if things are too tight.
            </p>
          </div>

          {/* WEEKLY PLAN - DESIGN UPDATED HERE */}
          <div onClick={() => setSelectedPlan({name: "Weekly Unlimited", amount: 3000, hours: 24*7})} className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden active:scale-95 transition-transform cursor-pointer">
            <div className="absolute top-0 right-0 bg-[#FF9800] text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={18} className="text-[#FF9800]" fill="currentColor" />
              <h3 className="font-extrabold text-[#FF9800] text-base">Weekly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-extrabold text-gray-800">429 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
            <div className="bg-orange-50 inline-block px-2 py-1 rounded mb-2">
              <p className="text-[10px] text-[#FF9800] font-bold">
                (3,000 UGX total per week)
              </p>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Cheaper than a plate of lunch and work stress free for the whole week.
            </p>
          </div>

          {/* MONTHLY PLAN - DESIGN UPDATED HERE */}
          <div onClick={() => setSelectedPlan({name: "Monthly Unlimited", amount: 10000, hours: 24*30})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-[#0055FF]" />
              <h3 className="font-extrabold text-[#0055FF] text-base">Monthly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-2xl font-extrabold text-gray-800">333 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
            <div className="bg-blue-50 inline-block px-2 py-1 rounded mb-2">
              <p className="text-[10px] text-[#0055FF] font-bold">
                (10,000 UGX total per month)
              </p>
            </div>
            <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
              Pay once and work stress free for the whole month.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          {!showVoucherInput ? (
            <button onClick={() => setShowVoucherInput(true)} className="w-full py-4 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm shadow-sm flex justify-center items-center gap-2 hover:bg-gray-200">
              <Ticket size={18} /> I already have a Voucher Code
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Ticket size={16} /> Enter Voucher Code</h3>
              <p className="text-[10px] text-blue-600 mb-3">Enter the secure code sent to you by the shop owner.</p>
              <div className="flex gap-2">
                <input
                  type="tel"
                  maxLength={6}
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 123456"
                  className="flex-1 p-3 bg-white border border-blue-200 rounded-xl text-center text-xl tracking-[0.2em] font-bold outline-none focus:ring-2 focus:ring-[#0055FF]"
                />
                <button onClick={handleRedeemVoucher} className="bg-[#0055FF] text-white px-4 rounded-xl font-bold shadow-md active:scale-95">Unlock</button>
              </div>
            </div>
          )}
        </div>

        <div onClick={handleSecretTap} className="text-center mt-12 pb-4 cursor-pointer text-[10px] text-gray-300">SmartSale Secure Merchant App</div>
      </div>

      {showOwnerGen && (
        <div className="absolute inset-0 bg-black/80 z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowOwnerGen(false)} className="absolute top-3 right-3 text-gray-400 p-1 bg-gray-100 rounded-full"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-4"><KeyRound size={20} className="text-[#FF9800]" /><h2 className="text-lg font-extrabold text-gray-800">Owner Voucher Generator</h2></div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Customer Phone</label>
                <input type="tel" value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)} placeholder="e.g. 0770123456" className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Plan</label>
                <select value={targetPlan} onChange={(e) => setTargetPlan(e.target.value as any)} className="w-full p-2 bg-gray-50 border rounded-lg text-sm">
                  <option value="D">Daily (500 UGX)</option>
                  <option value="W">Weekly (3000 UGX)</option>
                  <option value="M">Monthly (10000 UGX)</option>
                </select>
              </div>
              <button onClick={generateVoucher} className="w-full bg-[#0055FF] text-white py-2 rounded-lg font-bold text-sm">Generate 6-Digit Code</button>

              {generatedCode && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-[#FF9800] uppercase mb-1">Voucher Code</p>
                  <p className="text-3xl font-extrabold text-gray-800 tracking-[0.3em]">{generatedCode}</p>
                  <p className="text-[9px] text-gray-500 mt-2">This code will ONLY work on {targetPhone} and CANNOT be reused.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedPlan && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pb-0">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up relative">
            <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500"><X size={20} /></button>

            <div className="text-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-800">{selectedPlan.name}</h2>
              <p className="text-2xl font-extrabold text-[#FF9800] mt-1">UGX {selectedPlan.amount.toLocaleString()}</p>
            </div>

            <button onClick={() => handlePay(selectedPlan.name, selectedPlan.amount)} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform flex flex-col justify-center items-center gap-1 mb-4">
              <div className="flex items-center gap-2"><CreditCard size={20} /> Pay with Pesapal</div>
              <span className="text-[10px] font-medium opacity-80">(Instant Airtel/MTN Unlock)</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase">OR IF NETWORK FAILS</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-3">
              <p className="text-xs text-center text-gray-600 mb-3">Send {selectedPlan.amount.toLocaleString()} UGX manually to <strong>0708032236 (Classoni)</strong> and chat us for a voucher code.</p>
              <button onClick={() => {
                  const msg = encodeURIComponent(`Hello Classoni! I want to pay for SmartSale Premium.\n\nPhone: ${businessInfo?.phone}\nPlan: ${selectedPlan.name}\nAmount: UGX ${selectedPlan.amount}\n\nI have sent the Mobile Money manually. Please send my secure voucher code.`);
                  window.open(`https://wa.me/${OWNER_PHONE}?text=${msg}`, "_blank");
                }} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2">
                <MessageCircle size={18} /> Chat Owner on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions must be defined outside or imported
function generateNumericHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const num = Math.abs(hash) % 900000 + 100000;
  return num.toString();
}

const SECRET_KEY = "SMARTSALE_UGANDA_2026";
