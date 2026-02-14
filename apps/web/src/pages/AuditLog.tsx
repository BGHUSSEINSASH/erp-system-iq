import { useEffect, useState } from "react";
import { get } from "../api";

interface AuditEntry {
  id: string;
  action: string;
  module: string;
  description: string;
  user: string;
  role: string;
  ip: string;
  timestamp: string;
}

var actionIcons: Record<string, string> = {
  create: "➕", update: "✏️", delete: "🗑️", login: "🔑", logout: "🚪", export: "📤",
};
var actionColors: Record<string, string> = {
  create: "badge-approved", update: "badge-pending", delete: "badge-rejected",
  login: "badge-approved", logout: "badge-pending", export: "badge-pending",
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filterAction, setFilterAction] = useState("");
  const [filterUser, setFilterUser] = useState("");

  useEffect(() => {
    var url = "/audit-log";
    var params: string[] = [];
    if (filterAction) params.push("action=" + filterAction);
    if (filterUser) params.push("user=" + filterUser);
    if (params.length) url += "?" + params.join("&");
    get<AuditEntry[]>(url).then(setEntries);
  }, [filterAction, filterUser]);

  function formatDate(ts: string) {
    var d = new Date(ts);
    return d.toLocaleDateString("ar-IQ") + " " + d.toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📋 سجل النشاطات / Audit Log</h2>
      </div>

      <div className="chart-card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#64748b" }}>
              العملية / Action
            </label>
            <select className="form-select" value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", minWidth: "150px" }}>
              <option value="">الكل / All</option>
              <option value="create">إنشاء / Create</option>
              <option value="update">تعديل / Update</option>
              <option value="delete">حذف / Delete</option>
              <option value="login">تسجيل دخول / Login</option>
              <option value="export">تصدير / Export</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "0.85rem", color: "#64748b" }}>
              المستخدم / User
            </label>
            <select className="form-select" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}
              style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", minWidth: "150px" }}>
              <option value="">الكل / All</option>
              <option value="admin">admin</option>
              <option value="hr">hr</option>
              <option value="finance">finance</option>
              <option value="sales">sales</option>
              <option value="manager">manager</option>
            </select>
          </div>
        </div>
      </div>

      <div className="chart-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>العملية / Action</th>
              <th>الوحدة / Module</th>
              <th>الوصف / Description</th>
              <th>المستخدم / User</th>
              <th>الدور / Role</th>
              <th>IP</th>
              <th>الوقت / Time</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td>
                  <span className={"badge " + (actionColors[e.action] || "badge-pending")}>
                    {actionIcons[e.action] || "📌"} {e.action}
                  </span>
                </td>
                <td>{e.module}</td>
                <td>{e.description}</td>
                <td><strong>{e.user}</strong></td>
                <td><span className={"badge badge-" + e.role}>{e.role}</span></td>
                <td style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>{e.ip}</td>
                <td style={{ whiteSpace: "nowrap" }}>{formatDate(e.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8" }}>
            لا توجد سجلات / No entries found
          </div>
        )}
      </div>
    </div>
  );
}
