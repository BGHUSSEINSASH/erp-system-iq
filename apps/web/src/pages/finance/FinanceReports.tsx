import { useEffect, useState } from "react";
import { get } from "../../api";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportUtils";

interface AccountSummary { type: string; count: number; total: number }
interface PayRecSummary { status: string; count: number; total: number }
interface CostSummary { category: string; total: number }
interface Fund { id: string; name: string; type: string; currency: string; balance: number; lastUpdated: string }
interface JournalInfo { id: string; date: string; description: string; debit: number; credit: number; accountName: string; status: string }
interface AccountDetail { id: string; code: string; name: string; type: string; balance: number }
interface PayableDetail { id: string; vendorName: string; invoiceNo: string; amount: number; dueDate: string; status: string; description: string }
interface ReceivableDetail { id: string; customerName: string; invoiceNo: string; amount: number; dueDate: string; status: string; description: string }
interface CostDetail { id: string; category: string; description: string; amount: number; date: string; department: string; status: string }
interface BudgetDetail { id: string; department: string; category: string; allocated: number; spent: number; remaining: number; year: string; status: string }
interface InventoryDetail { id: string; name: string; sku: string; warehouse: string; quantity: number; unitCost: number; totalValue: number; status: string }
interface InvoiceDetail { id: string; invoiceNo: string; customerName: string; date: string; dueDate: string; total: number; status: string }

interface FinanceData {
  accounts: AccountSummary[];
  payables: PayRecSummary[];
  receivables: PayRecSummary[];
  costs: CostSummary[];
  funds: Fund[];
  journalEntries: JournalInfo[];
  totals: { assets: number; liabilities: number; equity: number; revenue: number; expenses: number };
  accountsList: AccountDetail[];
  payablesList: PayableDetail[];
  receivablesList: ReceivableDetail[];
  costsList: CostDetail[];
  budgetsList: BudgetDetail[];
  inventoryList: InventoryDetail[];
  invoicesList: InvoiceDetail[];
}

const tabsList = [
  { id: "overview", label: "نظرة عامة / Overview" },
  { id: "accounts", label: "الحسابات / Accounts" },
  { id: "payables", label: "الذمم الدائنة / Payables" },
  { id: "receivables", label: "الذمم المدينة / Receivables" },
  { id: "journal", label: "القيود / Journal" },
  { id: "costs", label: "التكاليف / Costs" },
  { id: "budgets", label: "الميزانيات / Budgets" },
  { id: "inventory", label: "المخزون / Inventory" },
  { id: "invoices", label: "الفواتير / Invoices" },
];

function fmt(n: number) { return n.toLocaleString("en-US") + " د.ع"; }

function getBadge(status: string) {
  if (["paid", "collected", "active", "received", "approved", "posted", "in-stock"].includes(status)) return "badge badge-approved";
  if (["overdue", "rejected", "out-of-stock", "overbudget"].includes(status)) return "badge badge-rejected";
  return "badge badge-pending";
}

export default function FinanceReports() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2027-01-01");

  useEffect(() => {
    setLoading(true);
    get<FinanceData>("/reports/finance?from=" + dateFrom + "&to=" + dateTo)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dateFrom, dateTo]);

  if (loading) return <div className="page"><div className="loading">جاري التحميل...</div></div>;
  if (!data) return <div className="page"><p>فشل تحميل البيانات</p></div>;

  const t = data.totals;
  const maxCost = Math.max(...data.costs.map((c) => c.total), 1);

  const getExportData = () => {
    switch (activeTab) {
      case "accounts": return { data: data.accountsList, name: "Finance_Accounts" };
      case "payables": return { data: data.payablesList, name: "Finance_Payables" };
      case "receivables": return { data: data.receivablesList, name: "Finance_Receivables" };
      case "journal": return { data: data.journalEntries, name: "Finance_Journal" };
      case "costs": return { data: data.costsList, name: "Finance_Costs" };
      case "budgets": return { data: data.budgetsList, name: "Finance_Budgets" };
      case "inventory": return { data: data.inventoryList, name: "Finance_Inventory" };
      case "invoices": return { data: data.invoicesList, name: "Finance_Invoices" };
      default: return { data: data.accountsList, name: "Finance_Report" };
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📊 التقارير المالية / Finance Reports</h2>
        <div className="export-btns">
          <button className="btn btn-secondary" onClick={() => exportToPDF("التقارير المالية")}>PDF</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToExcel(e.data as any[], e.name); }}>Excel</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToCSV(e.data as any[], e.name); }}>CSV</button>
        </div>
      </div>

      <div className="chart-card" style={{ padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>فترة التقرير / Report Period:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>من / From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>إلى / To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
      </div>

      <div className="report-tabs" style={{ flexWrap: "wrap" }}>
        {tabsList.map((tb) => (
          <button key={tb.id} className={"report-tab " + (activeTab === tb.id ? "active" : "")} onClick={() => setActiveTab(tb.id)}>{tb.label}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">{fmt(t.assets)}</div><div className="stat-label">الأصول / Assets</div></div>
            <div className="stat-card"><div className="stat-icon">📉</div><div className="stat-value">{fmt(t.liabilities)}</div><div className="stat-label">الالتزامات / Liabilities</div></div>
            <div className="stat-card"><div className="stat-icon">🏦</div><div className="stat-value">{fmt(t.equity)}</div><div className="stat-label">حقوق الملكية / Equity</div></div>
            <div className="stat-card"><div className="stat-icon">📈</div><div className="stat-value">{fmt(t.revenue)}</div><div className="stat-label">الإيرادات / Revenue</div></div>
            <div className="stat-card"><div className="stat-icon">💸</div><div className="stat-value">{fmt(t.expenses)}</div><div className="stat-label">المصروفات / Expenses</div></div>
            <div className="stat-card"><div className="stat-icon">📊</div><div className="stat-value">{fmt(t.revenue - t.expenses)}</div><div className="stat-label">صافي الربح / Net Profit</div></div>
          </div>
          <div className="dashboard-charts">
            <div className="chart-card">
              <h3>الصناديق / Funds</h3>
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>الصندوق / Fund</th><th>النوع / Type</th><th>العملة / Currency</th><th>الرصيد / Balance</th><th>آخر تحديث / Updated</th></tr></thead>
                <tbody>{data.funds.map(f => (
                  <tr key={f.id}><td>{f.name}</td><td>{f.type}</td><td>{f.currency}</td><td style={{fontWeight:600}}>{f.balance.toLocaleString()}</td><td>{f.lastUpdated}</td></tr>
                ))}</tbody>
              </table></div>
            </div>
            <div className="chart-card">
              <h3>التكاليف حسب الفئة / Costs by Category</h3>
              <div className="hbar-chart">{data.costs.map(c => (
                <div key={c.category} className="hbar-row">
                  <span className="hbar-name">{c.category}</span>
                  <div className="hbar-track"><div className="hbar-fill" style={{width:(c.total/maxCost)*100+"%"}} /></div>
                  <span className="hbar-val">{fmt(c.total)}</span>
                </div>
              ))}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع الحسابات / All Accounts ({data.accountsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الكود / Code</th><th>الاسم / Name</th><th>النوع / Type</th><th>الرصيد / Balance</th></tr></thead>
              <tbody>{data.accountsList.map((a, i) => (
                <tr key={a.id}><td>{i+1}</td><td>{a.code}</td><td>{a.name}</td><td>{a.type}</td><td style={{fontWeight:600}}>{fmt(a.balance)}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "payables" && (
        <div className="report-section animate-in">
          <div className="stats-grid">{data.payables.map(p => (
            <div key={p.status} className="stat-card"><div className="stat-icon"><span className={getBadge(p.status)}>{p.status}</span></div><div><div className="stat-value">{fmt(p.total)}</div><div className="stat-label">{p.count} ذمة</div></div></div>
          ))}</div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>جميع الذمم الدائنة / All Payables ({data.payablesList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>المورد / Vendor</th><th>رقم الفاتورة / Invoice</th><th>المبلغ / Amount</th><th>تاريخ الاستحقاق / Due</th><th>الوصف / Desc</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.payablesList.map((p, i) => (
                <tr key={p.id}><td>{i+1}</td><td>{p.vendorName}</td><td>{p.invoiceNo}</td><td>{fmt(p.amount)}</td><td>{p.dueDate}</td><td>{p.description}</td><td><span className={getBadge(p.status)}>{p.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "receivables" && (
        <div className="report-section animate-in">
          <div className="stats-grid">{data.receivables.map(r => (
            <div key={r.status} className="stat-card"><div className="stat-icon"><span className={getBadge(r.status)}>{r.status}</span></div><div><div className="stat-value">{fmt(r.total)}</div><div className="stat-label">{r.count} ذمة</div></div></div>
          ))}</div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>جميع الذمم المدينة / All Receivables ({data.receivablesList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>العميل / Customer</th><th>رقم الفاتورة / Invoice</th><th>المبلغ / Amount</th><th>تاريخ الاستحقاق / Due</th><th>الوصف / Desc</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.receivablesList.map((r, i) => (
                <tr key={r.id}><td>{i+1}</td><td>{r.customerName}</td><td>{r.invoiceNo}</td><td>{fmt(r.amount)}</td><td>{r.dueDate}</td><td>{r.description}</td><td><span className={getBadge(r.status)}>{r.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "journal" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع القيود المحاسبية / All Journal Entries ({data.journalEntries.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>التاريخ / Date</th><th>الوصف / Description</th><th>الحساب / Account</th><th>مدين / Debit</th><th>دائن / Credit</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.journalEntries.map((j, i) => (
                <tr key={j.id}><td>{i+1}</td><td>{j.date}</td><td>{j.description}</td><td>{j.accountName}</td><td>{j.debit > 0 ? fmt(j.debit) : "—"}</td><td>{j.credit > 0 ? fmt(j.credit) : "—"}</td><td><span className={getBadge(j.status)}>{j.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "costs" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع سجلات التكاليف / All Cost Records ({data.costsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الفئة / Category</th><th>الوصف / Description</th><th>المبلغ / Amount</th><th>التاريخ / Date</th><th>القسم / Dept</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.costsList.map((c, i) => (
                <tr key={c.id}><td>{i+1}</td><td>{c.category}</td><td>{c.description}</td><td>{fmt(c.amount)}</td><td>{c.date}</td><td>{c.department}</td><td><span className={getBadge(c.status)}>{c.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "budgets" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع الميزانيات / All Budgets ({data.budgetsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>القسم / Dept</th><th>الفئة / Category</th><th>المخصص / Allocated</th><th>المصروف / Spent</th><th>المتبقي / Remaining</th><th>السنة / Year</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.budgetsList.map((b, i) => (
                <tr key={b.id}><td>{i+1}</td><td>{b.department}</td><td>{b.category}</td><td>{fmt(b.allocated)}</td><td>{fmt(b.spent)}</td><td style={{fontWeight:600, color: b.remaining < 1000000 ? "#ef4444" : "#10b981"}}>{fmt(b.remaining)}</td><td>{b.year}</td><td><span className={getBadge(b.status)}>{b.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "inventory" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع اصناف المخزون / All Inventory Items ({data.inventoryList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الاسم / Name</th><th>الرمز / SKU</th><th>المستودع / Warehouse</th><th>الكمية / Qty</th><th>سعر الوحدة / Unit Cost</th><th>اجمالي القيمة / Total</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.inventoryList.map((item, i) => (
                <tr key={item.id}><td>{i+1}</td><td>{item.name}</td><td>{item.sku}</td><td>{item.warehouse}</td><td>{item.quantity}</td><td>{fmt(item.unitCost)}</td><td style={{fontWeight:600}}>{fmt(item.totalValue)}</td><td><span className={getBadge(item.status)}>{item.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "invoices" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع الفواتير / All Invoices ({data.invoicesList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>رقم الفاتورة / No.</th><th>العميل / Customer</th><th>التاريخ / Date</th><th>تاريخ الاستحقاق / Due</th><th>المبلغ / Total</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.invoicesList.map((inv, i) => (
                <tr key={inv.id}><td>{i+1}</td><td>{inv.invoiceNo}</td><td>{inv.customerName}</td><td>{inv.date}</td><td>{inv.dueDate}</td><td style={{fontWeight:600}}>{fmt(inv.total)}</td><td><span className={getBadge(inv.status)}>{inv.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}
