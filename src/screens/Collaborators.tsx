import { useState, useEffect } from "react";
import { ArrowLeft, UserPlus, Trash2 } from "lucide-react";

export default function Collaborators({ navigate, language }: any) {
  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");
  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("smartsale_collaborators") || "[]");
    setCollaborators(saved);
  }, []);

  const handleAdd = () => {
    if (newPhone.length < 9) return alert("Enter a valid phone number");
    if (collaborators.includes(newPhone)) return alert("This person is already a collaborator");
    
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

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("profile")} className="text-gray-500"><ArrowLeft size={24} /></button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Team & Collaborators", "Abakukorera hamwe")}</h1>
      </header>

      <div className="flex-1 p-6 overflow-y-auto">
        <p className="text-sm text-gray-500 mb-6">
          Add phone numbers of people who help you run the shop. They can record sales, but only you (the owner) can manage the account.
        </p>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-2">
          <input 
            type="tel" 
            value={newPhone} 
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="e.g. 0770123456"
            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800]"
          />
          <button onClick={handleAdd} className="bg-[#0055FF] text-white px-4 rounded-xl font-bold shadow-md active:scale-95 flex items-center justify-center">
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
            <p className="text-center text-gray-400 text-sm mt-8">No collaborators added yet. You are running the shop alone!</p>
          )}
        </div>
      </div>
    </div>
  );
  }
