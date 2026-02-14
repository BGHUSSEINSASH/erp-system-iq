import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type SE = { id: string; employeeName: string; department: string; evaluator: string; period: string; score: number; rating: string; comments: string; date: string; criteria: string };
type Emp = { id: string; name: string; department: string; position: string };

const empty: Omit<SE, "id"> = { employeeName: "", department: "", evaluator: "", period: "", score: 0, rating: "good", comments: "", date: new Date().toISOString().slice(0, 10), criteria: "" };

const ratingLabels: Record<string, { label: string; color: string; icon: string }> = {
  excellent: { label: "ممتاز / Excellent", color: "#22c55e", icon: "🌟" },
  good: { label: "جيد / Good", color: "#3b82f6", icon: "👍" },
  average: { label: "متوسط / Average", color: "#f59e0b", icon: "📊" },
  poor: { label: "ضعيف / Poor", color: "#ef4444", icon: "⚠️" },
};

export default function StaffEvaluation() {
  const { t } = useI18n();
  const [items, setItems] = useState<SE[]>([]);
  const [employees, setEmployees] = useState<Emp[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<SE | null>(null);
  const [filterRating, setFilterRating] = useState("all");

  const load = () => get<{ items: SE[] }>("/evaluations").then(r => setItems(r.items));
  const loadEmps = () => get<{ items: Emp[] }>("/employees").then(r => setEmployees(r.items));
  useEffect(() => { load(); loadEmps(); }, []);

  const filtered = filterRating === "all" ? items : items.filter(i => i.rating === filterRating);
  const avgScore = items.length > 0 ? Math.round(items.reduce((s, i) => s + (i.score || 0), 0) / items.length) : 0;

  const columns: Column<SE>[] = [
    { key: "employeeName", header: "👤 " + t("field.employee"), render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "department", header: "🏢 القسم" },
    { key: "evaluator", header: "👨‍💼 المقيّم" },
    { key: "period", header: "📅 الفترة" },
    { key: "score", header: "📊 النتيجة", render: v => {
      const s = Number(v);
      const color = s >= 90 ? "#22c55e" : s >= 70 ? "#3b82f6" : s >= 50 ? "#f59e0b" : "#ef4444";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 50, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${s}%`, height: "100%", borderRadius: 4, background: color }} />
          </div>
          <strong style={{ color }}>{s}%</strong>
        </div>
      );
    }},
    { key: "rating", header: "⭐ التقييم", render: v => {
      const r = ratingLabels[String(v)];
      return r ? <span className="badge" style={{ background: `${r.color}20`, color: r.color }}>{r.icon} {r.label}</span> : String(v);
    }},
    { key: "date", header: "📅 التاريخ" },
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: SE) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: SE) => { if (confirm(t("confirmDelete"))) { await del("/evaluations/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const rating = form.score >= 90 ? "excellent" : form.score >= 70 ? "good" : form.score >= 50 ? "average" : "poor";
    const payload = { ...form, rating };
    if (editId) await put("/evaluations/" + editId, payload);
    else await post("/evaluations", payload);
    setShowModal(false); load();
  };

  const onEmployeeSelect = (empName: string) => {
    const emp = employees.find(e => e.name === empName);
    if (emp) setForm(f => ({ ...f, employeeName: emp.name, department: emp.department || "" }));
    else setForm(f => ({ ...f, employeeName: empName }));
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: key === "score" ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير تقييم الموظفين / Staff Evaluation Report",
      columns: [
        { key: "employeeName", header: "الموظف" }, { key: "department", header: "القسم" },
        { key: "evaluator", header: "المقيّم" }, { key: "period", header: "الفترة" },
        { key: "score", header: "النتيجة" },
        { key: "rating", header: "التقييم", render: v => ratingLabels[String(v)]?.label || String(v) },
        { key: "date", header: "التاريخ" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي التقييمات", value: items.length },
        { label: "المتوسط العام", value: avgScore + "%" },
        { label: "ممتاز", value: items.filter(i => i.rating === "excellent").length },
        { label: "ضعيف", value: items.filter(i => i.rating === "poor").length },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.evaluations")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ تقييم جديد / New Evaluation</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "📋", label: "إجمالي التقييمات / Total", value: items.length, color: "#6366f1" },
          { icon: "📊", label: "المتوسط العام / Average", value: avgScore + "%", color: avgScore >= 70 ? "#22c55e" : "#f59e0b" },
          { icon: "🌟", label: "ممتاز / Excellent", value: items.filter(i => i.rating === "excellent").length, color: "#22c55e" },
          { icon: "⚠️", label: "ضعيف / Poor", value: items.filter(i => i.rating === "poor").length, color: "#ef4444" },
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
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", ...Object.keys(ratingLabels)].map(r => (
          <button key={r} className={"btn " + (filterRating === r ? "btn-primary" : "btn-secondary")} onClick={() => setFilterRating(r)} style={{ fontSize: 13 }}>
            {r === "all" ? "📋 الكل" : `${ratingLabels[r].icon} ${ratingLabels[r].label}`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"📋 تفاصيل التقييم — " + detail.employeeName} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>👤 الموظف:</strong> {detail.employeeName}</div>
            <div><strong>🏢 القسم:</strong> {detail.department || "—"}</div>
            <div><strong>👨‍💼 المقيّم:</strong> {detail.evaluator}</div>
            <div><strong>📅 الفترة:</strong> {detail.period}</div>
            <div><strong>📊 النتيجة:</strong> <span style={{ fontSize: 20, fontWeight: 800, color: detail.score >= 70 ? "#22c55e" : "#f59e0b" }}>{detail.score}%</span></div>
            <div><strong>⭐ التقييم:</strong> {ratingLabels[detail.rating]?.icon} {ratingLabels[detail.rating]?.label}</div>
            <div><strong>📅 التاريخ:</strong> {detail.date}</div>
            {detail.criteria && <div style={{ gridColumn: "1/-1" }}><strong>📝 المعايير:</strong> {detail.criteria}</div>}
            {detail.comments && <div style={{ gridColumn: "1/-1" }}><strong>💬 التعليقات:</strong> {detail.comments}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل تقييم" : "➕ تقييم جديد / New Evaluation"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="👤 الموظف / Employee" value={form.employeeName} type="select" onChange={onEmployeeSelect} required
              options={employees.map(e => ({ label: `${e.name} — ${e.department || ""} — ${e.position || ""}`, value: e.name }))} />
            <FormField label="🏢 القسم / Department" value={form.department} onChange={set("department")} disabled />
            <FormField label="👨‍💼 المقيّم / Evaluator" value={form.evaluator} onChange={set("evaluator")} required />
            <FormField label="📅 الفترة / Period" value={form.period} onChange={set("period")} placeholder="Q1 2026 / الربع الأول" />
            <FormField label="📊 النتيجة / Score (%)" value={form.score} type="number" onChange={set("score")} required />
            <FormField label="📅 التاريخ / Date" value={form.date} type="date" onChange={set("date")} />
            <div style={{ gridColumn: "1/-1", padding: 14, background: "rgba(99,102,241,0.1)", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>⭐ التقييم المتوقع / Expected Rating</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: form.score >= 90 ? "#22c55e" : form.score >= 70 ? "#3b82f6" : form.score >= 50 ? "#f59e0b" : "#ef4444" }}>
                {ratingLabels[form.score >= 90 ? "excellent" : form.score >= 70 ? "good" : form.score >= 50 ? "average" : "poor"]?.icon} {ratingLabels[form.score >= 90 ? "excellent" : form.score >= 70 ? "good" : form.score >= 50 ? "average" : "poor"]?.label}
              </div>
            </div>
            <FormField label="📝 المعايير / Criteria" value={form.criteria} type="textarea" onChange={set("criteria")} />
            <FormField label="💬 التعليقات / Comments" value={form.comments} type="textarea" onChange={set("comments")} />
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