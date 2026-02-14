import { useEffect, useState } from "react";
import { get } from "../api";
import { useAuth } from "../context/AuthContext";

interface KPIData {
  employees: { id: string; name: string; salary: number; status: string }[];
  departments: { id: string; name: string; employeeCount: number }[];
  invoices: { id: string; total: number; status: string }[];
  purchaseOrders: { id: string; total: number; status: string }[];
  tickets: { id: string; priority: string; status: string }[];
  products: { id: string; name: string; stock: number; minStock: number }[];
}

function fmt(n: number) { return n.toLocaleString() + " د.ع"; }

export default function KPIDashboard() {
  const { role } = useAuth();
  const [data, setData] = useState<KPIData | null>(null);

  useEffect(() => {
    Promise.all([
      get<any>("/employees"),
      get<any>("/departments"),
      get<any>("/invoices"),
      get<any>("/purchase-orders"),
      get<any>("/tickets"),
      get<any>("/products"),
    ]).then(([emp, dept, inv, po, tkt, prod]) => {
      setData({
        employees: emp.items || emp || [],
        departments: dept.items || dept || [],
        invoices: inv.items || inv || [],
        purchaseOrders: po.items || po || [],
        tickets: tkt.items || tkt || [],
        products: prod.items || prod || [],
      });
    });
  }, []);

  if (!data) return <div className="page"><div className="loading">جاري التحميل...</div></div>;

  if (role !== "admin" && role !== "manager") {
    return (
      <div className="page animate-in">
        <div className="chart-card" style={{ textAlign: "center", padding: "60px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🔒</div>
          <h3>غير مصرح / Access Denied</h3>
          <p style={{ color: "#94a3b8" }}>هذه الصفحة متاحة للإدارة فقط / Management only</p>
        </div>
      </div>
    );
  }

  var totalRev = data.invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);
  var totalUnpaid = data.invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").reduce((s, i) => s + i.total, 0);
  var totalPO = data.purchaseOrders.reduce((s, p) => s + p.total, 0);
  var totalSalaries = data.employees.reduce((s, e) => s + e.salary, 0);
  var openTickets = data.tickets.filter((t) => t.status === "open" || t.status === "in-progress").length;
  var lowStock = data.products.filter((p) => p.stock <= p.minStock).length;
  var activeEmp = data.employees.filter((e) => e.status === "active").length;
  var pendingPO = data.purchaseOrders.filter((p) => p.status === "pending").length;

  var kpis = [
    { icon: "💰", label: "الإيرادات المحصلة / Revenue", value: fmt(totalRev), color: "#10b981", trend: "+12%" },
    { icon: "📊", label: "المستحقات / Outstanding", value: fmt(totalUnpaid), color: "#f59e0b", trend: "" },
    { icon: "🛒", label: "المشتريات / Purchases", value: fmt(totalPO), color: "#3b82f6", trend: "" },
    { icon: "👥", label: "الموظفين النشطين / Active Staff", value: String(activeEmp), color: "#6366f1", trend: "" },
    { icon: "💸", label: "إجمالي الرواتب / Total Salaries", value: fmt(totalSalaries), color: "#8b5cf6", trend: "" },
    { icon: "🎫", label: "تذاكر مفتوحة / Open Tickets", value: String(openTickets), color: "#ef4444", trend: "" },
    { icon: "📦", label: "مخزون منخفض / Low Stock", value: String(lowStock), color: "#f59e0b", trend: "" },
    { icon: "⏳", label: "أوامر شراء معلقة / Pending POs", value: String(pendingPO), color: "#3b82f6", trend: "" },
  ];

  // Invoice status breakdown
  var invPaid = data.invoices.filter((i) => i.status === "paid").length;
  var invUnpaid = data.invoices.filter((i) => i.status === "unpaid").length;
  var invOverdue = data.invoices.filter((i) => i.status === "overdue").length;
  var invTotal = data.invoices.length || 1;

  // Ticket priority breakdown
  var tktCritical = data.tickets.filter((t) => t.priority === "critical").length;
  var tktHigh = data.tickets.filter((t) => t.priority === "high").length;
  var tktMedium = data.tickets.filter((t) => t.priority === "medium").length;
  var tktLow = data.tickets.filter((t) => t.priority === "low").length;

  // Dept size chart
  var maxDept = Math.max(...data.departments.map((d) => d.employeeCount), 1);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📊 لوحة مؤشرات الأداء / KPI Dashboard</h2>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
        {kpis.map((k, i) => (
          <div className="stat-card" key={i} style={{ borderRightColor: k.color, borderRightWidth: "4px" }}>
            <div className="stat-icon" style={{ background: k.color + "15", fontSize: "1.5rem" }}>{k.icon}</div>
            <div>
              <div className="stat-value">{k.value}</div>
              <div className="stat-label">{k.label}</div>
              {k.trend && <div style={{ color: "#10b981", fontSize: "0.8rem", marginTop: "4px" }}>{k.trend} ↑</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts" style={{ marginTop: "24px" }}>
        <div className="chart-card animate-in">
          <h3>📊 حالة الفواتير / Invoice Status</h3>
          <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>مدفوعة / Paid</span>
                <strong>{invPaid}</strong>
              </div>
              <div className="hbar"><div className="hbar-fill" style={{ width: (invPaid / invTotal) * 100 + "%", background: "#10b981" }}></div></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>غير مدفوعة / Unpaid</span>
                <strong>{invUnpaid}</strong>
              </div>
              <div className="hbar"><div className="hbar-fill" style={{ width: (invUnpaid / invTotal) * 100 + "%", background: "#f59e0b" }}></div></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span>متأخرة / Overdue</span>
                <strong>{invOverdue}</strong>
              </div>
              <div className="hbar"><div className="hbar-fill" style={{ width: (invOverdue / invTotal) * 100 + "%", background: "#ef4444" }}></div></div>
            </div>
          </div>
        </div>

        <div className="chart-card animate-in">
          <h3>🎫 أولوية التذاكر / Ticket Priority</h3>
          <div style={{ marginTop: "16px" }}>
            {[
              { label: "حرج / Critical", count: tktCritical, color: "#ef4444" },
              { label: "عالي / High", count: tktHigh, color: "#f59e0b" },
              { label: "متوسط / Medium", count: tktMedium, color: "#3b82f6" },
              { label: "منخفض / Low", count: tktLow, color: "#10b981" },
            ].map((p) => (
              <div key={p.label} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>{p.label}</span><strong>{p.count}</strong>
                </div>
                <div className="hbar">
                  <div className="hbar-fill" style={{ width: (p.count / (data.tickets.length || 1)) * 100 + "%", background: p.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-card animate-in" style={{ marginTop: "24px" }}>
        <h3>🏢 حجم الأقسام / Department Size</h3>
        <div className="chart-bars">
          {data.departments.map((d) => (
            <div className="chart-bar-group" key={d.id}>
              <div className="bar" style={{ height: Math.min((d.employeeCount / maxDept) * 160, 160) + "px" }}></div>
              <span>{d.name}</span>
              <small>{d.employeeCount} موظف</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
