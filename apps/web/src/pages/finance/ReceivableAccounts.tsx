import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type RA = { id: string; customerName: string; invoiceNumber: string; amount: number; dueDate: string; status: string; description: string };
const empty: Omit<RA, "id"> = { customerName: "", invoiceNumber: "", amount: 0, dueDate: "", status: "pending", description: "" };

export default function ReceivableAccounts() {
  const { t } = useI18n();
  const nav = useNavigate();
  const columns: Column<RA>[] = [
    { key: "customerName", header: t("field.customer") },
    { key: "invoiceNumber", header: t("field.invoiceNo") },
    { key: "amount", header: t("amount"), render: (v) => <strong>{Number(v).toLocaleString() + " د.ع"}</strong> },
    { key: "dueDate", header: t("field.dueDate") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];
  const [items, setItems] = useState<RA[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: RA[] }>("/receivable-accounts").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: RA) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: RA) => { if (confirm(t("confirmDelete"))) { await del("/receivable-accounts/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/receivable-accounts/" + editId, form);
    else await post("/receivable-accounts", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "amount" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.receivableAccounts")}</h2><div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.receivableAccounts")}</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 طلب سلفة</button></div></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.receivableAccounts") : t("new") + " " + t("page.receivableAccounts")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.customer")} value={form.customerName} onChange={set("customerName")} required />
            <FormField label={t("field.invoiceNo")} value={form.invoiceNumber} onChange={set("invoiceNumber")} />
            <FormField label={t("amount")} value={form.amount} type="number" onChange={set("amount")} />
            <FormField label={t("field.dueDate")} value={form.dueDate} type="date" onChange={set("dueDate")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("pending"),value:"pending"},{label:t("paid"),value:"received"},{label:t("overdue"),value:"overdue"}]} />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
