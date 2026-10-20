import { ArrowLeft, Gift, Share2, Users } from "lucide-react";

export default function Rewards({ navigate, language }: any) {
  const t = (en: string, run: string) => (language === "run" ? run : en);

  const handleInvite = () => {
    const text = "Join me on SmartSale! Manage your business with less stress. Download here: smartsale.ug";
    if (navigator.share) {
      navigator.share({ title: "SmartSale", text: text, url: "https://smartsale.ug" });
    } else {
      alert("Link copied to clipboard!");
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Rewards", "Empeera")}</h1>
      </header>

      <div className="flex-1 p-6 flex flex-col items-center">
        
        <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <Gift size={48} className="text-[#FF9800]" />
        </div>
        
        <h2 className="text-xl font-extrabold text-gray-800 text-center mb-2">Get 7 Days Free!</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Invite a fellow shopkeeper to SmartSale. When they join, you both get 1 week of unlimited storage and analytics free!
        </p>

        <button 
          onClick={handleInvite}
          className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 size={20} /> Invite a Friend
        </button>

        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full">
          <div className="flex items-center gap-3 mb-2">
            <Users size={20} className="text-[#0055FF]" />
            <p className="font-bold text-gray-800 text-sm">Your Network</p>
          </div>
          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
            <p className="text-xs text-gray-500 font-medium">Friends Joined</p>
            <p className="font-extrabold text-[#0055FF]">0</p>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-500 font-medium">Free Days Earned</p>
            <p className="font-extrabold text-[#FF9800]">2 (Trial)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
