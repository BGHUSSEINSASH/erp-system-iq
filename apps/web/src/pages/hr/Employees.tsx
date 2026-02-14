import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: string;
};

const empty: Omit<Employee, "id"> = { name: "", email: "", phone: "", department: "", position: "", salary: 0, hireDate: "", status: "active" };

export default function Employees() {
  const { t } = useI18n();
  const columns: Column<Employee>[] = [
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    { key: "department", header: t("field.department") },
    { key: "position", header: t("field.position") },
    { key: "salary", header: t("field.salary"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "hireDate", header: t("field.hireDate") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Employee[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Employee[] }>("/employees").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Employee) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Employee) => { if (confirm(t("confirmDelete"))) { await del(`/employees/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/employees/${editId}`, form);
    else await post("/employees", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "salary" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.employees")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.employees")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.employees") : t("new") + " " + t("page.employees")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.fullName")} value={form.name} onChange={set("name")} required />
            <FormField label={t("email")} value={form.email} type="email" onChange={set("email")} required />
            <FormField label={t("phone")} value={form.phone} onChange={set("phone")} />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label={t("field.position")} value={form.position} onChange={set("position")} />
            <FormField label={t("field.salary")} value={form.salary} type="number" onChange={set("salary")} />
            <FormField label={t("field.hireDate")} value={form.hireDate} type="date" onChange={set("hireDate")} />
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
