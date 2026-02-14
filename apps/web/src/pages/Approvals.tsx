import { useEffect, useState } from "react";
import { get, put } from "../api";

interface Approval {
  id: string;
  type: string;
  referenceId: string;
  title: string;
  titleAr: string;
  requestedBy: string;
  requestedByName: string;
  amount?: number;
  description: string;
  status: string;
  approver: string;
  approverName: string;
  comments: string;
  createdAt: string;
  resolvedAt?: string;
}

var typeIcons: Record<string, string> = {
  leave: "🏖️", purchase: "🛒", invoice: "🧾", expense: "💸", recruitment: "👥",
};

function fmt(n: number) { return n.toLocaleString() + " د.ع"; }

export default function Approvals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState("pending");
  const [selected, setSelected] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  function load() {
    var url = "/approvals";
    if (filter !== "all") url += "?status=" + filter;
    get<{ data: Approval[]; pendingCount: number }>(url).then((r) => {
      setApprovals(r.data);
      setPendingCount(r.pendingCount);
    });
  }

  useEffect(() => { load(); }, [filter]);

  function handleApprove(id: string) {
    put("/approvals/" + id + "/approve", { comments: comment || "تمت الموافقة / Approved" }).then(() => {
      setSelected(null);
      setComment("");
      load();
    });
  }

  function handleReject(id: string) {
    put("/approvals/" + id + "/reject", { comments: comment || "تم الرفض / Rejected" }).then(() => {
      setSelected(null);
      setComment("");
      load();
    });
  }

  function getBadge(status: string) {
    if (status === "approved") return "badge badge-approved";
    if (status === "rejected") return "badge badge-rejected";
    return "badge badge-pending";
  }

  function getTypeBadge(type: string) {
    var labels: Record<string, string> = { leave: "إجازة", purchase: "شراء", invoice: "فاتورة", expense: "مصروف", recruitment: "توظيف" };
    return labels[type] || type;
  }

  var tabs = [
    { id: "pending", label: "معلق / Pending" },
    { id: "approved", label: "موافق / Approved" },
    { id: "rejected", label: "مرفوض / Rejected" },
    { id: "all", label: "الكل / All" },
  ];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>✅ نظام الموافقات / Approvals</h2>
        <span className="badge badge-pending" style={{ fontSize: "0.9rem", padding: "6px 14px" }}>
          {pendingCount} بانتظار الموافقة / pending
        </span>
      </div>

      <div className="report-tabs" style={{ marginBottom: "20px" }}>
        {tabs.map((t) => (
          <button key={t.id} className={"report-tab " + (filter === t.id ? "active" : "")} onClick={() => setFilter(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="approvals-grid">
        {approvals.length === 0 ? (
          <div className="chart-card" style={{ textAlign: "center", padding: "40px", gridColumn: "1 / -1" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>✅</div>
            <p style={{ color: "#94a3b8" }}>لا توجد طلبات / No requests</p>
          </div>
        ) : (
          approvals.map((a) => (
            <div key={a.id} className={"approval-card " + (selected?.id === a.id ? "selected" : "")} onClick={() => setSelected(a)}>
              <div className="approval-card-header">
                <span className="approval-type-icon">{typeIcons[a.type] || "📋"}</span>
                <span className={getBadge(a.status)}>{a.status}</span>
              </div>
              <div className="approval-card-title">{a.titleAr}</div>
              <div className="approval-card-meta">
                <div>النوع: {getTypeBadge(a.type)}</div>
                <div>مقدم من: {a.requestedByName}</div>
                {a.amount && <div>المبلغ: {fmt(a.amount)}</div>}
              </div>
              <div className="approval-card-date">
                {new Date(a.createdAt).toLocaleDateString("ar-IQ")}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <div className="approval-detail chart-card animate-in" style={{ marginTop: "24px" }}>
          <h3>{typeIcons[selected.type]} {selected.titleAr}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", margin: "16px 0" }}>
            <div><strong>النوع / Type:</strong> {getTypeBadge(selected.type)}</div>
            <div><strong>الحالة / Status:</strong> <span className={getBadge(selected.status)}>{selected.status}</span></div>
            <div><strong>مقدم من / By:</strong> {selected.requestedByName}</div>
            <div><strong>الموافق / Approver:</strong> {selected.approverName}</div>
            {selected.amount && <div><strong>المبلغ / Amount:</strong> {fmt(selected.amount)}</div>}
            <div><strong>التاريخ / Date:</strong> {new Date(selected.createdAt).toLocaleString("ar-IQ")}</div>
          </div>
          <div style={{ margin: "12px 0" }}>
            <strong>الوصف / Description:</strong>
            <p style={{ marginTop: "4px", color: "#475569" }}>{selected.description}</p>
          </div>
          {selected.comments && (
            <div style={{ margin: "12px 0", padding: "12px", background: "#f1f5f9", borderRadius: "8px" }}>
              <strong>التعليق / Comment:</strong> {selected.comments}
            </div>
          )}

          {selected.status === "pending" && (
            <div style={{ marginTop: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label>تعليق / Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }}
                  placeholder="أضف تعليق (اختياري)..."
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="btn btn-primary" onClick={() => handleApprove(selected.id)}>
                  ✅ موافقة / Approve
                </button>
                <button className="btn" style={{ background: "#ef4444", color: "white" }} onClick={() => handleReject(selected.id)}>
                  ❌ رفض / Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
