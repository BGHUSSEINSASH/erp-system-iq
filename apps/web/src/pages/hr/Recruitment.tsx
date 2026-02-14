import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type RR = { id: string; position: string; department: string; requestedBy: string; date: string; vacancies: number; urgency: string; status: string; description: string; requirements: string; salary: string; location: string };
type Dept = { id: string; name: string };

const empty: Omit<RR, "id"> = { position: "", department: "", requestedBy: "", date: new Date().toISOString().slice(0, 10), vacancies: 1, urgency: "medium", status: "open", description: "", requirements: "", salary: "", location: "" };

const urgencyLabels: Record<string, { label: string; color: string; icon: string }> = {
  low: { label: "منخفضة / Low", color: "#22c55e", icon: "🟢" },
  medium: { label: "متوسطة / Medium", color: "#f59e0b", icon: "🟡" },
  high: { label: "عالية / High", color: "#ef4444", icon: "🔴" },
};

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  open: { label: "مفتوح / Open", color: "#3b82f6", icon: "📂" },
  interviewing: { label: "مقابلات / Interviewing", color: "#8b5cf6", icon: "🎙️" },
  filled: { label: "تم التعيين / Filled", color: "#22c55e", icon: "✅" },
  cancelled: { label: "ملغي / Cancelled", color: "#ef4444", icon: "❌" },
};

export default function Recruitment() {
  const { t } = useI18n();
  const [items, setItems] = useState<RR[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<RR | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () => get<{ items: RR[] }>("/recruitment").then(r => setItems(r.items));
  const loadDepts = () => get<{ items: Dept[] }>("/departments").then(r => setDepartments(r.items));
  useEffect(() => { load(); loadDepts(); }, []);

  const filtered = filterStatus === "all" ? items : items.filter(i => i.status === filterStatus);
  const totalVacancies = items.reduce((s, i) => s + (i.vacancies || 0), 0);
  const openCount = items.filter(i => i.status === "open").length;

  const columns: Column<RR>[] = [
    { key: "position", header: "💼 " + t("field.position"), render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "department", header: "🏢 " + t("field.department") },
    { key: "requestedBy", header: "👤 " + t("field.requestedBy") },
    { key: "vacancies", header: "📊 الشواغر" },
    { key: "urgency", header: "⚡ الأولوية", render: v => {
      const u = urgencyLabels[String(v)];
      return u ? <span className="badge" style={{ background: `${u.color}20`, color: u.color }}>{u.icon} {u.label}</span> : String(v);
    }},
    { key: "status", header: "الحالة", render: v => {
      const s = statusLabels[String(v)];
      return s ? <span className="badge" style={{ background: `${s.color}20`, color: s.color }}>{s.icon} {s.label}</span> : String(v);
    }},
    { key: "date", header: "📅 التاريخ" },
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: RR) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: RR) => { if (confirm(t("confirmDelete"))) { await del("/recruitment/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/recruitment/" + editId, form);
    else await post("/recruitment", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: key === "vacancies" ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير التوظيف / Recruitment Report",
      columns: [
        { key: "position", header: "الوظيفة" }, { key: "department", header: "القسم" },
        { key: "vacancies", header: "الشواغر" },
        { key: "urgency", header: "الأولوية", render: v => urgencyLabels[String(v)]?.label || String(v) },
        { key: "status", header: "الحالة", render: v => statusLabels[String(v)]?.label || String(v) },
        { key: "date", header: "التاريخ" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي الشواغر", value: totalVacancies },
        { label: "مفتوحة", value: openCount },
        { label: "تم التعيين", value: items.filter(i => i.status === "filled").length },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.recruitment")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ طلب توظيف / New Position</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "📋", label: "إجمالي الطلبات / Total", value: items.length, color: "#6366f1" },
          { icon: "📂", label: "مفتوحة / Open", value: openCount, color: "#3b82f6" },
          { icon: "📊", label: "إجمالي الشواغر / Vacancies", value: totalVacancies, color: "#f59e0b" },
          { icon: "✅", label: "تم التعيين / Filled", value: items.filter(i => i.status === "filled").length, color: "#22c55e" },
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
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {["all", ...Object.keys(statusLabels)].map(s => (
          <button key={s} className={"btn " + (filterStatus === s ? "btn-primary" : "btn-secondary")} onClick={() => setFilterStatus(s)} style={{ fontSize: 13 }}>
            {s === "all" ? "📋 الكل" : `${statusLabels[s].icon} ${statusLabels[s].label}`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"📋 تفاصيل الوظيفة — " + detail.position} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>💼 الوظيفة:</strong> {detail.position}</div>
            <div><strong>🏢 القسم:</strong> {detail.department}</div>
            <div><strong>👤 طالب التوظيف:</strong> {detail.requestedBy}</div>
            <div><strong>📊 عدد الشواغر:</strong> {detail.vacancies}</div>
            <div><strong>⚡ الأولوية:</strong> {urgencyLabels[detail.urgency]?.icon} {urgencyLabels[detail.urgency]?.label}</div>
            <div><strong>📋 الحالة:</strong> {statusLabels[detail.status]?.icon} {statusLabels[detail.status]?.label}</div>
            <div><strong>📅 التاريخ:</strong> {detail.date}</div>
            {detail.salary && <div><strong>💰 الراتب:</strong> {detail.salary}</div>}
            {detail.location && <div><strong>📍 الموقع:</strong> {detail.location}</div>}
            {detail.description && <div style={{ gridColumn: "1/-1" }}><strong>📝 الوصف:</strong> {detail.description}</div>}
            {detail.requirements && <div style={{ gridColumn: "1/-1" }}><strong>📋 المتطلبات:</strong> {detail.requirements}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل طلب توظيف" : "➕ طلب توظيف جديد / New Position"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="💼 المسمى الوظيفي / Position" value={form.position} onChange={set("position")} required />
            <FormField label="🏢 القسم / Department" value={form.department} type="select" onChange={set("department")} required
              options={departments.map(d => ({ label: d.name, value: d.name }))} />
            <FormField label="👤 طالب التوظيف / Requested By" value={form.requestedBy} onChange={set("requestedBy")} />
            <FormField label="📊 عدد الشواغر / Vacancies" value={form.vacancies} type="number" onChange={set("vacancies")} />
            <FormField label="📅 التاريخ / Date" value={form.date} type="date" onChange={set("date")} />
            <FormField label="⚡ الأولوية / Urgency" value={form.urgency} type="select" onChange={set("urgency")}
              options={Object.entries(urgencyLabels).map(([k, v]) => ({ label: `${v.icon} ${v.label}`, value: k }))} />
            <FormField label="📋 الحالة / Status" value={form.status} type="select" onChange={set("status")}
              options={Object.entries(statusLabels).map(([k, v]) => ({ label: `${v.icon} ${v.label}`, value: k }))} />
            <FormField label="💰 الراتب / Salary Range" value={form.salary} onChange={set("salary")} placeholder="مثال: 500,000 - 1,000,000 د.ع" />
            <FormField label="📍 الموقع / Location" value={form.location} onChange={set("location")} placeholder="بغداد / Baghdad" />
            <FormField label="📝 وصف الوظيفة / Description" value={form.description} type="textarea" onChange={set("description")} />
            <FormField label="📋 المتطلبات / Requirements" value={form.requirements} type="textarea" onChange={set("requirements")} />
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