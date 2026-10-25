import { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus, AlertCircle } from "lucide-react";

export default function AddSale({ navigate, businessInfo, language }: any) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Custom Item Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState<number | "">("");

  // Inputs for Sale
  const [inputMode, setInputMode] = useState<"qty" | "amount">("amount"); // Default to amount for speed
  const [qty, setQty] = useState<number | "">("");
  const [amount, setAmount] = useState<number | "">("");

  // Payment Status
  const [isPaid, setIsPaid] = useState(true);
  const [clientName, setClientName] = useState("");

  const [priceList, setPriceList] = useState<any[]>([]);

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = localStorage.getItem("smartsale_pricelist_v2") || localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setPriceList(JSON.parse(saved));
    }
  }, [businessInfo]);

  const filteredItems = priceList.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setSelectedItem(null);
    setIsAddingNew(false);
    setNewItemName("");
    setNewItemPrice("");
    setQty("");
    setAmount("");
    setInputMode("amount");
    setIsPaid(true);
    setClientName("");
    setSearch("");
  };

  const handleRecordSale = () => {
    let finalItemName = "";
    let unitPrice = 0;

    if (isAddingNew) {
      if (!newItemName.trim()) return alert("Please enter the item name.");
      if (!newItemPrice || newItemPrice <= 0) return alert("Please enter the selling price.");
      finalItemName = newItemName.trim();
      unitPrice = Number(newItemPrice);
    } else if (selectedItem) {
      finalItemName = selectedItem.name;
      unitPrice = selectedItem.sellingPrice;
    } else {
      return;
    }

    // Determine Quantity and Total
    let finalQty = 1;
    let finalTotal = unitPrice;

    if (inputMode === "qty") {
      if (qty && qty > 0) finalQty = Number(qty);
      finalTotal = unitPrice * finalQty;
    } else {
      if (amount && amount > 0) {
        finalTotal = Number(amount);
        finalQty = finalTotal / unitPrice;
      }
    }
    
    // 1. Save the Sale
    const existingSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itemName: finalItemName,
      quantity: Number(finalQty.toFixed(2)),
      total: finalTotal,
      buyingPrice: selectedItem?.buyingPrice || 0,
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

    // 3. AUTO-ADD TO PRICE LIST & STOCK IF NEW ITEM
    if (isAddingNew) {
      const currentList = JSON.parse(localStorage.getItem("smartsale_pricelist_v2") || "[]");
      const exists = currentList.find((i: any) => i.name.toLowerCase() === finalItemName.toLowerCase());
      
      if (!exists) {
        const newId = Date.now().toString() + "-new";
        // Add to Price List
        const newItemForList = {
          id: newId,
          name: finalItemName,
          unit: "pc",
          buyingPrice: 0, 
          sellingPrice: unitPrice,
        };
        localStorage.setItem("smartsale_pricelist_v2", JSON.stringify([...currentList, newItemForList]));

        // Add to Initial Stock (so it shows up in the Stock tab)
        const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
        initialStock.push({ itemId: newId, quantity: 0 }); // Start at 0 stock
        localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));
      }
    }

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
        
        {/* SEARCH & ADD NEW LIST VIEW */}
        {!selectedItem && !isAddingNew && (
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

            {/* RECTANGULAR ADD NEW ITEM BUTTON */}
            <button 
              onClick={() => setIsAddingNew(true)}
              className="w-full bg-white border-2 border-dashed border-[#FF9800] p-4 rounded-xl flex items-center justify-center gap-2 text-[#FF9800] shadow-sm active:scale-[0.98] transition-transform"
            >
              <Plus size={20} />
              <span className="font-extrabold text-base">Sell an item not in the list</span>
            </button>
            
            <div className="space-y-3">
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
              
              {search.length > 0 && filteredItems.length === 0 && (
                <p className="text-center text-gray-400 py-6 text-sm">No items found. Tap the orange button above to sell this.</p>
              )}
            </div>
          </div>
        )}

        {/* SALE FORM (EXISTING OR NEW ITEM) */}
        {(selectedItem || isAddingNew) && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            
            {/* HEADER (Item Name / Price) */}
            <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
              <div className="flex-1">
                {isAddingNew ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Item Name</label>
                    <input 
                      type="text" 
                      autoFocus
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      placeholder="e.g. Fresh Milk"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-extrabold text-gray-800 outline-none focus:ring-2 focus:ring-[#FF9800]"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-extrabold text-gray-800 leading-tight">{selectedItem.name}</h2>
                    <p className="text-sm text-gray-500 font-bold mt-1">UGX {selectedItem.sellingPrice.toLocaleString()} / {selectedItem.unit}</p>
                  </>
                )}
              </div>
              <button onClick={resetForm} className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg ml-2 mt-1">Cancel</button>
            </div>

            <div className="space-y-5">
              
              {/* CUSTOM PRICE INPUT */}
              {isAddingNew && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selling Price (UGX) *</label>
                  <input 
                    type="number" 
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-extrabold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              )}

              {/* INPUT TOGGLE (Amount is default) */}
              <div>
                <div className="flex bg-gray-100 p-1.5 rounded-xl mb-3">
                  <button onClick={() => setInputMode("amount")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMode === "amount" ? "bg-white shadow-sm text-[#FF9800]" : "text-gray-500"}`}>Enter Total Amount</button>
                  <button onClick={() => setInputMode("qty")} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${inputMode === "qty" ? "bg-white shadow-sm text-[#FF9800]" : "text-gray-500"}`}>Enter Quantity</button>
                </div>
                
                {inputMode === "amount" ? (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount (UGX)</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(Number(e.target.value))} 
                      placeholder="e.g. 10000" 
                      className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-extrabold text-[#FF9800] outline-none focus:ring-2 focus:ring-[#FF9800]" 
                    />
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity Sold (Optional)</label>
                    <input 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(Number(e.target.value))} 
                      placeholder="Leave blank for 1" 
                      className="w-full mt-1 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xl font-bold outline-none focus:ring-2 focus:ring-[#FF9800]" 
                    />
                  </div>
                )}
              </div>

              {/* PAYMENT STATUS */}
              <div className="pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payment Status</label>
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setIsPaid(true)} 
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-between px-5 border-2 transition-colors ${isPaid ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    <span>Paid in Full (Cash)</span>
                    {isPaid && <Check size={20} />}
                  </button>
                  
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
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center bg-orange-50 p-4 rounded-xl">
                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Sale</p>
                <p className="text-3xl font-extrabold text-[#FF9800]">
                  UGX {inputMode === "qty" 
                    ? ((isAddingNew ? (Number(newItemPrice) || 0) : selectedItem.sellingPrice) * (Number(qty) || 1)).toLocaleString()
                    : (Number(amount) || 0).toLocaleString()
                  }
                </p>
              </div>

              {/* SUBMIT BUTTON */}
              <button 
                onClick={handleRecordSale}
                className="w-full bg-[#FF9800] text-white py-5 rounded-xl font-extrabold text-xl shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 mt-2 active:scale-95 transition-transform"
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
