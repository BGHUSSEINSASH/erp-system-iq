import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Customer = { id: string; name: string; email: string; phone: string; company: string; totalPurchases: number; status: string };
const empty: Omit<Customer, "id"> = { name: "", email: "", phone: "", company: "", totalPurchases: 0, status: "active" };

export default function Customers() {
  const { t } = useI18n();

  const columns: Column<Customer>[] = [
    { key: "name", header: t("name") },
    { key: "company", header: t("company") },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    { key: "totalPurchases", header: t("field.totalPurchases"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Customer[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Customer[] }>("/customers").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Customer) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Customer) => { if (confirm(t("confirmDelete"))) { await del("/customers/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/customers/" + editId, form);
    else await post("/customers", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "totalPurchases" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.customers")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("new")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.customers") : t("new") + " " + t("page.customers")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("company")} value={form.company} onChange={set("company")} />
            <FormField label={t("email")} value={form.email} type="email" onChange={set("email")} />
            <FormField label={t("phone")} value={form.phone} onChange={set("phone")} />
            <FormField label={t("field.totalPurchases")} value={form.totalPurchases} type="number" onChange={set("totalPurchases")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("inactive"),value:"inactive"}]} />
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
