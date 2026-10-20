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
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top so they see the edit form
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
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: "", unit: "", buyingPrice: "", sellingPrice: "" }); }} 
          className="bg-[#FF9800] text-white p-2 rounded-full shadow-md"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <p className="text-[10px] text-gray-500 font-bold mb-4 uppercase text-center">
          Tap any item below to edit its price.
        </p>

        {(isAdding || editingId) && (
          <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-[#FF9800] mb-4 relative">
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="absolute top-2 right-2 text-gray-400 p-1">
              <X size={20} />
            </button>
            <h3 className="font-bold text-gray-800 mb-3">{editingId ? "Edit Item" : "Add New Item"}</h3>
            
            <input type="text" placeholder="Item Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 mb-2 bg-gray-50 border rounded-lg text-sm font-medium" />
            
            <div className="flex gap-2 mb-3">
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Unit</label>
                <input type="text" placeholder="kg" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
              </div>
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Buy Price</label>
                <input type="number" placeholder="0" value={formData.buyingPrice} onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm" />
              </div>
              <div className="w-1/3">
                <label className="text-[9px] text-gray-500 font-bold ml-1">Sell Price</label>
                <input type="number" placeholder="0" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})} className="w-full p-2 bg-gray-50 border rounded-lg text-sm font-bold text-[#0055FF]" />
              </div>
            </div>
            
            <button onClick={handleSave} className="w-full py-2.5 bg-[#FF9800] text-white rounded-lg font-bold text-sm shadow-md">
              {editingId ? "Save Changes" : "Add to List"}
            </button>
          </div>
        )}

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
            <p className="text-center text-gray-400 py-6 text-sm">No items yet. Tap + to add.</p>
          )}
        </div>
      </div>
    </div>
  );
                                            }
