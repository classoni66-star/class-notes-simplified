import { useState } from "react";
import { Butterfly, ArrowLeft } from "lucide-react";

export default function Onboarding({ navigate, onComplete, language }: any) {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handleSendSms = () => {
    if (!businessName || !phone) return;
    // In the real app, this is where the free SMS provider API goes.
    // For now, it just moves to the SMS entry step.
    setStep(3);
  };

  const handleVerify = () => {
    // We accept any 4-digit code for the free tier
    if (smsCode.length >= 4) {
      onComplete({
        name: businessName,
        phone: phone,
        priceList: [], // Empty initially, will be filled on the price list setup
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-white relative">
      <button onClick={() => navigate("welcome")} className="absolute top-6 left-6 text-gray-400">
        <ArrowLeft size={24} />
      </button>

      <div className="mt-16 flex flex-col items-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl">🦋</span>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-8">
          {t("Create your free account", "Kora akaunti yawe ya bwereere")}
        </h2>

        {step === 1 && (
          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Business Name</label>
              <input 
                type="text" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Mama Joy's Shop"
                className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
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
          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phone Number</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 0770123456"
                className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
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

        {step === 3 && (
          <div className="w-full max-w-xs space-y-4 text-center">
            <p className="text-sm text-gray-500 mb-4">Enter the 4-digit code sent to {phone}. <br/><span className="text-xs text-orange-500">(Demo hint: type 1234)</span></p>
            <input 
              type="number" 
              value={smsCode}
              onChange={(e) => setSmsCode(e.target.value)}
              placeholder="1 2 3 4"
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl tracking-[1em] font-bold focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
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
