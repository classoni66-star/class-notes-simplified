import { useState, useEffect } from "react";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";

export default function Analytics({ navigate, businessInfo, language }: any) {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses" | "debtors" | "creditors" | "summary">("summary");
  const [groupedSales, setGroupedSales] = useState<Record<string, any>>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [creditors, setCreditors] = useState<any[]>([]);
  const [summary, setSummary] = useState({ 
    totalSales: 0, totalCashSales: 0, totalProfit: 0, totalDebts: 0, totalCreditors: 0, totalFunds: 0, totalExpenses: 0, cashAtHand: 0, yesterdayCash: 0
  });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]").reverse();
    const allExpenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]").reverse();
    const allFunds = JSON.parse(localStorage.getItem("smartsale_funds") || "[]");
    
    // Group Sales by Day
    const grouped: Record<string, { items: any[], daySales: number, dayProfit: number }> = {};
    savedSales.forEach((sale: any) => {
      const dateObj = new Date(sale.date);
      const dayString = dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      if (!grouped[dayString]) grouped[dayString] = { items: [], daySales: 0, dayProfit: 0 };
      grouped[dayString].items.push(sale);
      grouped[dayString].daySales += Number(sale.total) || 0;
      const profit = ((Number(sale.sellingPrice) || 0) - (Number(sale.buyingPrice) || 0)) * (Number(sale.quantity) || 0);
      grouped[dayString].dayProfit += profit;
    });
    setGroupedSales(grouped);
    setExpenses(allExpenses);

    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]").filter((d: any) => Number(d.amountOwed) > 0);
    setDebtors(savedDebtors);
    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]").filter((c: any) => Number(c.amountOwed) > 0);
    setCreditors(savedCreditors);

    // Calculate Monthly Summary
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toDateString();
    
    let mSales = 0, mCashSales = 0, mProfit = 0, mDebts = 0, mCreditors = 0, mFunds = 0, mExpenses = 0;

    // Today's Math (for cash at hand)
    let tCashSales = 0;
    let tFunds = 0;
    let tExpenses = 0;
    
    savedSales.forEach((s: any) => {
      const d = new Date(s.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        mSales += Number(s.total) || 0;
        mProfit += ((Number(s.sellingPrice) || 0) - (Number(s.buyingPrice) || 0)) * (Number(s.quantity) || 0);
        if (!s.isPaid) mDebts += Number(s.total) || 0;
        else mCashSales += Number(s.total) || 0;
      }
      if (d.toDateString() === todayStr && s.isPaid) tCashSales += Number(s.total) || 0;
    });

    allExpenses.forEach((e: any) => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) mExpenses += Number(e.amount) || 0;
      if (d.toDateString() === todayStr) tExpenses += Number(e.amount) || 0;
    });

    allFunds.forEach((f: any) => {
      const d = new Date(f.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) mFunds += Number(f.amount) || 0;
      if (d.toDateString() === todayStr) tFunds += Number(f.amount) || 0;
    });

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yCash = Number(localStorage.getItem(`smartsale_cash_${yesterday.toDateString()}`) || 0);

    const cashAtHand = yCash + tCashSales + tFunds - tExpenses;

    setSummary({ 
      totalSales: mSales, totalCashSales: mCashSales, totalProfit: mProfit, totalDebts: mDebts, 
      totalCreditors: mCreditors, totalFunds: mFunds, totalExpenses: mExpenses, cashAtHand: cashAtHand, yesterdayCash: yCash
    });
  }, []);

  const handleDeleteExpense = (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    const updated = expenses.filter(e => e.id !== id);
    localStorage.setItem("smartsale_expenses", JSON.stringify(updated));
    setExpenses(updated);
  };

  const handleClearDebt = (debtId: string, amountOwed: number) => {
    const amountPaid = prompt(`Customer owes UGX ${amountOwed.toLocaleString()}. How much are they paying right now?`, amountOwed.toString());
    if (amountPaid === null) return;
    const paidNum = Number(amountPaid);
    if (isNaN(paidNum) || paidNum <= 0) return alert("Invalid amount");

    // Add to cash sales
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]");
    // Note: To accurately reflect cash, we'd log a recovery. For now, just update debt.
    
    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]");
    const updatedDebtors = savedDebtors.map((d: any) => {
      if (d.id === debtId) return { ...d, amountOwed: d.amountOwed - paidNum };
      return d;
    });
    localStorage.setItem("smartsale_debtors", JSON.stringify(updatedDebtors));
    setDebtors(updatedDebtors.filter((d: any) => d.amountOwed > 0));
    
    // Log as fund (cash injected)
    const funds = JSON.parse(localStorage.getItem("smartsale_funds") || "[]");
    funds.push({ id: Date.now().toString(), date: new Date().toISOString(), amount: paidNum, reason: "Debt Recovery" });
    localStorage.setItem("smartsale_funds", JSON.stringify(funds));
    
    window.location.reload(); 
  };

  const handleClearCreditor = (creditorId: string, amountOwed: number) => {
    const amountPaid = prompt(`You owe supplier UGX ${amountOwed.toLocaleString()}. How much are you paying them now?`, amountOwed.toString());
    if (amountPaid === null) return;
    const paidNum = Number(amountPaid);
    if (isNaN(paidNum) || paidNum <= 0) return alert("Invalid amount");

    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]");
    const updatedCreditors = savedCreditors.map((c: any) => {
      if (c.id === creditorId) return { ...c, amountOwed: c.amountOwed - paidNum };
      return c;
    });
    localStorage.setItem("smartsale_creditors", JSON.stringify(updatedCreditors));
    setCreditors(updatedCreditors.filter((c: any) => c.amountOwed > 0));

    // Log as expense (cash removed)
    const expenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]");
    expenses.push({ id: Date.now().toString(), date: new Date().toISOString(), amount: paidNum, reason: "Supplier Payment" });
    localStorage.setItem("smartsale_expenses", JSON.stringify(expenses));
    
    window.location.reload();
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6] overflow-hidden">
      <header className="bg-white px-4 py-3 flex items-center gap-3 shadow-sm z-10">
        <button onClick={() => navigate("home")} className="text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-extrabold text-gray-800">{t("Analytics", "Okwefumiiriza")}</h1>
      </header>

      <div className="bg-white px-2 flex justify-between border-b border-gray-200 sticky top-0 z-10 overflow-x-auto hide-scrollbar">
        {(["summary", "sales", "expenses", "debtors", "creditors"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 px-3 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab ? "border-[#FF9800] text-[#FF9800]" : "border-transparent text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        
        {/* 1. SUMMARY (CASH AT HAND MATH) */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Cash at Hand (Today)</p>
              <p className="text-2xl font-extrabold text-[#0055FF] mt-1">UGX {summary.cashAtHand.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Money from Yesterday</span>
                <span className="font-bold text-gray-800">UGX {summary.yesterdayCash.toLocaleString()}</span>
              </div>
              <div className="p-3 border-b border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Cash Sales Today</span>
                <span className="font-bold text-green-600">+ UGX {summary.totalCashSales.toLocaleString()}</span>
              </div>
              <div className="p-3 border-b border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Funds Added Today</span>
                <span className="font-bold text-green-600">+ UGX {summary.totalFunds.toLocaleString()}</span>
              </div>
              <div className="p-3 border-b border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Expenses Today</span>
                <span className="font-bold text-red-500">- UGX {summary.totalExpenses.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between text-sm bg-gray-50">
                <span className="text-gray-800 font-bold">Total Unpaid Debts</span>
                <span className="font-bold text-orange-500">UGX {summary.totalDebts.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* 2. SALES */}
        {activeTab === "sales" && (
          <div className="space-y-4">
            {Object.entries(groupedSales).map(([dayString, data]: any) => (
              <div key={dayString} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-bold text-gray-700 text-xs uppercase">{dayString}</span>
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
                <div className="bg-orange-50 p-3 flex justify-between items-center text-xs font-bold text-[#FF9800]">
                  <span>TOTAL: UGX {data.daySales.toLocaleString()}</span>
                  <span>PROFIT: UGX {data.dayProfit.toLocaleString()}</span>
                </div>
              </div>
            ))}
            {Object.keys(groupedSales).length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No sales yet.</p>}
          </div>
        )}

        {/* 3. EXPENSES */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center">
              <p className="text-xs font-bold text-red-800">Total Expenses</p>
              <p className="text-lg font-extrabold text-red-600">UGX {summary.totalExpenses.toLocaleString()}</p>
            </div>
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">{expense.reason}</p>
                  <p className="text-[10px] text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                  <p className="text-sm font-extrabold text-red-500 mt-1">UGX {expense.amount.toLocaleString()}</p>
                </div>
                <button onClick={() => handleDeleteExpense(expense.id)} className="bg-red-50 text-red-500 p-2 rounded-lg active:scale-95">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No expenses recorded.</p>}
          </div>
        )}

        {/* 4. DEBTORS */}
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
                  Receive
                </button>
              </div>
            ))}
            {debtors.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No active debts. Great job!</p>}
          </div>
        )}

        {/* 5. CREDITORS */}
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
                <button onClick={() => handleClearCreditor(creditor.id, creditor.amountOwed)} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95">
                  Pay
                </button>
              </div>
            ))}
            {creditors.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No suppliers to pay.</p>}
          </div>
        )}

      </div>
    </div>
  );
                                   }
