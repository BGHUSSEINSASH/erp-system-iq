import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Proj = { id: string; name: string; code: string; department: string; manager: string; startDate: string; endDate: string; budget: number; spent: number; progress: number; priority: string; status: string; description: string; milestones: string };
const empty: Omit<Proj, "id"> = { name: "", code: "", department: "", manager: "", startDate: "", endDate: "", budget: 0, spent: 0, progress: 0, priority: "medium", status: "planning", description: "", milestones: "" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function ProjectsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Proj[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"table" | "gantt">("table");

  const load = () => get<{ items: Proj[] }>("/projects").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const columns: Column<Proj>[] = [
    { key: "code", header: "الرمز / Code" },
    { key: "name", header: t("name") },
    { key: "department", header: t("field.department") },
    { key: "manager", header: "المدير / Manager" },
    { key: "budget", header: "الميزانية / Budget", render: v => fmt(Number(v)) },
    { key: "spent", header: "المصروف / Spent", render: v => fmt(Number(v)) },
    { key: "progress", header: "التقدم / Progress", render: (v: unknown) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.1)", borderRadius: 6, height: 8, minWidth: 60 }}>
          <div style={{ width: `${v}%`, height: "100%", background: Number(v) >= 80 ? "#22c55e" : Number(v) >= 50 ? "#eab308" : "#3b82f6", borderRadius: 6 }} />
        </div>
        <span style={{ fontSize: 12 }}>{String(v)}%</span>
      </div>
    )},
    { key: "priority", header: t("priority"), render: (v: unknown) => <span className={"badge badge-" + v}>{String(v)}</span> },
    { key: "status", header: t("status"), render: (v: unknown) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Proj) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Proj) => { if (confirm(t("confirmDelete"))) { await del(`/projects/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/projects/${editId}`, form);
    else await post("/projects", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["budget", "spent", "progress"].includes(key) ? Number(val) : val
  }));

  // Simple Gantt chart
  const ganttStart = items.length ? new Date(Math.min(...items.map(p => new Date(p.startDate).getTime()))) : new Date();
  const ganttEnd = items.length ? new Date(Math.max(...items.map(p => new Date(p.endDate).getTime()))) : new Date();
  const ganttRange = ganttEnd.getTime() - ganttStart.getTime() || 1;

  return (
    <div className="page">
      <div className="page-header">
        <h2>🏗️ إدارة المشاريع / Project Management</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"btn " + (view === "table" ? "btn-primary" : "btn-secondary")} onClick={() => setView("table")}>📋 جدول</button>
          <button className={"btn " + (view === "gantt" ? "btn-primary" : "btn-secondary")} onClick={() => setView("gantt")}>📊 Gantt</button>
          <button className="btn btn-primary" onClick={openAdd}>+ مشروع جديد</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "قيد التنفيذ / In Progress", count: items.filter(i => i.status === "in-progress").length, color: "#3b82f6" },
          { label: "مكتمل / Completed", count: items.filter(i => i.status === "completed").length, color: "#22c55e" },
          { label: "تخطيط / Planning", count: items.filter(i => i.status === "planning").length, color: "#eab308" },
          { label: "إجمالي الميزانية / Total Budget", count: fmt(items.reduce((s, i) => s + i.budget, 0)), color: "#a855f7" },
        ].map((s, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`, borderRadius: 12, padding: 16, border: `1px solid ${s.color}30`, textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {view === "table" ? (
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      ) : (
        /* Gantt Chart View */
        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)", overflowX: "auto" }}>
          <h3 style={{ marginBottom: 16 }}>📊 مخطط جانت / Gantt Chart</h3>
          {items.map((p, i) => {
            const start = new Date(p.startDate).getTime();
            const end = new Date(p.endDate).getTime();
            const left = ((start - ganttStart.getTime()) / ganttRange) * 100;
            const width = ((end - start) / ganttRange) * 100;
            const colors: Record<string, string> = { "in-progress": "#3b82f6", completed: "#22c55e", planning: "#eab308", "on-hold": "#f97316", cancelled: "#ef4444" };
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                <div style={{ width: 200, flexShrink: 0, fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ flex: 1, height: 28, background: "rgba(255,255,255,0.05)", borderRadius: 6, position: "relative" }}>
                  <div style={{
                    position: "absolute", left: `${left}%`, width: `${Math.max(width, 2)}%`,
                    height: "100%", background: colors[p.status] || "#6366f1", borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff",
                  }}>
                    {p.progress}%
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", marginTop: 8 }}>
            <div style={{ width: 200 }} />
            <div style={{ flex: 1, display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.5 }}>
              <span>{ganttStart.toLocaleDateString("ar-IQ")}</span>
              <span>{ganttEnd.toLocaleDateString("ar-IQ")}</span>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={editId ? "تعديل مشروع / Edit Project" : "مشروع جديد / New Project"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label="الرمز / Code" value={form.code} onChange={set("code")} required />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label="مدير المشروع / Manager" value={form.manager} onChange={set("manager")} />
            <FormField label={t("field.startDate")} value={form.startDate} type="date" onChange={set("startDate")} required />
            <FormField label={t("field.endDate")} value={form.endDate} type="date" onChange={set("endDate")} required />
            <FormField label="الميزانية / Budget" value={form.budget} type="number" onChange={set("budget")} />
            <FormField label="المصروف / Spent" value={form.spent} type="number" onChange={set("spent")} />
            <FormField label="التقدم % / Progress" value={form.progress} type="number" onChange={set("progress")} />
            <FormField label={t("priority")} value={form.priority} type="select" onChange={set("priority")} options={[{ label: t("low"), value: "low" }, { label: t("medium"), value: "medium" }, { label: t("high"), value: "high" }, { label: t("critical"), value: "critical" }]} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{ label: "تخطيط / Planning", value: "planning" }, { label: "قيد التنفيذ / In Progress", value: "in-progress" }, { label: "معلق / On Hold", value: "on-hold" }, { label: "مكتمل / Completed", value: "completed" }, { label: "ملغي / Cancelled", value: "cancelled" }]} />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
