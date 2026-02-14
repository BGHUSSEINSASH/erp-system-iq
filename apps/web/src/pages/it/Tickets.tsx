import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Ticket = { id: string; title: string; description: string; priority: string; status: string; assignee: string; requesterName: string; requesterDepartment: string; createdAt: string };
const empty: Omit<Ticket, "id"> = { title: "", description: "", priority: "medium", status: "open", assignee: "", requesterName: "", requesterDepartment: "", createdAt: "" };

export default function Tickets() {
  const { t } = useI18n();

  const columns: Column<Ticket>[] = [
    { key: "title", header: t("field.title") },
    { key: "requesterName", header: "مقدم الطلب / Requester" },
    { key: "requesterDepartment", header: "القسم / Department" },
    { key: "priority", header: t("priority"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
    { key: "assignee", header: "المنفذ / Assigned To" },
    { key: "createdAt", header: t("date"), render: (v) => new Date(String(v)).toLocaleDateString() },
  ];

  const [items, setItems] = useState<Ticket[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Ticket[] }>("/tickets").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({ ...empty, createdAt: new Date().toISOString() }); setEditId(null); setShowModal(true); };
  const openEdit = (item: Ticket) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Ticket) => { if (confirm(t("confirmDelete"))) { await del("/tickets/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/tickets/" + editId, form);
    else await post("/tickets", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.tickets")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("new")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.tickets") : t("new") + " " + t("page.tickets")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.title")} value={form.title} onChange={set("title")} required />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <FormField label={t("priority")} value={form.priority} type="select" onChange={set("priority")} options={[{label:t("low"),value:"low"},{label:t("medium"),value:"medium"},{label:t("high"),value:"high"},{label:t("critical"),value:"critical"}]} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("open"),value:"open"},{label:t("inProgress"),value:"in-progress"},{label:t("resolved"),value:"resolved"},{label:t("closed"),value:"closed"}]} />
            <FormField label="مقدم الطلب / Requester" value={form.requesterName} onChange={set("requesterName")} required />
            <FormField label="القسم / Department" value={form.requesterDepartment} type="select" onChange={set("requesterDepartment")} options={[{label:"الموارد البشرية / HR",value:"الموارد البشرية / HR"},{label:"المالية / Finance",value:"المالية / Finance"},{label:"المبيعات / Sales",value:"المبيعات / Sales"},{label:"الإدارة / Admin",value:"الإدارة / Admin"},{label:"المشتريات / Purchasing",value:"المشتريات / Purchasing"},{label:"تكنولوجيا المعلومات / IT",value:"تكنولوجيا المعلومات / IT"},{label:"الإنتاج / Production",value:"الإنتاج / Production"}]} />
            <FormField label="المنفذ / Assigned To" value={form.assignee} onChange={set("assignee")} />
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
