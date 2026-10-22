import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";

export default function Analytics({ navigate, businessInfo, language }: any) {
  const [activeTab, setActiveTab] = useState<"sales" | "expenses" | "debtors" | "creditors" | "summary">("sales");
  const [groupedSales, setGroupedSales] = useState<Record<string, any>>({});
  const [expenses, setExpenses] = useState<any[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);
  const [creditors, setCreditors] = useState<any[]>([]);
  
  const [summary, setSummary] = useState({ 
    totalSales: 0, totalProfit: 0, totalDebts: 0, totalCreditors: 0, 
    totalFunds: 0, totalExpenses: 0, cashAtHand: 0, yesterdayCash: 0
  });

  const t = (en: string, run: string) => (language === "run" ? run : en);

  useEffect(() => {
    const savedSales = JSON.parse(localStorage.getItem("smartsale_sales") || "[]").reverse();
    const allExpenses = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]").reverse();
    const allFunds = JSON.parse(localStorage.getItem("smartsale_funds") || "[]");
    
    // Group Sales by Day & Calculate Daily Cash at Hand
    const grouped: Record<string, any> = {};
    const uniqueDates = new Set<string>();

    savedSales.forEach((sale: any) => {
      const d = new Date(sale.date);
      uniqueDates.add(d.toDateString());
    });
    allExpenses.forEach((e: any) => uniqueDates.add(new Date(e.date).toDateString()));
    allFunds.forEach((f: any) => uniqueDates.add(new Date(f.date).toDateString()));

    Array.from(uniqueDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).forEach(dateStr => {
      const dayString = new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      
      const daySalesItems = savedSales.filter((s: any) => new Date(s.date).toDateString() === dateStr);
      const dayExpenses = allExpenses.filter((e: any) => new Date(e.date).toDateString() === dateStr).reduce((sum, e) => sum + Number(e.amount), 0);
      const dayFunds = allFunds.filter((f: any) => new Date(f.date).toDateString() === dateStr).reduce((sum, f) => sum + Number(f.amount), 0);

      let totalDaySales = 0;
      let totalDayProfit = 0;
      let totalDayCashSales = 0;
      let totalDayDebts = 0;

      daySalesItems.forEach((s: any) => {
        totalDaySales += Number(s.total) || 0;
        if (s.isPaid) totalDayCashSales += Number(s.total) || 0;
        else totalDayDebts += Number(s.total) || 0;
        
        const profit = ((Number(s.sellingPrice) || 0) - (Number(s.buyingPrice) || 0)) * (Number(s.quantity) || 0);
        totalDayProfit += profit;
      });

      // Get Yesterday's Cash
      const prevDate = new Date(dateStr);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevCash = Number(localStorage.getItem(`smartsale_cash_${prevDate.toDateString()}`) || 0);

      const cashAtHand = prevCash + totalDayCashSales + dayFunds - dayExpenses;
      localStorage.setItem(`smartsale_cash_${dateStr}`, cashAtHand.toString());

      grouped[dayString] = { 
        dateStr, items: daySalesItems, totalDaySales, totalDayProfit, totalDayDebts, 
        dayFunds, dayExpenses, prevCash, cashAtHand 
      };
    });

    setGroupedSales(grouped);
    setExpenses(allExpenses);

    const savedDebtors = JSON.parse(localStorage.getItem("smartsale_debtors") || "[]").filter((d: any) => Number(d.amountOwed) > 0);
    setDebtors(savedDebtors);
    const savedCreditors = JSON.parse(localStorage.getItem("smartsale_creditors") || "[]").filter((c: any) => Number(c.amountOwed) > 0);
    setCreditors(savedCreditors);

    // Monthly Summary Math
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toDateString();
    
    let mSales = 0, mProfit = 0, mDebts = 0, mCreditors = 0, mFunds = 0, mExpenses = 0;

    savedSales.forEach((s: any) => {
      const d = new Date(s.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        mSales += Number(s.total) || 0;
        mProfit += ((Number(s.sellingPrice) || 0) - (Number(s.buyingPrice) || 0)) * (Number(s.quantity) || 0);
        if (!s.isPaid) mDebts += Number(s.total) || 0;
      }
    });

    allExpenses.forEach((e: any) => {
      const d = new Date(e.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) mExpenses += Number(e.amount) || 0;
    });

    allFunds.forEach((f: any) => {
      const d = new Date(f.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) mFunds += Number(f.amount) || 0;
    });

    const currentCashAtHand = grouped[new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })]?.cashAtHand || 0;

    setSummary({ 
      totalSales: mSales, totalProfit: mProfit, totalDebts: mDebts, totalCreditors: mCreditors, 
      totalFunds: mFunds, totalExpenses: mExpenses, cashAtHand: currentCashAtHand, yesterdayCash: 0
    });
  }, []);

  const handleDeleteExpense = (id: string) => {
    if (!window.confirm("Delete this expense?")) return;
    const updated = expenses.filter(e => e.id !== id);
    localStorage.setItem("smartsale_expenses", JSON.stringify(updated));
    setExpenses(updated);
    window.location.reload();
  };

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

    // Log as expense (cash removed)
    const expensesList = JSON.parse(localStorage.getItem("smartsale_expenses") || "[]");
    expensesList.push({ id: Date.now().toString(), date: new Date().toISOString(), amount: paidNum, reason: "Supplier Payment" });
    localStorage.setItem("smartsale_expenses", JSON.stringify(expensesList));
    
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
        {(["sales", "expenses", "debtors", "creditors", "summary"] as const).map((tab) => (
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
        
        {/* 1. SALES (Day-by-Day Ledger) */}
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

                {/* DAY LEDGER BREAKDOWN */}
                <div className="bg-orange-50 p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold text-[#FF9800]">
                    <span>TOTAL SALES</span>
                    <span>UGX {data.totalDaySales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#0055FF]">
                    <span>PROFIT</span>
                    <span>UGX {data.totalDayProfit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 mt-2">
                    <span>Money from yesterday</span>
                    <span>+ UGX {data.prevCash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Funds added</span>
                    <span>+ UGX {data.dayFunds.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Expenses</span>
                    <span>- UGX {data.dayExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Debts created</span>
                    <span>- UGX {data.totalDayDebts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white font-extrabold text-sm pt-2 mt-1 border-t border-orange-200 bg-[#0055FF] -mx-3 px-3 pb-1 rounded-b-xl">
                    <span>CASH AT HAND</span>
                    <span>UGX {data.cashAtHand.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            {Object.keys(groupedSales).length === 0 && <p className="text-center text-gray-400 py-6 text-sm">No sales yet.</p>}
          </div>
        )}

        {/* 2. EXPENSES */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            <div className="bg-red-50 p-3 rounded-xl border border-red-100 flex justify-between items-center">
              <p className="text-xs font-bold text-red-800">Total Expenses (Month)</p>
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

        {/* 3. DEBTORS */}
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

        {/* 4. CREDITORS */}
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

        {/* 5. SUMMARY (Monthly) */}
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
              <p className="text-xs font-bold text-gray-500 uppercase">Total Funds Added</p>
              <p className="text-2xl font-extrabold text-green-600 mt-1">UGX {summary.totalFunds.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Expenses</p>
              <p className="text-2xl font-extrabold text-red-500 mt-1">UGX {summary.totalExpenses.toLocaleString()}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase">Total Unpaid Debts</p>
              <p className="text-2xl font-extrabold text-orange-500 mt-1">UGX {summary.totalDebts.toLocaleString()}</p>
            </div>
            <div className="bg-[#0055FF] p-4 rounded-xl shadow-lg text-white">
              <p className="text-xs font-bold uppercase opacity-80">Cash at Hand (Today)</p>
              <p className="text-2xl font-extrabold mt-1">UGX {summary.cashAtHand.toLocaleString()}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
                                }
