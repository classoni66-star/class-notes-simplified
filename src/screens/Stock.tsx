import { useState, useEffect } from "react";
import { ArrowLeft, Plus, AlertTriangle, X } from "lucide-react";

export default function Stock({ navigate, businessInfo, language }: any) {
  const [stockData, setStockData] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [addQty, setAddQty] = useState<number | "">("");
  const [addBuyPrice, setAddBuyPrice] = useState<number | "">("");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  // Load Price List + Sales to calculate Current Stock
  const loadStock = () => {
    const priceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    const sales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");

    // For every item in the price list, calculate how much was sold
    const combined = priceList.map((item: any) => {
      const itemSales = sales.filter((s: any) => s.itemName === item.name);
      const totalSold = itemSales.reduce((sum: number, s: any) => sum + s.quantity, 0);
      
      // Find initial stock (default to 0 if not set yet)
      const stockEntry = initialStock.find((s: any) => s.itemId === item.id);
      const initial = stockEntry ? stockEntry.quantity : 0;

      return {
        ...item,
        initial,
        sold: totalSold,
        current: initial - totalSold
      };
    });

    setStockData(combined);
    if (combined.length > 0 && !selectedItemId) {
      setSelectedItemId(combined[0].id);
    }
  };

  useEffect(() => {
    loadStock();
  }, []);

  const handleAddStock = () => {
    if (!selectedItemId || !addQty) return;

    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const existingIndex = initialStock.findIndex((s: any) => s.itemId === selectedItemId);

    if (existingIndex >= 0) {
      // Update existing stock
      initialStock[existingIndex].quantity += Number(addQty);
    } else {
      // Add new stock record
      initialStock.push({ itemId: selectedItemId, quantity: Number(addQty) });
    }

    localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));

    // If they entered a buying price and it's not paid, we can log it as a creditor (we'll build the UI for this soon)
    // For now, just update the stock and close
    setIsAdding(false);
    setAddQty("");
    setAddBuyPrice("");
    loadStock(); // Refresh the table
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-extrabold text-gray-800">{t("Stock", "Okugula")}</h1>
        </div>
        <button 
          onClick={() => setIsAdding(true)} 
          className="bg-[#FF9800] text-white px-3 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> Add Stock
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* ADD STOCK MODAL */}
        {isAdding && (
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#FF9800] mb-4 relative">
            <button onClick={() => setIsAdding(false)} className="absolute top-2 right-2 text-gray-400">
              <X size={20} />
            </button>
            <h3 className="font-bold text-gray-800 mb-3">Add New Stock</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Select Item</label>
                <select 
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-medium outline-none"
                >
                  <option value="" disabled>Select item...</option>
                  {stockData.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity Bought</label>
                  <input 
                    type="number" 
                    value={addQty}
                    onChange={(e) => setAddQty(Number(e.target.value))}
                    placeholder="e.g. 10"
                    className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Buying Price (Total)</label>
                  <input 
                    type="number" 
                    value={addBuyPrice}
                    onChange={(e) => setAddBuyPrice(Number(e.target.value))}
                    placeholder="Optional"
                    className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]"
                  />
                </div>
              </div>

              <button onClick={handleAddStock} className="w-full py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md mt-2">
                Confirm Stock Addition
              </button>
            </div>
          </div>
        )}

        {/* STOCK TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100 text-center">
            <div className="text-left col-span-1">Item</div>
            <div>In</div>
            <div>Out</div>
            <div className="text-[#FF9800]">Left</div>
          </div>
          
          {stockData.map((item) => (
            <div key={item.id} className="grid grid-cols-4 p-3 border-b border-gray-50 text-sm items-center text-center">
              <div className="text-left col-span-1 pr-1">
                <p className="font-bold text-gray-800 leading-tight truncate">{item.name}</p>
                <p className="text-[9px] text-gray-500">{item.unit}</p>
              </div>
              <div className="text-gray-500 text-xs">{item.initial}</div>
              <div className="text-gray-500 text-xs">{item.sold}</div>
              
              {/* Remaining Stock - Turns red if below 5 */}
              <div className={`font-extrabold text-sm ${item.current <= 5 ? 'text-red-500 flex items-center justify-center gap-1' : 'text-green-600'}`}>
                {item.current <= 5 && <AlertTriangle size={12} />}
                {item.current}
              </div>
            </div>
          ))}
          
          {stockData.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Your stock is empty. Tap "+ Add Stock" to begin.</p>
          )}
        </div>

        <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
          <p className="text-[10px] text-blue-800 font-medium">
            "In" is what you added. "Out" is what you sold. "Left" is your current stock. Red means time to restock!
          </p>
        </div>

      </div>
    </div>
  );
}
