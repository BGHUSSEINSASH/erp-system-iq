import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Inv = { id: string; invoiceNo: string; customerName: string; date: string; dueDate: string; total: number; status: string };
const empty: Omit<Inv, "id"> = { invoiceNo: "", customerName: "", date: "", dueDate: "", total: 0, status: "unpaid" };

export default function Invoices() {
  const { t } = useI18n();

  const columns: Column<Inv>[] = [
    { key: "invoiceNo", header: t("field.invoiceNo") },
    { key: "customerName", header: t("field.customer") },
    { key: "date", header: t("date") },
    { key: "dueDate", header: t("field.dueDate") },
    { key: "total", header: t("total"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Inv[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Inv[] }>("/invoices").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Inv) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Inv) => { if (confirm(t("confirmDelete"))) { await del("/invoices/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/invoices/" + editId, form);
    else await post("/invoices", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "total" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.invoices")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("new")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.invoices") : t("new") + " " + t("page.invoices")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.invoiceNo")} value={form.invoiceNo} onChange={set("invoiceNo")} required />
            <FormField label={t("field.customer")} value={form.customerName} onChange={set("customerName")} required />
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} />
            <FormField label={t("field.dueDate")} value={form.dueDate} type="date" onChange={set("dueDate")} />
            <FormField label={t("total")} value={form.total} type="number" onChange={set("total")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("unpaid"),value:"unpaid"},{label:t("paid"),value:"paid"},{label:t("overdue"),value:"overdue"}]} />
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
