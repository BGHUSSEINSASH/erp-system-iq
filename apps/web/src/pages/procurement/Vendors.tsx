import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Vendor = { id: string; name: string; email: string; phone: string; company: string; rating: number; status: string };
const empty: Omit<Vendor, "id"> = { name: "", email: "", phone: "", company: "", rating: 3, status: "active" };

export default function Vendors() {
  const { t } = useI18n();

  const columns: Column<Vendor>[] = [
    { key: "name", header: t("field.vendor") },
    { key: "company", header: t("company") },
    { key: "email", header: t("email") },
    { key: "phone", header: t("phone") },
    { key: "rating", header: t("category"), render: (v) => "★".repeat(Number(v)) + "☆".repeat(5 - Number(v)) },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Vendor[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Vendor[] }>("/vendors").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Vendor) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Vendor) => { if (confirm(t("confirmDelete"))) { await del("/vendors/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/vendors/" + editId, form);
    else await post("/vendors", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "rating" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.vendors")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("new")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.vendors") : t("new") + " " + t("page.vendors")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("company")} value={form.company} onChange={set("company")} />
            <FormField label={t("email")} value={form.email} type="email" onChange={set("email")} />
            <FormField label={t("phone")} value={form.phone} onChange={set("phone")} />
            <FormField label={t("category")} value={form.rating} type="number" onChange={set("rating")} />
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
