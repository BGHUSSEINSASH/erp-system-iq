import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { useAuth } from "../../context/AuthContext";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type LR = { id: string; employeeName: string; department: string; type: string; startDate: string; endDate: string; days: number; reason: string; status: string; approvedBy: string };
type Emp = { id: string; name: string; department: string };
type Dept = { id: string; name: string };

const empty: Omit<LR, "id"> = { employeeName: "", department: "", type: "annual", startDate: "", endDate: "", days: 1, reason: "", status: "pending", approvedBy: "" };

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  annual: { label: "سنوية / Annual", color: "#3b82f6", icon: "🌴" },
  sick: { label: "مرضية / Sick", color: "#ef4444", icon: "🏥" },
  personal: { label: "شخصية / Personal", color: "#8b5cf6", icon: "👤" },
  unpaid: { label: "بدون راتب / Unpaid", color: "#f59e0b", icon: "💸" },
  maternity: { label: "أمومة / Maternity", color: "#ec4899", icon: "👶" },
  emergency: { label: "طارئة / Emergency", color: "#ef4444", icon: "🚨" },
};

export default function LeaveRequests() {
  const { t } = useI18n();
  const { role } = useAuth();
  const isCeoOrAdmin = role === "ceo" || role === "admin" || role === "manager";

  const [items, setItems] = useState<LR[]>([]);
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<LR | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const load = () => get<{ items: LR[] }>("/leave-requests").then(r => setItems(r.items));
  const loadEmps = () => get<{ items: Emp[] }>("/employees").then(r => setEmployees(r.items));
  const loadDepts = () => get<{ items: Dept[] }>("/departments").then(r => setDepartments(r.items));
  useEffect(() => { load(); loadEmps(); loadDepts(); }, []);

  const filtered = items.filter(i => {
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (filterType !== "all" && i.type !== filterType) return false;
    return true;
  });

  const pendingCount = items.filter(i => i.status === "pending").length;
  const approvedCount = items.filter(i => i.status === "approved").length;
  const totalDays = items.filter(i => i.status === "approved").reduce((s, i) => s + (i.days || 0), 0);

  const statusColors: Record<string, { label: string; color: string }> = {
    pending: { label: "⏳ معلق / Pending", color: "#eab308" },
    approved: { label: "✅ موافق / Approved", color: "#22c55e" },
    rejected: { label: "❌ مرفوض / Rejected", color: "#ef4444" },
  };

  const columns: Column<LR>[] = [
    { key: "employeeName", header: "👤 " + t("field.employee"), render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "department", header: "🏢 القسم" },
    { key: "type", header: "📋 النوع", render: v => {
      const tl = typeLabels[String(v)];
      return tl ? <span className="badge" style={{ background: `${tl.color}20`, color: tl.color }}>{tl.icon} {tl.label}</span> : String(v);
    }},
    { key: "startDate", header: "📅 من / From" },
    { key: "endDate", header: "📅 إلى / To" },
    { key: "days", header: "📊 الأيام" },
    { key: "reason", header: "📝 السبب" },
    { key: "status", header: "الحالة", render: v => {
      const s = statusColors[String(v)] || { label: String(v), color: "#6366f1" };
      return <span className="badge" style={{ background: `${s.color}20`, color: s.color }}>{s.label}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: LR) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: LR) => { if (confirm(t("confirmDelete"))) { await del(`/leave-requests/${item.id}`); load(); } };

  const handleApprove = async (item: LR) => {
    await put(`/leave-requests/${item.id}`, { ...item, status: "approved", approvedBy: "المدير العام / CEO" });
    load();
  };
  const handleReject = async (item: LR) => {
    await put(`/leave-requests/${item.id}`, { ...item, status: "rejected", approvedBy: "المدير العام / CEO" });
    load();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/leave-requests/${editId}`, form);
    else await post("/leave-requests", form);
    setShowModal(false); load();
  };

  const onEmployeeSelect = (empName: string) => {
    const emp = employees.find(e => e.name === empName);
    if (emp) setForm(f => ({ ...f, employeeName: emp.name, department: emp.department }));
    else setForm(f => ({ ...f, employeeName: empName }));
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: key === "days" ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير طلبات الإجازة / Leave Requests Report",
      columns: [
        { key: "employeeName", header: "الموظف" }, { key: "department", header: "القسم" },
        { key: "type", header: "النوع", render: v => typeLabels[String(v)]?.label || String(v) },
        { key: "startDate", header: "من" }, { key: "endDate", header: "إلى" }, { key: "days", header: "الأيام" },
        { key: "status", header: "الحالة", render: v => statusColors[String(v)]?.label || String(v) },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "معلقة / Pending", value: pendingCount },
        { label: "موافق / Approved", value: approvedCount },
        { label: "إجمالي أيام الإجازات", value: totalDays },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.leaveRequests")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ طلب إجازة / New Leave</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "⏳", label: "معلقة / Pending", value: pendingCount, color: "#eab308" },
          { icon: "✅", label: "موافق / Approved", value: approvedCount, color: "#22c55e" },
          { icon: "❌", label: "مرفوض / Rejected", value: items.filter(i => i.status === "rejected").length, color: "#ef4444" },
          { icon: "📊", label: "إجمالي أيام الإجازة", value: totalDays + " يوم", color: "#3b82f6" },
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

      {/* Approval Panel */}
      {isCeoOrAdmin && pendingCount > 0 && (
        <div style={{ marginBottom: 20, padding: 16, background: "linear-gradient(135deg, rgba(234,179,8,0.12), rgba(234,179,8,0.04))", borderRadius: 14, border: "1px solid rgba(234,179,8,0.25)" }}>
          <h3 style={{ margin: "0 0 12px", color: "#f59e0b", fontSize: 16 }}>⚠️ طلبات بانتظار الموافقة ({pendingCount})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {items.filter(i => i.status === "pending").map(item => (
              <div key={item.id} style={{ padding: 12, background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)", minWidth: 280 }}>
                <div style={{ fontWeight: 600 }}>👤 {item.employeeName} — {item.department}</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{typeLabels[item.type]?.icon} {typeLabels[item.type]?.label} | {item.startDate} → {item.endDate} ({item.days} أيام)</div>
                <div style={{ fontSize: 13, opacity: 0.7 }}>{item.reason}</div>
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => handleApprove(item)}>✅ موافقة</button>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 12px", color: "#ef4444" }} onClick={() => handleReject(item)}>❌ رفض</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }}>
          <option value="all">📋 كل الحالات</option>
          <option value="pending">⏳ معلق</option>
          <option value="approved">✅ موافق</option>
          <option value="rejected">❌ مرفوض</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }}>
          <option value="all">📂 كل الأنواع</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"📋 تفاصيل الإجازة — " + detail.employeeName} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>👤 الموظف:</strong> {detail.employeeName}</div>
            <div><strong>🏢 القسم:</strong> {detail.department}</div>
            <div><strong>📋 النوع:</strong> {typeLabels[detail.type]?.icon} {typeLabels[detail.type]?.label}</div>
            <div><strong>📊 عدد الأيام:</strong> {detail.days}</div>
            <div><strong>📅 من:</strong> {detail.startDate}</div>
            <div><strong>📅 إلى:</strong> {detail.endDate}</div>
            <div style={{ gridColumn: "1/-1" }}><strong>📝 السبب:</strong> {detail.reason || "—"}</div>
            <div><strong>📋 الحالة:</strong> {statusColors[detail.status]?.label || detail.status}</div>
            {detail.approvedBy && <div><strong>✅ القرار من:</strong> {detail.approvedBy}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل طلب إجازة" : "➕ طلب إجازة جديد / New Leave"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="👤 الموظف / Employee" value={form.employeeName} type="select" onChange={onEmployeeSelect} required
              options={employees.map(e => ({ label: `${e.name} — ${e.department || ""}`, value: e.name }))} />
            <FormField label="🏢 القسم / Department" value={form.department} type="select" onChange={set("department")}
              options={departments.map(d => ({ label: d.name, value: d.name }))} />
            <FormField label="📋 النوع / Type" value={form.type} type="select" onChange={set("type")}
              options={Object.entries(typeLabels).map(([k, v]) => ({ label: `${v.icon} ${v.label}`, value: k }))} />
            <FormField label="📅 من / Start Date" value={form.startDate} type="date" onChange={set("startDate")} required />
            <FormField label="📅 إلى / End Date" value={form.endDate} type="date" onChange={set("endDate")} required />
            <FormField label="📊 عدد الأيام / Days" value={form.days} type="number" onChange={set("days")} />
            <FormField label="📝 السبب / Reason" value={form.reason} type="textarea" onChange={set("reason")} />
            {isCeoOrAdmin && (
              <FormField label="📋 الحالة / Status" value={form.status} type="select" onChange={set("status")} options={[
                { label: "⏳ معلق / Pending", value: "pending" },
                { label: "✅ موافق / Approved", value: "approved" },
                { label: "❌ مرفوض / Rejected", value: "rejected" },
              ]} />
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button type="submit" className="btn btn-primary">💾 {t("save")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}