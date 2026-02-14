import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";

type Vehicle = { id: string; plateNo: string; make: string; model: string; year: number; type: string; department: string; driver: string; mileage: number; fuelType: string; insuranceExpiry: string; lastMaintenance: string; nextMaintenance: string; status: string };
const empty: Omit<Vehicle, "id"> = { plateNo: "", make: "", model: "", year: 2024, type: "sedan", department: "", driver: "", mileage: 0, fuelType: "gasoline", insuranceExpiry: "", lastMaintenance: "", nextMaintenance: "", status: "active" };

function fmt(n: number) { return n.toLocaleString("ar-IQ"); }

const vehTypes: Record<string, string> = { sedan: "🚗 سيدان", suv: "🚙 SUV", truck: "🚛 شاحنة", van: "🚐 فان", pickup: "🛻 بيك أب", bus: "🚌 باص" };
const fuelTypes: Record<string, string> = { gasoline: "⛽ بنزين", diesel: "🛢️ ديزل", electric: "⚡ كهربائي", hybrid: "🔋 هجين" };

export default function VehicleManagement() {
  const { t } = useI18n();
  const [items, setItems] = useState<Vehicle[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const load = () => get<{ items: Vehicle[] }>("/vehicles").then(r => setItems(r.items));
  useEffect(() => { load(); }, []);

  const columns: Column<Vehicle>[] = [
    { key: "plateNo", header: "رقم اللوحة / Plate #" },
    { key: "make", header: "الشركة / Make" },
    { key: "model", header: "الموديل / Model" },
    { key: "year", header: "السنة / Year" },
    { key: "type", header: "النوع / Type", render: v => vehTypes[String(v)] || String(v) },
    { key: "department", header: t("field.department") },
    { key: "driver", header: "السائق / Driver" },
    { key: "mileage", header: "الكيلومتر / KM", render: v => fmt(Number(v)) },
    { key: "fuelType", header: "الوقود / Fuel", render: v => fuelTypes[String(v)] || String(v) },
    { key: "insuranceExpiry", header: "انتهاء التأمين / Insurance" },
    { key: "status", header: t("status"), render: v => {
      const colors: Record<string, string> = { active: "#22c55e", maintenance: "#eab308", "out-of-service": "#ef4444", reserved: "#3b82f6" };
      const labels: Record<string, string> = { active: "✅ نشط", maintenance: "🔧 صيانة", "out-of-service": "🚫 معطل", reserved: "📌 محجوز" };
      return <span className="badge" style={{ background: `${colors[String(v)] || "#6366f1"}30`, color: colors[String(v)] || "#6366f1" }}>{labels[String(v)] || String(v)}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setShowModal(true); };
  const openEdit = (item: Vehicle) => { setForm(item); setEditId(item.id); setShowModal(true); };
  const handleDelete = async (item: Vehicle) => { if (confirm(t("confirmDelete"))) { await del(`/vehicles/${item.id}`); load(); } };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) await put(`/vehicles/${editId}`, form);
    else await post("/vehicles", form);
    setShowModal(false); load();
  };

  const set = (key: string) => (val: string) => setForm(f => ({
    ...f, [key]: ["year", "mileage"].includes(key) ? Number(val) : val
  }));

  return (
    <div className="page">
      <div className="page-header">
        <h2>🚗 إدارة المركبات / Vehicle Management</h2>
        <button className="btn btn-primary" onClick={openAdd}>+ مركبة جديدة / New Vehicle</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { label: "نشطة / Active", count: items.filter(i => i.status === "active").length, color: "#22c55e" },
          { label: "صيانة / Maintenance", count: items.filter(i => i.status === "maintenance").length, color: "#eab308" },
          { label: "معطلة / Out of Service", count: items.filter(i => i.status === "out-of-service").length, color: "#ef4444" },
          { label: "محجوزة / Reserved", count: items.filter(i => i.status === "reserved").length, color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`, borderRadius: 12, padding: 16, border: `1px solid ${s.color}30`, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.count}</div>
            <div style={{ opacity: 0.7, fontSize: 13 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={items} onEdit={openEdit} onDelete={handleDelete} />
      {showModal && (
        <Modal title={editId ? "تعديل مركبة / Edit Vehicle" : "مركبة جديدة / New Vehicle"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            <FormField label="رقم اللوحة / Plate #" value={form.plateNo} onChange={set("plateNo")} required />
            <FormField label="الشركة / Make" value={form.make} onChange={set("make")} required />
            <FormField label="الموديل / Model" value={form.model} onChange={set("model")} required />
            <FormField label="السنة / Year" value={form.year} type="number" onChange={set("year")} />
            <FormField label="النوع / Type" value={form.type} type="select" onChange={set("type")} options={Object.entries(vehTypes).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label={t("field.department")} value={form.department} onChange={set("department")} />
            <FormField label="السائق / Driver" value={form.driver} onChange={set("driver")} />
            <FormField label="الكيلومتر / Mileage" value={form.mileage} type="number" onChange={set("mileage")} />
            <FormField label="الوقود / Fuel" value={form.fuelType} type="select" onChange={set("fuelType")} options={Object.entries(fuelTypes).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label="انتهاء التأمين / Insurance Expiry" value={form.insuranceExpiry} type="date" onChange={set("insuranceExpiry")} />
            <FormField label="آخر صيانة / Last Maintenance" value={form.lastMaintenance} type="date" onChange={set("lastMaintenance")} />
            <FormField label="الصيانة القادمة / Next Maintenance" value={form.nextMaintenance} type="date" onChange={set("nextMaintenance")} />
            <FormField label={t("status")} value={form.status} type="select" onChange={set("status")} options={[{ label: "نشط / Active", value: "active" }, { label: "صيانة / Maintenance", value: "maintenance" }, { label: "معطل / Out of Service", value: "out-of-service" }, { label: "محجوز / Reserved", value: "reserved" }]} />
            <div className="form-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button><button type="submit" className="btn btn-primary">{t("save")}</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
