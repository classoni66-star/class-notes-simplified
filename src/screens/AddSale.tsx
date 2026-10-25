import { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus, AlertCircle } from "lucide-react";

export default function AddSale({ navigate, businessInfo, language }: any) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Inputs
  const [inputMode, setInputMode] = useState<"qty" | "amount">("qty");
  const [qty, setQty] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");
  const [customPrice, setCustomPrice] = useState<number | "">("");

  // Payment Status (Default is PAID)
  const [isPaid, setIsPaid] = useState(true);
  const [clientName, setClientName] = useState("");

  const [priceList, setPriceList] = useState<any[]>([]);

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    // Load the updated price list
    const saved = localStorage.getItem("smartsale_pricelist_v2") || localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setPriceList(JSON.parse(saved));
    }
  }, [businessInfo]);

  const filteredItems = priceList.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordSale = () => {
    if (!selectedItem) return;
    if (inputMode === "qty" && (!qty || qty <= 0)) return alert("Please enter a valid quantity.");
    if (inputMode === "amount" && (!amount || amount <= 0)) return alert("Please enter a valid amount.");
    if (selectedItem.isCustom && !customPrice) return alert("Please enter the selling price.");

    const unitPrice = selectedItem.isCustom ? Number(customPrice) : selectedItem.sellingPrice;
    
    // Calculate final QTY and TOTAL
    let finalQty = 0;
    let finalTotal = 0;

    if (inputMode === "qty") {
      finalQty = Number(qty);
      finalTotal = unitPrice * finalQty;
    } else {
      finalTotal = Number(amount);
      finalQty = finalTotal / unitPrice;
    }
    
    // 1. Save the Sale
    const existingSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itemName: selectedItem.name,
      quantity: Number(finalQty.toFixed(2)),
      total: finalTotal,
      buyingPrice: selectedItem.buyingPrice || 0,
      sellingPrice: unitPrice,
      isPaid,
      clientName: isPaid ? "" : clientName.trim() || "Unknown",
    };
    localStorage.setItem("smartsale_sales", JSON.stringify([...existingSales, newSale]));

    // 2. Handle Debt
    if (!isPaid) {
      const existingDebts = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
      const newDebt = {
        id: newSale.id,
        date: newSale.date,
        clientName: newSale.clientName,
        amountOwed: finalTotal,
      };
      localStorage.setItem("smartsale_debtors", JSON.stringify([...existingDebts, newDebt]));
    }

    // 3. AUTO-ADD TO PRICE LIST IF CUSTOM
    if (selectedItem.isCustom) {
      const currentList = JSON.parse(localStorage.getItem("smartsale_pricelist_v2") || "[]");
      const newItemForList = {
        id: Date.now().toString() + "-new",
        name: selectedItem.name,
        unit: "pc", // Default unit
        buyingPrice: 0, // No buying price known yet
        sellingPrice: unitPrice,
      };
      localStorage.setItem("smartsale_pricelist_v2", JSON.stringify([...currentList, newItemForList]));
    }

    // Go Home
    navigate("home");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden relative">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Add Sale", "Tunda")}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {!selectedItem ? (
          <div className="space-y-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800] text-lg font-medium shadow-sm"
              />
            </div>
            
            <div className="space-y-3">
              {/* Show filtered items */}
              {filteredItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setSearch(""); }}
                  className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-left active:scale-[0.98] transition-transform"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium">{item.unit}</p>
                  </div>
                  <p className="font-extrabold text-[#0055FF] text-lg">UGX {item.sellingPrice.toLocaleString()}</p>
                </button>
              ))}
              
              {/* BIG BUTTON FOR MISSING ITEM */}
              {search.length > 0 && filteredItems.length === 0 && (
                <button 
                  onClick={() => { setSelectedItem({ name: search, isCustom: true }); setSearch(""); }}
                  className="w-full bg-[#FF9800] border-2 border-[#FF9800] p-5 rounded-xl flex flex-col items-center justify-center gap-2 text-white shadow-lg active:scale-[0.98] transition-transform mt-4"
                >
                  <Plus size={24} />
                  <span className="font-extrabold text-lg text-center leading-tight">Sell "{search}"</span>
                  <span className="text-xs font-medium text-orange-100">Not in price list. Tap to add & sell.</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">{selectedItem.name}</h2>
                {!selectedItem.isCustom ? (
                  <p className="text-sm text-gray-500 font-medium mt-1">UGX {selectedItem.sellingPrice.toLocaleString()} / {selectedItem.unit}</p>
                ) : (
                  <p className="text-xs text-[#FF9800] font-bold mt-1">New Item (Will be saved to Price List)</p>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">Change</button>
            </div>

            <div className="space-y-5">
              
              {/* CUSTOM PRICE INPUT */}
              {selectedItem.isCustom && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price (UGX)</label>
                  <input 
                    type="number" 
                    autoFocus
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-extrabold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              )}

              {/* FLEXIBLE INPUT TOGGLE */}
              <div>
                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-3">
                  <button onClick={() => setInputMode("qty")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMode === "qty" ? "bg-white shadow-sm text-[#FF9800]" : "text-gray-500"}`}>Enter Quantity</button>
                  <button onClick={() => setInputMode("amount")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMode === "amount" ? "bg-white shadow-sm text-[#FF9800]" : "text-gray-500"}`}>Enter Total Amount</button>
                </div>
                
                {inputMode === "qty" ? (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity Sold</label>
                    <input 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))} 
                      placeholder="e.g. 2" 
                      className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold outline-none focus:ring-2 focus:ring-[#FF9800]" 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount (UGX)</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(Number(e.target.value))} 
                      placeholder="e.g. 10000" 
                      className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]" 
                    />
                  </div>
                )}
              </div>

              {/* PAYMENT STATUS */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payment Status</label>
                <div className="flex flex-col gap-2">
                  
                  {/* PAID BUTTON (Default) */}
                  <button 
                    onClick={() => setIsPaid(true)} 
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-between px-5 border-2 transition-colors ${isPaid ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <span>Paid in Full (Cash)</span>
                    {isPaid && <Check size={20} />}
                  </button>
                  
                  {/* DEBT BUTTON */}
                  <button 
                    onClick={() => setIsPaid(false)} 
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-between px-5 border-2 transition-colors ${!isPaid ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <span>Credit (Not Paid)</span>
                    {!isPaid && <AlertCircle size={20} />}
                  </button>

                </div>
              </div>

              {/* CLIENT NAME FOR DEBT */}
              {!isPaid && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 animate-fade-in-down">
                  <label className="text-xs font-bold text-red-800 uppercase tracking-wider">Client Name (Optional)</label>
                  <input 
                    type="text" 
                    value={clientName} 
                    onChange={(e) => setClientName(e.target.value)} 
                    placeholder="Who owes you?" 
                    className="w-full mt-2 p-3 bg-white border border-red-200 rounded-xl outline-none focus:ring-2 focus:ring-red-400 text-lg font-medium" 
                  />
                  <p className="text-[10px] text-red-600 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> This will be added to your Debtors list.
                  </p>
                </div>
              )}

              {/* TOTAL DISPLAY */}
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Amount</p>
                <p className="text-3xl font-extrabold text-[#FF9800]">
                  UGX {inputMode === "qty" 
                    ? ((selectedItem.isCustom ? (Number(customPrice) || 0) : selectedItem.sellingPrice) * (Number(qty) || 0)).toLocaleString()
                    : (Number(amount) || 0).toLocaleString()
                  }
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                onClick={handleRecordSale}
                disabled={(inputMode === "qty" && !qty) || (inputMode === "amount" && !amount) || (selectedItem.isCustom && !customPrice)}
                className="w-full bg-[#FF9800] text-white py-5 rounded-xl font-extrabold text-xl shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 disabled:opacity-50 mt-2 active:scale-95 transition-transform"
              >
                <Check size={24} />
                Confirm Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  }
