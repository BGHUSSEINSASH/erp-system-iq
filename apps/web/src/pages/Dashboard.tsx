import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";

type DeptAtt = {
  department: string;
  departmentId: string;
  totalEmployees: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  exception: number;
  checkedOut: number;
  totalLateMinutes: number;
  employees: { name: string; status: string; checkIn: string; checkOut: string; lateMinutes: number; exceptionReason: string }[];
};

type DashboardData = {
  stats: Record<string, number>;
  attendance: Record<string, number>;
  revenueByMonth: { month: string; value: number }[];
  departmentHeadcount: { name: string; count: number }[];
  deptAttendance: DeptAtt[];
};

type ActivityItem = { id: string; titleAr: string; message: string; type: string; createdAt: string };

// Map user department to employee department name
const deptCodeToName: Record<string, string> = {
  hr: "Human Resources",
  finance: "Finance",
  sales: "Sales",
  it: "IT",
  purchasing: "Procurement",
  production: "Production",
  admin: "Administration",
  marketing: "Marketing",
};

const GLOBAL_ROLES = ["admin", "ceo", "manager"];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const navigate = useNavigate();
  const { role, department } = useAuth();

  const isGlobal = GLOBAL_ROLES.includes(role);
  const isDeptManager = role.endsWith("_manager") || role.endsWith("_assistant");
  const showDeptWidget = isGlobal || isDeptManager;

  useEffect(() => {
    get<DashboardData>("/dashboard").then(setData);
    get<{ data: ActivityItem[] }>("/notifications?limit=6")
      .then((r) => setRecentActivity(r.data || []))
      .catch(() => {});
  }, []);

  if (!data) return <div className="loading">جاري التحميل... / Loading...</div>;

  const { stats, attendance, revenueByMonth, departmentHeadcount, deptAttendance } = data;
  const maxRev = Math.max(...revenueByMonth.map((r) => r.value));
  const maxHc = Math.max(...departmentHeadcount.map((d) => d.count));

  // Filter departments based on role
  const myDeptName = department ? deptCodeToName[department] : null;
  const visibleDepts = isGlobal
    ? deptAttendance
    : isDeptManager && myDeptName
    ? deptAttendance.filter(d => d.department === myDeptName)
    : [];

  var allQuickActions = [
    { icon: "👤", label: "موظف جديد / New Employee", path: "/hr/staff-card", roles: ["admin", "manager", "hr"] },
    { icon: "🧾", label: "فاتورة جديدة / New Invoice", path: "/sales/invoices", roles: ["admin", "manager", "finance", "sales"] },
    { icon: "📋", label: "أمر شراء / Purchase Order", path: "/procurement/purchase-orders", roles: ["admin", "manager", "finance"] },
    { icon: "🏖️", label: "طلب إجازة / Leave Request", path: "/hr/leave-requests", roles: ["admin", "manager", "hr"] },
    { icon: "💵", label: "الرواتب / Payroll", path: "/hr/payroll", roles: ["admin", "manager", "hr"] },
    { icon: "📊", label: "التقارير / Reports", path: "/hr/reports", roles: ["admin", "manager", "hr"] },
    { icon: "💰", label: "تقارير مالية / Finance", path: "/finance/reports", roles: ["admin", "manager", "finance"] },
    { icon: "🎫", label: "تذكرة دعم / Ticket", path: "/it/tickets", roles: ["admin", "manager"] },
    { icon: "✅", label: "الموافقات / Approvals", path: "/approvals", roles: ["admin", "manager"] },
    { icon: "📅", label: "التقويم / Calendar", path: "/calendar", roles: ["admin", "manager", "hr", "finance", "sales"] },
  ];
  var quickActions = allQuickActions.filter(function(a) { return a.roles.includes(role); });

  var typeIcons: Record<string, string> = {
    leave: "🏖️", invoice: "🧾", ticket: "🎫", purchase: "🛒",
    payroll: "💰", system: "⚙️", approval: "✅", message: "💬",
  };

  var now = new Date();
  var dateStr = now.toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const sc: Record<string, string> = { present: "#22c55e", absent: "#ef4444", late: "#eab308", leave: "#3b82f6", exception: "#a855f7" };
  const sl: Record<string, string> = { present: "✅ حاضر", absent: "❌ غائب", late: "⏰ متأخر", leave: "🏖️ إجازة", exception: "⚠️ استثناء" };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>🏠 لوحة التحكم / Dashboard</h2>
          <p className="page-subtitle" style={{ marginTop: 4 }}>{dateStr}</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="إجمالي الموظفين / Employees" value={stats.totalEmployees} color="#3b82f6" icon="👥" />
        <StatCard label="العملاء / Customers" value={stats.totalCustomers} color="#10b981" icon="🤝" />
        <StatCard label="التذاكر المفتوحة / Tickets" value={stats.openTickets} color="#ef4444" icon="🎫" />
        <StatCard label="أوامر الشراء المعلقة / POs" value={stats.pendingPOs} color="#f59e0b" icon="📦" />
        <StatCard label="فواتير غير مدفوعة / Invoices" value={stats.unpaidInvoices} color="#8b5cf6" icon="📄" />
        <StatCard label="مخزون منخفض / Low Stock" value={stats.lowStock} color="#ec4899" icon="⚠️" />
        <StatCard label="إجمالي الإيرادات / Revenue" value={(stats.totalRevenue / 1000).toFixed(0) + "K د.ع"} color="#059669" icon="💵" />
        <StatCard label="إجمالي المصروفات / Expenses" value={(stats.totalExpenses / 1000).toFixed(0) + "K د.ع"} color="#dc2626" icon="💸" />
      </div>

      {/* Quick Actions */}
      <div className="chart-card animate-in" style={{ marginBottom: 20 }}>
        <h3>⚡ إجراءات سريعة / Quick Actions</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {quickActions.map(function(a) {
            return (
              <button
                key={a.path}
                className="btn btn-secondary"
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, borderRadius: 8 }}
                onClick={function() { navigate(a.path); }}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Department Attendance Widget ===== */}
      {showDeptWidget && visibleDepts.length > 0 && (
        <div className="chart-card animate-in" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>
              📊 حضور الأقسام اليوم / Department Attendance Today
              {!isGlobal && myDeptName && <span style={{ fontSize: 13, color: "#6366f1", marginRight: 8 }}>({myDeptName})</span>}
            </h3>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 14px" }} onClick={() => navigate("/biometric-attendance")}>
              📷 الحضور البيومتري
            </button>
          </div>

          {/* Summary for all visible departments */}
          {isGlobal && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 18 }}>
              {[
                { l: "حاضر / Present", v: visibleDepts.reduce((s, d) => s + d.present, 0), c: "#22c55e", i: "✅" },
                { l: "غائب / Absent", v: visibleDepts.reduce((s, d) => s + d.absent, 0), c: "#ef4444", i: "❌" },
                { l: "متأخر / Late", v: visibleDepts.reduce((s, d) => s + d.late, 0), c: "#eab308", i: "⏰" },
                { l: "إجازة / Leave", v: visibleDepts.reduce((s, d) => s + d.leave, 0), c: "#3b82f6", i: "🏖️" },
                { l: "استثناء / Exception", v: visibleDepts.reduce((s, d) => s + d.exception, 0), c: "#a855f7", i: "⚠️" },
                { l: "انصرف / Left", v: visibleDepts.reduce((s, d) => s + d.checkedOut, 0), c: "#06b6d4", i: "🚪" },
              ].map((s, i) => (
                <div key={i} style={{ background: `linear-gradient(135deg, ${s.c}12, ${s.c}04)`, borderRadius: 10, padding: 12, border: `1px solid ${s.c}20`, textAlign: "center" }}>
                  <div style={{ fontSize: 14 }}>{s.i}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ opacity: 0.6, fontSize: 10 }}>{s.l}</div>
                </div>
              ))}
            </div>
          )}

          {/* Per-department cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {visibleDepts.map(dept => {
              const attendanceRate = dept.totalEmployees > 0
                ? Math.round(((dept.present + dept.late) / dept.totalEmployees) * 100)
                : 0;
              const isExpanded = expandedDept === dept.departmentId;

              return (
                <div key={dept.departmentId} style={{
                  background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(99,102,241,0.02))",
                  borderRadius: 14,
                  border: "1px solid rgba(99,102,241,0.15)",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}>
                  {/* Header */}
                  <div
                    style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => setExpandedDept(isExpanded ? null : dept.departmentId)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>🏢 {dept.department}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8" }}>{dept.totalEmployees} موظف</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 50, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${attendanceRate}%`, height: "100%", background: attendanceRate >= 80 ? "#22c55e" : attendanceRate >= 50 ? "#eab308" : "#ef4444", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: attendanceRate >= 80 ? "#22c55e" : attendanceRate >= 50 ? "#eab308" : "#ef4444" }}>{attendanceRate}%</span>
                      </div>
                      <span style={{ fontSize: 12, color: "#94a3b8", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", justifyContent: "space-around", padding: "0 12px 12px", flexWrap: "wrap", gap: 4 }}>
                    {[
                      { v: dept.present, c: "#22c55e", l: "حاضر" },
                      { v: dept.absent, c: "#ef4444", l: "غائب" },
                      { v: dept.late, c: "#eab308", l: "متأخر" },
                      { v: dept.leave, c: "#3b82f6", l: "إجازة" },
                      { v: dept.exception, c: "#a855f7", l: "استثناء" },
                      { v: dept.checkedOut, c: "#06b6d4", l: "انصرف" },
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: "center", minWidth: 38 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
                        <div style={{ fontSize: 9, opacity: 0.6 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Expanded: Employee list */}
                  {isExpanded && dept.employees.length > 0 && (
                    <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", padding: "10px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 8, color: "#94a3b8" }}>
                        👥 تفاصيل الموظفين / Employee Details
                        {dept.totalLateMinutes > 0 && (
                          <span style={{ marginRight: 8, color: "#eab308" }}>⏱️ إجمالي تأخير: {dept.totalLateMinutes} دقيقة</span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {dept.employees.map((emp, i) => (
                          <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "6px 10px", borderRadius: 8,
                            background: "rgba(255,255,255,0.03)",
                            border: `1px solid ${sc[emp.status] || "#888"}15`,
                          }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sc[emp.status] || "#888" }} />
                              <span style={{ fontWeight: 600, fontSize: 12 }}>{emp.name}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                              {emp.checkIn && <span style={{ color: "#22c55e" }}>⬆ {emp.checkIn}</span>}
                              {emp.checkOut && <span style={{ color: "#06b6d4" }}>⬇ {emp.checkOut}</span>}
                              {emp.lateMinutes > 0 && <span style={{ color: "#eab308" }}>⏰ {emp.lateMinutes}د</span>}
                              {emp.exceptionReason && <span style={{ color: "#a855f7", fontSize: 10 }}>⚠️ {emp.exceptionReason.substring(0, 20)}</span>}
                              <span style={{ padding: "1px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: `${sc[emp.status] || "#888"}20`, color: sc[emp.status] || "#888" }}>
                                {sl[emp.status] || emp.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && dept.employees.length === 0 && (
                    <div style={{ borderTop: "1px solid rgba(99,102,241,0.1)", padding: "14px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                      لا توجد سجلات حضور لهذا اليوم
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="dashboard-charts">
        <div className="chart-card animate-in">
          <h3>الإيرادات (آخر 6 أشهر) / Revenue</h3>
          <div className="bar-chart">
            {revenueByMonth.map((r) => (
              <div key={r.month} className="bar-col">
                <div className="bar-value">{(r.value / 1000).toFixed(0)}K</div>
                <div className="bar" style={{ height: (r.value / maxRev) * 160 + "px" }} />
                <div className="bar-label">{r.month}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card animate-in">
          <h3>الحضور اليوم / Attendance Today</h3>
          <div className="attendance-grid">
            <div className="att-item present">
              <div className="att-val">{attendance.presentToday}</div>
              <div className="att-lbl">حاضر / Present</div>
            </div>
            <div className="att-item absent">
              <div className="att-val">{attendance.absentToday}</div>
              <div className="att-lbl">غائب / Absent</div>
            </div>
            <div className="att-item late">
              <div className="att-val">{attendance.lateToday}</div>
              <div className="att-lbl">متأخر / Late</div>
            </div>
            <div className="att-item leave">
              <div className="att-val">{attendance.onLeave}</div>
              <div className="att-lbl">إجازة / Leave</div>
            </div>
          </div>
        </div>

        <div className="chart-card animate-in">
          <h3>عدد الموظفين بالقسم / Headcount</h3>
          <div className="hbar-chart">
            {departmentHeadcount.map((d) => (
              <div key={d.name} className="hbar-row">
                <span className="hbar-name">{d.name}</span>
                <div className="hbar-track">
                  <div className="hbar-fill" style={{ width: (d.count / maxHc) * 100 + "%" }} />
                </div>
                <span className="hbar-val">{d.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="chart-card animate-in">
          <h3>📋 آخر النشاطات / Recent Activity</h3>
          {recentActivity.length === 0 ? (
            <p style={{ color: "#94a3b8", textAlign: "center", padding: 20 }}>لا توجد نشاطات حديثة</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {recentActivity.map(function(item) {
                return (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(99,102,241,0.05)", borderRadius: 8 }}>
                    <span style={{ fontSize: 20 }}>{typeIcons[item.type] || "📌"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{item.titleAr}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>{item.message}</div>
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(item.createdAt).toLocaleDateString("ar-IQ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={function() { navigate("/notifications"); }}>
              عرض الكل / View All →
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="chart-card animate-in">
          <h3>🖥️ حالة النظام / System Status</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🟢 الخادم / Server</span>
              <span className="badge badge-approved">متصل / Online</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🗄️ قاعدة البيانات / Database</span>
              <span className="badge badge-approved">نشط / Active</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📊 الوحدات / Modules</span>
              <span className="badge badge-approved">10 وحدات نشطة</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🔄 آخر تحديث / Last Update</span>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>{now.toLocaleTimeString("ar-IQ")}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>📦 الإصدار / Version</span>
              <span style={{ color: "#94a3b8", fontSize: 13 }}>v2.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
