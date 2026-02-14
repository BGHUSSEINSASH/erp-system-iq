import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Timesheet = { id: string; employeeName: string; date: string; hoursWorked: number; overtime: number; project: string; status: string };
const empty: Omit<Timesheet, "id"> = { employeeName: "", date: "", hoursWorked: 8, overtime: 0, project: "", status: "submitted" };

export default function Timesheets() {
  const { t } = useI18n();
  const columns: Column<Timesheet>[] = [
    { key: "employeeName", header: t("field.employee") },
    { key: "date", header: t("date") },
    { key: "hoursWorked", header: t("field.hours") },
    { key: "overtime", header: t("field.overtime") },
    { key: "project", header: t("field.project") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Timesheet[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Timesheet[] }>("/timesheets").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Timesheet) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Timesheet) => { if (confirm(t("confirmDelete"))) { await del(`/timesheets/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/timesheets/${editId}`, form);
    else await post("/timesheets", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: ["hoursWorked", "overtime"].includes(key) ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.timesheets")}</h2><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.timesheets")}</button></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.timesheets") : t("new") + " " + t("page.timesheets")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.employee")} value={form.employeeName} onChange={set("employeeName")} required />
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} required />
            <FormField label={t("field.hours")} value={form.hoursWorked} type="number" onChange={set("hoursWorked")} />
            <FormField label={t("field.overtime")} value={form.overtime} type="number" onChange={set("overtime")} />
            <FormField label={t("field.project")} value={form.project} onChange={set("project")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("submitted"),value:"submitted"},{label:t("approved"),value:"approved"},{label:t("rejected"),value:"rejected"}]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
