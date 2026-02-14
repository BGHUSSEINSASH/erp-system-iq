import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { useAuth } from "../context/AuthContext";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { generatePDFReport } from "../utils/pdf";

type Loan = {
  id: string; employeeId: string; employeeName: string; department: string;
  loanAmount: number; monthlyDeduction: number; totalPaid: number; remaining: number;
  installments: number; paidInstallments: number; startDate: string; endDate: string;
  reason: string; status: string; approvedBy: string; approvedAt: string;
  rejectedBy: string; rejectedAt: string; rejectionReason: string;
  requestedBy: string; requestDate: string;
};
type Emp = { id: string; name: string; department: string };
type Dept = { id: string; name: string };

const empty: Omit<Loan, "id"> = {
  employeeId: "", employeeName: "", department: "", loanAmount: 0, monthlyDeduction: 0,
  totalPaid: 0, remaining: 0, installments: 10, paidInstallments: 0,
  startDate: "", endDate: "", reason: "", status: "pending", approvedBy: "",
  approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "",
  requestedBy: "", requestDate: new Date().toISOString().slice(0, 10)
};

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function EmployeeLoans() {
  const { t } = useI18n();
  const { role, name: userName } = useAuth();
  const [items, setItems] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Loan | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "active" | "rejected">("all");

  const canApprove = ["admin", "ceo", "manager", "hr_manager", "finance_manager", "sales_manager", "it_manager", "production_manager", "purchasing_manager", "admin_manager", "finance_assistant", "finance"].includes(role || "");

  const load = () => get<{ items: Loan[] }>("/employee-loans").then(r => setItems(r.items));
  const loadEmps = () => get<{ items: Emp[] }>("/employees").then(r => setEmployees(r.items));
  const loadDepts = () => get<{ items: Dept[] }>("/departments").then(r => setDepartments(r.items));
  useEffect(() => { load(); loadEmps(); loadDepts(); }, []);

  const filtered = tab === "all" ? items : items.filter(i => i.status === tab || (tab === "pending" && i.status.startsWith("pending")));
  const totalActive = items.filter(i => i.status === "active").reduce((s, i) => s + i.remaining, 0);
  const totalPending = items.filter(i => i.status.startsWith("pending")).length;

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending_dept: { label: "⏳ بانتظار مدير القسم", color: "#eab308" },
    pending_finance: { label: "🏦 بانتظار المالية", color: "#f97316" },
    pending_ceo: { label: "👔 بانتظار المدير العام", color: "#8b5cf6" },
    pending: { label: "⏳ بانتظار الموافقة", color: "#eab308" },
    active: { label: "✅ موافق عليه", color: "#22c55e" },
    completed: { label: "🏁 مكتمل", color: "#3b82f6" },
    rejected: { label: "❌ مرفوض", color: "#ef4444" },
  };

  const columns: Column<Loan>[] = [
    { key: "employeeName", header: "👤 الموظف", render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "department", header: "🏢 القسم" },
    { key: "loanAmount", header: "💰 المبلغ", render: v => fmt(Number(v)) + " د.ع" },
    { key: "installments", header: "📊 الأقساط" },
    { key: "monthlyDeduction", header: "📅 الاستقطاع", render: v => fmt(Number(v)) + " د.ع" },
    { key: "remaining", header: "📥 المتبقي", render: v => <span style={{ color: Number(v) > 0 ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>{fmt(Number(v))} د.ع</span> },
    { key: "requestDate", header: "📅 التاريخ" },
    { key: "status", header: "الحالة", render: v => {
      const s = statusLabels[String(v)] || { label: String(v), color: "#6366f1" };
      return <span className="badge" style={{ background: `${s.color}25`, color: s.color }}>{s.label}</span>;
    }},
    ...(canApprove ? [{
      key: "id" as string, header: "الإجراءات", render: (_v: unknown, row: Loan) => {
        const loan = row as any;
        if (loan.status === "active") return <span style={{ fontSize: 11, color: "#22c55e" }}>✅ {loan.approvedBy}</span>;
        if (loan.status === "rejected") return <span style={{ fontSize: 11, color: "#ef4444" }}>❌ {loan.rejectedBy}</span>;
        if (!loan.status.startsWith("pending")) return null;
        return (
          <div style={{ display: "flex", gap: 4 }}>
            <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={(e) => { e.stopPropagation(); handleApprove(loan.id); }}>✅ موافقة</button>
            <button className="btn btn-secondary" style={{ padding: "4px 10px", fontSize: 11, color: "#ef4444" }} onClick={(e) => { e.stopPropagation(); setRejectModal(loan.id); setRejectReason(""); }}>❌ رفض</button>
          </div>
        );
      }
    }] : []),
  ];

  const handleApprove = async (id: string) => {
    await put(`/employee-loans/${id}/approve`, { role, approverName: userName });
    load();
  };
  const handleReject = async () => {
    if (!rejectModal) return;
    await put(`/employee-loans/${rejectModal}/reject`, { role, approverName: userName, reason: rejectReason });
    setRejectModal(null); load();
  };

  const onEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) setForm(f => ({ ...f, employeeId: emp.id, employeeName: emp.name, department: emp.department }));
  };

  const openAdd = () => { setForm({ ...empty, requestedBy: role || "", requestDate: new Date().toISOString().slice(0, 10) }); setEditId(null); setShowModal(true); };
  const openEdit = (item: Loan) => { if (item.status === "pending" || item.status.startsWith("pending")) { setForm(item); setEditId(item.id); setShowModal(true); } };
  const handleDelete = async (item: Loan) => { if (confirm(t("confirmDelete"))) { await del(`/employee-loans/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = form.loanAmount - form.totalPaid;
    const data = { ...form, remaining, monthlyDeduction: Math.round(form.loanAmount / form.installments), requestedBy: role };
    if (editId) await put(`/employee-loans/${editId}`, data);
    else await post("/employee-loans", data);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["loanAmount", "monthlyDeduction", "totalPaid", "remaining", "installments", "paidInstallments"].includes(key) ? Number(val) : val
  }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير السلف / Loan Report",
      columns: [
        { key: "employeeName", header: "الموظف" }, { key: "department", header: "القسم" },
        { key: "loanAmount", header: "المبلغ", render: v => fmt(Number(v)) },
        { key: "installments", header: "الأقساط" },
        { key: "remaining", header: "المتبقي", render: v => fmt(Number(v)) },
        { key: "status", header: "الحالة", render: v => statusLabels[String(v)]?.label || String(v) },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "معلقة", value: totalPending },
        { label: "نشطة", value: items.filter(i => i.status === "active").length },
        { label: "إجمالي المتبقي", value: fmt(totalActive) + " د.ع" },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🏦 نظام السلف والموافقات / Loan Requests</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ طلب سلفة جديد</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "⏳", label: "بانتظار الموافقة / Pending", value: totalPending, color: "#eab308" },
          { icon: "✅", label: "سلف نشطة / Active", value: items.filter(i => i.status === "active").length, color: "#22c55e" },
          { icon: "💰", label: "إجمالي المتبقي / Remaining", value: fmt(totalActive) + " د.ع", color: "#ef4444" },
          { icon: "🏁", label: "مكتملة / Completed", value: items.filter(i => i.status === "completed").length, color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`, borderRadius: 14, padding: 20, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["all", "pending", "active", "rejected"] as const).map(tb => (
          <button key={tb} className={"btn " + (tab === tb ? "btn-primary" : "btn-secondary")} onClick={() => setTab(tb)} style={{ fontSize: 13 }}>
            {tb === "all" ? "📋 الكل" : tb === "pending" ? `⏳ معلقة (${totalPending})` : tb === "active" ? "✅ نشطة" : "❌ مرفوضة"}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail Modal */}
      {detail && (
        <Modal title={"📋 تفاصيل السلفة — " + detail.employeeName} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>👤 الموظف:</strong> {detail.employeeName}</div>
            <div><strong>🏢 القسم:</strong> {detail.department}</div>
            <div><strong>📅 تاريخ الطلب:</strong> {detail.requestDate}</div>
            <div><strong>📋 الحالة:</strong> {statusLabels[detail.status]?.label || detail.status}</div>
            <div style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 12 }} />
            <div><strong>💰 مبلغ السلفة:</strong> <span style={{ color: "#6366f1", fontSize: 18, fontWeight: 700 }}>{fmt(detail.loanAmount)} د.ع</span></div>
            <div><strong>📊 عدد الأقساط:</strong> {detail.installments}</div>
            <div><strong>📅 الاستقطاع الشهري:</strong> {fmt(detail.monthlyDeduction)} د.ع</div>
            <div><strong>✅ المسدد:</strong> <span style={{ color: "#22c55e" }}>{fmt(detail.totalPaid)} د.ع</span></div>
            <div><strong>📥 المتبقي:</strong> <span style={{ color: "#ef4444" }}>{fmt(detail.remaining)} د.ع</span></div>
            <div><strong>📊 الأقساط المدفوعة:</strong> {detail.paidInstallments} / {detail.installments}</div>
            {detail.startDate && <div><strong>📅 البداية:</strong> {detail.startDate}</div>}
            {detail.endDate && <div><strong>📅 النهاية:</strong> {detail.endDate}</div>}
            <div style={{ gridColumn: "1/-1" }}><strong>📝 السبب:</strong> {detail.reason || "—"}</div>
            {detail.approvedBy && <div style={{ gridColumn: "1/-1" }}><strong>✅ موافق من:</strong> {detail.approvedBy} ({detail.approvedAt})</div>}
            {detail.rejectedBy && <div style={{ gridColumn: "1/-1" }}><strong>❌ مرفوض من:</strong> {detail.rejectedBy}: {detail.rejectionReason}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل طلب سلفة" : "➕ طلب سلفة جديد / New Loan"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="👤 اختر الموظف / Select Employee" value={form.employeeId} type="select" onChange={onEmployeeSelect} required
              options={employees.map(e => ({ label: `${e.name} — ${e.department || ""}`, value: e.id }))} />
            <FormField label="🏢 القسم / Department" value={form.department} type="select" onChange={set("department")}
              options={departments.map(d => ({ label: d.name, value: d.name }))} />
            <FormField label="💰 مبلغ السلفة / Amount (IQD)" value={form.loanAmount} type="number" onChange={set("loanAmount")} required />
            <FormField label="📊 عدد الأقساط / Installments" value={form.installments} type="number" onChange={set("installments")} required />
            <FormField label="📅 تاريخ البدء / Start Date" value={form.startDate} type="date" onChange={set("startDate")} required />
            <FormField label="📅 تاريخ الانتهاء / End Date" value={form.endDate} type="date" onChange={set("endDate")} />
            <FormField label="📝 السبب / Reason" value={form.reason} type="textarea" onChange={set("reason")} required />
            <div style={{ gridColumn: "1/-1", padding: 14, background: "rgba(99,102,241,0.1)", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>📅 الاستقطاع الشهري المتوقع / Expected Monthly Deduction</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{form.installments > 0 ? fmt(Math.round(form.loanAmount / form.installments)) : 0} د.ع</div>
            </div>
            <div style={{ gridColumn: "1/-1", padding: 12, background: "rgba(59,130,246,0.08)", borderRadius: 8, fontSize: 13 }}>
              ℹ️ مسار الموافقة: مدير القسم ← مدير المالية ← المدير العام
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button type="submit" className="btn btn-primary">📤 إرسال الطلب</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal title="❌ رفض طلب السلفة / Reject Loan" onClose={() => setRejectModal(null)}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600 }}>سبب الرفض / Rejection Reason</label>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="اكتب سبب الرفض..."
              style={{ width: "100%", minHeight: 100, padding: 12, borderRadius: 8, background: "var(--card)", border: "1px solid var(--border)", color: "inherit", fontSize: 14 }} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setRejectModal(null)}>{t("cancel")}</button>
            <button type="button" className="btn btn-primary" style={{ background: "#ef4444" }} onClick={handleReject} disabled={!rejectReason.trim()}>❌ تأكيد الرفض</button>
          </div>
        </Modal>
      )}
    </div>
  );
}