import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Edit2, Check, X } from "lucide-react";

export default function PriceList({ navigate, businessInfo, language }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    // Load from memory, or use the demo ones if empty
    const saved = localStorage.getItem("smartsale_pricelist");
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      const demoList = [
        { id: "1", name: "Sugar (Sukari)", unit: "kg", buyingPrice: 4000, sellingPrice: 4500 },
        { id: "2", name: "Soap (Sabuni)", unit: "bar", buyingPrice: 2500, sellingPrice: 3000 },
        { id: "3", name: "Bread (Omugati)", unit: "loaf", buyingPrice: 3000, sellingPrice: 3500 },
      ];
      setItems(demoList);
      localStorage.setItem("smartsale_pricelist", JSON.stringify(demoList));
    }
  }, []);

  const saveItems = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("smartsale_pricelist", JSON.stringify(newItems));
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.sellingPrice) return;
    const item = {
      id: Date.now().toString(),
      name: newItem.name,
      unit: newItem.unit || "pc",
      buyingPrice: Number(newItem.buyingPrice) || 0,
      sellingPrice: Number(newItem.sellingPrice) || 0,
    };
    saveItems([...items, item]);
    setIsAdding(false);
    setNewItem({ name: "", unit: "", buyingPrice: "", sellingPrice: "" });
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
        <button onClick={() => setIsAdding(true)} className="bg-[#FF9800] text-white p-2 rounded-full shadow-md">
          <Plus size={20} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <p className="text-xs text-gray-500 font-bold mb-4 uppercase text-center">
          Confirm buying & selling prices to calculate profit.
        </p>

        {/* ADD ITEM FORM */}
        {isAdding && (
          <div className="bg-white p-4 rounded-xl shadow-md border border-gray-100 mb-4">
            <h3 className="font-bold text-gray-800 mb-2">Add New Item</h3>
            <input type="text" placeholder="Item Name" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} className="w-full p-2 mb-2 bg-gray-50 border rounded-lg text-sm" />
            <div className="flex gap-2 mb-2">
              <input type="text" placeholder="Unit (e.g. kg)" value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} className="w-1/3 p-2 bg-gray-50 border rounded-lg text-sm" />
              <input type="number" placeholder="Buy Price" value={newItem.buyingPrice} onChange={(e) => setNewItem({...newItem, buyingPrice: e.target.value})} className="w-1/3 p-2 bg-gray-50 border rounded-lg text-sm" />
              <input type="number" placeholder="Sell Price" value={newItem.sellingPrice} onChange={(e) => setNewItem({...newItem, sellingPrice: e.target.value})} className="w-1/3 p-2 bg-gray-50 border rounded-lg text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsAdding(false)} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">Cancel</button>
              <button onClick={handleAddItem} className="flex-1 py-2 bg-[#FF9800] text-white rounded-lg font-bold text-sm">Save Item</button>
            </div>
          </div>
        )}

        {/* ITEMS TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-4 bg-gray-50 p-3 text-[10px] font-bold text-gray-500 uppercase border-b border-gray-100">
            <div className="col-span-2">Item / Unit</div>
            <div className="text-right">Buy</div>
            <div className="text-right">Sell</div>
          </div>
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-4 p-3 border-b border-gray-50 text-sm items-center">
              <div className="col-span-2">
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-[10px] text-gray-500">{item.unit}</p>
              </div>
              <div className="text-right text-gray-500">{item.buyingPrice.toLocaleString()}</div>
              <div className="text-right font-bold text-[#0055FF]">{item.sellingPrice.toLocaleString()}</div>
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
