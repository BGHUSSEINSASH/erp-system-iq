import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api";
import { useI18n } from "../../i18n";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Contract = { id: string; employeeName: string; type: string; startDate: string; endDate: string; salary: number; status: string };
const empty: Omit<Contract, "id"> = { employeeName: "", type: "full-time", startDate: "", endDate: "", salary: 0, status: "active" };

export default function Contracts() {
  const { t } = useI18n();
  const columns: Column<Contract>[] = [
    { key: "employeeName", header: t("field.employee") },
    { key: "type", header: t("type"), render: (v) => t("contract." + String(v).replace("-", "").replace("time", "Time")) },
    { key: "startDate", header: t("field.startDate") },
    { key: "endDate", header: t("field.endDate") },
    { key: "salary", header: t("field.salary"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Contract[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Contract[] }>("/contracts").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Contract) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Contract) => { if (confirm(t("confirmDelete"))) { await del("/contracts/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/contracts/" + editId, form);
    else await post("/contracts", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "salary" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.contracts")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.contracts")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.contracts") : t("new") + " " + t("page.contracts")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.employee")} value={form.employeeName} onChange={set("employeeName")} required />
            <FormField label={t("type")} value={form.type} type="select" onChange={set("type")} options={[{label:t("contract.fullTime"),value:"full-time"},{label:t("contract.partTime"),value:"part-time"},{label:t("contract.contract"),value:"contract"},{label:t("contract.internship"),value:"internship"}]} />
            <FormField label={t("field.startDate")} value={form.startDate} type="date" onChange={set("startDate")} />
            <FormField label={t("field.endDate")} value={form.endDate} type="date" onChange={set("endDate")} />
            <FormField label={t("field.salary")} value={form.salary} type="number" onChange={set("salary")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("expired"),value:"expired"},{label:t("terminated"),value:"terminated"}]} />
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
