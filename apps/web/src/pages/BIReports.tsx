import { useEffect, useState } from "react";
import { get } from "../api";
import { useI18n } from "../i18n";

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function BIReports() {
  const { t } = useI18n();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("revenue");

  useEffect(() => { get<any>("/ceo-dashboard").then(setData); }, []);

  if (!data) return <div className="page"><div className="loading">{t("loading")}</div></div>;

  const s = data.summary;

  const tabs = [
    { key: "revenue", label: "📈 الإيرادات / Revenue" },
    { key: "hr", label: "👥 الموارد البشرية / HR" },
    { key: "operations", label: "⚙️ العمليات / Operations" },
    { key: "finance", label: "💰 المالية / Finance" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>📊 تقارير BI تفاعلية / Interactive BI Reports</h2>
        <button className="btn btn-primary" onClick={() => window.print()}>📄 تصدير PDF / Export PDF</button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {tabs.map(tab => (
          <button key={tab.key} className={"btn " + (activeTab === tab.key ? "btn-primary" : "btn-secondary")} onClick={() => setActiveTab(tab.key)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === "revenue" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{fmt(s.totalRevenue)} د.ع</div>
              <div style={{ opacity: 0.7 }}>الإيرادات / Revenue</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{fmt(s.totalCosts)} د.ع</div>
              <div style={{ opacity: 0.7 }}>التكاليف / Costs</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{fmt(s.totalRevenue - s.totalCosts)} د.ع</div>
              <div style={{ opacity: 0.7 }}>صافي الربح / Net Profit</div>
            </div>
          </div>

          {/* Revenue Bar Chart */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>اتجاه الإيرادات الشهري / Monthly Revenue Trend</h3>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 250, padding: "0 20px" }}>
              {data.revenueTrend.map((r: any, i: number) => {
                const max = Math.max(...data.revenueTrend.map((x: any) => x.amount));
                return (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ fontSize: 11, marginBottom: 4 }}>{fmt(r.amount)}</div>
                    <div style={{
                      height: `${(r.amount / max) * 200}px`,
                      background: `linear-gradient(180deg, #3b82f6, #6366f1)`,
                      borderRadius: "8px 8px 0 0",
                      minHeight: 20,
                      transition: "height 0.5s ease",
                      boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                    }} />
                    <div style={{ fontSize: 12, marginTop: 6, opacity: 0.7 }}>{r.month}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* HR Tab */}
      {activeTab === "hr" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{s.totalEmployees}</div>
              <div style={{ opacity: 0.7 }}>إجمالي الموظفين / Total Employees</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(234,179,8,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#eab308" }}>{s.pendingLeaves}</div>
              <div style={{ opacity: 0.7 }}>إجازات معلقة / Pending Leaves</div>
            </div>
            <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(168,85,247,0.2)" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#a855f7" }}>{fmt(s.totalPayroll)} د.ع</div>
              <div style={{ opacity: 0.7 }}>إجمالي الرواتب / Total Payroll</div>
            </div>
          </div>

          {/* Department Distribution */}
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>توزيع الموظفين حسب القسم / Employees by Department</h3>
            {data.deptBreakdown.map((d: any, i: number) => {
              const maxEmp = Math.max(...data.deptBreakdown.map((x: any) => x.employees));
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 12 }}>
                  <div style={{ width: 150, fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                  <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
                    <div style={{
                      width: `${(d.employees / maxEmp) * 100}%`, height: "100%",
                      background: `hsl(${i * 40}, 70%, 55%)`, borderRadius: 6,
                      display: "flex", alignItems: "center", paddingInlineStart: 8, fontSize: 12, color: "#fff",
                    }}>
                      {d.employees}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operations Tab */}
      {activeTab === "operations" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>🏗️ المشاريع / Projects</h3>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#3b82f6" }}>{s.activeProjects}</div>
            <div style={{ opacity: 0.7 }}>مشاريع نشطة / Active Projects</div>
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>الميزانية الإجمالية</span><span>{fmt(s.projectBudgetTotal)} د.ع</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>المصروف</span><span>{fmt(s.projectSpentTotal)} د.ع</span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, marginTop: 8 }}>
                <div style={{ width: `${(s.projectSpentTotal / s.projectBudgetTotal) * 100}%`, height: "100%", background: "#3b82f6", borderRadius: 6 }} />
              </div>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>🚗 المركبات / Vehicles</h3>
            <div style={{ fontSize: 48, fontWeight: 700, color: "#22c55e" }}>{s.activeVehicles}</div>
            <div style={{ opacity: 0.7 }}>مركبات نشطة / Active Vehicles</div>
            <div style={{ marginTop: 12, padding: 8, background: "rgba(239,68,68,0.1)", borderRadius: 8 }}>
              ⚠️ {s.maintenanceVehicles} مركبة في الصيانة / in maintenance
            </div>
          </div>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === "finance" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
            {[
              { label: "الفواتير المعلقة / Pending Invoices", value: s.pendingInvoices, icon: "🧾", color: "#eab308" },
              { label: "الفواتير المتأخرة / Overdue", value: s.overdueInvoices, icon: "⚠️", color: "#ef4444" },
              { label: "أوامر شراء معلقة / Pending POs", value: s.pendingPOs, icon: "📦", color: "#f97316" },
              { label: "صفقات CRM / CRM Deals", value: s.crmDeals, icon: "🤝", color: "#3b82f6" },
              { label: "قيمة الصفقات / Deal Value", value: fmt(s.crmTotalValue) + " د.ع", icon: "💎", color: "#a855f7" },
              { label: "سلف نشطة / Active Loans", value: s.activeLoans, icon: "🏦", color: "#14b8a6" },
            ].map((item, i) => (
              <div key={i} style={{ background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)`, borderRadius: 12, padding: 20, border: `1px solid ${item.color}30` }}>
                <div style={{ fontSize: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: item.color }}>{item.value}</div>
                <div style={{ opacity: 0.7, fontSize: 12 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
