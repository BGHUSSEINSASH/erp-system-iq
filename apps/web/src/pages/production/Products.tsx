import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Product = { id: string; name: string; sku: string; category: string; price: number; stock: number; minStock: number; status: string };
const empty: Omit<Product, "id"> = { name: "", sku: "", category: "", price: 0, stock: 0, minStock: 0, status: "active" };

export default function Products() {
  const { t } = useI18n();
  const columns: Column<Product>[] = [
    { key: "sku", header: t("field.sku") },
    { key: "name", header: t("field.product") },
    { key: "category", header: t("category") },
    { key: "price", header: t("field.price"), render: (v) => Number(v).toLocaleString() + " د.ع" },
    { key: "stock", header: t("field.stock"), render: (v: unknown, row: Product) => {
      const s = Number(v);
      const cls = s <= row.minStock ? "text-danger" : "";
      return <span className={cls}>{s} {s <= row.minStock ? " ⚠️" : ""}</span>;
    }},
    { key: "minStock", header: t("field.minStock") },
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<Product[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Product[] }>("/products").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Product) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Product) => { if (confirm(t("confirmDelete"))) { await del("/products/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/products/" + editId, form);
    else await post("/products", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: ["price","stock","minStock"].includes(key) ? Number(val) : val }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.products")}</h2>
        <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add") + " " + t("field.product")}</button>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("field.product") : t("new") + " " + t("field.product")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("field.sku")} value={form.sku} onChange={set("sku")} required />
            <FormField label={t("category")} value={form.category} onChange={set("category")} />
            <FormField label={t("field.price")} value={form.price} type="number" onChange={set("price")} />
            <FormField label={t("field.stock")} value={form.stock} type="number" onChange={set("stock")} />
            <FormField label={t("field.minStock")} value={form.minStock} type="number" onChange={set("minStock")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("prod.discontinued"),value:"discontinued"}]} />
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
