import { useEffect, useState } from "react";
import { get } from "../api";

export default function SmartAlerts() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(function () {
    get("/smart-alerts").then(function (r) { setData(r); setLoading(false); });
  }, []);

  if (loading || !data) return <div className="page-loading"><div className="spinner"></div><p>جاري تحميل التنبيهات...</p></div>;

  var filtered = data.alerts.filter(function (a: any) {
    if (dismissed.indexOf(a.id) >= 0) return false;
    if (filter === "all") return true;
    return a.severity === filter;
  });

  function dismissAlert(id: string) {
    setDismissed(function (prev) { return [].concat(prev as any, id as any); });
  }

  function getSeverityClass(s: string) {
    if (s === "high") return "alert-high";
    if (s === "medium") return "alert-medium";
    return "alert-low";
  }

  function getSeverityLabel(s: string) {
    if (s === "high") return "عالي / High";
    if (s === "medium") return "متوسط / Medium";
    return "منخفض / Low";
  }

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🔔 التنبيهات الذكية / Smart Alerts</h2>
        <div className="alert-summary">
          <span className="alert-badge badge-high">🔴 {data.counts.high} عالي</span>
          <span className="alert-badge badge-medium">🟡 {data.counts.medium} متوسط</span>
          <span className="alert-badge badge-low">🟢 {data.counts.low} منخفض</span>
        </div>
      </div>

      <div className="alert-filters">
        {[
          { key: "all", label: "الكل / All" },
          { key: "high", label: "🔴 عالي" },
          { key: "medium", label: "🟡 متوسط" },
          { key: "low", label: "🟢 منخفض" },
        ].map(function (f) {
          return <button key={f.key} className={"filter-btn" + (filter === f.key ? " active" : "")} onClick={function () { setFilter(f.key); }}>{f.label}</button>;
        })}
      </div>

      <div className="alerts-list">
        {filtered.length === 0 && <div className="empty-state"><p>✅ لا توجد تنبيهات / No alerts</p></div>}
        {filtered.map(function (alert: any) {
          return (
            <div key={alert.id} className={"alert-item " + getSeverityClass(alert.severity)}>
              <div className="alert-icon">{alert.icon}</div>
              <div className="alert-content">
                <div className="alert-title">{alert.titleAr} / {alert.titleEn}</div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-meta">
                  <span className={"severity-tag " + alert.severity}>{getSeverityLabel(alert.severity)}</span>
                  <span className="alert-date">📅 {alert.date}</span>
                  <span className="alert-type">{alert.type}</span>
                </div>
              </div>
              <div className="alert-actions">
                <a href={alert.actionPath} className="btn btn-sm btn-primary">عرض / View</a>
                <button className="btn btn-sm btn-outline" onClick={function () { dismissAlert(alert.id); }}>تجاهل</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
