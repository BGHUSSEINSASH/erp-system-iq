import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type LA = { id: string; propertyName: string; tenant: string; startDate: string; endDate: string; monthlyRent: number; status: string; notes: string };
const empty: Omit<LA, "id"> = { propertyName: "", tenant: "", startDate: "", endDate: "", monthlyRent: 0, status: "active", notes: "" };

export default function LeaseAgreements() {
  const { t } = useI18n();
  const columns: Column<LA>[] = [
    { key: "propertyName", header: t("page.property") },
    { key: "tenant", header: t("field.tenant") },
    { key: "startDate", header: t("field.start") },
    { key: "endDate", header: t("field.end") },
    { key: "monthlyRent", header: t("field.monthlyRent"), render: (v) => <strong>{Number(v).toLocaleString() + " د.ع"}</strong> },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<LA[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: LA[] }>("/lease-agreements").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: LA) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: LA) => { if (confirm(t("confirmDelete"))) { await del("/lease-agreements/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/lease-agreements/" + editId, form);
    else await post("/lease-agreements", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "monthlyRent" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.leaseAgreements")}</h2><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("new")}</button></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") : t("new")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("page.property")} value={form.propertyName} onChange={set("propertyName")} required />
            <FormField label={t("field.tenant")} value={form.tenant} onChange={set("tenant")} required />
            <FormField label={t("field.start")} value={form.startDate} type="date" onChange={set("startDate")} />
            <FormField label={t("field.end")} value={form.endDate} type="date" onChange={set("endDate")} />
            <FormField label={t("field.monthlyRent")} value={form.monthlyRent} type="number" onChange={set("monthlyRent")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("expired"),value:"expired"},{label:t("terminated"),value:"terminated"}]} />
            <FormField label={t("description")} value={form.notes} onChange={set("notes")} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
