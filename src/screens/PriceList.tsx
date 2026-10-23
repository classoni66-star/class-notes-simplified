import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, X, Trash2 } from "lucide-react";

const LISTS: Record<string, any[]> = {
  "Retailer": [
    { name: "Sugar (Sukari)", unit: "kg", sellingPrice: 5000 },
    { name: "Rice (Mchele)", unit: "kg", sellingPrice: 5300 },
    { name: "Maize Flour (Posho)", unit: "kg", sellingPrice: 2800 },
    { name: "Bread (Omugati)", unit: "loaf", sellingPrice: 6000 },
    { name: "Beans (Yellow)", unit: "kg", sellingPrice: 5800 },
    { name: "Cooking Oil (Mafuta)", unit: "liter", sellingPrice: 9400 },
    { name: "Salt (Omunyo)", unit: "packet", sellingPrice: 1200 },
    { name: "Laundry Soap (Sabuni)", unit: "bar", sellingPrice: 5400 },
    { name: "Soda (300ml)", unit: "bottle", sellingPrice: 2000 },
    { name: "Bottled Water (500ml)", unit: "bottle", sellingPrice: 1000 },
    { name: "Eggs (Traysta)", unit: "tray", sellingPrice: 12000 },
  ],
  "Trader": [
    { name: "Maize (Grain)", unit: "kg", sellingPrice: 1500 },
    { name: "Beans", unit: "kg", sellingPrice: 5000 },
    { name: "Groundnuts", unit: "kg", sellingPrice: 7500 },
    { name: "Cassava", unit: "kg", sellingPrice: 2000 },
    { name: "Bananas (Matooke)", unit: "bunch", sellingPrice: 15000 },
  ],
  "Electronics": [
    { name: "Samsung Charger", unit: "pc", sellingPrice: 15000 },
    { name: "Earphones (Basic)", unit: "pc", sellingPrice: 8000 },
    { name: "USB Cable", unit: "pc", sellingPrice: 5000 },
    { name: "Extension Cable", unit: "pc", sellingPrice: 20000 },
    { name: "Phone Case", unit: "pc", sellingPrice: 10000 },
  ],
  "Spare Parts": [
    { name: "Engine Oil (1L)", unit: "liter", sellingPrice: 25000 },
    { name: "Brake Pads", unit: "set", sellingPrice: 35000 },
    { name: "Spark Plug", unit: "pc", sellingPrice: 15000 },
    { name: "Side Mirror", unit: "pc", sellingPrice: 20000 },
    { name: "Wiper Blades", unit: "pair", sellingPrice: 18000 },
  ],
  "Restaurant": [
    { name: "Matooke & Beef", unit: "plate", sellingPrice: 10000 },
    { name: "Rice & Chicken", unit: "plate", sellingPrice: 12000 },
    { name: "Posho & Beans", unit: "plate", sellingPrice: 5000 },
    { name: "Chapati", unit: "pc", sellingPrice: 1000 },
    { name: "Soda (300ml)", unit: "bottle", sellingPrice: 2000 },
    { name: "Bottled Water", unit: "bottle", sellingPrice: 1000 },
  ],
  "Other": [
    { name: "Item 1", unit: "pc", sellingPrice: 0 },
  ]
};

export default function PriceList({ navigate, businessInfo, language }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });

  const t = (en: string, run: string) => (language === "run" ? run : en);
  const category = businessInfo?.type || "Retailer";

  useEffect(() => {
    const saved = localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const defaultList = LISTS[category] || LISTS["Retailer"];
      const seededList = defaultList.map((item, index) => ({
        ...item,
        id: (index + 1).toString()
      }));
      setItems(seededList);
      localStorage.setItem("smartsale_pricelist", JSON.stringify(seededList));
    }
  }, [category]);

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("smartsale_pricelist", JSON.stringify(newItems));
  };

  const handleSave = () => {
    if (!formData.name || !formData.sellingPrice) return;

    const itemData = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      unit: formData.unit || "pc",
      buyingPrice: Number(formData.buyingPrice) || 0, // Optional
      sellingPrice: Number(formData.sellingPrice) || 0,
    };

    if (editingId) {
      saveItems(items.map(i => i.id === editingId ? itemData : i));
    } else {
      saveItems([...items, itemData]);
    }

    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this item?")) {
      saveItems(items.filter(i => i.id !== id));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure? This will remove ALL items from your price list.")) {
      saveItems([]);
    }
  };

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      unit: item.unit,
      buyingPrice: item.buyingPrice ? item.buyingPrice.toString() : "",
      sellingPrice: item.sellingPrice.toString()
    });
    setIsAdding(false);
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
        <div className="flex gap-2">
          {items.length > 0 && (
            <button onClick={handleClearAll} className="text-red-500 p-2 bg-red-50 rounded-full shadow-sm">
              <Trash2 size={16} />
            </button>
          )}
          <button onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", unit: "", buyingPrice: "", sellingPrice: "" }); }} className="bg-[#FF9800] text-white p-2 rounded-full shadow-md">
            <Plus size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 text-center shadow-sm">
          <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
            This is your <strong>{category}</strong> price list. You can add missing items, edit prices, or remove items. 
            <br/><span className="text-[10px] text-blue-600">(Buying price is optional. Leave blank if you don't want profit calculated).</span>
          </p>
        </div>

        {(isAdding || editingId) && (
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#FF9800] mb-4 relative">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="absolute top-2 right-2 text-gray-400 p-1 bg-gray-50 rounded-full">
              <X size={18} />
            </button>
            <h3 className="font-bold text-gray-800 mb-3">{editingId ? "Edit Item" : "Add New Item"}</h3>
            
            <input type="text" placeholder="Item Name (e.g. Milk)" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 mb-2 bg-gray-50 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#FF9800]" />
            
            <div className="flex gap-2 mb-3">
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Unit</label>
                <input type="text" placeholder="kg" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Buy Price (Optional)</label>
                <input type="number" placeholder="0" value={formData.buyingPrice} onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Sell Price</label>
                <input type="number" placeholder="0" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md">
              {editingId ? "Save Changes" : "Add to List"}
            </button>
          </div>
        )}

        <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase text-center">
          Tap any item to edit. Swipe to delete.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-5 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            <div className="col-span-2">Item / Unit</div>
            <div className="text-right">Buy</div>
            <div className="text-right">Sell</div>
            <div className="text-center">Action</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-5 p-3 border-b border-gray-50 text-sm items-center">
              <div className="col-span-2 pr-1 cursor-pointer" onClick={() => startEdit(item)}>
                <p className="font-bold text-gray-800 leading-tight flex items-center gap-1">
                  {item.name} <Edit2 size={10} className="text-gray-400" />
                </p>
                <p className="text-[10px] text-gray-500">{item.unit}</p>
              </div>
              <div className="text-right text-gray-500 text-xs">
                {item.buyingPrice ? item.buyingPrice.toLocaleString() : "-"}
              </div>
              <div className="text-right font-bold text-[#0055FF] text-xs">{item.sellingPrice.toLocaleString()}</div>
              <div className="text-center">
                <button onClick={() => handleDelete(item.id)} className="text-red-400 p-1 bg-red-50 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">Your list is empty. Tap + to add items.</p>
          )}
        </div>
      </div>
    </div>
  );
     }
