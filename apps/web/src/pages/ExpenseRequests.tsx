import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Expense = {
  id: string; requestNo: string; title: string; description: string; department: string;
  requestedBy: string; requestedByName: string; amount: number;
  category: string; urgency: string; attachments: string; requestDate: string;
  approvedBy: string; approvedAt: string; rejectedBy: string; rejectedAt: string;
  rejectionReason: string; paidAt: string; status: string;
};
const empty: Omit<Expense, "id"> = {
  requestNo: "", title: "", description: "", department: "", requestedBy: "", requestedByName: "",
  amount: 0, category: "office", urgency: "medium", attachments: "", requestDate: "",
  approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "",
  rejectionReason: "", paidAt: "", status: "pending"
};

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

const catLabels: Record<string, string> = {
  office: "🏢 مكتبية / Office",
  travel: "✈️ سفر / Travel",
  maintenance: "🔧 صيانة / Maintenance",
  equipment: "💻 معدات / Equipment",
  training: "📚 تدريب / Training",
  marketing: "📢 تسويق / Marketing",
  other: "📎 أخرى / Other",
};

const urgencyLabels: Record<string, { label: string; color: string }> = {
  low: { label: "🟢 عادي / Low", color: "#22c55e" },
  medium: { label: "🟡 متوسط / Medium", color: "#eab308" },
  high: { label: "🟠 عاجل / High", color: "#f97316" },
  urgent: { label: "🔴 طارئ / Urgent", color: "#ef4444" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending_dept: { label: "⏳ بانتظار مدير القسم", color: "#eab308" },
  pending_finance: { label: "🏦 بانتظار المالية", color: "#f97316" },
  pending_ceo: { label: "👔 بانتظار المدير العام", color: "#8b5cf6" },
  pending: { label: "⏳ بانتظار الموافقة", color: "#eab308" },
  approved: { label: "✅ موافق عليه", color: "#22c55e" },
  rejected: { label: "❌ مرفوض", color: "#ef4444" },
  paid: { label: "💰 تم الصرف", color: "#3b82f6" },
  cancelled: { label: "🚫 ملغي", color: "#6b7280" },
};

export default function ExpenseRequests() {
  const { t } = useI18n();
  const { role, name: userName } = useAuth();
  const [items, setItems] = useState<Expense[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected" | "paid">("all");

  const canApprove = ["admin", "ceo", "manager", "hr_manager", "finance_manager", "sales_manager", "it_manager", "production_manager", "purchasing_manager", "admin_manager", "finance_assistant", "finance"].includes(role || "");

  const load = () => get<{ items: Expense[] }>("/expense-requests").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const filtered = tab === "all" ? items : items.filter(i => i.status === tab || (tab === "pending" && i.status.startsWith("pending")));

  const columns: Column<Expense>[] = [
    { key: "requestNo", header: "رقم الطلب / #" },
    { key: "title", header: "العنوان / Title" },
    { key: "department", header: "القسم / Dept" },
    { key: "requestedByName", header: "مقدم الطلب / Requester" },
    { key: "amount", header: "المبلغ / Amount", render: v => fmt(Number(v)) + " د.ع" },
    { key: "category", header: "الفئة / Category", render: v => <span className="badge badge-info">{catLabels[String(v)] || String(v)}</span> },
    { key: "urgency", header: "الأولوية / Urgency", render: v => {
      const u = urgencyLabels[String(v)] || { label: String(v), color: "#6366f1" };
      return <span className="badge" style={{ background: `${u.color}25`, color: u.color }}>{u.label}</span>;
    }},
    { key: "requestDate", header: "التاريخ / Date" },
    { key: "status", header: "الحالة / Status", render: v => {
      const s = statusLabels[String(v)] || { label: String(v), color: "#6366f1" };
      return <span className="badge" style={{ background: `${s.color}25`, color: s.color }}>{s.label}</span>;
    }},
    ...(canApprove ? ([{
      key: "id", header: "الإجراءات / Actions", render: (_v: unknown, row: Expense) => {
        const exp = row as any;
        if (exp.status.startsWith("pending")) {
          return (
            <div style={{ display: "flex", gap: 4, flexDirection: "column" }}>
              <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>
                {exp.status === "pending_dept" ? "📋 المرحلة 1: مدير القسم" : exp.status === "pending_finance" ? "🏦 المرحلة 2: المالية" : exp.status === "pending_ceo" ? "👔 المرحلة 3: المدير العام" : "⏳ معلق"}
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); handleApprove(exp.id); }}>✅ موافقة</button>
                <button className="btn btn-secondary" style={{ padding: "4px 12px", fontSize: 12, color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }} onClick={(e) => { e.stopPropagation(); setRejectModal(exp.id); setRejectReason(""); }}>❌ رفض</button>
              </div>
            </div>
          );
        }
        if (exp.status === "approved") {
          return <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: 12 }} onClick={(e) => { e.stopPropagation(); handlePay(exp.id); }}>💰 صرف</button>;
        }
        if (exp.status === "rejected") return <span style={{ fontSize: 11, color: "#ef4444" }}>❌ {exp.rejectedBy}: {exp.rejectionReason}</span>;
        if (exp.status === "paid") return <span style={{ fontSize: 11, color: "#3b82f6" }}>💰 تم الصرف {exp.paidAt}</span>;
        return null;
      }
    }] as Column<Expense>[]) : []),
  ];

  const handleApprove = async (id: string) => {
    await put(`/expense-requests/${id}/approve`, { role, approverName: userName });
    load();
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    await put(`/expense-requests/${rejectModal}/reject`, { role, approverName: userName, reason: rejectReason });
    setRejectModal(null);
    load();
  };

  const handlePay = async (id: string) => {
    await put(`/expense-requests/${id}/pay`, {});
    load();
  };

  const openAdd = () => { setForm({ ...empty, requestedBy: role || "", requestedByName: userName || "" }); setEditId(null); setShowModal(true); };
  const openEdit = (item: Expense) => { if (item.status === "pending") { setForm(item); setEditId(item.id); setShowModal(true); } };
  const handleDelete = async (item: Expense) => { if (confirm(t("confirmDelete"))) { await del(`/expense-requests/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, requestedBy: role, requestedByName: userName };
    if (editId) await put(`/expense-requests/${editId}`, data);
    else await post("/expense-requests", data);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: key === "amount" ? Number(val) : val
  }));

  const pendingCount = items.filter(i => i.status.startsWith("pending")).length;
  const pendingAmount = items.filter(i => i.status.startsWith("pending")).reduce((s, i) => s + i.amount, 0);
  const approvedAmount = items.filter(i => i.status === "approved").reduce((s, i) => s + i.amount, 0);
  const paidAmount = items.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>💸 طلبات الصرف والموافقات / Expense Requests & Approvals</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ طلب صرف جديد / New Expense</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(234,179,8,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#eab308" }}>{pendingCount}</div>
          <div style={{ opacity: 0.7 }}>⏳ بانتظار الموافقة / Pending</div>
          <div style={{ fontSize: 13, color: "#eab308", marginTop: 4 }}>{fmt(pendingAmount)} د.ع</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{items.filter(i => i.status === "approved").length}</div>
          <div style={{ opacity: 0.7 }}>✅ موافق عليها / Approved</div>
          <div style={{ fontSize: 13, color: "#22c55e", marginTop: 4 }}>{fmt(approvedAmount)} د.ع</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{items.filter(i => i.status === "paid").length}</div>
          <div style={{ opacity: 0.7 }}>💰 تم الصرف / Paid</div>
          <div style={{ fontSize: 13, color: "#3b82f6", marginTop: 4 }}>{fmt(paidAmount)} د.ع</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ef4444" }}>{items.filter(i => i.status === "rejected").length}</div>
          <div style={{ opacity: 0.7 }}>❌ مرفوض / Rejected</div>
        </div>
      </div>

      {/* Approval Notice */}
      {canApprove && pendingCount > 0 && (
        <div style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))", borderRadius: 12, padding: 16, marginBottom: 20, border: "1px solid rgba(234,179,8,0.25)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: "#eab308" }}>يوجد {pendingCount} طلب صرف بانتظار موافقتك بقيمة {fmt(pendingAmount)} د.ع</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>You have {pendingCount} pending expense(s) worth {fmt(pendingAmount)} IQD awaiting approval</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["all", "pending", "approved", "paid", "rejected"] as const).map(t => (
          <button key={t} className={"btn " + (tab === t ? "btn-primary" : "btn-secondary")} onClick={() => setTab(t)} style={{ fontSize: 13 }}>
            {t === "all" ? "📋 الكل" : t === "pending" ? `⏳ معلقة (${pendingCount})` : t === "approved" ? "✅ موافق" : t === "paid" ? "💰 مصروفة" : "❌ مرفوضة"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* New/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "تعديل طلب صرف / Edit Expense" : "طلب صرف جديد / New Expense Request"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="العنوان / Title" value={form.title} onChange={set("title")} required />
            <FormField label="القسم / Department" value={form.department} onChange={set("department")} required />
            <FormField label="المبلغ / Amount (IQD)" value={form.amount} type="number" onChange={set("amount")} required />
            <FormField label="الفئة / Category" value={form.category} type="select" onChange={set("category")} options={Object.entries(catLabels).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label="الأولوية / Urgency" value={form.urgency} type="select" onChange={set("urgency")} options={Object.entries(urgencyLabels).map(([v, u]) => ({ label: u.label, value: v }))} />
            <FormField label="المرفقات / Attachments" value={form.attachments} onChange={set("attachments")} />
            <FormField label="الوصف / Description" value={form.description} onChange={set("description")} />
            <div style={{ gridColumn: "1/-1", padding: 12, background: "rgba(59,130,246,0.08)", borderRadius: 8, fontSize: 13 }}>
              ℹ️ مسار الموافقة: مدير القسم ← مدير المالية ← المدير العام
              <br />
              Approval flow: Dept. Manager → Finance Manager → CEO
            </div>
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">📤 إرسال الطلب / Submit Request</button></div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title="❌ رفض طلب الصرف / Reject Expense" onClose={() => setRejectModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>سبب الرفض / Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض..."
              style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "inherit", fontSize: 14 }}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRejectModal(null)}>{t("cancel")}</button>
            <button type="button" className="btn btn-primary" style={{ background: "#ef4444" }} onClick={handleReject} disabled={!rejectReason.trim()}>❌ تأكيد الرفض / Confirm Reject</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
