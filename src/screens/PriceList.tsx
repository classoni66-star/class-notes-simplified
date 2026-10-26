import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, MoreVertical } from "lucide-react";

const LISTS: Record<string, any[]> = {
  "Retailer": [
    { name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4300, sellingPrice: 5000 },
    { name: "Rice (Mchele)", unit: "kg", buyingPrice: 4800, sellingPrice: 5300 },
    { name: "Maize Flour (Posho)", unit: "kg", buyingPrice: 2500, sellingPrice: 2800 },
    { name: "Bread (Omugati)", unit: "loaf", buyingPrice: 5300, sellingPrice: 6000 },
    { name: "Beans (Yellow)", unit: "kg", buyingPrice: 5200, sellingPrice: 5800 },
    { name: "Cooking Oil (Mafuta)", unit: "liter", buyingPrice: 8500, sellingPrice: 9400 },
    { name: "Salt (Omunyo)", unit: "packet", buyingPrice: 1000, sellingPrice: 1200 },
    { name: "Laundry Soap (Sabuni)", unit: "bar", buyingPrice: 4900, sellingPrice: 5400 },
    { name: "Soda (300ml)", unit: "bottle", buyingPrice: 1500, sellingPrice: 2000 },
    { name: "Bottled Water (500ml)", unit: "bottle", buyingPrice: 800, sellingPrice: 1000 },
    { name: "Eggs (Traysta)", unit: "tray", buyingPrice: 11000, sellingPrice: 12000 },
  ],
  "Trader": [
    { name: "Maize (Grain)", unit: "kg", buyingPrice: 1200, sellingPrice: 1400 },
    { name: "Beans", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
    { name: "Groundnuts", unit: "kg", buyingPrice: 5500, sellingPrice: 6500 },
    { name: "Cassava Chips", unit: "kg", buyingPrice: 1200, sellingPrice: 1500 },
    { name: "Bananas (Matooke)", unit: "bunch", buyingPrice: 12000, sellingPrice: 15000 },
  ],
  "Electronics": [
    { name: "USB-C Cable", unit: "pc", buyingPrice: 5000, sellingPrice: 8000 },
    { name: "Fast Charger", unit: "pc", buyingPrice: 12000, sellingPrice: 18000 },
    { name: "Earphones (Basic)", unit: "pc", buyingPrice: 6000, sellingPrice: 10000 },
    { name: "Extension Cable", unit: "pc", buyingPrice: 15000, sellingPrice: 22000 },
    { name: "Phone Case", unit: "pc", buyingPrice: 4000, sellingPrice: 8000 },
  ],
  "Spare Parts": [
    { name: "Engine Oil (1L)", unit: "liter", buyingPrice: 20000, sellingPrice: 25000 },
    { name: "Brake Pads", unit: "set", buyingPrice: 55000, sellingPrice: 70000 },
    { name: "Spark Plug", unit: "pc", buyingPrice: 15000, sellingPrice: 20000 },
    { name: "Wiper Blades", unit: "pair", buyingPrice: 12000, sellingPrice: 18000 },
  ],
  "Restaurant": [
    { name: "Matooke & Beef", unit: "plate", buyingPrice: 6000, sellingPrice: 10000 },
    { name: "Rice & Chicken", unit: "plate", buyingPrice: 8000, sellingPrice: 15000 },
    { name: "Posho & Beans", unit: "plate", buyingPrice: 3000, sellingPrice: 5000 },
    { name: "Chapati", unit: "pc", buyingPrice: 800, sellingPrice: 1500 },
    { name: "Soda (300ml)", unit: "bottle", buyingPrice: 1200, sellingPrice: 1500 },
    { name: "Bottled Water", unit: "bottle", buyingPrice: 600, sellingPrice: 1000 },
  ],
  "Other": []
};

export default function PriceList({ navigate, businessInfo, language }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<"name" | "unit" | "buyingPrice" | "sellingPrice" | null>(null);
  const [editValue, setEditValue] = useState("");

  // State for the 3-dots menu
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const t = (en: string, run: string) => (language === "run" ? run : en);
  const category = businessInfo?.type || "Retailer";
  const STORAGE_KEY = "smartsale_pricelist_v2";

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      loadDefaults();
    }
  }, [category]);

  const loadDefaults = () => {
    const defaultList = LISTS[category] || LISTS["Retailer"];
    const seededList = defaultList.map((item, index) => ({
      ...item,
      id: (index + 1).toString()
    }));
    setItems(seededList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seededList));
  };

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  };

  const handleAddNew = () => {
    if (!newItem.name || !newItem.sellingPrice) return alert("Item Name and Selling Price are required.");

    const itemData = {
      id: Date.now().toString(),
      name: newItem.name,
      unit: newItem.unit || "pc",
      buyingPrice: Number(newItem.buyingPrice) || 0,
      sellingPrice: Number(newItem.sellingPrice),
    };

    saveItems([...items, itemData]);
    setShowAddForm(false);
    setNewItem({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });
  };

  const handleDelete = (id: string) => {
    saveItems(items.filter(i => i.id !== id));
    setMenuOpenId(null); // Close menu after deleting
  };

  const startEdit = (id: string, field: "name" | "unit" | "buyingPrice" | "sellingPrice", currentValue: string) => {
    setEditingId(id);
    setEditingField(field);
    setEditValue(currentValue.toString());
    setMenuOpenId(null); // Close menu if open
  };

  const saveEdit = () => {
    if (!editingId || !editingField) return;
    
    const updatedItems = items.map(item => {
      if (item.id === editingId) {
        let finalValue: any = editValue;
        if (editingField === "buyingPrice" || editingField === "sellingPrice") {
          finalValue = Number(editValue) || 0;
        }
        return { ...item, [editingField]: finalValue };
      }
      return item;
    });

    saveItems(updatedItems);
    setEditingId(null);
    setEditingField(null);
    setEditValue("");
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")} className="text-gray-500">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-extrabold text-gray-800">{t("Price List", "Ebihenda")}</h1>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-center shadow-sm">
          <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
            This is your <strong>{category}</strong> price list. Tap any item, unit, or price to edit it instantly.
            <br/><span className="text-[10px] text-blue-600">(At least Item Name & Selling Price are required).</span>
          </p>
        </div>

        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full bg-white border-2 border-dashed border-[#FF9800] text-[#FF9800] font-bold py-4 rounded-xl mb-4 flex flex-col justify-center items-center gap-1 active:scale-95 transition-transform shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Plus size={20} />
              <span>Tap here to add a new item</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400">At least Item Name & Selling Price are required</span>
          </button>
        )}

        {showAddForm && (
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#FF9800] mb-4 relative">
            <button onClick={() => setShowAddForm(false)} className="absolute top-2 right-2 text-gray-400 p-1 bg-gray-50 rounded-full">
              <X size={18} />
            </button>
            <h3 className="font-bold text-gray-800 mb-3">Add New Item</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase">Item Name *</label>
                <input type="text" placeholder="e.g. Milk" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-[2]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Selling Price *</label>
                  <input type="number" placeholder="e.g. 2000" value={newItem.sellingPrice} onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Buy Price</label>
                  <input type="number" placeholder="Optional" value={newItem.buyingPrice} onChange={(e) => setNewItem({...newItem, buyingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
                <div className="w-[70px]">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Unit</label>
                  <input type="text" placeholder="pc" value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
                </div>
              </div>
            </div>
            
            <button onClick={handleAddNew} className="w-full py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md mt-4">
              Add to List
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            <div className="col-span-2">Item / Unit</div>
            <div className="text-right">Buy</div>
            <div className="text-right">Sell</div>
            <div className="text-center">More</div>
          </div>

          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-5 p-2 border-b border-gray-50 text-sm items-center hover:bg-gray-50 transition-colors group">
              
              <div className="col-span-2 pr-2">
                {editingId === item.id && editingField === "name" ? (
                  <input autoFocus type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="w-full p-1 bg-white border border-[#FF9800] rounded text-sm font-bold outline-none" />
                ) : (
                  <p onClick={() => startEdit(item.id, "name", item.name)} className="font-bold text-gray-800 leading-tight cursor-text hover:bg-gray-100 rounded px-1 py-0.5">
                    {item.name}
                  </p>
                )}

                {editingId === item.id && editingField === "unit" ? (
                  <input autoFocus type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="w-16 mt-1 p-1 bg-white border border-[#FF9800] rounded text-[10px] outline-none" />
                ) : (
                  <p onClick={() => startEdit(item.id, "unit", item.unit)} className="text-[10px] text-gray-500 cursor-text hover:bg-gray-100 rounded px-1 inline-block">
                    {item.unit}
                  </p>
                )}
              </div>

              <div className="text-right pr-1">
                {editingId === item.id && editingField === "buyingPrice" ? (
                  <input autoFocus type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="w-full text-right p-1 bg-white border border-[#FF9800] rounded text-xs outline-none" />
                ) : (
                  <p onClick={() => startEdit(item.id, "buyingPrice", item.buyingPrice || "")} className="text-gray-500 text-xs cursor-text hover:bg-gray-100 rounded px-1 py-0.5">
                    {item.buyingPrice ? item.buyingPrice.toLocaleString() : "-"}
                  </p>
                )}
              </div>

              <div className="text-right pr-1">
                {editingId === item.id && editingField === "sellingPrice" ? (
                  <input autoFocus type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={saveEdit} onKeyDown={(e) => e.key === 'Enter' && saveEdit()} className="w-full text-right p-1 bg-white border border-[#FF9800] rounded text-xs font-bold text-[#0055FF] outline-none" />
                ) : (
                  <p onClick={() => startEdit(item.id, "sellingPrice", item.sellingPrice)} className="font-bold text-[#0055FF] text-xs cursor-text hover:bg-gray-100 rounded px-1 py-0.5">
                    {item.sellingPrice.toLocaleString()}
                  </p>
                )}
              </div>

              {/* 🛠️ 3 DOTS MENU */}
              <div className="flex justify-center relative">
                <button 
                  onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)} 
                  className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical size={16} />
                </button>

                {menuOpenId === item.id && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 shadow-xl rounded-xl z-20 w-28 overflow-hidden animate-fade-in-down">
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="w-full text-left px-4 py-3 text-xs text-red-600 font-bold hover:bg-red-50 active:bg-red-100 transition-colors"
                    >
                      Remove Item
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">Your list is empty. Tap the button above to add items.</p>
          )}
        </div>
      </div>
    </div>
  );
  }
