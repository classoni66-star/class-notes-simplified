import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, X } from "lucide-react";

export default function PriceList({ navigate, businessInfo, language }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const saved = localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const demoList = [
        { id: "1", name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
        { id: "2", name: "Soap (Sabuni)", unit: "bar", buyingPrice: 2500, sellingPrice: 3000 },
      ];
      setItems(demoList);
      localStorage.setItem("smartsale_pricelist", JSON.stringify(demoList));
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
        
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-5 text-center shadow-sm">
          <p className="text-[11px] text-blue-800 font-medium leading-relaxed">
            This list is used to calculate your profits. Confirm or edit the prices of the items or add any item missing. The listed items are the general items for your business but you can add items specific to you missing on this list.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", unit: "", buyingPrice: "", sellingPrice: "" }); }} 
            className="w-full bg-white border-2 border-dashed border-[#FF9800] text-[#FF9800] font-bold py-4 rounded-2xl mb-5 flex flex-col justify-center items-center gap-1 active:scale-95 transition-transform shadow-sm"
          >
            <div className="flex items-center gap-1">
              <Plus size={18} />
              <span>Click here to add any missing item</span>
            </div>
            <span className="text-[9px] font-medium text-gray-400">Tap to enter item name, unit, buying & selling price</span>
          </button>
        )}

        {(isAdding || editingId) && (
          <div className="bg-white p-5 rounded-2xl shadow-lg border-2 border-[#FF9800] mb-5 relative">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="absolute top-3 right-3 text-gray-400 p-1 bg-gray-50 rounded-full">
              <X size={18} />
            </button>
            <h3 className="font-bold text-gray-800 mb-4">{editingId ? "Edit Item" : "Add New Item"}</h3>
            
            <input 
              type="text" 
              placeholder="Item Name (e.g. Milk)" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 mb-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#FF9800]" 
            />
            
            <div className="flex gap-3 mb-4">
              <div className="w-1/3">
                <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Unit</label>
                <input type="text" placeholder="kg" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              <div className="w-1/3">
                <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Buy Price</label>
                <input type="number" placeholder="0" value={formData.buyingPrice} onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
              <div className="w-1/3">
                <label className="text-[10px] text-gray-500 font-bold ml-1 uppercase">Sell Price</label>
                <input type="number" placeholder="0" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#0055FF] outline-none focus:ring-2 focus:ring-[#FF9800]" />
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full py-3 bg-[#FF9800] text-white rounded-xl font-bold text-sm shadow-md">
              {editingId ? "Save Changes" : "Add to List"}
            </button>
          </div>
        )}

        {/* BEAUTIFUL CARD LIST */}
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id} 
              onClick={() => startEdit(item)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div>
                <p className="font-extrabold text-gray-800 flex items-center gap-1">
                  {item.name} <Edit2 size={12} className="text-gray-300" />
                </p>
                <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{item.unit}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold">BUY: {item.buyingPrice.toLocaleString()}</p>
                <p className="text-base font-extrabold text-[#0055FF]">SELL: {item.sellingPrice.toLocaleString()}</p>
              </div>
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
