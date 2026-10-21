import { useState } from "react";
import { ArrowLeft, Store, Pill } from "lucide-react";

export default function Onboarding({ navigate, onComplete, language }: any) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Retail");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handleSendSms = () => {
    if (!phone) return;
    setStep(4);
  };

  const handleVerify = () => {
    if (smsCode.length >= 4) {
      
      // 🎁 CHECK FOR REFERRAL REWARD
      const invitedBy = localStorage.getItem("smartsale_invited_by");
      if (invitedBy) {
        // Give new user 7 days of premium
        const currentPremium = Number(localStorage.getItem("smartsale_premium_until") || Date.now());
        const newPremium = currentPremium + (7 * 24 * 60 * 60 * 1000);
        localStorage.setItem("smartsale_premium_until", newPremium.toString());
        
        // Remove the invite tag so they don't get it again if they refresh
        localStorage.removeItem("smartsale_invited_by");
        
        alert("🎉 Welcome! Because you were invited by a friend, you have received 7 days of free Premium access!");
      }

      onComplete({
        name: businessName,
        type: businessType,
        phone: phone,
        priceList: [], 
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#F3F4F6] relative overflow-y-auto">
      <button onClick={() => navigate("welcome")} className="absolute top-6 left-6 text-gray-400">
        <ArrowLeft size={24} />
      </button>

      <div className="mt-12 flex flex-col items-center w-full max-w-xs mx-auto pb-10">
        
        {/* 🦋 The consistent butterfly with Orange Border */}
        <div className="w-20 h-20 rounded-full border-4 border-[#FF9800] bg-white shadow-md flex items-center justify-center mb-6">
          <span className="text-4xl">🦋</span>
        </div>
        
        <h2 className="text-xl font-extrabold text-gray-800 text-center mb-8">
          {t("Create your free account", "Kora akaunti yawe ya bwereere")}
        </h2>

        {step === 1 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Business Name</label>
              <input 
                type="text" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Saviour's Shop"
                className="w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!businessName}
              className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="w-full space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Business Category</label>
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => { setBusinessType("Retail"); setStep(3); }}
                className="flex items-center gap-3 p-4 bg-white border-2 border-[#FF9800] rounded-xl text-left shadow-sm"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9800] flex items-center justify-center"><Store size={20} /></div>
                <div>
                  <p className="font-bold text-gray-800">Retail Shop</p>
                  <p className="text-xs text-gray-500">Groceries, Duka, Mini-mart</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setBusinessType("Pharmacy"); setStep(3); }}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl text-left opacity-50"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0055FF] flex items-center justify-center"><Pill size={20} /></div>
                <div>
                  <p className="font-bold text-gray-800">Pharmacy</p>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="w-full space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0770123456"
                className="w-full mt-1 p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#FF9800] outline-none font-medium text-gray-800"
              />
            </div>
            <button
              onClick={handleSendSms}
              disabled={phone.length < 9}
              className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
            >
              Send SMS Code
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="w-full space-y-4 text-center">
            <p className="text-sm text-gray-500 mb-4">Enter the 4-digit code sent to {phone}. <br/><span className="text-xs text-orange-500">(Demo hint: type 1234)</span></p>
            <input 
              type="number" 
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="1 2 3 4"
              className="w-full p-4 bg-white border border-gray-200 rounded-xl text-center text-2xl tracking-[1em] font-bold focus:ring-2 focus:ring-[#FF9800] outline-none text-gray-800"
            />
            <button
              onClick={handleVerify}
              disabled={smsCode.length < 4}
              className="w-full bg-[#0055FF] text-white py-4 rounded-xl font-bold mt-4 disabled:opacity-50"
            >
              Verify Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
            }
