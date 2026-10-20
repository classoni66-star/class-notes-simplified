import { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus } from "lucide-react";

export default function AddSale({ navigate, businessInfo, language }: any) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [isPaid, setIsPaid] = useState(true);
  const [clientName, setClientName] = useState("");
  const [priceList, setPriceList] = useState<any[]>([]);

  // Custom Item State
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [showAddPrompt, setShowAddPrompt] = useState(false);
  const [newItemBuyingPrice, setNewItemBuyingPrice] = useState<number | "">("");
  const [newItemUnit, setNewItemUnit] = useState("pc");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setPriceList(JSON.parse(saved));
    } else {
      setPriceList([
        { id: "1", name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
        { id: "2", name: "Soap (Sabuni)", unit: "bar", buyingPrice: 2500, sellingPrice: 3000 },
      ]);
    }
  }, [businessInfo]);

  const filteredItems = priceList.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordSale = () => {
    if (!selectedItem || !quantity || quantity <= 0) return;
    if (selectedItem.isCustom && !customPrice) return;

    const unitPrice = selectedItem.isCustom ? Number(customPrice) : selectedItem.sellingPrice;
    const saleTotal = unitPrice * Number(quantity);
    
    // 1. Save Sale
    const existingSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itemName: selectedItem.name,
      quantity: Number(quantity),
      total: saleTotal,
      buyingPrice: selectedItem.buyingPrice || 0,
      sellingPrice: unitPrice,
      isPaid,
      clientName: isPaid ? "" : clientName || "Unknown",
    };
    localStorage.setItem("smartsale_sales", JSON.stringify([...existingSales, newSale]));

    // 2. Save Debt if unpaid
    if (!isPaid) {
      const existingDebts = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
      const newDebt = {
        id: newSale.id,
        date: newSale.date,
        clientName: newSale.clientName,
        amountOwed: saleTotal,
      };
      localStorage.setItem("smartsale_debtors", JSON.stringify([...existingDebts, newDebt]));
    }

    // 3. Check if custom item: Show prompt instead of navigating immediately
    if (selectedItem.isCustom) {
      setShowAddPrompt(true);
    } else {
      navigate("home");
    }
  };

  const handleSaveNewItemToPriceList = () => {
    if (!newItemBuyingPrice) {
      navigate("home"); // If they skip, just go home
      return;
    }
    
    const currentPriceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    const newItem = {
      id: Date.now().toString(),
      name: selectedItem.name,
      unit: newItemUnit,
      buyingPrice: Number(newItemBuyingPrice),
      sellingPrice: Number(customPrice),
    };
    
    localStorage.setItem("smartsale_pricelist", JSON.stringify([...currentPriceList, newItem]));
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
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800]"
              />
            </div>
            
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setSearch(""); }}
                  className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-left"
                >
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                  <p className="font-extrabold text-[#0055FF]">UGX {item.sellingPrice.toLocaleString()}</p>
                </button>
              ))}
              
              {/* CUSTOM ITEM FALLBACK */}
              {search.length > 0 && filteredItems.length === 0 && (
                <button 
                  onClick={() => { setSelectedItem({ name: search, isCustom: true }); setSearch(""); }}
                  className="w-full bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center gap-2 text-[#FF9800] font-bold"
                >
                  <Plus size={18} />
                  Sell "{search}" (Not in price list)
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">{selectedItem.name}</h2>
                {!selectedItem.isCustom && (
                  <p className="text-sm text-gray-500">UGX {selectedItem.sellingPrice.toLocaleString()} / {selectedItem.unit}</p>
                )}
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-sm font-bold text-red-500">Change</button>
            </div>

            <div className="space-y-4">
              
              {/* Custom Price Input */}
              {selectedItem.isCustom && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Selling Price (UGX)</label>
                  <input 
                    type="number" 
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    placeholder="e.g. 2000"
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Quantity Sold</label>
                <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  placeholder="e.g. 2"
                  className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-lg font-bold outline-none focus:ring-2 focus:ring-[#FF9800]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Payment Status</label>
                <div className="flex gap-2 mt-1">
                  <button 
                    onClick={() => setIsPaid(true)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${isPaid ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    Paid (Cash)
                  </button>
                  <button 
                    onClick={() => setIsPaid(false)}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm border-2 ${!isPaid ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}
                  >
                    Credit (Debt)
                  </button>
                </div>
              </div>

              {!isPaid && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Client Name (Debtor)</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Who owes you?"
                    className="w-full mt-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <p className="text-sm font-bold text-gray-500">Total Amount</p>
                <p className="text-2xl font-extrabold text-[#FF9800]">
                  UGX {(
                    (selectedItem.isCustom ? (Number(customPrice) || 0) : selectedItem.sellingPrice) * (Number(quantity) || 0)
                  ).toLocaleString()}
                </p>
              </div>

              <button 
                onClick={handleRecordSale}
                disabled={!quantity || quantity <= 0 || (selectedItem.isCustom && !customPrice)}
                className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
              >
                <Check size={20} />
                Confirm Sale
              </button>
            </div>
          </div>
        )}
      </div>

      {/* POST-SALE PROMPT FOR CUSTOM ITEMS */}
      {showAddPrompt && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Sale Recorded!</h3>
            <p className="text-sm text-gray-500 mb-4">
              "{selectedItem.name}" is not in your price list. Add it now to track profit next time?
            </p>
            
            <div className="space-y-3 text-left mb-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Unit (e.g. kg, pc)</label>
                <input 
                  type="text" 
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Buying Price (UGX)</label>
                <input 
                  type="number" 
                  value={newItemBuyingPrice}
                  onChange={(e) => setNewItemBuyingPrice(Number(e.target.value))}
                  placeholder="How much did you buy it for?"
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>
              <p className="text-[10px] text-gray-400">Selling Price will be saved as UGX {Number(customPrice).toLocaleString()}</p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => navigate("home")} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm">
                Skip
              </button>
              <button onClick={handleSaveNewItemToPriceList} className="flex-1 py-2.5 bg-[#0055FF] text-white rounded-lg font-bold text-sm shadow-md">
                Save to List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
