import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, post, put, del } from "../../api";
import DataTable, { type Column } from "../../components/DataTable";
import Modal from "../../components/Modal";
import FormField from "../../components/FormField";

type User = { id: string; username: string; name: string; email: string; role: string; department: string; status: string };
const empty: Omit<User, "id"> & { password: string } = { username: "", name: "", email: "", role: "employee", department: "none", status: "active", password: "" };

const roleGroups = [
  {
    label: "إدارة النظام / System",
    roles: [
      { value: "admin", label: "مدير النظام / System Admin" },
      { value: "ceo", label: "المدير العام / CEO" },
      { value: "manager", label: "مدير تنفيذي / General Manager" },
    ],
  },
  {
    label: "الموارد البشرية / HR",
    roles: [
      { value: "hr_manager", label: "مدير الموارد البشرية / HR Manager" },
      { value: "hr_assistant", label: "مساعد مدير الموارد البشرية / HR Asst." },
      { value: "hr", label: "موظف موارد بشرية / HR Staff" },
    ],
  },
  {
    label: "المالية / Finance",
    roles: [
      { value: "finance_manager", label: "مدير المالية / Finance Manager" },
      { value: "finance_assistant", label: "مساعد مدير المالية / Finance Asst." },
      { value: "finance", label: "موظف مالية / Finance Staff" },
    ],
  },
  {
    label: "المبيعات / Sales",
    roles: [
      { value: "sales_manager", label: "مدير المبيعات / Sales Manager" },
      { value: "sales_assistant", label: "مساعد مدير المبيعات / Sales Asst." },
      { value: "sales", label: "موظف مبيعات / Sales Staff" },
    ],
  },
  {
    label: "تكنولوجيا المعلومات / IT",
    roles: [
      { value: "it_manager", label: "مدير IT / IT Manager" },
      { value: "it_assistant", label: "مساعد مدير IT / IT Asst." },
      { value: "it", label: "موظف IT / IT Staff" },
    ],
  },
  {
    label: "الإنتاج / Production",
    roles: [
      { value: "production_manager", label: "مدير الإنتاج / Production Manager" },
      { value: "production_assistant", label: "مساعد مدير الإنتاج / Production Asst." },
      { value: "production", label: "موظف إنتاج / Production Staff" },
    ],
  },
  {
    label: "المشتريات / Purchasing",
    roles: [
      { value: "purchasing_manager", label: "مدير المشتريات / Purchasing Manager" },
      { value: "purchasing_assistant", label: "مساعد مدير المشتريات / Purchasing Asst." },
      { value: "purchasing", label: "موظف مشتريات / Purchasing Staff" },
    ],
  },
  {
    label: "الإدارة / Admin",
    roles: [
      { value: "admin_manager", label: "مدير الإدارة / Admin Manager" },
      { value: "admin_assistant", label: "مساعد مدير الإدارة / Admin Asst." },
    ],
  },
  {
    label: "عام / General",
    roles: [
      { value: "employee", label: "موظف / Employee" },
    ],
  },
];

const allRoleOptions = roleGroups.flatMap(g => g.roles);

const departmentOptions = [
  { label: "النظام / System", value: "system" },
  { label: "الموارد البشرية / HR", value: "hr" },
  { label: "المالية / Finance", value: "finance" },
  { label: "المبيعات / Sales", value: "sales" },
  { label: "تكنولوجيا المعلومات / IT", value: "it" },
  { label: "الإنتاج / Production", value: "production" },
  { label: "المشتريات / Purchasing", value: "purchasing" },
  { label: "الإدارة / Admin", value: "admin" },
  { label: "بدون / None", value: "none" },
];

const roleLabelMap: Record<string, string> = {};
allRoleOptions.forEach(r => { roleLabelMap[r.value] = r.label; });

const deptLabelMap: Record<string, string> = {};
departmentOptions.forEach(d => { deptLabelMap[d.value] = d.label; });

const roleIconMap: Record<string, string> = {
  admin: "⚙️", ceo: "🏛️", manager: "📋",
  hr_manager: "👤", hr_assistant: "👥", hr: "👥",
  finance_manager: "💼", finance_assistant: "💰", finance: "💰",
  sales_manager: "📊", sales_assistant: "📈", sales: "📈",
  it_manager: "🖥️", it_assistant: "💻", it: "💻",
  production_manager: "🏭", production_assistant: "🔧", production: "🔧",
  purchasing_manager: "📦", purchasing_assistant: "🛒", purchasing: "🛒",
  admin_manager: "🏢", admin_assistant: "🏢",
  employee: "👤",
};

export default function Users() {
  const { t } = useI18n();
  const columns: Column<User>[] = [
    { key: "username", header: t("field.username") },
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    { key: "role", header: t("field.role"), render: (v) => (
      <span className={"badge badge-" + String(v)} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <span>{roleIconMap[String(v)] || "👤"}</span>
        <span>{roleLabelMap[String(v)] || String(v)}</span>
      </span>
    )},
    { key: "department", header: "القسم / Dept", render: (v) => (
      <span className="badge badge-info">{deptLabelMap[String(v)] || String(v)}</span>
    )},
    { key: "status", header: t("status"), render: (v) => <span className={"badge badge-" + v}>{String(v)}</span> },
  ];
  const [items, setItems] = useState<User[]>([]);
  const [form, setForm] = useState<typeof empty>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("");

  const load = () => get<{ items: User[] }>("/users").then((r) => setItems(r.items));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: User) => { setForm({ ...item, password: "" }); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: User) => { if (confirm(t("confirmDelete"))) { await del("/users/" + item.id); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    if (editId && !payload.password) delete payload.password;
    if (editId) await put("/users/" + editId, payload);
    else await post("/users", payload);
    setShowModal(false);
    load();
  };

  const set = (key: string) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  // Auto-set department when role changes
  const handleRoleChange = (val: string) => {
    const deptMap: Record<string, string> = {
      admin: "system", ceo: "system", manager: "system",
      hr_manager: "hr", hr_assistant: "hr", hr: "hr",
      finance_manager: "finance", finance_assistant: "finance", finance: "finance",
      sales_manager: "sales", sales_assistant: "sales", sales: "sales",
      it_manager: "it", it_assistant: "it", it: "it",
      production_manager: "production", production_assistant: "production", production: "production",
      purchasing_manager: "purchasing", purchasing_assistant: "purchasing", purchasing: "purchasing",
      admin_manager: "admin", admin_assistant: "admin",
      employee: "none",
    };
    setForm(f => ({ ...f, role: val, department: deptMap[val] || "none" }));
  };

  const filteredItems = filter ? items.filter(i => i.department === filter || i.role?.startsWith(filter)) : items;

  return (
    <div className="page">
      <div className="page-header">
        <h2>👥 {t("page.users")}</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <select className="form-select" value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 160 }}>
            <option value="">الكل / All</option>
            {departmentOptions.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={openAdd}>{"+ " + t("add")}</button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <div className="chart-card" style={{ padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "var(--primary)" }}>{items.length}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>إجمالي المستخدمين / Total Users</div>
        </div>
        <div className="chart-card" style={{ padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>{items.filter(i => i.status === "active").length}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>نشط / Active</div>
        </div>
        <div className="chart-card" style={{ padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#f59e0b" }}>{new Set(items.map(i => i.department)).size}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>الأقسام / Departments</div>
        </div>
        <div className="chart-card" style={{ padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#6366f1" }}>{new Set(items.map(i => i.role)).size}</div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>الأدوار / Roles</div>
        </div>
      </div>

      <DataTable columns={columns} data={filteredItems} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? t("edit") : t("new")} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("field.username")} value={form.username} onChange={set("username")} required />
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label={t("email")} value={form.email} type="email" onChange={set("email")} />
            <FormField label={editId ? "كلمة المرور (اتركها فارغة للإبقاء) / Password" : "كلمة المرور / Password"} value={form.password} onChange={set("password")} required={!editId} />
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 600, fontSize: 14 }}>الدور / Role</label>
              <select 
                className="form-select" 
                value={form.role} 
                onChange={e => handleRoleChange(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", fontSize: 14 }}
              >
                {roleGroups.map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.roles.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <FormField label="القسم / Department" value={form.department} type="select" onChange={set("department")} options={departmentOptions} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{label:t("active"),value:"active"},{label:t("disabled"),value:"disabled"}]} />
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
