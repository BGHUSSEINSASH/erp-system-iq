import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Tender = { id: string; tenderNo: string; title: string; description: string; department: string; estimatedBudget: number; publishDate: string; closingDate: string; bidsCount: number; winnerVendor: string; winnerAmount: number; status: string };
const empty: Omit<Tender, "id"> = { tenderNo: "", title: "", description: "", department: "", estimatedBudget: 0, publishDate: "", closingDate: "", bidsCount: 0, winnerVendor: "", winnerAmount: 0, status: "draft" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

export default function Tenders() {
  const { t } = useI18n();
  const [items, setItems] = useState<Tender[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Tender[] }>("/tenders").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const statusLabels: Record<string, string> = {
    draft: "📝 مسودة", published: "📢 منشور", evaluation: "🔍 تقييم",
    awarded: "🏆 ممنوح", cancelled: "❌ ملغي", closed: "✅ مغلق",
  };

  const columns: Column<Tender>[] = [
    { key: "tenderNo", header: "رقم المناقصة / #" },
    { key: "title", header: "العنوان / Title" },
    { key: "department", header: t("field.department") },
    { key: "estimatedBudget", header: "الميزانية التقديرية / Budget", render: (v: unknown) => fmt(Number(v)) + " د.ع" },
    { key: "publishDate", header: "تاريخ النشر / Published" },
    { key: "closingDate", header: "تاريخ الإغلاق / Closing" },
    { key: "bidsCount", header: "العروض / Bids" },
    { key: "winnerVendor", header: "الفائز / Winner", render: (v: unknown) => <>{v || "-"}</> },
    { key: "status", header: t("status"), render: (v: unknown) => <span className={"badge badge-" + v}>{statusLabels[String(v)] || String(v)}</span> },
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Tender) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Tender) => { if (confirm(t("confirmDelete"))) { await del(`/tenders/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/tenders/${editId}`, form);
    else await post("/tenders", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["estimatedBudget", "bidsCount", "winnerAmount"].includes(key) ? Number(val) : val
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 نظام المناقصات / Tenders Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ مناقصة جديدة / New Tender</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {["published", "evaluation", "awarded", "closed"].map(s => (
          <div key={s} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16, border: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{items.filter(i => i.status === s).length}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>{statusLabels[s]}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? "تعديل مناقصة / Edit Tender" : "مناقصة جديدة / New Tender"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="رقم المناقصة / Tender #" value={form.tenderNo} onChange={set("tenderNo")} required />
            <FormField label="العنوان / Title" value={form.title} onChange={set("title")} required />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label="الميزانية التقديرية / Budget" value={form.estimatedBudget} type="number" onChange={set("estimatedBudget")} />
            <FormField label="تاريخ النشر / Publish Date" value={form.publishDate} type="date" onChange={set("publishDate")} />
            <FormField label="تاريخ الإغلاق / Closing Date" value={form.closingDate} type="date" onChange={set("closingDate")} />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={Object.entries(statusLabels).map(([v, l]) => ({ label: l, value: v }))} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
