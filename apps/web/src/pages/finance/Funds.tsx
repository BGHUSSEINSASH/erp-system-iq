import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";
import { generatePDFReport } from "../../utils/pdf";

type Fund = { id: string; name: string; type: string; balance: number; currency: string; lastUpdated: string; status: string; accountId: string; accountName: string; notes: string };
type Account = { id: string; code: string; name: string; type: string; balance: number };

const empty: Omit<Fund, "id"> = { name: "", type: "cash", balance: 0, currency: "IQD", lastUpdated: new Date().toISOString().slice(0, 10), status: "active", accountId: "", accountName: "", notes: "" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
  cash: { label: "نقدي / Cash", icon: "💵", color: "#22c55e" },
  bank: { label: "بنكي / Bank", icon: "🏦", color: "#3b82f6" },
  investment: { label: "استثماري / Investment", icon: "📈", color: "#8b5cf6" },
};

export default function Funds() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [items, setItems] = useState<Fund[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Fund | null>(null);
  const [filterType, setFilterType] = useState("all");

  const load = () => get<{ items: Fund[] }>("/funds").then(r => setItems(r.items));
  const loadAccounts = () => get<{ items: Account[] }>("/accounts").then(r => setAccounts(r.items));
  useEffect(() => { load(); loadAccounts(); }, []);

  const filtered = filterType === "all" ? items : items.filter(i => i.type === filterType);
  const totalBalance = items.reduce((s, i) => s + (i.balance || 0), 0);
  const activeCount = items.filter(i => i.status === "active").length;

  const columns: Column<Fund>[] = [
    { key: "name", header: "🏦 " + t("field.fundName"), render: (v, row) => <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>{String(v)}</button> },
    { key: "type", header: "📂 النوع", render: v => {
      const tl = typeLabels[String(v)];
      return tl ? <span className="badge" style={{ background: `${tl.color}20`, color: tl.color }}>{tl.icon} {tl.label}</span> : String(v);
    }},
    { key: "accountName", header: "📋 الحساب المرتبط" },
    { key: "balance", header: "💰 الرصيد", render: v => <strong style={{ color: "#6366f1" }}>{fmt(Number(v))} د.ع</strong> },
    { key: "currency", header: "💱 العملة" },
    { key: "lastUpdated", header: "📅 آخر تحديث" },
    { key: "status", header: "الحالة", render: v => {
      const colors: Record<string, string> = { active: "#22c55e", frozen: "#f59e0b", closed: "#ef4444" };
      const labels: Record<string, string> = { active: "✅ نشط", frozen: "❄️ مجمد", closed: "🔒 مغلق" };
      return <span className="badge" style={{ background: `${colors[String(v)] || "#6366f1"}20`, color: colors[String(v)] || "#6366f1" }}>{labels[String(v)] || String(v)}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Fund) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Fund) => { if (confirm(t("confirmDelete"))) { await del("/funds/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, lastUpdated: new Date().toISOString().slice(0, 10) };
    if (editId) await put("/funds/" + editId, payload);
    else await post("/funds", payload);
    setShowModal(false); load();
  };

  const onAccountSelect = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (acc) setForm(f => ({ ...f, accountId: acc.id, accountName: `${acc.code} — ${acc.name}` }));
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: key === "balance" ? Number(val) : val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير الصناديق المالية / Funds Report",
      columns: [
        { key: "name", header: "الصندوق" },
        { key: "type", header: "النوع", render: v => typeLabels[String(v)]?.label || String(v) },
        { key: "accountName", header: "الحساب المرتبط" },
        { key: "balance", header: "الرصيد", render: v => fmt(Number(v)) + " د.ع" },
        { key: "currency", header: "العملة" },
        { key: "status", header: "الحالة" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي الرصيد", value: fmt(totalBalance) + " د.ع" },
        { label: "صناديق نشطة", value: activeCount },
        { label: "إجمالي الصناديق", value: items.length },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>{t("page.funds")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ صندوق جديد / New Fund</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 سلف</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "💰", label: "إجمالي الرصيد / Total", value: fmt(totalBalance) + " د.ع", color: "#6366f1" },
          { icon: "✅", label: "صناديق نشطة / Active", value: activeCount, color: "#22c55e" },
          { icon: "💵", label: "نقدي / Cash", value: items.filter(i => i.type === "cash").length, color: "#22c55e" },
          { icon: "🏦", label: "بنكي / Bank", value: items.filter(i => i.type === "bank").length, color: "#3b82f6" },
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
        {["all", ...Object.keys(typeLabels)].map(f => (
          <button key={f} className={"btn " + (filterType === f ? "btn-primary" : "btn-secondary")} onClick={() => setFilterType(f)} style={{ fontSize: 13 }}>
            {f === "all" ? "📋 الكل" : `${typeLabels[f].icon} ${typeLabels[f].label}`}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"🏦 تفاصيل الصندوق — " + detail.name} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>🏦 اسم الصندوق:</strong> {detail.name}</div>
            <div><strong>📂 النوع:</strong> {typeLabels[detail.type]?.icon} {typeLabels[detail.type]?.label}</div>
            <div><strong>📋 الحساب المرتبط:</strong> {detail.accountName || "—"}</div>
            <div><strong>💱 العملة:</strong> {detail.currency}</div>
            <div style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 12 }} />
            <div><strong>💰 الرصيد:</strong> <span style={{ fontSize: 24, fontWeight: 800, color: "#6366f1" }}>{fmt(detail.balance)} د.ع</span></div>
            <div><strong>📅 آخر تحديث:</strong> {detail.lastUpdated}</div>
            <div><strong>📋 الحالة:</strong> {detail.status}</div>
            {detail.notes && <div style={{ gridColumn: "1/-1" }}><strong>📝 ملاحظات:</strong> {detail.notes}</div>}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل صندوق" : "➕ صندوق جديد / New Fund"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="🏦 اسم الصندوق / Fund Name" value={form.name} onChange={set("name")} required />
            <FormField label="📂 النوع / Type" value={form.type} type="select" onChange={set("type")}
              options={Object.entries(typeLabels).map(([k, v]) => ({ label: `${v.icon} ${v.label}`, value: k }))} />
            <FormField label="📋 الحساب المرتبط / Linked Account" value={form.accountId} type="select" onChange={onAccountSelect}
              options={accounts.map(a => ({ label: `${a.code} — ${a.name} (${a.type})`, value: a.id }))} />
            <FormField label="💰 الرصيد / Balance (IQD)" value={form.balance} type="number" onChange={set("balance")} required />
            <FormField label="💱 العملة / Currency" value={form.currency} type="select" onChange={set("currency")}
              options={[{ label: "د.ع – دينار عراقي / IQD", value: "IQD" }, { label: "$ – دولار أمريكي / USD", value: "USD" }]} />
            <FormField label="📋 الحالة / Status" value={form.status} type="select" onChange={set("status")} options={[
              { label: "✅ نشط / Active", value: "active" },
              { label: "❄️ مجمد / Frozen", value: "frozen" },
              { label: "🔒 مغلق / Closed", value: "closed" },
            ]} />
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