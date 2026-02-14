import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Dept = { id: string; name: string; manager: string; employeeCount: number };
const empty: Omit<Dept, "id"> = { name: "", manager: "", employeeCount: 0 };

export default function Departments() {
  const { t } = useI18n();
  const columns: Column<Dept>[] = [
    { key: "name", header: t("field.department") },
    { key: "manager", header: t("field.manager") },
    { key: "employeeCount", header: t("field.employeeCount") },
  ];
  const [items, setItems] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Dept[] }>("/departments").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Dept) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Dept) => { if (confirm(t("confirmDelete"))) { await del(`/departments/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/departments/${editId}`, form);
    else await post("/departments", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "employeeCount" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.departments")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.departments")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.departments") : t("new") + " " + t("page.departments")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("field.manager")} value={form.manager} onChange={set("manager")} />
            <FormField label={t("field.employeeCount")} value={form.employeeCount} type="number" onChange={set("employeeCount")} />
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
