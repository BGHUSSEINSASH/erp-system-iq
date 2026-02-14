import { useEffect, useState } from "react";
import { get } from "../api";
import { useAuth } from "../context/AuthContext";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AnalyticsDashboard() {
  const auth = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(function () {
    get("/analytics").then(function (r) { setData(r); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="page-loading"><div className="spinner"></div><p>جاري تحميل التحليلات...</p></div>;

  var COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📊 لوحة التحليلات / Analytics Dashboard</h2>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="kpi-card kpi-revenue">
          <div className="kpi-icon">💰</div>
          <div className="kpi-info"><span className="kpi-label">إجمالي الإيرادات / Revenue</span><span className="kpi-value">{(data.kpis.totalRevenue || 0).toLocaleString()} د.ع</span></div>
        </div>
        <div className="kpi-card kpi-expenses">
          <div className="kpi-icon">📉</div>
          <div className="kpi-info"><span className="kpi-label">المصروفات / Expenses</span><span className="kpi-value">{(data.kpis.totalExpenses || 0).toLocaleString()} د.ع</span></div>
        </div>
        <div className="kpi-card kpi-profit">
          <div className="kpi-icon">📈</div>
          <div className="kpi-info"><span className="kpi-label">صافي الربح / Net Profit</span><span className="kpi-value">{(data.kpis.netProfit || 0).toLocaleString()} د.ع</span></div>
        </div>
        <div className="kpi-card kpi-employees">
          <div className="kpi-icon">👥</div>
          <div className="kpi-info"><span className="kpi-label">الموظفين / Employees</span><span className="kpi-value">{data.kpis.employeeCount}</span></div>
        </div>
        <div className="kpi-card kpi-invoices-count">
          <div className="kpi-icon">🧾</div>
          <div className="kpi-info"><span className="kpi-label">الفواتير / Invoices</span><span className="kpi-value">{data.kpis.invoiceCount}</span></div>
        </div>
        <div className="kpi-card kpi-fund">
          <div className="kpi-icon">🏦</div>
          <div className="kpi-info"><span className="kpi-label">رصيد الصناديق / Funds</span><span className="kpi-value">{(data.kpis.fundBalance || 0).toLocaleString()} د.ع</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        {[
          { key: "revenue", label: "الإيرادات والمصروفات" },
          { key: "departments", label: "الأقسام" },
          { key: "cashflow", label: "التدفق النقدي" },
          { key: "growth", label: "النمو" },
        ].map(function (tab) {
          return <button key={tab.key} className={"tab-btn" + (activeTab === tab.key ? " active" : "")} onClick={function () { setActiveTab(tab.key); }}>{tab.label}</button>;
        })}
      </div>

      <div className="analytics-charts">
        {activeTab === "revenue" && (
          <div className="chart-grid-2">
            <div className="chart-card">
              <h3>الإيرادات والمصروفات الشهرية / Monthly Revenue & Expenses</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="var(--text-color)" fontSize={12} />
                  <YAxis stroke="var(--text-color)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>صافي الربح / Net Profit Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="var(--text-color)" fontSize={12} />
                  <YAxis stroke="var(--text-color)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Area type="monotone" dataKey="profit" name="الربح" stroke="#10b981" fill="rgba(16,185,129,0.3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="chart-grid-2">
            <div className="chart-card">
              <h3>مصروفات الأقسام / Department Expenses</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={data.deptExpenses} cx="50%" cy="50%" outerRadius={120} dataKey="value" nameKey="name" label={function (entry: any) { return entry.name.split("/")[0].trim(); }}>
                    {data.deptExpenses.map(function (entry: any, index: number) {
                      return <Cell key={"cell-" + index} fill={entry.color || COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>حالة الفواتير / Invoice Status</h3>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie data={[{ name: "مدفوعة", value: data.invoiceStats.paid, color: "#10b981" }, { name: "غير مدفوعة", value: data.invoiceStats.unpaid, color: "#f59e0b" }, { name: "متأخرة", value: data.invoiceStats.overdue, color: "#ef4444" }]} cx="50%" cy="50%" outerRadius={120} dataKey="value" nameKey="name" label>
                    <Cell fill="#10b981" /><Cell fill="#f59e0b" /><Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "cashflow" && (
          <div className="chart-card" style={{ maxWidth: "100%" }}>
            <h3>التدفق النقدي الأسبوعي / Weekly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data.cashFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="week" stroke="var(--text-color)" fontSize={12} />
                <YAxis stroke="var(--text-color)" fontSize={12} />
                <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                <Legend />
                <Line type="monotone" dataKey="inflow" name="التدفق الداخل" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="outflow" name="التدفق الخارج" stroke="#ef4444" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "growth" && (
          <div className="chart-grid-2">
            <div className="chart-card">
              <h3>نمو الموظفين / Employee Growth</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={data.empGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="quarter" stroke="var(--text-color)" fontSize={12} />
                  <YAxis stroke="var(--text-color)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Area type="monotone" dataKey="count" name="عدد الموظفين" stroke="#8b5cf6" fill="rgba(139,92,246,0.3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-card">
              <h3>المقارنة السنوية / Yearly Comparison</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.yearlyComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="year" stroke="var(--text-color)" fontSize={12} />
                  <YAxis stroke="var(--text-color)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgba(30,30,60,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Legend />
                  <Bar dataKey="revenue" name="الإيرادات" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="المصروفات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="الربح" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
