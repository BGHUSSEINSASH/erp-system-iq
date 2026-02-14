import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type PA = { id: string; vendorName: string; invoiceNumber: string; amount: number; dueDate: string; status: string; description: string };
const empty: Omit<PA, "id"> = { vendorName: "", invoiceNumber: "", amount: 0, dueDate: "", status: "pending", description: "" };

export default function PayableAccounts() {
  const { t } = useI18n();
  const nav = useNavigate();
  const columns: Column<PA>[] = [
    { key: "vendorName", header: t("field.vendor") },
    { key: "invoiceNumber", header: t("field.invoiceNo") },
    { key: "amount", header: t("amount"), render: (v) => <strong>{Number(v).toLocaleString() + " د.ع"}</strong> },
    { key: "dueDate", header: t("field.dueDate") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];
  const [items, setItems] = useState<PA[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: PA[] }>("/payable-accounts").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: PA) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: PA) => { if (confirm(t("confirmDelete"))) { await del("/payable-accounts/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/payable-accounts/" + editId, form);
    else await post("/payable-accounts", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "amount" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.payableAccounts")}</h2><div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.payableAccounts")}</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 طلب سلفة</button></div></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.payableAccounts") : t("new") + " " + t("page.payableAccounts")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.vendor")} value={form.vendorName} onChange={set("vendorName")} required />
            <FormField label={t("field.invoiceNo")} value={form.invoiceNumber} onChange={set("invoiceNumber")} />
            <FormField label={t("amount")} value={form.amount} type="number" onChange={set("amount")} />
            <FormField label={t("field.dueDate")} value={form.dueDate} type="date" onChange={set("dueDate")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("pending"),value:"pending"},{label:t("paid"),value:"paid"},{label:t("overdue"),value:"overdue"}]} />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
