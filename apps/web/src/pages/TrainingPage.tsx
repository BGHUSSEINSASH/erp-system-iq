import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Training = { id: string; title: string; category: string; trainer: string; department: string; startDate: string; endDate: string; duration: string; maxParticipants: number; enrolled: number; location: string; cost: number; status: string; description: string };
const empty: Omit<Training, "id"> = { title: "", category: "technical", trainer: "", department: "", startDate: "", endDate: "", duration: "", maxParticipants: 20, enrolled: 0, location: "", cost: 0, status: "upcoming", description: "" };

const catLabels: Record<string, string> = {
  technical: "💻 تقني", management: "👔 إداري", safety: "🦺 سلامة",
  "soft-skills": "🤝 مهارات ناعمة", compliance: "📋 التزام", certification: "🎓 شهادات",
};

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function TrainingPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Training[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Training[] }>("/training").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const columns: Column<Training>[] = [
    { key: "title", header: "العنوان / Title" },
    { key: "category", header: t("category"), render: v => <span className="badge badge-info">{catLabels[String(v)] || String(v)}</span> },
    { key: "trainer", header: "المدرب / Trainer" },
    { key: "department", header: t("field.department") },
    { key: "startDate", header: t("field.startDate") },
    { key: "duration", header: "المدة / Duration" },
    { key: "enrolled", header: "المسجلين / Enrolled", render: (v, row) => `${v} / ${(row as Training).maxParticipants}` },
    { key: "location", header: t("location") },
    { key: "cost", header: "التكلفة / Cost", render: v => fmt(Number(v)) + " د.ع" },
    { key: "status", header: t("status"), render: v => {
      const colors: Record<string, string> = { upcoming: "#3b82f6", "in-progress": "#eab308", completed: "#22c55e", cancelled: "#ef4444" };
      return <span className="badge" style={{ background: `${colors[String(v)] || "#6366f1"}30`, color: colors[String(v)] || "#6366f1" }}>{String(v)}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Training) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Training) => { if (confirm(t("confirmDelete"))) { await del(`/training/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/training/${editId}`, form);
    else await post("/training", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["maxParticipants", "enrolled", "cost"].includes(key) ? Number(val) : val
  }));

  const totalCost = items.reduce((s, i) => s + i.cost, 0);
  const totalEnrolled = items.reduce((s, i) => s + i.enrolled, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>📚 نظام التدريب والتطوير / Training & Development</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ برنامج جديد / New Program</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{items.filter(i => i.status === "upcoming").length}</div>
          <div style={{ opacity: 0.7 }}>📅 قادمة / Upcoming</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{totalEnrolled}</div>
          <div style={{ opacity: 0.7 }}>👥 إجمالي المسجلين / Total Enrolled</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#a855f7" }}>{fmt(totalCost)} د.ع</div>
          <div style={{ opacity: 0.7 }}>💰 إجمالي التكلفة / Total Cost</div>
        </div>
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? "تعديل برنامج / Edit Program" : "برنامج جديد / New Program"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="العنوان / Title" value={form.title} onChange={set("title")} required />
            <FormField label={t("category")} value={form.category} type="select" onChange={set("category")} options={Object.entries(catLabels).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label="المدرب / Trainer" value={form.trainer} onChange={set("trainer")} />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label={t("field.startDate")} value={form.startDate} type="date" onChange={set("startDate")} required />
            <FormField label={t("field.endDate")} value={form.endDate} type="date" onChange={set("endDate")} />
            <FormField label="المدة / Duration" value={form.duration} onChange={set("duration")} />
            <FormField label="الحد الأقصى / Max Participants" value={form.maxParticipants} type="number" onChange={set("maxParticipants")} />
            <FormField label="المسجلين / Enrolled" value={form.enrolled} type="number" onChange={set("enrolled")} />
            <FormField label={t("location")} value={form.location} onChange={set("location")} />
            <FormField label="التكلفة / Cost" value={form.cost} type="number" onChange={set("cost")} />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{ label: "قادم / Upcoming", value: "upcoming" }, { label: "قيد التنفيذ / In Progress", value: "in-progress" }, { label: "مكتمل / Completed", value: "completed" }, { label: "ملغي / Cancelled", value: "cancelled" }]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
