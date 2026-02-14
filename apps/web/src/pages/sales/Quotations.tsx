import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api";
import { useI18n } from "../../i18n";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Quotation = { id: string; quoteNo: string; customerName: string; date: string; validUntil: string; total: number; status: string };
const empty: Omit<Quotation, "id"> = { quoteNo: "", customerName: "", date: "", validUntil: "", total: 0, status: "draft" };

export default function Quotations() {
  const { t } = useI18n();
  const columns: Column<Quotation>[] = [
    { key: "quoteNo", header: t("field.quoteNo") },
    { key: "customerName", header: t("field.customer") },
    { key: "date", header: t("date") },
    { key: "validUntil", header: t("field.validUntil") },
    { key: "total", header: t("total"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Quotation[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Quotation[] }>("/quotations").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Quotation) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Quotation) => { if (confirm(t("confirmDelete"))) { await del("/quotations/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/quotations/" + editId, form);
    else await post("/quotations", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "total" ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.quotations")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.quotations")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.quotations") : t("new") + " " + t("page.quotations")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.quoteNo")} value={form.quoteNo} onChange={set("quoteNo")} required />
            <FormField label={t("field.customer")} value={form.customerName} onChange={set("customerName")} required />
            <FormField label={t("date")} value={form.date} type="date" onChange={set("date")} />
            <FormField label={t("field.validUntil")} value={form.validUntil} type="date" onChange={set("validUntil")} />
            <FormField label={t("total")} value={form.total} type="number" onChange={set("total")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("draft"),value:"draft"},{label:t("sent"),value:"sent"},{label:t("accepted"),value:"accepted"},{label:t("rejected"),value:"rejected"},{label:t("expired"),value:"expired"}]} />
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
