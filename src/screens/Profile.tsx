import { useState } from "react";
import { ArrowLeft, Save, Users, LogOut, Shield } from "lucide-react";

export default function Profile({ navigate, businessInfo, language }: any) {
  const [formData, setFormData] = useState(businessInfo || {});
  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handleSave = () => {
    localStorage.setItem("smartsale_business", JSON.stringify(formData));
    alert("Profile updated successfully!");
    navigate("home");
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out? Your records will be safely locked.")) {
      localStorage.removeItem("smartsale_is_logged_in");
      window.location.reload(); // Reload triggers the Lock Screen
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-y-auto">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10 sticky top-0">
        <button onClick={() => navigate("home")} className="text-gray-500"><ArrowLeft size={24} /></button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Profile", "Ebikukwatako")}</h1>
      </header>

      <div className="flex-1 p-4 pb-10 space-y-4">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Business Name</label>
            <input type="text" value={formData.name || ""} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800] font-bold text-gray-800" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Phone Number</label>
            <input type="tel" value={formData.phone || ""} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800] text-gray-800" />
          </div>
          <button onClick={handleSave} className="w-full bg-[#FF9800] text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 mt-2 active:scale-95 transition-transform">
            <Save size={18} /> Save Changes
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button onClick={() => navigate("collaborators")} className="w-full p-4 flex items-center gap-3 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#0055FF]">
              <Users size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 text-sm">Team & Collaborators</p>
              <p className="text-[10px] text-gray-500">Add or remove people who can record sales</p>
            </div>
          </button>

          <button className="w-full p-4 flex items-center gap-3 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-[#FF9800]">
              <Shield size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 text-sm">Security Settings</p>
              <p className="text-[10px] text-gray-500">Change your password</p>
            </div>
          </button>
          
          <button onClick={handleLogout} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 active:bg-red-100 transition-colors">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <LogOut size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-red-500 text-sm">Log Out</p>
              <p className="text-[10px] text-red-400">Lock your records securely</p>
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
