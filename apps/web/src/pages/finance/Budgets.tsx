import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { get, post, put, del } from "../../api";
import { useI18n } from "../../i18n";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type Budget = { id: string; department: string; category: string; allocated: number; spent: number; remaining: number; year: string; status: string; notes: string };
type Dept = { id: string; name: string };

const empty: Omit<Budget, "id"> = { department: "", category: "salaries", allocated: 0, spent: 0, remaining: 0, year: new Date().getFullYear().toString(), status: "active", notes: "" };

const catLabels: Record<string, string> = {
  salaries: "💵 رواتب / Salaries", equipment: "🔧 معدات / Equipment", advertising: "📢 إعلان / Advertising",
  maintenance: "🛠 صيانة / Maintenance", software: "💻 برمجيات / Software", travel: "✈️ سفر / Travel",
  training: "📚 تدريب / Training", other: "📁 أخرى / Other",
};

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function Budgets() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [items, setItems] = useState<Budget[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Budget | null>(null);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
  const [filterCat, setFilterCat] = useState("all");

  const load = () => get<{ items: Budget[] }>("/budgets").then(r => setItems(r.items));
  const loadDepts = () => get<{ items: Dept[] }>("/departments").then(r => setDepartments(r.items));
  useEffect(() => { load(); loadDepts(); }, []);

  const pct = (spent: number, allocated: number) => allocated > 0 ? Math.round((spent / allocated) * 100) : 0;

  const filtered = items.filter(i => {
    if (filterYear && i.year !== filterYear) return false;
    if (filterCat !== "all" && i.category !== filterCat) return false;
    return true;
  });

  const totalAllocated = filtered.reduce((s, i) => s + (i.allocated || 0), 0);
  const totalSpent = filtered.reduce((s, i) => s + (i.spent || 0), 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overbudgetCount = filtered.filter(i => pct(i.spent, i.allocated) >= 100).length;

  const columns: Column<Budget>[] = [
    { key: "department", header: "🏢 " + t("field.department"), render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "category", header: "📂 " + t("category"), render: v => catLabels[String(v)] || String(v) },
    { key: "allocated", header: "💰 المخصص / Allocated", render: v => fmt(Number(v)) + " د.ع" },
    { key: "spent", header: "📤 المصروف / Spent", render: v => fmt(Number(v)) + " د.ع" },
    { key: "remaining", header: "📥 المتبقي / Remaining", render: v => {
      const n = Number(v);
      return <span style={{ color: n < 0 ? "#ef4444" : "#22c55e", fontWeight: 700 }}>{fmt(n)} د.ع</span>;
    }},
    { key: "year", header: "📅 " + t("field.year") },
    { key: "status", header: "الحالة", render: (v, row) => {
      const p = pct((row as Budget).spent, (row as Budget).allocated);
      const color = p >= 100 ? "#ef4444" : p >= 80 ? "#f59e0b" : "#22c55e";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 60, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.min(p, 100)}%`, height: "100%", borderRadius: 4, background: color }} />
          </div>
          <span style={{ color, fontWeight: 700, fontSize: 13 }}>{p}%</span>
        </div>
      );
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Budget) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Budget) => { if (confirm(t("confirmDelete"))) { await del("/budgets/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const remaining = Number(form.allocated) - Number(form.spent);
    const status = remaining < 0 ? "overbudget" : "active";
    const payload = { ...form, remaining, status };
    if (editId) await put("/budgets/" + editId, payload);
    else await post("/budgets", payload);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: ["allocated", "spent", "remaining"].includes(key) ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير الميزانيات / Budget Report",
      subtitle: `السنة: ${filterYear}`,
      columns: [
        { key: "department", header: "القسم / Dept" },
        { key: "category", header: "الفئة / Category", render: v => catLabels[String(v)] || String(v) },
        { key: "allocated", header: "المخصص", render: v => fmt(Number(v)) },
        { key: "spent", header: "المصروف", render: v => fmt(Number(v)) },
        { key: "remaining", header: "المتبقي", render: v => fmt(Number(v)) },
        { key: "year", header: "السنة" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي المخصص", value: fmt(totalAllocated) + " د.ع" },
        { label: "إجمالي المصروف", value: fmt(totalSpent) + " د.ع" },
        { label: "إجمالي المتبقي", value: fmt(totalRemaining) + " د.ع" },
        { label: "تجاوز الميزانية", value: overbudgetCount },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.budgets")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ ميزانية جديدة / New Budget</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 تصدير PDF</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "💰", label: "إجمالي المخصص / Allocated", value: fmt(totalAllocated) + " د.ع", color: "#6366f1" },
          { icon: "📤", label: "إجمالي المصروف / Spent", value: fmt(totalSpent) + " د.ع", color: "#f59e0b" },
          { icon: "📥", label: "المتبقي / Remaining", value: fmt(totalRemaining) + " د.ع", color: totalRemaining >= 0 ? "#22c55e" : "#ef4444" },
          { icon: "⚠️", label: "تجاوز الميزانية / Overbudget", value: overbudgetCount, color: "#ef4444" },
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
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }}>
          {[2024, 2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13 }}>
          <option value="all">📂 كل الفئات / All Categories</option>
          {Object.entries(catLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"📋 تفاصيل الميزانية — " + detail.department} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>🏢 القسم:</strong> {detail.department}</div>
            <div><strong>📂 الفئة:</strong> {catLabels[detail.category] || detail.category}</div>
            <div><strong>📅 السنة:</strong> {detail.year}</div>
            <div><strong>📋 الحالة:</strong> {detail.status}</div>
            <div style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 12 }} />
            <div><strong>💰 المخصص:</strong> <span style={{ color: "#6366f1", fontSize: 18, fontWeight: 700 }}>{fmt(detail.allocated)} د.ع</span></div>
            <div><strong>📤 المصروف:</strong> <span style={{ color: "#f59e0b", fontSize: 18, fontWeight: 700 }}>{fmt(detail.spent)} د.ع</span></div>
            <div><strong>📥 المتبقي:</strong> <span style={{ color: detail.remaining >= 0 ? "#22c55e" : "#ef4444", fontSize: 18, fontWeight: 700 }}>{fmt(detail.remaining)} د.ع</span></div>
            <div><strong>📊 نسبة الاستهلاك:</strong> <span style={{ fontWeight: 700 }}>{pct(detail.spent, detail.allocated)}%</span></div>
            {detail.notes && <div style={{ gridColumn: "1/-1" }}><strong>📝 ملاحظات:</strong> {detail.notes}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل ميزانية / Edit Budget" : "➕ ميزانية جديدة / New Budget"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="🏢 القسم / Department" value={form.department} type="select" onChange={set("department")} required
              options={departments.map(d => ({ label: d.name, value: d.name }))} />
            <FormField label="📂 الفئة / Category" value={form.category} type="select" onChange={set("category")} options={Object.entries(catLabels).map(([k, v]) => ({ label: v, value: k }))} />
            <FormField label="💰 المبلغ المخصص / Allocated (IQD)" value={form.allocated} type="number" onChange={set("allocated")} required />
            <FormField label="📤 المصروف / Spent (IQD)" value={form.spent} type="number" onChange={set("spent")} />
            <FormField label="📅 السنة / Year" value={form.year} onChange={set("year")} required />
            <div style={{ gridColumn: "1/-1", padding: 14, background: "rgba(99,102,241,0.1)", borderRadius: 10, textAlign: "center" }}>
              <div style={{ fontSize: 13, opacity: 0.7 }}>📥 المتبقي المتوقع / Expected Remaining</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: (Number(form.allocated) - Number(form.spent)) >= 0 ? "#22c55e" : "#ef4444" }}>
                {fmt(Number(form.allocated) - Number(form.spent))} د.ع
              </div>
            </div>
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