import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type PO = { id: string; poNumber: string; vendorName: string; date: string; total: number; status: string };
const empty: Omit<PO, "id"> = { poNumber: "", vendorName: "", date: "", total: 0, status: "pending" };

export default function PurchaseOrders() {
  const { t } = useI18n();

  const columns: Column<PO>[] = [
    { key: "poNumber", header: t("field.poNumber") },
    { key: "vendorName", header: t("field.vendor") },
    { key: "date", header: t("date") },
    { key: "total", header: t("total"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<PO[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: PO[] }>("/purchase-orders").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: PO) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: PO) => { if (confirm(t("confirmDelete"))) { await del("/purchase-orders/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/purchase-orders/" + editId, form);
    else await post("/purchase-orders", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "total" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.purchaseOrders")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("new")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.purchaseOrders") : t("new") + " " + t("page.purchaseOrders")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.poNumber")} value={form.poNumber} onChange={set("poNumber")} required />
            <FormField label={t("field.vendor")} value={form.vendorName} onChange={set("vendorName")} required />
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} />
            <FormField label={t("total")} value={form.total} type="number" onChange={set("total")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("pending"),value:"pending"},{label:t("approved"),value:"approved"},{label:t("received"),value:"received"},{label:t("cancelled"),value:"cancelled"}]} />
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
