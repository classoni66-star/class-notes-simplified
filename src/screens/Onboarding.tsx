import { useState } from "react";
import { ArrowLeft, Store, Pill, Utensils } from "lucide-react";

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
      onComplete({
        name: businessName,
        type: businessType,
        phone: phone,
        priceList: [], 
      });
    }
  };

  return (
    <div className="h-full flex flex-col p-6 bg-[#F3F4F6] relative">
      <button onClick={() => navigate("welcome")} className="absolute top-6 left-6 text-gray-400">
        <ArrowLeft size={24} />
      </button>

      <div className="mt-16 flex flex-col items-center w-full max-w-xs mx-auto">
        {/* Custom SVG Butterfly */}
        <div className="w-20 h-20 bg-white shadow-sm rounded-full flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
            <path d="M12 12C12 12 8 4 3 6C-1 8 2 16 7 18C11 19.5 12 12 12 12Z" fill="#FF9800" />
            <path d="M12 12C12 12 16 4 21 6C25 8 22 16 17 18C13 19.5 12 12 12 12Z" fill="#0055FF" />
            <path d="M12 10C12 10 10 16 8 20C6 23 11 23 12 19C13 23 18 23 16 20C14 16 12 10 12 10Z" fill="#0055FF" opacity="0.8" />
          </svg>
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
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#FF9800] text-left"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9800] flex items-center justify-center"><Store size={20} /></div>
                <div>
                  <p className="font-bold text-gray-800">Retail Shop</p>
                  <p className="text-xs text-gray-500">Groceries, Duka, Mini-mart</p>
                </div>
              </button>
              
              <button 
                onClick={() => { setBusinessType("Pharmacy"); setStep(3); }}
                className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-[#FF9800] text-left opacity-50"
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
