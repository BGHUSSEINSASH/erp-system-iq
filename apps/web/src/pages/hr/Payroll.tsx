import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type PR = { id: string; employeeName: string; employeeId: string; department: string; month: string; basicSalary: number; allowances: number; deductions: number; netSalary: number; status: string; payDate: string; notes: string };
type Emp = { id: string; name: string; department: string; salary: number; position: string };

const empty: Omit<PR, "id"> = { employeeName: "", employeeId: "", department: "", month: new Date().toISOString().slice(0, 7), basicSalary: 0, allowances: 0, deductions: 0, netSalary: 0, status: "draft", payDate: "", notes: "" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function Payroll() {
  const { t } = useI18n();
  const [items, setItems] = useState<PR[]>([]);
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<PR | null>(null);
  const [filterMonth, setFilterMonth] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQ, setSearchQ] = useState("");

  const load = () => get<{ items: PR[] }>("/payroll").then(r => setItems(r.items));
  const loadEmps = () => get<{ items: Emp[] }>("/employees").then(r => setEmployees(r.items));
  useEffect(() => { load(); loadEmps(); }, []);

  const filtered = items.filter(i => {
    if (filterMonth && !i.month.includes(filterMonth)) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    if (searchQ && !i.employeeName.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const totalNet = filtered.reduce((s, i) => s + (i.netSalary || 0), 0);
  const totalBasic = filtered.reduce((s, i) => s + (i.basicSalary || 0), 0);
  const paidCount = filtered.filter(i => i.status === "paid").length;
  const draftCount = filtered.filter(i => i.status === "draft").length;

  const columns: Column<PR>[] = [
    { key: "employeeName", header: "👤 " + t("field.employee"), render: (v, row) => <button className="btn-link" onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "department", header: "🏢 القسم / Dept" },
    { key: "month", header: "📅 " + t("field.month") },
    { key: "basicSalary", header: "💵 الراتب الأساسي", render: v => fmt(Number(v)) + " د.ع" },
    { key: "allowances", header: "➕ البدلات", render: v => <span style={{ color: "#22c55e" }}>+{fmt(Number(v))}</span> },
    { key: "deductions", header: "➖ الخصومات", render: v => <span style={{ color: "#ef4444" }}>-{fmt(Number(v))}</span> },
    { key: "netSalary", header: "💰 الصافي / Net", render: v => <strong style={{ color: "#6366f1" }}>{fmt(Number(v))} د.ع</strong> },
    { key: "status", header: "الحالة / Status", render: v => {
      const colors: Record<string, string> = { draft: "#eab308", processed: "#3b82f6", paid: "#22c55e" };
      const labels: Record<string, string> = { draft: "📝 مسودة", processed: "⚙️ معالج", paid: "✅ مدفوع" };
      return <span className="badge" style={{ background: `${colors[String(v)] || "#6366f1"}20`, color: colors[String(v)] || "#6366f1" }}>{labels[String(v)] || String(v)}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: PR) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: PR) => { if (confirm(t("confirmDelete"))) { await del("/payroll/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const net = Number(form.basicSalary) + Number(form.allowances) - Number(form.deductions);
    const payload = { ...form, netSalary: net };
    if (editId) await put("/payroll/" + editId, payload);
    else await post("/payroll", payload);
    setShowModal(false); load();
  };

  const onEmployeeSelect = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      setForm(f => ({ ...f, employeeId: emp.id, employeeName: emp.name, department: emp.department, basicSalary: emp.salary || 0 }));
    }
  };

  const nums = ["basicSalary", "allowances", "deductions"];
  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: nums.includes(key) ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير الرواتب / Payroll Report",
      subtitle: filterMonth ? `الشهر: ${filterMonth}` : undefined,
      columns: [
        { key: "employeeName", header: "الموظف / Employee" },
        { key: "department", header: "القسم / Dept" },
        { key: "month", header: "الشهر / Month" },
        { key: "basicSalary", header: "الأساسي / Basic", render: v => fmt(Number(v)) },
        { key: "allowances", header: "البدلات / Allow.", render: v => fmt(Number(v)) },
        { key: "deductions", header: "الخصومات / Deduct.", render: v => fmt(Number(v)) },
        { key: "netSalary", header: "الصافي / Net", render: v => fmt(Number(v)) },
        { key: "status", header: "الحالة / Status" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي الصافي / Total Net", value: fmt(totalNet) + " د.ع" },
        { label: "مدفوعة / Paid", value: paidCount },
        { label: "مسودة / Draft", value: draftCount },
        { label: "إجمالي السجلات / Records", value: filtered.length },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.payroll")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ إضافة راتب / Add Salary</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 تصدير PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "💰", label: "إجمالي الصافي / Total Net", value: fmt(totalNet) + " د.ع", color: "#6366f1" },
          { icon: "💵", label: "إجمالي الأساسي / Total Basic", value: fmt(totalBasic) + " د.ع", color: "#22c55e" },
          { icon: "✅", label: "مدفوعة / Paid", value: paidCount, color: "#22c55e" },
          { icon: "📝", label: "مسودة / Draft", value: draftCount, color: "#eab308" },
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

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 بحث بالاسم / Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13, minWidth: 200 }} />
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }}>
          <option value="all">📋 الكل / All</option>
          <option value="draft">📝 مسودة / Draft</option>
          <option value="processed">⚙️ معالج / Processed</option>
          <option value="paid">✅ مدفوع / Paid</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail Panel */}
      {detail && (
        <Modal title={"📋 تفاصيل الراتب / Salary Details — " + detail.employeeName} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>👤 الموظف:</strong> {detail.employeeName}</div>
            <div><strong>🏢 القسم:</strong> {detail.department || "—"}</div>
            <div><strong>📅 الشهر:</strong> {detail.month}</div>
            <div><strong>📋 الحالة:</strong> {detail.status}</div>
            <div style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 12 }} />
            <div><strong>💵 الراتب الأساسي:</strong> <span style={{ color: "#6366f1" }}>{fmt(detail.basicSalary)} د.ع</span></div>
            <div><strong>➕ البدلات:</strong> <span style={{ color: "#22c55e" }}>+{fmt(detail.allowances)} د.ع</span></div>
            <div><strong>➖ الخصومات:</strong> <span style={{ color: "#ef4444" }}>-{fmt(detail.deductions)} د.ع</span></div>
            <div><strong>💰 صافي الراتب:</strong> <span style={{ fontSize: 18, fontWeight: 800, color: "#6366f1" }}>{fmt(detail.netSalary)} د.ع</span></div>
            {detail.payDate && <div><strong>📅 تاريخ الدفع:</strong> {detail.payDate}</div>}
            {detail.notes && <div style={{ gridColumn: "1/-1" }}><strong>📝 ملاحظات:</strong> {detail.notes}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل راتب / Edit Salary" : "➕ إضافة راتب جديد / New Salary"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="👤 اختر الموظف / Select Employee" value={form.employeeId} type="select" onChange={onEmployeeSelect} required
              options={employees.map(e => ({ label: `${e.name} — ${e.department || ""} — ${e.position || ""}`, value: e.id }))} />
            <FormField label="🏢 القسم / Department" value={form.department} onChange={set("department")} disabled />
            <FormField label="📅 الشهر / Month" value={form.month} type="month" onChange={set("month")} required />
            <FormField label="💵 الراتب الأساسي / Basic Salary (IQD)" value={form.basicSalary} type="number" onChange={set("basicSalary")} required />
            <FormField label="➕ البدلات / Allowances (IQD)" value={form.allowances} type="number" onChange={set("allowances")} />
            <FormField label="➖ الخصومات / Deductions (IQD)" value={form.deductions} type="number" onChange={set("deductions")} />
            <div style={{ gridColumn: "1/-1", padding: 14, background: "rgba(99,102,241,0.1)", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>💰 صافي الراتب المتوقع / Expected Net Salary</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{fmt(Number(form.basicSalary) + Number(form.allowances) - Number(form.deductions))} د.ع</div>
            </div>
            <FormField label="📅 تاريخ الدفع / Pay Date" value={form.payDate} type="date" onChange={set("payDate")} />
            <FormField label="الحالة / Status" value={form.status} type="select" onChange={set("status")} options={[{ label: "📝 مسودة / Draft", value: "draft" }, { label: "⚙️ معالج / Processed", value: "processed" }, { label: "✅ مدفوع / Paid", value: "paid" }]} />
            <FormField label="📝 ملاحظات / Notes" value={form.notes} type="textarea" onChange={set("notes")} />
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