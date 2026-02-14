import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Branch = { id: string; name: string; code: string; city: string; address: string; phone: string; manager: string; employees: number; isMain: boolean; lat: number; lng: number; status: string };
const empty: Omit<Branch, "id"> = { name: "", code: "", city: "", address: "", phone: "", manager: "", employees: 0, isMain: false, lat: 33.3, lng: 44.3, status: "active" };

export default function BranchManagement() {
  const { t } = useI18n();
  const [items, setItems] = useState<Branch[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Branch[] }>("/branches").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const columns: Column<Branch>[] = [
    { key: "code", header: "الرمز / Code" },
    { key: "name", header: t("name") },
    { key: "city", header: "المدينة / City" },
    { key: "phone", header: t("phone") },
    { key: "manager", header: "المدير / Manager" },
    { key: "employees", header: "الموظفين / Employees" },
    { key: "isMain", header: "رئيسي / Main", render: v => v ? "⭐ نعم" : "-" },
    { key: "status", header: t("status"), render: v => {
      const colors: Record<string, string> = { active: "#22c55e", inactive: "#ef4444" };
      return <span className="badge" style={{ background: `${colors[String(v)] || "#6366f1"}30`, color: colors[String(v)] || "#6366f1" }}>{String(v) === "active" ? "✅ نشط" : "🚫 غير نشط"}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Branch) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Branch) => { if (confirm(t("confirmDelete"))) { await del(`/branches/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/branches/${editId}`, form);
    else await post("/branches", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["employees", "lat", "lng"].includes(key) ? Number(val) : key === "isMain" ? val === "true" : val
  }));

  const totalEmployees = items.reduce((s, i) => s + i.employees, 0);

  return (
    <div className="page">
      <div className="page-header">
        <h2>🏢 إدارة الفروع / Branch Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ فرع جديد / New Branch</button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(59,130,246,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#3b82f6" }}>{items.length}</div>
          <div style={{ opacity: 0.7 }}>إجمالي الفروع / Total Branches</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(34,197,94,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#22c55e" }}>{items.filter(i => i.status === "active").length}</div>
          <div style={{ opacity: 0.7 }}>فروع نشطة / Active</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(168,85,247,0.05))", borderRadius: 12, padding: 20, border: "1px solid rgba(168,85,247,0.2)", textAlign: "center" }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: "#a855f7" }}>{totalEmployees}</div>
          <div style={{ opacity: 0.7 }}>إجمالي الموظفين / Total Employees</div>
        </div>
      </div>

      {/* Branch Map (Visual) */}
      <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>🗺️ خريطة الفروع / Branch Map</h3>
        <div style={{ position: "relative", height: 300, background: "linear-gradient(135deg, #0f172a, #1e293b)", borderRadius: 12, overflow: "hidden" }}>
          {/* Simple map background */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: "radial-gradient(circle at 25% 25%, #3b82f6 1px, transparent 1px), radial-gradient(circle at 75% 50%, #3b82f6 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          {items.map((branch, i) => {
            // Normalize positions relative to Iraq bounds (approx lat 29-37, lng 38-49)
            const x = ((branch.lng - 38) / 11) * 80 + 10;
            const y = ((37 - branch.lat) / 8) * 80 + 10;
            return (
              <div key={i} style={{
                position: "absolute", left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)",
                textAlign: "center", zIndex: 2,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: branch.isMain ? "linear-gradient(135deg, #eab308, #f59e0b)" : "linear-gradient(135deg, #3b82f6, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 20px ${branch.isMain ? "rgba(234,179,8,0.4)" : "rgba(59,130,246,0.4)"}`,
                  border: "2px solid rgba(255,255,255,0.3)",
                }}>
                  {branch.isMain ? "⭐" : "🏢"}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, textShadow: "0 1px 4px rgba(0,0,0,0.8)", whiteSpace: "nowrap" }}>{branch.name}</div>
                <div style={{ fontSize: 10, opacity: 0.6 }}>{branch.employees} 👥</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Branch Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginBottom: 24 }}>
        {items.map(branch => (
          <div key={branch.id} onClick={() => openEdit(branch)} style={{
            background: branch.isMain ? "linear-gradient(135deg, rgba(234,179,8,0.1), rgba(234,179,8,0.02))" : "rgba(255,255,255,0.03)",
            borderRadius: 14, padding: 20, cursor: "pointer",
            border: `1px solid ${branch.isMain ? "rgba(234,179,8,0.3)" : "rgba(255,255,255,0.08)"}`,
            transition: "transform 0.2s", position: "relative", overflow: "hidden",
          }}>
            {branch.isMain && <div style={{ position: "absolute", top: 8, left: 8, fontSize: 16 }}>⭐</div>}
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{branch.name}</div>
            <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>{branch.city} - {branch.address}</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span>📞 {branch.phone}</span>
              <span>👤 {branch.manager}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 13 }}>
              <span>👥 {branch.employees} موظف</span>
              <span className="badge" style={{ background: branch.status === "active" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)", color: branch.status === "active" ? "#22c55e" : "#ef4444" }}>
                {branch.status === "active" ? "نشط" : "غير نشط"}
              </span>
            </div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? "تعديل فرع / Edit Branch" : "فرع جديد / New Branch"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label={t("name")} value={form.name} onChange={set("name")} required />
            <FormField label="الرمز / Code" value={form.code} onChange={set("code")} required />
            <FormField label="المدينة / City" value={form.city} onChange={set("city")} required />
            <FormField label="العنوان / Address" value={form.address} onChange={set("address")} />
            <FormField label={t("phone")} value={form.phone} onChange={set("phone")} />
            <FormField label="المدير / Manager" value={form.manager} onChange={set("manager")} />
            <FormField label="عدد الموظفين / Employees" value={form.employees} type="number" onChange={set("employees")} />
            <FormField label="فرع رئيسي / Main Branch" value={String(form.isMain)} type="select" onChange={set("isMain")} options={[{ label: "نعم / Yes", value: "true" }, { label: "لا / No", value: "false" }]} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{ label: "نشط / Active", value: "active" }, { label: "غير نشط / Inactive", value: "inactive" }]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
