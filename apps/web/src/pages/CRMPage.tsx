import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Contact = { id: string; name: string; company: string; email: string; phone: string; type: string; source: string; stage: string; dealValue: number; probability: number; assignedTo: string; lastContact: string; nextFollowUp: string; notes: string };
const empty: Omit<Contact, "id"> = { name: "", company: "", email: "", phone: "", type: "lead", source: "website", stage: "new", dealValue: 0, probability: 0, assignedTo: "", lastContact: "", nextFollowUp: "", notes: "" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

const stages = [
  { key: "new", label: "🆕 جديد", color: "#6366f1" },
  { key: "contacted", label: "📞 تم التواصل", color: "#3b82f6" },
  { key: "qualified", label: "✅ مؤهل", color: "#14b8a6" },
  { key: "proposal", label: "📝 عرض سعر", color: "#eab308" },
  { key: "negotiation", label: "🤝 تفاوض", color: "#f97316" },
  { key: "won", label: "🏆 فاز", color: "#22c55e" },
  { key: "lost", label: "❌ خسر", color: "#ef4444" },
];

export default function CRMPage() {
  const { t } = useI18n();
  const [items, setItems] = useState<Contact[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"table" | "pipeline">("pipeline");

  const load = () => get<{ items: Contact[] }>("/crm").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const columns: Column<Contact>[] = [
    { key: "name", header: t("name") },
    { key: "company", header: "الشركة / Company" },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    { key: "type", header: "النوع / Type" },
    { key: "dealValue", header: "قيمة الصفقة / Deal", render: v => fmt(Number(v)) + " د.ع" },
    { key: "probability", header: "الاحتمالية / Prob.", render: v => v + "%" },
    { key: "stage", header: "المرحلة / Stage", render: v => {
      const s = stages.find(st => st.key === v);
      return <span className="badge" style={{ background: `${s?.color || "#6366f1"}30`, color: s?.color || "#6366f1" }}>{s?.label || String(v)}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Contact) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Contact) => { if (confirm(t("confirmDelete"))) { await del(`/crm/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/crm/${editId}`, form);
    else await post("/crm", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["dealValue", "probability"].includes(key) ? Number(val) : val
  }));

  const totalPipeline = items.filter(i => !["won", "lost"].includes(i.stage)).reduce((s, i) => s + i.dealValue, 0);
  const wonDeals = items.filter(i => i.stage === "won");
  const wonTotal = wonDeals.reduce((s, i) => s + i.dealValue, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>🤝 نظام CRM متقدم / Advanced CRM</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={"btn " + (view === "pipeline" ? "btn-primary" : "btn-secondary")} onClick={() => setView("pipeline")}>📊 Pipeline</button>
          <button className={"btn " + (view === "table" ? "btn-primary" : "btn-secondary")} onClick={() => setView("table")}>📋 جدول</button>
          <button className="btn btn-primary" onClick={openAdd}>+ عميل جديد / New Contact</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(99,102,241,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>{items.length}</div>
          <div style={{ opacity: 0.7 }}>جهات الاتصال / Contacts</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>{fmt(totalPipeline)} د.ع</div>
          <div style={{ opacity: 0.7 }}>قيمة Pipeline</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>{fmt(wonTotal)} د.ع</div>
          <div style={{ opacity: 0.7 }}>الصفقات المربوحة / Won Deals</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.15), rgba(234,179,8,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(234,179,8,0.2)" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#eab308" }}>{items.length ? Math.round((wonDeals.length / items.length) * 100) : 0}%</div>
          <div style={{ opacity: 0.7 }}>معدل التحويل / Conversion</div>
        </div>
      </div>

      {view === "pipeline" ? (
        /* Pipeline View */
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 12, overflowX: "auto" }}>
          {stages.map(stage => {
            const stageItems = items.filter(i => i.stage === stage.key);
            const stageTotal = stageItems.reduce((s, i) => s + i.dealValue, 0);
            return (
              <div key={stage.key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 12, border: "1px solid rgba(255,255,255,0.08)", minWidth: 180 }}>
                <div style={{ textAlign: "center", marginBottom: 12, paddingBottom: 8, borderBottom: `2px solid ${stage.color}` }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{stage.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{stageItems.length} | {fmt(stageTotal)} د.ع</div>
                </div>
                {stageItems.map(item => (
                  <div key={item.id} onClick={() => openEdit(item)} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 10, marginBottom: 8, cursor: "pointer", borderRight: `3px solid ${stage.color}`, transition: "transform 0.15s" }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>{item.company}</div>
                    <div style={{ fontSize: 12, color: stage.color, marginTop: 4 }}>{fmt(item.dealValue)} د.ع</div>
                    <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>{item.assignedTo}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {showModal && (
        <Modal title={editId ? "تعديل جهة اتصال / Edit Contact" : "جهة اتصال جديدة / New Contact"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label="الشركة / Company" value={form.company} onChange={set("company")} />
            <FormField label={t("email")} value={form.email} onChange={set("email")} />
            <FormField label={t("phone")} value={form.phone} onChange={set("phone")} />
            <FormField label="النوع / Type" value={form.type} type="select" onChange={set("type")} options={[{ label: "عميل محتمل / Lead", value: "lead" }, { label: "عميل / Customer", value: "customer" }, { label: "شريك / Partner", value: "partner" }]} />
            <FormField label="المصدر / Source" value={form.source} type="select" onChange={set("source")} options={[{ label: "موقع / Website", value: "website" }, { label: "إحالة / Referral", value: "referral" }, { label: "معرض / Exhibition", value: "exhibition" }, { label: "إعلان / Advertising", value: "advertising" }, { label: "آخر / Other", value: "other" }]} />
            <FormField label="المرحلة / Stage" value={form.stage} type="select" onChange={set("stage")} options={stages.map(s => ({ label: s.label, value: s.key }))} />
            <FormField label="قيمة الصفقة / Deal Value" value={form.dealValue} type="number" onChange={set("dealValue")} />
            <FormField label="الاحتمالية % / Probability" value={form.probability} type="number" onChange={set("probability")} />
            <FormField label="المسؤول / Assigned To" value={form.assignedTo} onChange={set("assignedTo")} />
            <FormField label="آخر تواصل / Last Contact" value={form.lastContact} type="date" onChange={set("lastContact")} />
            <FormField label="المتابعة القادمة / Next Follow-up" value={form.nextFollowUp} type="date" onChange={set("nextFollowUp")} />
            <FormField label={t("notes")} value={form.notes} onChange={set("notes")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
