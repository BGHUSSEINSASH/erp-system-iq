import { useEffect, useState } from "react";
import { get } from "../api";
import { useI18n } from "../i18n";

type Summary = {
  totalEmployees: number; activeEmployees: number; totalDepartments: number;
  totalCustomers: number; totalRevenue: number; pendingInvoices: number;
  overdueInvoices: number; totalVendors: number; pendingPOs: number;
  openTickets: number; pendingLeaves: number; totalPayroll: number;
  totalCosts: number; activeLoans: number; totalLoanAmount: number;
  activeProjects: number; projectBudgetTotal: number; projectSpentTotal: number;
  activeVehicles: number; maintenanceVehicles: number; crmDeals: number;
  crmTotalValue: number; activeBranches: number; upcomingTraining: number;
  totalUsers: number;
};

type DashData = {
  summary: Summary;
  deptBreakdown: { name: string; employees: number; manager: string }[];
  revenueTrend: { month: string; amount: number }[];
  recentLeaves: any[];
  recentProjects: any[];
};

function fmt(n: number) {
  return n.toLocaleString("ar-IQ");
}

export default function CEODashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => { get<DashData>("/ceo-dashboard").then(setData); }, []);

  if (!data) return <div className="page"><div className="loading">{t("loading")}</div></div>;
  const s = data.summary;

  const cards = [
    { icon: "👥", label: "الموظفين / Employees", value: s.totalEmployees, color: "#3b82f6" },
    { icon: "🏢", label: "الأقسام / Departments", value: s.totalDepartments, color: "#8b5cf6" },
    { icon: "💰", label: "الإيرادات / Revenue", value: fmt(s.totalRevenue) + " د.ع", color: "#22c55e" },
    { icon: "📦", label: "أوامر شراء معلقة / Pending POs", value: s.pendingPOs, color: "#f59e0b" },
    { icon: "🧾", label: "فواتير متأخرة / Overdue", value: s.overdueInvoices, color: "#ef4444" },
    { icon: "🏖️", label: "إجازات معلقة / Pending Leaves", value: s.pendingLeaves, color: "#f97316" },
    { icon: "🎫", label: "تذاكر مفتوحة / Open Tickets", value: s.openTickets, color: "#6366f1" },
    { icon: "💵", label: "إجمالي الرواتب / Total Payroll", value: fmt(s.totalPayroll) + " د.ع", color: "#14b8a6" },
    { icon: "💹", label: "التكاليف / Total Costs", value: fmt(s.totalCosts) + " د.ع", color: "#e11d48" },
    { icon: "🏗️", label: "مشاريع نشطة / Active Projects", value: s.activeProjects, color: "#0ea5e9" },
    { icon: "🚗", label: "مركبات / Vehicles", value: `${s.activeVehicles} نشطة`, color: "#84cc16" },
    { icon: "📊", label: "صفقات CRM / CRM Deals", value: s.crmDeals, color: "#a855f7" },
    { icon: "🏦", label: "سلف نشطة / Active Loans", value: s.activeLoans, color: "#f43f5e" },
    { icon: "🌍", label: "الفروع / Branches", value: s.activeBranches, color: "#06b6d4" },
    { icon: "📚", label: "تدريبات قادمة / Training", value: s.upcomingTraining, color: "#d946ef" },
    { icon: "👤", label: "المستخدمين / Users", value: s.totalUsers, color: "#64748b" },
  ];

  const maxRevenue = Math.max(...data.revenueTrend.map(r => r.amount));

  return (
    <div className="page">
      <div className="page-header">
        <h2>🏛️ لوحة تحكم الرئيس التنفيذي / CEO Dashboard</h2>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${c.color}18, ${c.color}08)`,
            borderRadius: 14, padding: 20,
            border: `1px solid ${c.color}30`,
            transition: "transform 0.2s, box-shadow 0.2s",
            cursor: "default",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${c.color}20`; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
          >
            <div style={{ fontSize: 32 }}>{c.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color, marginTop: 4 }}>{c.value}</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Trend & Department Breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
        {/* Revenue Chart */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ marginBottom: 16 }}>📈 اتجاه الإيرادات / Revenue Trend</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200 }}>
            {data.revenueTrend.map((r, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  height: `${(r.amount / maxRevenue) * 160}px`,
                  background: "linear-gradient(180deg, #3b82f6, #6366f1)",
                  borderRadius: "6px 6px 0 0",
                  minHeight: 20,
                  transition: "height 0.5s ease",
                }} />
                <div style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}>{r.month}</div>
                <div style={{ fontSize: 10, opacity: 0.5 }}>{fmt(r.amount)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ marginBottom: 16 }}>🏢 الأقسام / Departments</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.deptBreakdown.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                <span style={{ fontWeight: 600 }}>{d.name}</span>
                <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 12, opacity: 0.6 }}>{d.manager}</span>
                  <span className="badge badge-info" style={{ minWidth: 30, textAlign: "center" }}>{d.employees}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Pending Leaves */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ marginBottom: 16 }}>🏖️ إجازات معلقة / Pending Leaves</h3>
          {data.recentLeaves.length === 0 ? <div style={{ opacity: 0.5 }}>لا توجد طلبات معلقة</div> :
            data.recentLeaves.map((l: any, i: number) => (
              <div key={i} style={{ padding: 10, borderRadius: 8, marginBottom: 8, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <div style={{ fontWeight: 600 }}>{l.employeeName} <span style={{ fontSize: 12, opacity: 0.6 }}>({l.department})</span></div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{l.type} | {l.startDate} → {l.endDate} ({l.days} days)</div>
              </div>
            ))
          }
        </div>

        {/* Active Projects */}
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 style={{ marginBottom: 16 }}>🏗️ مشاريع نشطة / Active Projects</h3>
          {data.recentProjects.map((p: any, i: number) => (
            <div key={i} style={{ padding: 10, borderRadius: 8, marginBottom: 8, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{p.manager} | {p.department}</div>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, overflow: "hidden" }}>
                <div style={{ width: `${p.progress}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #22c55e)", borderRadius: 6, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, textAlign: "end", marginTop: 2 }}>{p.progress}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
