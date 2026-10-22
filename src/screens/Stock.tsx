import { useState, useEffect } from "react";
import { ArrowLeft, Plus, AlertTriangle, X, PackageMinus, PackagePlus } from "lucide-react";

const DEFAULT_ITEMS = [
  { name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4300, sellingPrice: 5000 },
  { name: "Rice (Mchele)", unit: "kg", buyingPrice: 4800, sellingPrice: 5300 },
  { name: "Maize Flour (Posho)", unit: "kg", buyingPrice: 2500, sellingPrice: 2800 },
  { name: "Bread (Omugati)", unit: "loaf", buyingPrice: 5300, sellingPrice: 6000 },
  { name: "Beans (Yellow)", unit: "kg", buyingPrice: 5200, sellingPrice: 5800 },
  { name: "Groundnuts (Ebinjagiro)", unit: "kg", buyingPrice: 7000, sellingPrice: 7700 },
  { name: "Cassava Flour", unit: "kg", buyingPrice: 2300, sellingPrice: 2600 },
  { name: "Cooking Oil (Mafuta)", unit: "liter", buyingPrice: 8500, sellingPrice: 9400 },
  { name: "Salt (Omunyo)", unit: "packet", buyingPrice: 1000, sellingPrice: 1200 },
  { name: "Tomatoes (Nyanya)", unit: "kg", buyingPrice: 2700, sellingPrice: 3100 },
  { name: "Onions (Bitunguru)", unit: "kg", buyingPrice: 3300, sellingPrice: 3800 },
  { name: "Laundry Soap (Sabuni)", unit: "bar", buyingPrice: 4900, sellingPrice: 5400 },
  { name: "Bathing Soap (White Star)", unit: "bar", buyingPrice: 5500, sellingPrice: 6200 },
  { name: "Toothpaste", unit: "tube", buyingPrice: 3500, sellingPrice: 4000 },
  { name: "Sanitary Pads", unit: "packet", buyingPrice: 3000, sellingPrice: 3500 },
  { name: "Tea Leaves (Chai)", unit: "packet", buyingPrice: 4000, sellingPrice: 4500 },
  { name: "Soda (300ml)", unit: "bottle", buyingPrice: 1500, sellingPrice: 2000 },
  { name: "Bottled Water (500ml)", unit: "bottle", buyingPrice: 800, sellingPrice: 1000 },
  { name: "Biscuits", unit: "packet", buyingPrice: 1000, sellingPrice: 1300 },
  { name: "Eggs (Traysta)", unit: "tray", buyingPrice: 11000, sellingPrice: 12000 },
];

export default function Stock({ navigate, businessInfo, language }: any) {
  const [stockData, setStockData] = useState<any[]>([]);
  
  // Modal State
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalMode, setModalMode] = useState<"menu" | "add" | "remove" | "newItem">("menu");
  
  // Form State
  const [qty, setQty] = useState<number | "">("");
  const [totalCost, setTotalCost] = useState<number | "">("");
  const [isPaid, setIsPaid] = useState(true);
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [supplierName, setSupplierName] = useState("");

  // New Item State
  const [newItem, setNewItem] = useState({ name: "", unit: "pc", buyingPrice: "", sellingPrice: "" });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  const loadStock = () => {
    let priceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    if (priceList.length === 0) {
      priceList = DEFAULT_ITEMS.map((item, index) => ({ ...item, id: (index + 1).toString() }));
      localStorage.setItem("smartsale_pricelist", JSON.stringify(priceList));
    }

    const sales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const removals = JSON.parse(localStorage.getItem("smartsale_removals") || "[]");
    const todayStr = new Date().toDateString();

    const combined = priceList.map((item: any) => {
      // 1. ALL TIME IN
      const stockEntry = initialStock.find((s: any) => s.itemId === item.id);
      const initial = stockEntry ? Number(stockEntry.quantity) : 0;

      // 2. ALL TIME OUT (For calculating true Left)
      const allItemSales = sales.filter((s: any) => s.itemName === item.name);
      const allTimeSold = allItemSales.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
      
      const allItemRemovals = removals.filter((r: any) => r.itemId === item.id);
      const allTimeRemoved = allItemRemovals.reduce((sum: number, r: any) => sum + Number(r.quantity), 0);

      // 3. TODAY'S OUT (For the "Out" column)
      const todaySales = allItemSales.filter((s: any) => new Date(s.date).toDateString() === todayStr);
      const todaySold = todaySales.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);

      const todayRemovals = allItemRemovals.filter((r: any) => new Date(r.date).toDateString() === todayStr);
      const todayRemoved = todayRemovals.reduce((sum: number, r: any) => sum + Number(r.quantity), 0);

      return {
        ...item,
        initial,
        todayOut: todaySold + todayRemoved,
        current: initial - allTimeSold - allTimeRemoved
      };
    });

    setStockData(combined);
  };

  useEffect(() => {
    loadStock();
  }, []);

  const resetForm = () => {
    setQty(""); setTotalCost(""); setIsPaid(true); setAmountPaid(""); setSupplierName("");
    setNewItem({ name: "", unit: "pc", buyingPrice: "", sellingPrice: "" });
  };

  const handleAddStock = () => {
    if (!qty || !selectedItem) return;

    // 1. Update Stock Quantity
    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    const existingIndex = initialStock.findIndex((s: any) => s.itemId === selectedItem.id);

    if (existingIndex >= 0) {
      initialStock[existingIndex].quantity += Number(qty);
    } else {
      initialStock.push({ itemId: selectedItem.id, quantity: Number(qty) });
    }
    localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));

    // 2. Handle Expenses & Creditors
    const cost = Number(totalCost) || 0;
    const paid = Number(amountPaid) || 0;
    const balance = cost - paid;

    if (isPaid && cost > 0) {
      const expenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]");
      expenses.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: cost,
        reason: `Stock Purchase: ${selectedItem.name}`
      });
      localStorage.setItem("smartsale_expenses", JSON.stringify(expenses));
    } else if (!isPaid) {
      if (paid > 0) {
        const expenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]");
        expenses.push({
          id: Date.now().toString(),
          date: new Date().toISOString(),
          amount: paid,
          reason: `Partial Stock Pay: ${selectedItem.name}`
        });
        localStorage.setItem("smartsale_expenses", JSON.stringify(expenses));
      }

      if (balance > 0) {
        if (!supplierName.trim()) return alert("Please enter the supplier's name for the balance owed.");
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

    setSelectedItem(null);
    resetForm();
    loadStock();
  };

  const handleRemoveStock = () => {
    if (!qty || !selectedItem) return;

    const removals = JSON.parse(localStorage.getItem("smartsale_removals") || "[]");
    removals.push({ itemId: selectedItem.id, quantity: Number(qty), date: new Date().toISOString() });
    localStorage.setItem("smartsale_removals", JSON.stringify(removals));

    setSelectedItem(null);
    resetForm();
    loadStock();
  };

  const handleCreateNewItem = () => {
    if (!newItem.name || !newItem.sellingPrice || !qty) return;

    const priceList = JSON.parse(localStorage.getItem("smartsale_pricelist") || "[]");
    const newId = Date.now().toString();
    
    const itemToAdd = {
      id: newId,
      name: newItem.name,
      unit: newItem.unit || "pc",
      buyingPrice: Number(newItem.buyingPrice) || 0,
      sellingPrice: Number(newItem.sellingPrice) || 0,
    };
    priceList.push(itemToAdd);
    localStorage.setItem("smartsale_pricelist", JSON.stringify(priceList));

    const initialStock = JSON.parse(localStorage.getItem("smartsale_initial_stock") || "[]");
    initialStock.push({ itemId: newId, quantity: Number(qty) });
    localStorage.setItem("smartsale_initial_stock", JSON.stringify(initialStock));

    const cost = (Number(newItem.buyingPrice) || 0) * Number(qty);
    if (isPaid && cost > 0) {
      const expenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]");
      expenses.push({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        amount: cost,
        reason: `New Item Purchase: ${newItem.name}`
      });
      localStorage.setItem("smartsale_expenses", JSON.stringify(expenses));
    }

    setSelectedItem(null);
    setModalMode("menu");
    resetForm();
    loadStock();
  };

  const calculatedBalance = (Number(totalCost) || 0) - (Number(amountPaid) || 0);

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden relative">
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-extrabold text-gray-800">{t("Stock", "Okugula")}</h1>
        </div>
        <button 
          onClick={() => { setModalMode("newItem"); setSelectedItem({name: "New Item"}); }} 
          className="bg-[#FF9800] text-white px-3 py-1.5 rounded-full shadow-md text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
        >
          <Plus size={14} /> Add Item
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* UPDATED HEADERS */}
          <div className="grid grid-cols-5 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100 text-center">
            <div className="text-left col-span-2">Item</div>
            <div>Total In</div>
            <div>Today Out</div>
            <div className="text-[#FF9800]">Left</div>
          </div>
          
          {stockData.map((item) => (
            <div 
              key={item.id} 
              onClick={() => { setSelectedItem(item); setModalMode("menu"); }}
              className="grid grid-cols-5 p-3 border-b border-gray-50 text-sm items-center text-center cursor-pointer hover:bg-orange-50 active:bg-orange-100 transition-colors"
            >
              <div className="text-left col-span-2 pr-1">
                <p className="font-bold text-gray-800 leading-tight truncate">{item.name}</p>
                <p className="text-[9px] text-gray-500">{item.unit}</p>
              </div>
              <div className="text-gray-500 text-xs font-medium">{item.initial}</div>
              <div className="text-gray-500 text-xs font-medium">{item.todayOut}</div>
              <div className={`font-extrabold text-sm ${item.current <= 5 ? 'text-red-500 flex items-center justify-center gap-1' : 'text-green-600'}`}>
                {item.current <= 5 && <AlertTriangle size={12} />}
                {item.current}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-3 text-center">"Today Out" resets to 0 every morning. "Left" is your actual physical stock.</p>
      </div>

      {/* BOTTOM SHEET MODAL */}
      {selectedItem && (
        <div className="absolute inset-0 bg-black/50 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-extrabold text-gray-800">{selectedItem.name}</h2>
              <button onClick={() => { setSelectedItem(null); setModalMode("menu"); }} className="p-1 bg-gray-100 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>

            {modalMode === "menu" && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-4 text-center">What would you like to do with this item?</p>
                <button onClick={() => setModalMode("add")} className="w-full py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold flex items-center justify-center gap-2">
                  <PackagePlus size={18} /> Add New Stock (Delivery)
                </button>
                <button onClick={() => setModalMode("remove")} className="w-full py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold flex items-center justify-center gap-2">
                  <PackageMinus size={18} /> Remove Stock (Spoiled/Loss)
                </button>
              </div>
            )}

            {modalMode === "add" && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity Received</label>
                    <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="e.g. 10" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Total Cost (UGX)</label>
                    <input type="number" value={totalCost} onChange={(e) => setTotalCost(Number(e.target.value))} placeholder="e.g. 40000" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
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
                      <input type="text" value={supplierName} onChange={(e) => setSupplierName(e.target.value)} placeholder="Who supplied this?" className="w-full p-2 bg-white border border-red-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400" />
                    </div>
                    {calculatedBalance > 0 && <p className="text-xs font-bold text-red-600 mt-1">Balance to owe: UGX {calculatedBalance.toLocaleString()}</p>}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModalMode("menu")} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm">Back</button>
                  <button onClick={handleAddStock} disabled={!qty} className="flex-[2] py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md disabled:opacity-50">Add to Stock</button>
                </div>
              </div>
            )}

            {modalMode === "remove" && (
              <div className="space-y-3">
                <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-center mb-2">
                  <p className="text-xs text-red-800 font-medium">Use this to record items that spoiled, broke, or were lost. This will reduce your available stock.</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Quantity to Remove</label>
                  <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="e.g. 2" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-red-400" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModalMode("menu")} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm">Back</button>
                  <button onClick={handleRemoveStock} disabled={!qty} className="flex-[2] py-2.5 bg-red-500 text-white rounded-lg font-bold text-sm shadow-md disabled:opacity-50">Confirm Removal</button>
                </div>
              </div>
            )}

            {modalMode === "newItem" && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Item Name</label>
                  <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="e.g. Milk" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
                <div className="flex gap-2">
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Unit</label>
                    <input type="text" value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} placeholder="kg" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                  </div>
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Buy Price</label>
                    <input type="number" value={newItem.buyingPrice} onChange={(e) => setNewItem({...newItem, buyingPrice: e.target.value})} placeholder="0" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                  </div>
                  <div className="w-1/3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Sell Price</label>
                    <input type="number" value={newItem.sellingPrice} onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})} placeholder="0" className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Initial Quantity</label>
                  <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="e.g. 10" className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Was this stock paid for?</label>
                  <div className="flex gap-2 mt-1">
                    <button onClick={() => setIsPaid(true)} className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 ${isPaid ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>Yes (Paid)</button>
                    <button onClick={() => setIsPaid(false)} className={`flex-1 py-2 rounded-lg font-bold text-xs border-2 ${!isPaid ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>No (Credit)</button>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setSelectedItem(null)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg font-bold text-sm">Cancel</button>
                  <button onClick={handleCreateNewItem} disabled={!newItem.name || !newItem.sellingPrice || !qty} className="flex-[2] py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md disabled:opacity-50">Add to Stock & List</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  }
