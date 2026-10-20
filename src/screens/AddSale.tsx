import { useState, useEffect } from "react";
import { ArrowLeft, Check, Search, Plus } from "lucide-react";

export default function AddSale({ navigate, businessInfo, language }: any) {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState<number | "">("");
  const [isPaid, setIsPaid] = useState(true);
  const [clientName, setClientName] = useState("");
  const [priceList, setPriceList] = useState<any[]>([]);

  const t = (en: string, run: string) => (language === "run" ? run : en);

  // Load items from the business price list (or a default demo list)
  useEffect(() => {
    if (businessInfo?.priceList && businessInfo.priceList.length > 0) {
      setPriceList(businessInfo.priceList);
    } else {
      // Demo items if price list is empty
      setPriceList([
        { id: "1", name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
        { id: "2", name: "Soap (Sabuni)", unit: "bar", buyingPrice: 2500, sellingPrice: 3000 },
        { id: "3", name: "Bread (Omugati)", unit: "loaf", buyingPrice: 3000, sellingPrice: 3500 },
      ]);
    }
  }, [businessInfo]);

  const filteredItems = priceList.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleRecordSale = () => {
    if (!selectedItem || !quantity || quantity <= 0) return;

    const saleTotal = selectedItem.sellingPrice * Number(quantity);
    
    // Save Sale to Phone Memory
    const existingSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const newSale = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      itemName: selectedItem.name,
      quantity: Number(quantity),
      total: saleTotal,
      isPaid,
      clientName: isPaid ? "" : clientName || "Unknown",
    };
    localStorage.setItem("smartsale_sales", JSON.stringify([...existingSales, newSale]));

    // If it's a debt, save to Debtors list
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

    // Go back to Home
    navigate("home");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      {/* HEADER */}
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Add Sale", "Tunda")}</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* STEP 1: SELECT ITEM */}
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
                  onClick={() => setSelectedItem(item)}
                  className="w-full bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center text-left"
                >
                  <div>
                    <p className="font-bold text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.unit}</p>
                  </div>
                  <p className="font-extrabold text-[#0055FF]">UGX {item.sellingPrice.toLocaleString()}</p>
                </button>
              ))}
              {filteredItems.length === 0 && (
                <p className="text-center text-gray-500 text-sm mt-4">Item not found. Add it in the Price List tab.</p>
              )}
            </div>
          </div>
        ) : (
          /* STEP 2: ENTER DETAILS */
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-800">{selectedItem.name}</h2>
                <p className="text-sm text-gray-500">UGX {selectedItem.sellingPrice.toLocaleString()} / {selectedItem.unit}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-sm font-bold text-red-500">Change</button>
            </div>

            <div className="space-y-4">
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
                  UGX {((selectedItem.sellingPrice * (Number(quantity) || 0))).toLocaleString()}
                </p>
              </div>

              <button 
                onClick={handleRecordSale}
                disabled={!quantity || quantity <= 0}
                className="w-full bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-500/30 flex justify-center items-center gap-2 disabled:opacity-50 mt-2"
              >
                <Check size={20} />
                Confirm Sale
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
