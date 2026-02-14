import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api";
import { useI18n } from "../../i18n";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type WO = { id: string; orderNo: string; product: string; quantity: number; startDate: string; dueDate: string; assignedTo: string; status: string };
const empty: Omit<WO, "id"> = { orderNo: "", product: "", quantity: 0, startDate: "", dueDate: "", assignedTo: "", status: "pending" };

export default function WorkOrders() {
  const { t } = useI18n();
  const columns: Column<WO>[] = [
    { key: "orderNo", header: t("field.orderNo") },
    { key: "product", header: t("field.product") },
    { key: "quantity", header: t("field.quantity") },
    { key: "startDate", header: t("field.startDate") },
    { key: "dueDate", header: t("field.dueDate") },
    { key: "assignedTo", header: t("assignee") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<WO[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: WO[] }>("/work-orders").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: WO) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: WO) => { if (confirm(t("confirmDelete"))) { await del("/work-orders/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/work-orders/" + editId, form);
    else await post("/work-orders", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "quantity" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.workOrders")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.workOrders")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.workOrders") : t("new") + " " + t("page.workOrders")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.orderNo")} value={form.orderNo} onChange={set("orderNo")} required />
            <FormField label={t("field.product")} value={form.product} onChange={set("product")} required />
            <FormField label={t("field.quantity")} value={form.quantity} type="number" onChange={set("quantity")} />
            <FormField label={t("field.startDate")} value={form.startDate} type="date" onChange={set("startDate")} />
            <FormField label={t("field.dueDate")} value={form.dueDate} type="date" onChange={set("dueDate")} />
            <FormField label={t("assignee")} value={form.assignedTo} onChange={set("assignedTo")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("pending"),value:"pending"},{label:t("inProgress"),value:"in-progress"},{label:t("completed"),value:"completed"},{label:t("cancelled"),value:"cancelled"}]} />
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
