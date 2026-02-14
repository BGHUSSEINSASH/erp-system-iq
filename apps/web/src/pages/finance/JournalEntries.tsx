import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type JE = { id: string; date: string; description: string; debit: number; credit: number; accountName: string; status: string };
const empty: Omit<JE, "id"> = { date: "", description: "", debit: 0, credit: 0, accountName: "", status: "draft" };

export default function JournalEntries() {
  const { t } = useI18n();
  const nav = useNavigate();
  const columns: Column<JE>[] = [
    { key: "date", header: t("date") },
    { key: "description", header: t("description") },
    { key: "accountName", header: t("field.account") },
    { key: "debit", header: t("field.debit"), render: (v) => Number(v) > 0 ? Number(v).toLocaleString() : "—" },
    { key: "credit", header: t("field.credit"), render: (v) => Number(v) > 0 ? Number(v).toLocaleString() : "—" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];
  const [items, setItems] = useState<JE[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: JE[] }>("/journal-entries").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: JE) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: JE) => { if (confirm(t("confirmDelete"))) { await del("/journal-entries/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/journal-entries/" + editId, form);
    else await post("/journal-entries", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: ["debit", "credit"].includes(key) ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.journalEntries")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.journalEntries")}</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 طلب سلفة</button>
        </div>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.journalEntries") : t("new") + " " + t("page.journalEntries")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} required />
            <FormField label={t("description")} value={form.description} onChange={set("description")} required />
            <FormField label={t("field.account")} value={form.accountName} onChange={set("accountName")} required />
            <FormField label={t("field.debit")} value={form.debit} type="number" onChange={set("debit")} />
            <FormField label={t("field.credit")} value={form.credit} type="number" onChange={set("credit")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("draft"),value:"draft"},{label:t("posted"),value:"posted"}]} />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button type="submit" className="btn btn-primary">{t("save")}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
