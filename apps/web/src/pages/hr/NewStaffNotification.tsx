import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type SN = { id: string; employeeName: string; department: string; position: string; startDate: string; notifiedBy: string; date: string; notes: string };
const empty: Omit<SN, "id"> = { employeeName: "", department: "", position: "", startDate: "", notifiedBy: "", date: "", notes: "" };

export default function NewStaffNotification() {
  const { t } = useI18n();
  const columns: Column<SN>[] = [
    { key: "employeeName", header: t("field.newEmployee") },
    { key: "department", header: t("field.department") },
    { key: "position", header: t("field.position") },
    { key: "startDate", header: t("date") },
    { key: "notifiedBy", header: t("field.notifiedBy") },
    { key: "date", header: t("field.notifDate") },
  ];
  const [items, setItems] = useState<SN[]>([]);
  const [form, setForm] = useState(empty);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: SN[] }>("/staff-notifications").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setShowModal(true); };
  const handleDelete = async (item: SN) => { if (confirm(t("confirmDelete"))) { await del("/staff-notifications/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await post("/staff-notifications", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.staffNotif")}</h2><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.staffNotif")}</button></div>
      <DataTable columns={columns} data={items} onDelete={handleDelete} />
      {showModal && (
        <Modal title={t("new") + " " + t("page.staffNotif")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.employee")} value={form.employeeName} onChange={set("employeeName")} required />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} required />
            <FormField label={t("field.position")} value={form.position} onChange={set("position")} />
            <FormField label={t("date")} value={form.startDate} type="date" onChange={set("startDate")} />
            <FormField label={t("field.notifiedBy")} value={form.notifiedBy} onChange={set("notifiedBy")} />
            <FormField label={t("field.notifDate")} value={form.date} type="date" onChange={set("date")} />
            <FormField label={t("notes")} value={form.notes} onChange={set("notes")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
