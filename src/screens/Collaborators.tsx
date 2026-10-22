import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Trash2, Link as LinkIcon, Share2 } from "lucide-react";

export default function Collaborators({ navigate, businessInfo, language }: any) {
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("smartsale_collaborators") || "[]");
    setCollaborators(saved);
  }, []);

  const handleAdd = () => {
    if (newPhone.length < 9) return alert("Enter a valid phone number");
    if (collaborators.includes(newPhone)) return alert("Already a collaborator");
    
    const updated = [...collaborators, newPhone];
    setCollaborators(updated);
    localStorage.setItem("smartsale_collaborators", JSON.stringify(updated));
    setNewPhone("");
  };

  const handleRemove = (phone: string) => {
    if (!window.confirm("Remove this collaborator?")) return;
    const updated = collaborators.filter(c => c !== phone);
    setCollaborators(updated);
    localStorage.setItem("smartsale_collaborators", JSON.stringify(updated));
  };

  const generateLink = async () => {
    // Link expires in 15 mins (15 * 60 * 1000)
    const expiry = Date.now() + 900000;
    const ownerPhone = businessInfo?.phone || "unknown";
    const link = `${window.location.origin}?join=${ownerPhone}&exp=${expiry}`;
    
    setInviteLink(link);
    
    // Automatically try to share it
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my SmartSale Shop",
          text: `Use this secure link to join my shop as an attendant. Valid for 15 minutes only:`,
          url: link
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(link);
      alert("Invite link copied to clipboard! Valid for 15 minutes.");
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("profile")} className="text-gray-500"><ArrowLeft size={24} /></button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Team & Collaborators", "Abakukorera hamwe")}</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        
        {/* GENERATE LINK BUTTON */}
        <div className="bg-[#0055FF] p-5 rounded-2xl shadow-lg mb-6 text-white text-center">
          <LinkIcon size={32} className="mx-auto mb-3 opacity-80" />
          <h2 className="text-lg font-bold mb-1">Invite Attendant</h2>
          <p className="text-xs opacity-80 mb-4">Generate a secure link to let someone else record sales on their phone.</p>
          <button onClick={generateLink} className="w-full bg-white text-[#0055FF] font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2">
            <Share2 size={18} /> Generate 15-Min Link
          </button>
          {inviteLink && (
            <p className="text-[10px] mt-3 bg-blue-600/50 p-2 rounded break-all">{inviteLink}</p>
          )}
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-2">
          <input 
            type="tel" 
            value={newPhone} 
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Or add phone manually"
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800]"
          />
          <button onClick={handleAdd} className="bg-[#FF9800] text-white px-4 rounded-xl font-bold shadow-md active:scale-95 flex items-center justify-center">
            <UserPlus size={20} />
          </button>
        </div>

        <div className="space-y-3">
          {collaborators.map((phone, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{phone}</p>
                <p className="text-[10px] text-gray-400">Sales Attendant</p>
              </div>
              <button onClick={() => handleRemove(phone)} className="bg-red-50 text-red-500 p-2 rounded-lg active:scale-95">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {collaborators.length === 0 && (
            <p className="text-center text-gray-400 text-sm mt-8">No collaborators added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
    }
