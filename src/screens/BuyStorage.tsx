import { useState, useEffect } from "react";
import { ArrowLeft, Zap, Star, Crown, CheckCircle2, Ticket, X, KeyRound } from "lucide-react";

// 🔐 A simple, fast hash function to lock the voucher to a phone number
function generateHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; 
  }
  return Math.abs(hash).toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

export default function BuyStorage({ navigate, language, businessInfo }: any) {
  const [premiumDaysLeft, setPremiumDaysLeft] = useState(0);
  const [voucherCode, setVoucherCode] = useState("");
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ name: string, amount: number, hours: number } | null>(null);
  
  // Secret Generator State (For you, the owner)
  const [ownerTaps, setOwnerTaps] = useState(0);
  const [showOwnerGen, setShowOwnerGen] = useState(false);
  const [targetPhone, setTargetPhone] = useState("");
  const [targetPlan, setTargetPlan] = useState<"D" | "W" | "M">("W");
  const [generatedCode, setGeneratedCode] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);
  const SECRET_KEY = "SMARTSALE_UGANDA_2026"; // 🔐 The master key

  useEffect(() => {
    const premiumUntil = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const now = Date.now();
    if (premiumUntil > now) {
      const msLeft = premiumUntil - now;
      if (msLeft < 24 * 60 * 60 * 1000) {
        setPremiumDaysLeft(Math.ceil(msLeft / (1000 * 60 * 60)));
      } else {
        setPremiumDaysLeft(Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      }
    }
  }, []);

  const handleRedeemVoucher = () => {
    const cleanCode = voucherCode.trim().toUpperCase();
    
    // The customer's phone must be in the system to validate
    const customerPhone = businessInfo?.phone?.trim() || "";
    if (!customerPhone) return alert("Please set your phone number in your profile first.");

    let hoursToAdd = 0;
    let expectedCode = "";

    // Check which plan the code is for
    if (cleanCode.startsWith("D-")) {
      expectedCode = "D-" + generateHash(customerPhone + "D" + SECRET_KEY);
      hoursToAdd = 24;
    } else if (cleanCode.startsWith("W-")) {
      expectedCode = "W-" + generateHash(customerPhone + "W" + SECRET_KEY);
      hoursToAdd = 24 * 7;
    } else if (cleanCode.startsWith("M-")) {
      expectedCode = "M-" + generateHash(customerPhone + "M" + SECRET_KEY);
      hoursToAdd = 24 * 30;
    } else {
      return alert("Invalid voucher format.");
    }

    // Verify the code matches the math
    if (cleanCode === expectedCode) {
      const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
      const newPremium = Math.max(Date.now(), currentPremium) + (hoursToAdd * 60 * 60 * 1000);
      localStorage.setItem("smartsale_premium_until", newPremium.toString());
      
      alert(`🎉 Success! Premium unlocked.`);
      window.location.reload();
    } else {
      alert("❌ Invalid voucher code for this phone number. Please check the spelling or contact support.");
    }
  };

  // Secret Owner Generator Logic
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
    const hash = generateHash(targetPhone.trim() + targetPlan + SECRET_KEY);
    setGeneratedCode(`${targetPlan}-${hash}`);
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

        {/* PLANS */}
        <div className="space-y-4">
          <div onClick={() => setSelectedPlan({name: "Daily Unlimited", amount: 500, hours: 24})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={18} className="text-yellow-500" />
              <h3 className="font-extrabold text-gray-800 text-base">Daily Unlimited</h3>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-extrabold text-gray-800">500 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ day</span>
            </div>
          </div>

          <div onClick={() => setSelectedPlan({name: "Weekly Unlimited", amount: 3000, hours: 24*7})} className="bg-white p-4 rounded-2xl shadow-lg border-2 border-[#FF9800] relative overflow-hidden active:scale-95 transition-transform cursor-pointer">
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
          </div>

          <div onClick={() => setSelectedPlan({name: "Monthly Unlimited", amount: 10000, hours: 24*30})} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 active:scale-95 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-1">
              <Crown size={18} className="text-[#0055FF]" />
              <h3 className="font-extrabold text-[#0055FF] text-base">Monthly Unlimited</h3>
            </div>
            <div className="flex items-end gap-2 mb-1">
              <span className="text-2xl font-extrabold text-gray-800">10,000 UGX</span>
              <span className="text-xs text-gray-500 mb-1">/ month</span>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded ml-auto mb-1">SAVE 33%</span>
            </div>
          </div>
        </div>

        {/* VOUCHER REDEEM */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {!showVoucherInput ? (
            <button onClick={() => setShowVoucherInput(true)} className="w-full py-4 bg-gray-800 text-white rounded-xl font-bold text-sm shadow-md flex justify-center items-center gap-2">
              <Ticket size={18} /> I already have a Voucher Code
            </button>
          ) : (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h3 className="text-sm font-bold text-blue-800 mb-2 flex items-center gap-2"><Ticket size={16} /> Enter Voucher Code</h3>
              <p className="text-[10px] text-blue-600 mb-3">Enter the code exactly as it was sent to you. It is locked to your phone number.</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  placeholder="e.g. W-A1B2C3"
                  className="flex-1 p-3 bg-white border border-blue-200 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-[#0055FF]"
                />
                <button onClick={handleRedeemVoucher} className="bg-[#0055FF] text-white px-4 rounded-xl font-bold shadow-md active:scale-95">
                  Unlock
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🥷 SECRET OWNER VOUCHER GENERATOR */}
        <div onClick={handleSecretTap} className="text-center mt-12 pb-4 cursor-pointer text-[10px] text-gray-300">
          SmartSale Secure Merchant App
        </div>
      </div>

      {/* OWNER GENERATOR MODAL */}
      {showOwnerGen && (
        <div className="absolute inset-0 bg-black/80 z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm relative">
            <button onClick={() => setShowOwnerGen(false)} className="absolute top-3 right-3 text-gray-400 p-1 bg-gray-100 rounded-full">
              <X size={16} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <KeyRound size={20} className="text-[#FF9800]" />
              <h2 className="text-lg font-extrabold text-gray-800">Owner Voucher Generator</h2>
            </div>
            
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
              <button onClick={generateVoucher} className="w-full bg-[#0055FF] text-white py-2 rounded-lg font-bold text-sm">Generate Secure Code</button>
              
              {generatedCode && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-[#FF9800] uppercase mb-1">Voucher Code</p>
                  <p className="text-2xl font-mono font-extrabold text-gray-800 tracking-wider">{generatedCode}</p>
                  <p className="text-[9px] text-gray-500 mt-2">This code will ONLY work on {targetPhone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {selectedPlan && (
        <div className="absolute inset-0 bg-black/60 z-[100] flex items-end justify-center pb-0">
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up relative">
            <button onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 bg-gray-100 p-2 rounded-full text-gray-500">
              <X size={20} />
            </button>
            
            <div className="text-center mb-4">
              <h2 className="text-xl font-extrabold text-gray-800">Pay via Mobile Money</h2>
              <p className="text-xs text-gray-500 mt-1">Pay {selectedPlan.amount.toLocaleString()} UGX to get your secure code.</p>
            </div>

            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-4 text-center">
              <p className="text-[10px] font-bold text-[#FF9800] uppercase tracking-wider mb-1">Send Exactly</p>
              <p className="text-2xl font-extrabold text-gray-800 mb-1">UGX {selectedPlan.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-600">To MTN/Airtel: <strong className="text-gray-800">0708032236 (Classoni)</strong></p>
            </div>

            <div className="space-y-2 mb-4 text-xs text-gray-600">
              <p>1. Send the money via MTN or Airtel.</p>
              <p>2. Tap the WhatsApp button below to notify us.</p>
              <p>3. We will send you a secure voucher code.</p>
            </div>

            <button onClick={() => {
                const msg = encodeURIComponent(`Hello Classoni! I want to pay for SmartSale Premium.\n\nPhone: ${businessInfo?.phone}\nPlan: ${selectedPlan.name}\nAmount: UGX ${selectedPlan.amount}\n\nI have sent the Mobile Money. Please send my secure voucher code.`);
                window.open(`https://wa.me/256708032236?text=${msg}`, "_blank");
              }} 
              className="w-full bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 mb-3"
            >
              Chat Owner on WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
    }
