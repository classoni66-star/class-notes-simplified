import { useState } from "react";
import { ArrowLeft, Store, Pill, Wrench, Utensils, Briefcase, ShoppingBag, Lock, ShieldQuestion } from "lucide-react";

export default function Onboarding({ navigate, onComplete, language }: any) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Retailer");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  
  const [secQuestion, setSecQuestion] = useState("What is your mother's name?");
  const [secAnswer, setSecAnswer] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  const categories = [
    { id: "Retailer", icon: <Store size={20} />, label: "Retailer", desc: "Groceries, Duka, Mini-mart" },
    { id: "Trader", icon: <Briefcase size={20} />, label: "Trader", desc: "Wholesale, Produce" },
    { id: "Electronics", icon: <ShoppingBag size={20} />, label: "Electronics", desc: "Phones, TVs, Accessories" },
    { id: "Spare Parts", icon: <Wrench size={20} />, label: "Spare Parts", desc: "Car & Boda parts" },
    { id: "Restaurant", icon: <Utensils size={20} />, label: "Restaurant", desc: "Food, Drinks, Fast food" },
    { id: "Other", icon: <Pill size={20} />, label: "Other", desc: "Pharmacy, Services, etc." },
  ];

  const handleVerify = () => {
    if (smsCode.length >= 4) setStep(5);
  };

  const handleFinish = () => {
    if (password.length < 4) return alert("Password must be at least 4 characters.");
    if (!secAnswer.trim()) return alert("Please provide a security answer.");

    localStorage.setItem("smartsale_password", btoa(password));
    localStorage.setItem("smartsale_sec_question", secQuestion);
    localStorage.setItem("smartsale_sec_answer", btoa(secAnswer.trim().toLowerCase()));

    const invitedBy = localStorage.getItem("smartsale_invited_by");
    let daysToAdd = 1; // 🕐 1 DAY FREE TRIAL
    
    if (invitedBy) {
      if (invitedBy.trim() === phone.trim()) {
        alert("You cannot use your own invite link.");
        localStorage.removeItem("smartsale_invited_by");
      } else {
        daysToAdd = 7; // 7 days for referral
        localStorage.removeItem("smartsale_invited_by");
        setTimeout(() => alert("🎉 Welcome! You have received 7 days of free Premium access!"), 500);
      }
    }

    const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || 0);
    const newPremium = Math.max(Date.now(), currentPremium) + (daysToAdd * 24 * 60 * 60 * 1000);
    localStorage.setItem("smartsale_premium_until", newPremium.toString());

    onComplete({
      name: businessName,
      type: businessType,
      phone: phone.trim(),
      priceList: [], 
    });
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#F3F4F6] relative overflow-y-auto">
      <button onClick={() => navigate("welcome")} className="absolute top-6 left-6 text-gray-400">
        <ArrowLeft size={24} />
      </button>

      <div className="mt-12 flex flex-col items-center w-full max-w-xs mx-auto pb-10">
        
        <div className="w-20 h-20 rounded-full border-4 border-[#FF9800] bg-white shadow-md flex items-center justify-center mb-6">
          <span className="text-4xl">🦋</span>
        </div>
        
        <h2 className="text-xl font-extrabold text-gray-800 text-center mb-8">
          {step === 6 ? "Account Recovery" : step === 5 ? "Secure your account" : "Create your merchant account"}
        </h2>

        {step === 1 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Business Name</label>
              <input type="text" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Saviour's Shop" className="w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800" />
            </div>
            <button onClick={() => setStep(2)} disabled={!businessName} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50">Next</button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Merchant Category</label>
            <div className="grid grid-cols-1 gap-2">
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => { setBusinessType(cat.id); setStep(3); }} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl text-left shadow-sm hover:border-[#FF9800] active:scale-95 transition-transform">
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9800] flex items-center justify-center flex-shrink-0">{cat.icon}</div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{cat.label}</p>
                    <p className="text-[10px] text-gray-500">{cat.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0770123456" className="w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800" />
            </div>
            <button onClick={() => setStep(4)} disabled={phone.length < 9} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50">Send SMS Code</button>
          </div>
        )}

        {step === 4 && (
          <div className="w-full space-y-4 text-center">
            <p className="text-sm text-gray-500 mb-4">Enter code sent to {phone}. <br/><span className="text-xs text-orange-500">(Demo hint: type 1234)</span></p>
            <input type="number" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} placeholder="1 2 3 4" className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-[1em] font-bold focus:ring-2 focus:ring-[#FF9800] outline-none text-gray-800" />
            <button onClick={handleVerify} disabled={smsCode.length < 4} className="w-full bg-[#0055FF] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50">Verify Account</button>
          </div>
        )}

        {step === 5 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Create Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-4 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter a strong password" className="w-full mt-1 pl-10 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800" />
              </div>
            </div>
            <button onClick={() => setStep(6)} disabled={password.length < 4} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50">Next</button>
          </div>
        )}

        {step === 6 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Security Question</label>
              <div className="relative">
                <ShieldQuestion size={18} className="absolute left-3 top-4 text-gray-400" />
                <select 
                  value={secQuestion} 
                  onChange={(e) => setSecQuestion(e.target.value)} 
                  className="w-full mt-1 pl-10 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800"
                >
                  <option>What is your mother's name?</option>
                  <option>What is your favorite food?</option>
                  <option>What is your first pet's name?</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Your Answer</label>
              <input type="text" value={secAnswer} onChange={(e) => setSecAnswer(e.target.value)} placeholder="e.g. Joy" className="w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800" />
              <p className="text-[10px] text-gray-400 mt-2 ml-1">You will use this if you forget your password.</p>
            </div>
            <button onClick={handleFinish} disabled={!secAnswer.trim()} className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50">Finish Setup</button>
          </div>
        )}
      </div>
    </div>
  );
              }
