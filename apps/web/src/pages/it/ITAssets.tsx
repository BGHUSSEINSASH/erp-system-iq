import { useEffect, useState } from "react";
import { get, post, put, del } from "../../api";
import { useI18n } from "../../i18n";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Asset = { id: string; name: string; category: string; serialNumber: string; assignedTo: string; location: string; purchaseDate: string; warranty: string; status: string };
const empty: Omit<Asset, "id"> = { name: "", category: "laptop", serialNumber: "", assignedTo: "", location: "", purchaseDate: "", warranty: "", status: "active" };

export default function ITAssets() {
  const { t } = useI18n();
  const columns: Column<Asset>[] = [
    { key: "name", header: t("name") },
    { key: "category", header: t("category"), render: (v) => t("itCat." + v) },
    { key: "serialNumber", header: t("field.code") },
    { key: "assignedTo", header: t("assignee") },
    { key: "location", header: t("location") },
    { key: "warranty", header: t("field.endDate") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
  ];

  const [items, setItems] = useState<Asset[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Asset[] }>("/it-assets").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Asset) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Asset) => { if (confirm(t("confirmDelete"))) { await del("/it-assets/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/it-assets/" + editId, form);
    else await post("/it-assets", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.itAssets")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.itAssets")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.itAssets") : t("new") + " " + t("page.itAssets")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("category")} value={form.category} type="select" onChange={set("category")} options={[{label:t("itCat.laptop"),value:"laptop"},{label:t("itCat.desktop"),value:"desktop"},{label:t("itCat.network"),value:"network"},{label:t("itCat.printer"),value:"printer"},{label:t("itCat.tablet"),value:"tablet"},{label:t("itCat.infrastructure"),value:"infrastructure"}]} />
            <FormField label={t("field.code")} value={form.serialNumber} onChange={set("serialNumber")} required />
            <FormField label={t("assignee")} value={form.assignedTo} onChange={set("assignedTo")} />
            <FormField label={t("location")} value={form.location} onChange={set("location")} />
            <FormField label={t("field.acquiredDate")} value={form.purchaseDate} type="date" onChange={set("purchaseDate")} />
            <FormField label={t("field.endDate")} value={form.warranty} type="date" onChange={set("warranty")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("asset.underMaint"),value:"maintenance"},{label:t("asset.disposed"),value:"retired"}]} />
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
