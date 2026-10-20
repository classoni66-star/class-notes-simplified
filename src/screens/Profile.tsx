import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function Profile({ navigate, businessInfo, language }: any) {
  const [formData, setFormData] = useState(businessInfo || {});
  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handleSave = () => {
    localStorage.setItem("smartsale_business", JSON.stringify(formData));
    alert("Profile updated successfully!");
    navigate("home");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Profile", "Ebikukwatako")}</h1>
      </header>

      <div className="flex-1 p-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Business Name</label>
            <input 
              type="text" 
              value={formData.name || ""}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800] font-bold text-gray-800"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone || ""}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800] text-gray-800"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Business Type</label>
            <input 
              type="text" 
              value={formData.type || "Retail"}
              disabled
              className="w-full mt-1 p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium"
            />
          </div>

          <button onClick={handleSave} className="w-full bg-[#FF9800] text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 mt-4 active:scale-95 transition-transform">
            <Save size={18} /> Save Profile
          </button>

        </div>
      </div>
    </div>
  );
}
