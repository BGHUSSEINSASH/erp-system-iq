import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Cost = { id: string; category: string; description: string; amount: number; date: string; department: string; approvedBy: string; status: string };
const empty: Omit<Cost, "id"> = { category: "", description: "", amount: 0, date: "", department: "", approvedBy: "", status: "pending" };

export default function Costs() {
  const { t } = useI18n();
  const nav = useNavigate();
  const columns: Column<Cost>[] = [
    { key: "category", header: t("category") },
    { key: "description", header: t("description") },
    { key: "amount", header: t("amount"), render: (v) => <strong>{Number(v).toLocaleString() + " د.ع"}</strong> },
    { key: "department", header: t("department") },
    { key: "date", header: t("date") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Cost[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Cost[] }>("/costs").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Cost) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Cost) => { if (confirm(t("confirmDelete"))) { await del("/costs/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/costs/" + editId, form);
    else await post("/costs", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "amount" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.costs")}</h2><div style={{ display: "flex", gap: 8 }}><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add")}</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button><button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 طلب سلفة</button></div></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") : t("new")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("category")} value={form.category} onChange={set("category")} required />
            <FormField label={t("description")} value={form.description} onChange={set("description")} />
            <FormField label={t("amount")} value={form.amount} type="number" onChange={set("amount")} />
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} />
            <FormField label={t("department")} value={form.department} onChange={set("department")} />
            <FormField label={t("approvedBy")} value={form.approvedBy} onChange={set("approvedBy")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("pending"),value:"pending"},{label:t("approved"),value:"approved"},{label:t("rejected"),value:"rejected"}]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
