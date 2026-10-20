import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function Analytics({ navigate, businessInfo, language }: any) {
  const [activeTab, setActiveTab] = useState<"sales" | "debtors" | "creditors" | "summary">("sales");
  const [groupedSales, setGroupedSales] = useState<Record<string, any>>({});
  const [debtors, setDebtors] = useState<any[]>([]);
  const [creditors, setCreditors] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalSales: 0, totalProfit: 0, totalDebts: 0, totalCreditors: 0 });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    // 1. Load Sales & Group by Day
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]").reverse();
    
    const grouped: Record<string, { items: any[], daySales: number, dayProfit: number }> = {};
    
    savedSales.forEach((sale: any) => {
      const dateObj = new Date(sale.date);
      const dayString = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      
      if (!grouped[dayString]) {
        grouped[dayString] = { items: [], daySales: 0, dayProfit: 0 };
      }
      
      grouped[dayString].items.push(sale);
      grouped[dayString].daySales += Number(sale.total) || 0;
      
      const profit = ((Number(sale.sellingPrice) || 0) - (Number(sale.buyingPrice) || 0)) * (Number(sale.quantity) || 0);
      grouped[dayString].dayProfit += profit;
    });
    
    setGroupedSales(grouped);

    // 2. Load Debtors & Creditors
    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]").filter((d: any) => Number(d.amountOwed) > 0);
    setDebtors(savedDebtors);

    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]").filter((c: any) => Number(c.amountOwed) > 0);
    setCreditors(savedCreditors);

    // 3. Calculate Monthly Summary
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let mSales = 0, mProfit = 0, mDebts = 0, mCreditors = 0;

    savedSales.forEach((s: any) => {
      const d = new Date(s.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        mSales += Number(s.total) || 0;
        mProfit += ((Number(s.sellingPrice) || 0) - (Number(s.buyingPrice) || 0)) * (Number(s.quantity) || 0);
        if (!s.isPaid) mDebts += Number(s.total) || 0;
      }
    });

    savedCreditors.forEach((c: any) => {
      const d = new Date(c.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        mCreditors += Number(c.amountOwed) || 0;
      }
    });

    setSummary({ totalSales: mSales, totalProfit: mProfit, totalDebts: mDebts, totalCreditors: mCreditors });
  }, []);

  const handleClearDebt = (debtId: string, amountOwed: number) => {
    const amountPaid = prompt(`Customer owes UGX ${amountOwed.toLocaleString()}. How much are they paying right now?`, amountOwed.toString());
    if (amountPaid === null) return;
    const paidNum = Number(amountPaid);
    if (isNaN(paidNum) || paidNum <= 0) return alert("Invalid amount");

    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
    const updatedDebtors = savedDebtors.map((d: any) => {
      if (d.id === debtId) return { ...d, amountOwed: d.amountOwed - paidNum };
      return d;
    });

    localStorage.setItem("smartsale_debtors", JSON.stringify(updatedDebtors));
    setDebtors(updatedDebtors.filter((d: any) => d.amountOwed > 0));
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Analytics", "Okwefumiiriza")}</h1>
      </header>

      <div className="bg-white px-2 flex justify-between border-b border-gray-200 sticky top-0 z-10">
        {(["sales", "debtors", "creditors", "summary"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-2 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-colors ${
              activeTab === tab ? "border-[#FF9800] text-[#FF9800]" : "border-transparent text-gray-400"
            }`}
          >
            {t(tab, tab === "sales" ? "Okutunda" : tab === "debtors" ? "Babanja" : tab === "creditors" ? "Abakuguzi" : "Omwezi")}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* 1. SALES HISTORY (Grouped by Day) */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            {Object.entries(groupedSales).map(([dayString, data]: any) => (
              <div key={dayString} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-xs uppercase">{dayString}</span>
                </div>
                
                <div className="grid grid-cols-4 p-2 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-50">
                  <div className="col-span-2">Item</div>
                  <div className="text-center">Qty</div>
                  <div className="text-right">Amount</div>
                </div>
                
                {data.items.map((sale: any) => (
                  <div key={sale.id} className="grid grid-cols-4 p-3 border-b border-gray-50 text-sm items-center">
                    <div className="col-span-2">
                      <p className="font-bold text-gray-800 leading-tight">{sale.itemName}</p>
                      <p className="text-[9px] text-gray-500">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                    <div className="text-center font-bold">{sale.quantity}</div>
                    <div className={`text-right font-bold ${sale.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                      {sale.total.toLocaleString()}
                    </div>
                  </div>
                ))}

                {/* DAY TOTALS */}
                <div className="bg-orange-50 p-3 flex justify-between items-center text-xs font-bold text-[#FF9800]">
                  <span>TOTAL: UGX {data.daySales.toLocaleString()}</span>
                  <span>PROFIT: UGX {data.dayProfit.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {Object.keys(groupedSales).length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No sales yet.</p>}
          </div>
        )}

        {/* 2. DEBTORS */}
        {activeTab === "debtors" && (
          <div className="space-y-3">
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center">
              <p className="text-xs font-bold text-red-800">Total Active Debtors</p>
              <p className="text-lg font-extrabold text-red-600">{debtors.length}</p>
            </div>
            
            {debtors.map((debt) => (
              <div key={debt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{debt.clientName}</p>
                  <p className="text-[10px] text-gray-500">{new Date(debt.date).toLocaleDateString()}</p>
                  <p className="text-sm font-extrabold text-red-500 mt-1">UGX {debt.amountOwed.toLocaleString()}</p>
                </div>
                <button onClick={() => handleClearDebt(debt.id, debt.amountOwed)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95">
                  Clear
                </button>
              </div>
            ))}
            {debtors.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No active debts. Great job!</p>}
          </div>
        )}

        {/* 3. CREDITORS */}
        {activeTab === "creditors" && (
          <div className="space-y-3">
             <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex justify-between items-center">
              <p className="text-xs font-bold text-orange-800">Total Active Creditors</p>
              <p className="text-lg font-extrabold text-orange-600">{creditors.length}</p>
            </div>
            {creditors.map((creditor) => (
              <div key={creditor.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{creditor.supplierName}</p>
                  <p className="text-[10px] text-gray-500">{new Date(creditor.date).toLocaleDateString()}</p>
                  <p className="text-sm font-extrabold text-orange-500 mt-1">UGX {creditor.amountOwed.toLocaleString()}</p>
                </div>
              </div>
            ))}
            {creditors.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No suppliers to pay.</p>}
          </div>
        )}

        {/* 4. MONTHLY SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Sales (This Month)</p>
              <p className="text-2xl font-extrabold text-gray-800 mt-1">UGX {summary.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Profit (This Month)</p>
              <p className="text-2xl font-extrabold text-[#0055FF] mt-1">UGX {summary.totalProfit.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Unpaid Debts (Owed to you)</p>
              <p className="text-2xl font-extrabold text-red-500 mt-1">UGX {summary.totalDebts.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Creditors (You owe)</p>
              <p className="text-2xl font-extrabold text-orange-500 mt-1">UGX {summary.totalCreditors.toLocaleString()}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
        }
