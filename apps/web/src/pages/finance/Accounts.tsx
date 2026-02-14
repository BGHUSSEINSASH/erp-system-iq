import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type Account = { id: string; code: string; name: string; type: string; balance: number };
const empty: Omit<Account, "id"> = { code: "", name: "", type: "asset", balance: 0 };

export default function Accounts() {
  const { t } = useI18n();
  const nav = useNavigate();
  const columns: Column<Account>[] = [
    { key: "code", header: t("field.code") },
    { key: "name", header: t("field.accountName") },
    { key: "type", header: t("type"), render: (v) => <span className={"badge badge-" + v}>{t(String(v))}</span> },
    { key: "balance", header: t("field.balance"), render: (v) => Number(v).toLocaleString() + " د.ع" },
  ];
  const [items, setItems] = useState<Account[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Account[] }>("/accounts").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Account) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Account) => { if (confirm(t("confirmDelete"))) { await del("/accounts/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put("/accounts/" + editId, form);
    else await post("/accounts", form);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: key === "balance" ? Number(val) : val }));

  const typeOptions = [
    { label: t("acct.asset"), value: "asset" },
    { label: t("acct.liability"), value: "liability" },
    { label: t("acct.equity"), value: "equity" },
    { label: t("acct.revenue"), value: "revenue" },
    { label: t("acct.expense"), value: "expense" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>{t("page.accounts")}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("page.accounts")}</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/expense-requests")}>💸 طلب صرف</button>
          <button className="btn btn-secondary" style={{ fontSize: 12 }} onClick={() => nav("/employee-loans")}>🤝 طلب سلفة</button>
        </div>
      </div>
      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") + " " + t("page.accounts") : t("new") + " " + t("page.accounts")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.code")} value={form.code} onChange={set("code")} required />
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("type")} value={form.type} type="select" onChange={set("type")} options={typeOptions} />
            <FormField label={t("field.balance")} value={form.balance} type="number" onChange={set("balance")} />
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
