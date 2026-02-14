import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type FA = { id: string; name: string; assetCode: string; category: string; department: string; location: string; purchaseDate: string; purchaseCost: number; currentValue: number; depreciationRate: number; depreciationMethod: string; usefulLife: number; accumulatedDepreciation: number; status: string };
const empty: Omit<FA, "id"> = { name: "", assetCode: "", category: "other", department: "", location: "", purchaseDate: "", purchaseCost: 0, currentValue: 0, depreciationRate: 10, depreciationMethod: "straight-line", usefulLife: 10, accumulatedDepreciation: 0, status: "active" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

const catLabels: Record<string, string> = {
  buildings: "🏢 مباني", vehicles: "🚗 مركبات", machinery: "⚙️ آلات", furniture: "🪑 أثاث",
  computers: "💻 حواسيب", land: "🌍 أراضي", other: "📦 أخرى",
};

export default function FixedAssetsPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<FA[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: FA[] }>("/fixed-assets").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const totalCost = items.reduce((s, i) => s + i.purchaseCost, 0);
  const totalCurrent = items.reduce((s, i) => s + i.currentValue, 0);
  const totalDepr = items.reduce((s, i) => s + i.accumulatedDepreciation, 0);

  const columns: Column<FA>[] = [
    { key: "assetCode", header: "الرمز / Code" },
    { key: "name", header: t("name") },
    { key: "category", header: t("category"), render: v => catLabels[String(v)] || String(v) },
    { key: "department", header: t("field.department") },
    { key: "location", header: t("location") },
    { key: "purchaseCost", header: "تكلفة الشراء / Cost", render: v => fmt(Number(v)) },
    { key: "currentValue", header: "القيمة الحالية / Current", render: v => fmt(Number(v)) },
    { key: "accumulatedDepreciation", header: "الإهلاك / Depreciation", render: v => fmt(Number(v)) },
    { key: "depreciationRate", header: "% الإهلاك / Rate", render: v => v + "%" },
    { key: "status", header: t("status"), render: v => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: FA) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: FA) => { if (confirm(t("confirmDelete"))) { await del(`/fixed-assets/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/fixed-assets/${editId}`, form);
    else await post("/fixed-assets", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["purchaseCost", "currentValue", "depreciationRate", "usefulLife", "accumulatedDepreciation"].includes(key) ? Number(val) : val
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>🏗️ إدارة الأصول الثابتة / Fixed Assets Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ أصل جديد / New Asset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#3b82f6" }}>{items.length}</div>
          <div style={{ opacity: 0.7 }}>إجمالي الأصول / Total Assets</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>{fmt(totalCost)}</div>
          <div style={{ opacity: 0.7 }}>تكلفة الشراء / Purchase Cost</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(168,85,247,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#a855f7" }}>{fmt(totalCurrent)}</div>
          <div style={{ opacity: 0.7 }}>القيمة الحالية / Current Value</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(239,68,68,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{fmt(totalDepr)}</div>
          <div style={{ opacity: 0.7 }}>الإهلاك المتراكم / Accumulated Depr.</div>
        </div>
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? "تعديل أصل / Edit Asset" : "أصل جديد / New Asset"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label="رمز الأصل / Asset Code" value={form.assetCode} onChange={set("assetCode")} required />
            <FormField label={t("category")} value={form.category} type="select" onChange={set("category")} options={Object.entries(catLabels).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label={t("location")} value={form.location} onChange={set("location")} />
            <FormField label="تاريخ الشراء / Purchase Date" value={form.purchaseDate} type="date" onChange={set("purchaseDate")} />
            <FormField label="تكلفة الشراء / Purchase Cost" value={form.purchaseCost} type="number" onChange={set("purchaseCost")} />
            <FormField label="القيمة الحالية / Current Value" value={form.currentValue} type="number" onChange={set("currentValue")} />
            <FormField label="نسبة الإهلاك % / Rate" value={form.depreciationRate} type="number" onChange={set("depreciationRate")} />
            <FormField label="العمر الإنتاجي (سنة) / Useful Life" value={form.usefulLife} type="number" onChange={set("usefulLife")} />
            <FormField label="طريقة الإهلاك / Method" value={form.depreciationMethod} type="select" onChange={set("depreciationMethod")} options={[{ label: "خط مستقيم / Straight-line", value: "straight-line" }, { label: "القسط المتناقص / Declining", value: "declining-balance" }]} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{ label: t("active"), value: "active" }, { label: t("maintenance"), value: "maintenance" }, { label: "تم التخلص / Disposed", value: "disposed" }, { label: "محول / Transferred", value: "transferred" }]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
