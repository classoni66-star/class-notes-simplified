import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, X } from "lucide-react";

const DEFAULT_UGANDA_RETAIL_ITEMS = [
  // Staples & Grains
  { name: "Sugar (Sukari)", unit: "kg", buyingPrice: 3200, sellingPrice: 3600 },
  { name: "Rice (Mchele)", unit: "kg", buyingPrice: 4800, sellingPrice: 5300 },
  { name: "Maize Flour (Posho)", unit: "kg", buyingPrice: 2500, sellingPrice: 2800 },
  { name: "Bread (Omugati)", unit: "loaf", buyingPrice: 2800, sellingPrice: 3200 },
  { name: "Beans (Yellow)", unit: "kg", buyingPrice: 5200, sellingPrice: 5800 },
  { name: "Groundnuts (Ebinjagiro)", unit: "kg", buyingPrice: 7000, sellingPrice: 7700 },
  { name: "Cassava Flour", unit: "kg", buyingPrice: 2300, sellingPrice: 2600 },
  
  // Cooking Essentials
  { name: "Cooking Oil (Mafuta)", unit: "liter", buyingPrice: 8500, sellingPrice: 9400 },
  { name: "Salt (Omunyo)", unit: "packet", buyingPrice: 1000, sellingPrice: 1200 },
  { name: "Tomatoes (Nyanya)", unit: "kg", buyingPrice: 2700, sellingPrice: 3100 },
  { name: "Onions (Bitunguru)", unit: "kg", buyingPrice: 3300, sellingPrice: 3800 },
  
  // Household & Toiletries
  { name: "Laundry Soap (Sabuni)", unit: "bar", buyingPrice: 4900, sellingPrice: 5400 },
  { name: "Bathing Soap (White Star)", unit: "bar", buyingPrice: 5500, sellingPrice: 6200 },
  { name: "Toothpaste", unit: "tube", buyingPrice: 3500, sellingPrice: 4000 },
  { name: "Sanitary Pads", unit: "packet", buyingPrice: 3000, sellingPrice: 3500 },
  
  // Beverages & Snacks
  { name: "Tea Leaves (Chai)", unit: "packet", buyingPrice: 4000, sellingPrice: 4500 },
  { name: "Soda (300ml)", unit: "bottle", buyingPrice: 1500, sellingPrice: 2000 },
  { name: "Bottled Water (500ml)", unit: "bottle", buyingPrice: 800, sellingPrice: 1000 },
  { name: "Biscuits", unit: "packet", buyingPrice: 1000, sellingPrice: 1300 },
  { name: "Eggs (Traysta)", unit: "tray", buyingPrice: 11000, sellingPrice: 12000 },
];

export default function PriceList({ navigate, businessInfo, language }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = localStorage.getItem("smartsale_pricelist");
    if (saved) {
      const parsed = JSON.parse(saved);
      // If the saved list is empty, load the Uganda defaults
      if (parsed.length === 0) {
        const seededList = DEFAULT_UGANDA_RETAIL_ITEMS.map((item, index) => ({
          ...item,
          id: (index + 1).toString()
        }));
        setItems(seededList);
        localStorage.setItem("smartsale_pricelist", JSON.stringify(seededList));
      } else {
        setItems(parsed);
      }
    } else {
      // First time opening: Load defaults
      const seededList = DEFAULT_UGANDA_RETAIL_ITEMS.map((item, index) => ({
        ...item,
        id: (index + 1).toString()
      }));
      setItems(seededList);
      localStorage.setItem("smartsale_pricelist", JSON.stringify(seededList));
    }
  }, []);

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
      buyingPrice: Number(formData.buyingPrice) || 0,
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

  const startEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      unit: item.unit,
      buyingPrice: item.buyingPrice.toString(),
      sellingPrice: item.sellingPrice.toString()
    });
    setIsAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
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
            This list is used to calculate your profits. Confirm or edit the prices of the items or add any item missing. The listed items are the general items for your business but you can add items specific to you missing on this list.
          </p>
        </div>

        {/* SOLID ADD BUTTON */}
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", unit: "", buyingPrice: "", sellingPrice: "" }); }} 
            className="w-full bg-[#FF9800] text-white font-bold py-3.5 rounded-xl mb-4 flex justify-center items-center gap-2 active:scale-95 transition-transform shadow-md"
          >
            <Plus size={18} />
            Click here to add any missing item
          </button>
        )}

        {(isAdding || editingId) && (
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#FF9800] mb-4 relative">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="absolute top-2 right-2 text-gray-400 p-1 bg-gray-50 rounded-full">
              <X size={18} />
            </button>
            <h3 className="font-bold text-gray-800 mb-3">{editingId ? "Edit Item" : "Add New Item"}</h3>
            
            <input 
              type="text" 
              placeholder="Item Name (e.g. Milk)" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-2 mb-2 bg-gray-50 border rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-[#FF9800]" 
            />
            
            <div className="flex gap-2 mb-3">
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Unit</label>
                <input type="text" placeholder="kg" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Buy Price</label>
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
          Tap any item below to edit its price.
        </p>

        {/* TABLE LAYOUT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            <div className="col-span-2">Item / Unit</div>
            <div className="text-right">Buy</div>
            <div className="text-right">Sell</div>
          </div>
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => startEdit(item)}
              className="grid grid-cols-4 p-3 border-b border-gray-50 text-sm items-center cursor-pointer hover:bg-orange-50 active:bg-orange-100 transition-colors"
            >
              <div className="col-span-2 pr-1">
                <p className="font-bold text-gray-800 leading-tight flex items-center gap-1">
                  {item.name} <Edit2 size={10} className="text-gray-400" />
                </p>
                <p className="text-[10px] text-gray-500">{item.unit}</p>
              </div>
              <div className="text-right text-gray-500 text-xs">{item.buyingPrice.toLocaleString()}</div>
              <div className="text-right font-bold text-[#0055FF] text-xs">{item.sellingPrice.toLocaleString()}</div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-gray-400 py-6 text-sm">No items yet. Tap the button above to add.</p>
          )}
        </div>
      </div>
    </div>
  );
    }
