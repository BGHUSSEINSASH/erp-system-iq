import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";

type EN = { id: string; to: string; toEmail: string; subject: string; body: string; type: string; status: string; sentAt: string; relatedId: string };

export default function EmailNotifications() {
  const { t } = useI18n();
  const [items, setItems] = useState<EN[]>([]);
  const [stats, setStats] = useState({ sent: 0, pending: 0, failed: 0 });

  const load = () => get<{ items: EN[] }>("/email-notifications").then((r) => {
    setItems(r.items);
    setStats({
      sent: r.items.filter(i => i.status === "sent").length,
      pending: r.items.filter(i => i.status === "pending").length,
      failed: r.items.filter(i => i.status === "failed").length,
    });
  });
  useEffect(() => { load(); }, []);

  const typeLabels: Record<string, string> = {
    "leave-approved": "✅ موافقة إجازة",
    "leave-rejected": "❌ رفض إجازة",
    "po-approved": "✅ موافقة شراء",
    "po-rejected": "❌ رفض شراء",
    "general": "📢 عام",
    "salary": "💵 رواتب",
    "training": "📚 تدريب",
  };

  const columns: Column<EN>[] = [
    { key: "to", header: "المستلم / To" },
    { key: "toEmail", header: "البريد / Email" },
    { key: "subject", header: "الموضوع / Subject" },
    { key: "type", header: "النوع / Type", render: (v) => <span className="badge badge-info">{typeLabels[String(v)] || String(v)}</span> },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{v === "sent" ? "✅ مرسل" : v === "pending" ? "⏳ قيد الانتظار" : "❌ فشل"}</span> },
    { key: "sentAt", header: "وقت الإرسال / Sent At", render: (v) => v ? new Date(String(v)).toLocaleString("ar-IQ") : "-" },
  ];

  const handleDelete = async (item: EN) => { if (confirm(t("confirmDelete"))) { await del(`/email-notifications/${item.id}`); load(); } };

  return (
    <div className="page">
      <div className="page-header">
        <h2>📧 إشعارات البريد الإلكتروني / Email Notifications</h2>
      </div>

      <div className="stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{stats.sent}</div>
          <div style={{ opacity: 0.7 }}>✅ مرسل / Sent</div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(234,179,8,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#eab308" }}>{stats.pending}</div>
          <div style={{ opacity: 0.7 }}>⏳ قيد الانتظار / Pending</div>
        </div>
        <div className="stat-card" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{stats.failed}</div>
          <div style={{ opacity: 0.7 }}>❌ فشل / Failed</div>
        </div>
      </div>

      <DataTable columns={columns} data={items} onDelete={handleDelete} />
    </div>
  );
}
