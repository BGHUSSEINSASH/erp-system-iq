import { useEffect, useState, useCallback } from "react";
import { get } from "../../api";
import { useI18n } from "../../i18n";
import { generatePDFReport } from "../../utils/pdf";

type HealthData = {
  summary: { totalAssets: number; activeAssets: number; maintenanceAssets: number; retiredAssets: number; openTickets: number; inProgressTickets: number; totalEmployees: number; totalUsers: number };
  services: { name: string; status: string; uptime: string }[];
  warrantyAlerts: { id: string; name: string; warranty: string }[];
  assetsByCategory: Record<string, number>;
};

type LogEntry = { time: string; level: string; message: string; source: string };

export default function SystemHealth() {
  const { t } = useI18n();
  const [data, setData] = useState<HealthData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "performance" | "logs" | "maintenance">("overview");
  const [refreshing, setRefreshing] = useState(false);

  // Simulated real-time metrics
  const [cpuUsage] = useState(23);
  const [memoryUsage] = useState(42);
  const [diskUsage] = useState(31);
  const [networkIn] = useState(1.4);
  const [networkOut] = useState(0.8);
  const [activeConnections] = useState(12);
  const [responseTime] = useState(45);
  const [errorRate] = useState(0.2);

  // Simulated logs
  const [logs] = useState<LogEntry[]>([
    { time: "2026-02-10 10:45:23", level: "info", message: "API server started on port 4000", source: "Express" },
    { time: "2026-02-10 10:44:12", level: "info", message: "Database connection established", source: "Database" },
    { time: "2026-02-10 10:43:05", level: "warning", message: "High memory usage detected (42%)", source: "Monitor" },
    { time: "2026-02-10 10:40:18", level: "info", message: "Backup completed successfully", source: "Backup" },
    { time: "2026-02-10 10:35:44", level: "error", message: "Failed to connect to SMTP server", source: "Email" },
    { time: "2026-02-10 10:30:01", level: "info", message: "Scheduled task: attendance report generated", source: "Scheduler" },
    { time: "2026-02-10 10:25:33", level: "info", message: "User admin logged in from 192.168.1.10", source: "Auth" },
    { time: "2026-02-10 10:20:15", level: "warning", message: "SSL certificate expires in 30 days", source: "Security" },
    { time: "2026-02-10 10:15:00", level: "info", message: "Cache cleared - 256 MB freed", source: "Cache" },
    { time: "2026-02-10 10:10:45", level: "info", message: "System health check passed", source: "Monitor" },
  ]);

  const reload = useCallback(() => {
    setRefreshing(true);
    get<HealthData>("/system-health").then(d => { setData(d); setRefreshing(false); }).catch(() => setRefreshing(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const exportPDF = () => {
    if (!data) return;
    generatePDFReport({
      title: "\u062a\u0642\u0631\u064a\u0631 \u0635\u062d\u0629 \u0627\u0644\u0646\u0638\u0627\u0645 / System Health Report",
      subtitle: `\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u062a\u0642\u0631\u064a\u0631: ${new Date().toLocaleDateString("ar-IQ")}`,
      columns: [
        { key: "name", header: "\u0627\u0644\u062e\u062f\u0645\u0629 / Service" },
        { key: "status", header: "\u0627\u0644\u062d\u0627\u0644\u0629 / Status" },
        { key: "uptime", header: "Uptime" },
      ],
      data: data.services.map(s => ({ name: s.name, status: s.status === "online" ? "\u2705 \u0645\u062a\u0635\u0644" : s.status === "degraded" ? "\u26a0\ufe0f \u0645\u062a\u0630\u0628\u0630\u0628" : "\u274c \u0645\u0646\u0642\u0637\u0639", uptime: s.uptime })),
      stats: [
        { label: "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0623\u0635\u0648\u0644", value: data.summary.totalAssets },
        { label: "\u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0646\u0634\u0637\u0629", value: data.summary.activeAssets },
        { label: "\u0627\u0644\u062a\u0630\u0627\u0643\u0631 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629", value: data.summary.openTickets },
        { label: "\u0627\u0644\u0645\u0633\u062a\u062e\u062f\u0645\u064a\u0646", value: data.summary.totalUsers },
      ],
    });
  };

  if (!data) return <div className="page"><p>{t("loading")}</p></div>;
  const { summary, services, warrantyAlerts, assetsByCategory } = data;

  const statusColor = (s: string) => s === "online" ? "#10b981" : s === "degraded" ? "#f59e0b" : "#ef4444";
  const statusLabel = (s: string) => s === "online" ? "\u2705 \u0645\u062a\u0635\u0644 / Online" : s === "degraded" ? "\u26a0\ufe0f \u0645\u062a\u0630\u0628\u0630\u0628 / Degraded" : "\u274c \u0645\u0646\u0642\u0637\u0639 / Offline";
  const logLevelColor: Record<string, string> = { info: "#3b82f6", warning: "#f59e0b", error: "#ef4444", debug: "#8b5cf6" };
  const logLevelLabel: Record<string, string> = { info: "\u2139\ufe0f \u0645\u0639\u0644\u0648\u0645\u0627\u062a", warning: "\u26a0\ufe0f \u062a\u062d\u0630\u064a\u0631", error: "\u274c \u062e\u0637\u0623", debug: "\ud83d\udd0d \u062a\u0635\u062d\u064a\u062d" };

  const cardStyle = { background: "var(--card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)" };
  const onlineCount = services.filter(s => s.status === "online").length;
  const overallHealth = Math.round((onlineCount / services.length) * 100);

  const GaugeChart = ({ value, label, color, max = 100 }: { value: number; label: string; color: string; max?: number }) => {
    const pct = Math.min((value / max) * 100, 100);
    const r = 45; const circ = 2 * Math.PI * r; const offset = circ - (pct / 100) * circ * 0.75;
    return (
      <div style={{ textAlign: "center" }}>
        <svg width="110" height="90" viewBox="0 0 110 90">
          <path d="M 10 80 A 45 45 0 1 1 100 80" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 80 A 45 45 0 1 1 100 80" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${circ * 0.75}`} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s" }} />
          <text x="55" y="55" textAnchor="middle" fill={color} fontSize="18" fontWeight="800">{value}%</text>
        </svg>
        <div style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600, marginTop: -4 }}>{label}</div>
      </div>
    );
  };

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h2>{"\ud83d\udda5\ufe0f"} {t("page.systemHealth")} / System Health</h2>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>مراقبة أداء وصحة النظام / Monitor system performance and health</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={reload} disabled={refreshing}>
            {refreshing ? "\ud83d\udd04 ..." : "\ud83d\udd04 تحديث / Refresh"}
          </button>
          <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={exportPDF}>
            {"\ud83d\udcc4"} تقرير PDF
          </button>
        </div>
      </div>

      {/* Overall Health Indicator */}
      <div style={{ marginBottom: 20, padding: "16px 24px", borderRadius: 16, background: `linear-gradient(135deg, ${overallHealth >= 80 ? "rgba(16,185,129,0.08)" : overallHealth >= 50 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"}, transparent)`, border: `1px solid ${overallHealth >= 80 ? "rgba(16,185,129,0.15)" : overallHealth >= 50 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)"}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: `${overallHealth >= 80 ? "#10b981" : overallHealth >= 50 ? "#f59e0b" : "#ef4444"}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
            {overallHealth >= 80 ? "\u2705" : overallHealth >= 50 ? "\u26a0\ufe0f" : "\u274c"}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>صحة النظام العامة / Overall System Health</div>
            <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>{onlineCount} من {services.length} خدمة متصلة</div>
          </div>
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: overallHealth >= 80 ? "#10b981" : overallHealth >= 50 ? "#f59e0b" : "#ef4444" }}>
          {overallHealth}%
        </div>
      </div>

      {/* Tabs */}
      <div className="report-tabs" style={{ flexWrap: "wrap", marginBottom: 20 }}>
        {[
          { id: "overview" as const, label: "\ud83d\udcca نظرة عامة / Overview" },
          { id: "services" as const, label: `\ud83d\udfe2 الخدمات / Services (${services.length})` },
          { id: "performance" as const, label: "\u26a1 الأداء / Performance" },
          { id: "logs" as const, label: `\ud83d\udccb السجلات / Logs (${logs.length})` },
          { id: "maintenance" as const, label: `\ud83d\udd27 الصيانة / Maintenance (${warrantyAlerts.length})` },
        ].map(tab => (
          <button key={tab.id} className={"report-tab " + (activeTab === tab.id ? "active" : "")} onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== OVERVIEW ===== */}
      {activeTab === "overview" && (
        <div className="animate-in">
          {/* Summary Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { l: "\u0627\u0644\u0623\u0635\u0648\u0644 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a\u0629 / Total Assets", v: summary.totalAssets, c: "#6366f1", i: "\ud83d\udcbb" },
              { l: "\u0646\u0634\u0637\u0629 / Active", v: summary.activeAssets, c: "#10b981", i: "\u2705" },
              { l: "\u0635\u064a\u0627\u0646\u0629 / Maintenance", v: summary.maintenanceAssets, c: "#f59e0b", i: "\ud83d\udd27" },
              { l: "\u0645\u062a\u0642\u0627\u0639\u062f\u0629 / Retired", v: summary.retiredAssets, c: "#ef4444", i: "\ud83d\udea8" },
              { l: "\u062a\u0630\u0627\u0643\u0631 \u0645\u0641\u062a\u0648\u062d\u0629 / Open Tickets", v: summary.openTickets, c: "#3b82f6", i: "\ud83c\udfab" },
              { l: "\u0642\u064a\u062f \u0627\u0644\u0645\u0639\u0627\u0644\u062c\u0629 / In Progress", v: summary.inProgressTickets, c: "#8b5cf6", i: "\u23f3" },
            ].map((s, i) => (
              <div key={i} style={{ background: `${s.c}08`, borderRadius: 14, padding: 16, textAlign: "center", border: `1px solid ${s.c}15`, transition: "all .2s" }}>
                <div style={{ fontSize: 20 }}>{s.i}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.c, margin: "4px 0" }}>{s.v}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Quick Gauges + Services */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15 }}>{"\u26a1"} مقاييس سريعة / Quick Metrics</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                <GaugeChart value={cpuUsage} label="CPU" color={cpuUsage > 80 ? "#ef4444" : cpuUsage > 50 ? "#f59e0b" : "#10b981"} />
                <GaugeChart value={memoryUsage} label="\u0627\u0644\u0630\u0627\u0643\u0631\u0629 / RAM" color={memoryUsage > 80 ? "#ef4444" : memoryUsage > 50 ? "#f59e0b" : "#3b82f6"} />
                <GaugeChart value={diskUsage} label="\u0627\u0644\u0642\u0631\u0635 / Disk" color={diskUsage > 80 ? "#ef4444" : diskUsage > 50 ? "#f59e0b" : "#8b5cf6"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginTop: 14 }}>
                {[
                  { l: "\u0632\u0645\u0646 \u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629 / Response", v: `${responseTime}ms`, c: "#6366f1" },
                  { l: "\u0645\u0639\u062f\u0644 \u0627\u0644\u0623\u062e\u0637\u0627\u0621 / Error Rate", v: `${errorRate}%`, c: errorRate > 1 ? "#ef4444" : "#10b981" },
                  { l: "\u0627\u062a\u0635\u0627\u0644\u0627\u062a \u0646\u0634\u0637\u0629 / Connections", v: String(activeConnections), c: "#3b82f6" },
                  { l: "\u0627\u0644\u0634\u0628\u0643\u0629 / Network", v: `\u2193${networkIn} \u2191${networkOut} MB/s`, c: "#8b5cf6" },
                ].map((m, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 10, color: "var(--ink-muted)" }}>{m.l}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: m.c }}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15 }}>{"\ud83d\udcca"} توزيع الأصول / Asset Distribution</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {Object.entries(assetsByCategory).map(([cat, count], i) => {
                  const colors = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4"];
                  const total = Object.values(assetsByCategory).reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{t("itCat." + cat) || cat}</span>
                        <span style={{ fontSize: 12, color: colors[i % colors.length], fontWeight: 600 }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "var(--bg-subtle)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${colors[i % colors.length]}, ${colors[i % colors.length]}88)`, borderRadius: 4, transition: "width .6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SERVICES ===== */}
      {activeTab === "services" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14, marginBottom: 20 }}>
            {services.map((s, i) => (
              <div key={i} style={{ ...cardStyle, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor(s.status), boxShadow: `0 0 8px ${statusColor(s.status)}50` }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>Uptime: {s.uptime}</div>
                  </div>
                </div>
                <span className="badge" style={{ background: `${statusColor(s.status)}15`, color: statusColor(s.status), borderRadius: 20, fontSize: 11 }}>
                  {statusLabel(s.status)}
                </span>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 15 }}>{"\ud83d\udcca"} جدول الخدمات / Services Table</h3>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>#</th><th>الخدمة / Service</th><th>الحالة / Status</th><th>Uptime</th><th>آخر فحص / Last Check</th></tr></thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(s.status) }} />
                          <span style={{ color: statusColor(s.status), fontWeight: 600, fontSize: 12 }}>{statusLabel(s.status)}</span>
                        </div>
                      </td>
                      <td style={{ color: "#6366f1", fontWeight: 600 }}>{s.uptime}</td>
                      <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>منذ دقيقة / 1 min ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== PERFORMANCE ===== */}
      {activeTab === "performance" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* CPU */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\u2699\ufe0f"} المعالج / CPU</h3>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <GaugeChart value={cpuUsage} label="" color={cpuUsage > 80 ? "#ef4444" : cpuUsage > 50 ? "#f59e0b" : "#10b981"} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>النوى / Cores</span><span style={{ fontWeight: 600 }}>2 vCPU</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>الحمل / Load Avg</span><span style={{ fontWeight: 600 }}>0.45, 0.32, 0.28</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>العمليات / Processes</span><span style={{ fontWeight: 600 }}>128</span></div>
              </div>
            </div>

            {/* Memory */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\ud83e\udde0"} الذاكرة / Memory</h3>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <GaugeChart value={memoryUsage} label="" color={memoryUsage > 80 ? "#ef4444" : memoryUsage > 50 ? "#f59e0b" : "#3b82f6"} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>الإجمالي / Total</span><span style={{ fontWeight: 600 }}>4 GB</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>المستخدم / Used</span><span style={{ fontWeight: 600 }}>1.68 GB</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>المتاح / Available</span><span style={{ fontWeight: 600 }}>2.32 GB</span></div>
              </div>
            </div>

            {/* Disk */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\ud83d\udcbe"} القرص / Disk</h3>
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <GaugeChart value={diskUsage} label="" color={diskUsage > 80 ? "#ef4444" : diskUsage > 50 ? "#f59e0b" : "#8b5cf6"} />
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>الإجمالي / Total</span><span style={{ fontWeight: 600 }}>50 GB</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>المستخدم / Used</span><span style={{ fontWeight: 600 }}>15.5 GB</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>I/O</span><span style={{ fontWeight: 600 }}>Read: 12MB/s Write: 8MB/s</span></div>
              </div>
            </div>

            {/* Network */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\ud83c\udf10"} الشبكة / Network</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { l: "\u0627\u0644\u0648\u0627\u0631\u062f / Inbound", v: `${networkIn} MB/s`, c: "#10b981", i: "\u2b07\ufe0f" },
                  { l: "\u0627\u0644\u0635\u0627\u062f\u0631 / Outbound", v: `${networkOut} MB/s`, c: "#3b82f6", i: "\u2b06\ufe0f" },
                  { l: "\u0627\u062a\u0635\u0627\u0644\u0627\u062a \u0646\u0634\u0637\u0629 / Active Conn.", v: String(activeConnections), c: "#8b5cf6", i: "\ud83d\udd17" },
                  { l: "\u0632\u0645\u0646 \u0627\u0644\u0627\u0633\u062a\u062c\u0627\u0628\u0629 / Latency", v: `${responseTime}ms`, c: "#6366f1", i: "\u23f1\ufe0f" },
                ].map((m, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: `${m.c}08`, border: `1px solid ${m.c}15` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span>{m.i}</span>
                      <span style={{ fontSize: 12 }}>{m.l}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: m.c }}>{m.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* API Performance */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\ud83d\ude80"} أداء API / API Performance</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { l: "GET /employees", v: "12ms", calls: 1240 },
                  { l: "POST /attendance", v: "45ms", calls: 856 },
                  { l: "GET /dashboard", v: "89ms", calls: 2100 },
                  { l: "PUT /payroll/:id", v: "34ms", calls: 320 },
                  { l: "GET /reports", v: "156ms", calls: 180 },
                ].map((ep, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 8, background: "var(--bg-subtle)" }}>
                    <code style={{ fontSize: 11, color: "#6366f1" }}>{ep.l}</code>
                    <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                      <span style={{ color: "var(--ink-muted)" }}>{ep.calls} calls</span>
                      <span style={{ fontWeight: 700, color: parseInt(ep.v) > 100 ? "#f59e0b" : "#10b981" }}>{ep.v}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Rate */}
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, display: "flex", alignItems: "center", gap: 8 }}>{"\u26a0\ufe0f"} معدل الأخطاء / Error Rate</h3>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: errorRate > 1 ? "#ef4444" : "#10b981" }}>{errorRate}%</div>
                <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>{errorRate > 1 ? "\u274c معدل أخطاء مرتفع" : "\u2705 معدل أخطاء طبيعي"}</div>
              </div>
              <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>4xx Errors</span><span style={{ fontWeight: 600, color: "#f59e0b" }}>3</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>5xx Errors</span><span style={{ fontWeight: 600, color: "#ef4444" }}>1</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}><span>Timeouts</span><span style={{ fontWeight: 600 }}>0</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOGS ===== */}
      {activeTab === "logs" && (
        <div className="animate-in">
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>{"\ud83d\udccb"} سجلات النظام / System Logs</h3>
              <div style={{ display: "flex", gap: 6 }}>
                {["all", "info", "warning", "error"].map(level => (
                  <span key={level} className="badge" style={{ cursor: "pointer", background: level === "all" ? "rgba(99,102,241,0.1)" : `${logLevelColor[level] || "#888"}15`, color: level === "all" ? "#6366f1" : logLevelColor[level], borderRadius: 20, fontSize: 11 }}>
                    {level === "all" ? "\u0627\u0644\u0643\u0644" : logLevelLabel[level]}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {logs.map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderRadius: 10, background: i % 2 === 0 ? "var(--bg-subtle)" : "transparent", borderInlineStart: `3px solid ${logLevelColor[log.level] || "#888"}` }}>
                  <span className="badge" style={{ background: `${logLevelColor[log.level]}15`, color: logLevelColor[log.level], borderRadius: 6, fontSize: 10, minWidth: 65, textAlign: "center", flexShrink: 0 }}>
                    {logLevelLabel[log.level]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{log.message}</div>
                    <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 2, display: "flex", gap: 12 }}>
                      <span>{"\ud83d\udcc5"} {log.time}</span>
                      <span>{"\ud83d\udce6"} {log.source}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== MAINTENANCE ===== */}
      {activeTab === "maintenance" && (
        <div className="animate-in">
          {warrantyAlerts.length > 0 && (
            <div style={{ ...cardStyle, marginBottom: 16, borderInlineStart: "4px solid #ef4444" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15, color: "#ef4444" }}>{"\u26a0\ufe0f"} تنبيهات الضمان / Warranty Alerts ({warrantyAlerts.length})</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead><tr><th>#</th><th>الأصل / Asset</th><th>انتهاء الضمان / Warranty</th><th>الحالة / Status</th></tr></thead>
                  <tbody>
                    {warrantyAlerts.map((a, i) => (
                      <tr key={a.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                        <td style={{ color: "#ef4444", fontWeight: 600 }}>{a.warranty}</td>
                        <td><span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 20 }}>{"\u26a0\ufe0f"} يحتاج تجديد</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15 }}>{"\ud83d\udee0\ufe0f"} إجراءات الصيانة / Maintenance Actions</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { l: "\ud83d\uddd1\ufe0f تنظيف الكاش / Clear Cache", desc: "حذف الملفات المؤقتة وتحرير الذاكرة", action: "clear-cache" },
                  { l: "\ud83d\udd04 إعادة تشغيل الخدمات / Restart Services", desc: "إعادة تشغيل جميع الخدمات", action: "restart" },
                  { l: "\ud83d\udcca تحسين قاعدة البيانات / Optimize DB", desc: "تحسين أداء قاعدة البيانات", action: "optimize-db" },
                  { l: "\ud83d\udee1\ufe0f فحص أمني / Security Scan", desc: "فحص شامل للثغرات الأمنية", action: "security-scan" },
                  { l: "\ud83d\udce6 تحديث النظام / System Update", desc: "البحث عن تحديثات جديدة", action: "update" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.l}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{item.desc}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => alert(`\ud83d\udd04 جاري تنفيذ: ${item.l}`)}>
                      تنفيذ
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: 15 }}>{"\ud83d\udcc5"} جدول الصيانة / Maintenance Schedule</h3>
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { task: "نسخ احتياطي يومي", next: "2026-02-11 03:00", status: "scheduled", freq: "يوميًا" },
                  { task: "تحسين قاعدة البيانات", next: "2026-02-15 02:00", status: "scheduled", freq: "أسبوعيًا" },
                  { task: "فحص أمني شامل", next: "2026-03-01 01:00", status: "scheduled", freq: "شهريًا" },
                  { task: "تنظيف الكاش", next: "2026-02-10 23:00", status: "scheduled", freq: "يوميًا" },
                  { task: "تحديث الشهادات", next: "2026-03-10", status: "upcoming", freq: "سنويًا" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{item.task}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{item.freq} · {item.next}</div>
                    </div>
                    <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 20, fontSize: 10 }}>
                      {"\ud83d\udcc5"} مجدول
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
