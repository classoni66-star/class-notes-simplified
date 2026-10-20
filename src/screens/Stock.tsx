import { useState, useEffect } from "react";
import { ArrowLeft, Plus, AlertTriangle, X } from "lucide-react";

export default function Stock({ navigate, businessInfo, language }: any) {
  const [stockData, setStockData] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  
  // Add Stock Form State
  const [addQty, setAddQty] = useState<number | "">("");
  const [addBuyPrice, setAddBuyPrice] = useState<number | "">(""); 
  const [isPaid, setIsPaid] = useState(true);
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [supplierName, setSupplierName] = useState("");

  const t = (en: string, run: string) => (language === "run" ? run : en);

  const loadStock = () => {
    const priceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    const sales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");

    const combined = priceList.map((item: any) => {
      const itemSales = sales.filter((s: any) => s.itemName === item.name);
      const totalSold = itemSales.reduce((sum: number, s: any) => sum + s.quantity, 0);
      
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

  const handleEditInitial = (itemId: string, newVal: string) => {
    const val = Number(newVal) || 0;
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const existingIndex = initialStock.findIndex((s: any) => s.itemId === itemId);

    if (existingIndex >= 0) {
      initialStock[existingIndex].quantity = val;
    } else {
      initialStock.push({ itemId, quantity: val });
    }
    
    localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));
    loadStock(); 
  };

  const handleAddStock = () => {
    if (!selectedItemId || !addQty) return;

    // 1. Update Stock Quantity
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const existingIndex = initialStock.findIndex((s: any) => s.itemId === selectedItemId);

    if (existingIndex >= 0) {
      initialStock[existingIndex].quantity += Number(addQty);
    } else {
      initialStock.push({ itemId: selectedItemId, quantity: Number(addQty) });
    }
    localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));

    // 2. Handle Credit (Creditors) if Not Paid
    if (!isPaid) {
      const totalCost = Number(addBuyPrice) || 0;
      const paid = Number(amountPaid) || 0;
      const balance = totalCost - paid;

      if (balance > 0) {
        if (!supplierName.trim()) {
          return alert("Please enter the supplier's name for the balance owed.");
        }
        
        const creditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]");
        creditors.push({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          supplierName: supplierName.trim(),
          amountOwed: balance
        });
        localStorage.setItem("smartsale_creditors", JSON.stringify(creditors));
      }
    }

    // Reset and close
    setIsAdding(false);
    setAddQty("");
    setAddBuyPrice("");
    setIsPaid(true);
    setAmountPaid("");
    setSupplierName("");
    loadStock(); 
  };

  const calculatedBalance = (Number(addBuyPrice) || 0) - (Number(amountPaid) || 0);

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
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity</label>
                  <input type="number" value={addQty} onChange={(e) => setAddQty(Number(e.target.value))} placeholder="e.g. 10" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Total Cost (UGX)</label>
                  <input type="number" value={addBuyPrice} onChange={(e) => setAddBuyPrice(Number(e.target.value))} placeholder="e.g. 40000" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Payment Status</label>
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setIsPaid(true)} className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 ${isPaid ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>Paid in Full</button>
                  <button onClick={() => setIsPaid(false)} className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 ${!isPaid ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>Credit (Not Paid)</button>
                </div>
              </div>

              {!isPaid && (
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 space-y-2 mt-2">
                  <div>
                    <label className="text-[10px] font-bold text-red-800 uppercase">Amount Paid Now (Optional)</label>
                    <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(Number(e.target.value))} placeholder="e.g. 10000" className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-red-800 uppercase">Supplier Name</label>
                    <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Who supplied this stock?" className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400" />
                  </div>
                  {calculatedBalance > 0 && (
                    <p className="text-xs font-bold text-red-600 mt-1">Balance to owe: UGX {calculatedBalance.toLocaleString()}</p>
                  )}
                </div>
              )}

              <button onClick={handleAddStock} className="w-full py-3 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md mt-2">
                Confirm Stock Addition
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100 text-center">
            <div className="text-left col-span-1">Item</div>
            <div>In (Edit)</div>
            <div>Out</div>
            <div className="text-[#FF9800]">Left</div>
          </div>
          
          {stockData.map((item) => (
            <div key={item.id} className="grid grid-cols-4 p-2 border-b border-gray-50 text-sm items-center text-center">
              <div className="text-left col-span-1 pr-1">
                <p className="font-bold text-gray-800 leading-tight truncate">{item.name}</p>
                <p className="text-[9px] text-gray-500">{item.unit}</p>
              </div>
              
              <div className="flex justify-center">
                <input 
                  type="number" 
                  value={item.initial}
                  onChange={(e) => handleEditInitial(item.id, e.target.value)}
                  className="w-12 text-center border-b-2 border-gray-300 focus:border-[#FF9800] outline-none text-xs font-bold text-gray-700 bg-transparent"
                />
              </div>

              <div className="text-gray-500 text-xs font-medium">{item.sold}</div>
              
              <div className={`font-extrabold text-sm ${item.current <= 5 ? 'text-red-500 flex items-center justify-center gap-1' : 'text-green-600'}`}>
                {item.current <= 5 && <AlertTriangle size={12} />}
                {item.current}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
      }
