import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Prop = { id: string; name: string; type: string; location: string; area: number; value: number; status: string; acquiredDate: string };
const empty: Omit<Prop, "id"> = { name: "", type: "building", location: "", area: 0, value: 0, status: "active", acquiredDate: "" };

export default function Property() {
  const { t } = useI18n();
  const columns: Column<Prop>[] = [
    { key: "name", header: t("page.property") },
    { key: "type", header: t("type"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
    { key: "location", header: t("location") },
    { key: "area", header: t("field.area") },
    { key: "value", header: t("field.value"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
    { key: "acquiredDate", header: t("field.acquiredDate") },
  ];
  const [items, setItems] = useState<Prop[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Prop[] }>("/properties").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Prop) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Prop) => { if (confirm(t("confirmDelete"))) { await del("/properties/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/properties/" + editId, form);
    else await post("/properties", form);
    setShowModal(false); load();
  };

  const nums = ["area", "value"];
  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: nums.includes(key) ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.property")}</h2><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add")}</button></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") : t("new")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("type")} value={form.type} type="select" onChange={set("type")} options={[{label:t("asset.building"),value:"building"},{label:t("asset.land"),value:"land"},{label:t("asset.vehicle"),value:"vehicle"},{label:t("asset.equipment"),value:"equipment"}]} />
            <FormField label={t("location")} value={form.location} onChange={set("location")} />
            <FormField label={t("field.area")} value={form.area} type="number" onChange={set("area")} />
            <FormField label={t("field.value")} value={form.value} type="number" onChange={set("value")} />
            <FormField label={t("field.acquiredDate")} value={form.acquiredDate} type="date" onChange={set("acquiredDate")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("asset.underMaint"),value:"maintenance"},{label:t("asset.disposed"),value:"disposed"}]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
