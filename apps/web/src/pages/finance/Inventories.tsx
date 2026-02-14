import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Inv = { id: string; itemName: string; sku: string; category: string; quantity: number; unitPrice: number; warehouse: string; minStock: number; status: string };
const empty: Omit<Inv, "id"> = { itemName: "", sku: "", category: "", quantity: 0, unitPrice: 0, warehouse: "", minStock: 10, status: "in-stock" };

export default function Inventories() {
  const { t } = useI18n();
  const columns: Column<Inv>[] = [
    { key: "sku", header: t("field.sku") },
    { key: "itemName", header: t("field.item") },
    { key: "category", header: t("category") },
    { key: "quantity", header: t("field.qty") },
    { key: "unitPrice", header: t("field.unitPrice"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "warehouse", header: t("field.warehouse") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Inv[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Inv[] }>("/inventories").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Inv) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Inv) => { if (confirm(t("confirmDelete"))) { await del("/inventories/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/inventories/" + editId, form);
    else await post("/inventories", form);
    setShowModal(false); load();
  };

  const nums = ["quantity", "unitPrice", "minStock"];
  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: nums.includes(key) ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header"><h2>{t("page.inventories")}</h2><button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("field.item")}</button></div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("field.item") : t("new") + " " + t("field.item")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.item")} value={form.itemName} onChange={set("itemName")} required />
            <FormField label={t("field.sku")} value={form.sku} onChange={set("sku")} />
            <FormField label={t("category")} value={form.category} onChange={set("category")} />
            <FormField label={t("field.qty")} value={form.quantity} type="number" onChange={set("quantity")} />
            <FormField label={t("field.unitPrice")} value={form.unitPrice} type="number" onChange={set("unitPrice")} />
            <FormField label={t("field.warehouse")} value={form.warehouse} onChange={set("warehouse")} />
            <FormField label={t("field.minStock")} value={form.minStock} type="number" onChange={set("minStock")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("inv.inStock"),value:"in-stock"},{label:t("inv.lowStock"),value:"low-stock"},{label:t("inv.outOfStock"),value:"out-of-stock"}]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
