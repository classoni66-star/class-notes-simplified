import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PlusCircle, MinusCircle } from "lucide-react";

export default function FinanceModal({ isOpen, onClose, type }: any) {
  const [amount, setAmount] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const isFund = type === "fund";

  const handleSave = () => {
    if (!amount || amount <= 0) return alert("Please enter a valid amount");
    if (!reason.trim()) return alert("Please enter a reason");

    const key = isFund ? "smartsale_funds" : "smartsale_expenses";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    
    existing.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount: Number(amount),
      reason: reason.trim()
    });

    localStorage.setItem(key, JSON.stringify(existing));
    setAmount("");
    setReason("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[100]" />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 bg-white z-[101] rounded-t-3xl shadow-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-extrabold text-gray-800">
                {isFund ? "Add Funds" : "Record Expense"}
              </h2>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Amount (UGX)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="e.g. 5000"
                  className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Reason / Description</label>
                <input 
                  type="text" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={isFund ? "e.g. Added capital" : "e.g. Transport, Lunch"}
                  className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>

              <button 
                onClick={handleSave}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 mt-2 ${
                  isFund ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {isFund ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
                {isFund ? "Add Funds" : "Record Expense"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
      }
