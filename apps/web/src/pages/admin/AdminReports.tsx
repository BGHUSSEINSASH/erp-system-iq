import { useEffect, useState } from "react";
import { get } from "../../api";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportUtils";

type AdminReportData = {
  summary: {
    totalProperties: number; totalPropertyValue: number; activeProperties: number;
    maintenanceProperties: number; totalLeases: number; activeLeases: number;
    monthlyRentalIncome: number; annualRentalIncome: number;
  };
  propertiesByTypeArr: { type: string; count: number }[];
  propertiesByStatus: { active: number; maintenance: number; disposed: number };
  leasesByStatus: { active: number; expired: number; terminated: number };
  propertiesList: { id: string; name: string; type: string; location: string; value: number; acquisitionDate: string; status: string }[];
  leasesList: { id: string; property: string; tenant: string; startDate: string; endDate: string; monthlyRent: number; status: string }[];
};

const typeLabels: Record<string, string> = {
  building: "مبنى / Building", land: "أرض / Land", vehicle: "مركبة / Vehicle",
  equipment: "معدات / Equipment", furniture: "أثاث / Furniture",
};

function getBadge(status: string) {
  if (status === "active") return "badge badge-approved";
  if (["expired", "disposed", "terminated"].includes(status)) return "badge badge-rejected";
  return "badge badge-pending";
}

function fmt(n: number) { return n.toLocaleString() + " د.ع"; }

const tabs = [
  { id: "overview", label: "نظرة عامة / Overview" },
  { id: "properties", label: "الممتلكات / Properties" },
  { id: "leases", label: "الايجارات / Leases" },
];

export default function AdminReports() {
  const [data, setData] = useState<AdminReportData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    get<AdminReportData>("/reports/admin")
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><div className="loading">جاري التحميل...</div></div>;
  if (!data) return <div className="page"><p>فشل تحميل البيانات</p></div>;

  const { summary: s, propertiesByTypeArr, propertiesByStatus: ps, leasesByStatus: ls, propertiesList, leasesList } = data;
  const maxCount = Math.max(...propertiesByTypeArr.map((p) => p.count), 1);

  const getExportData = () => {
    switch (activeTab) {
      case "properties": return { data: propertiesList, name: "Admin_Properties" };
      case "leases": return { data: leasesList, name: "Admin_Leases" };
      default: return { data: propertiesList, name: "Admin_Report" };
    }
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🏢 تقارير الادارة / Admin Reports</h2>
        <div className="export-btns">
          <button className="btn btn-secondary" onClick={() => exportToPDF("تقارير الادارة")}>PDF</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToExcel(e.data as any[], e.name); }}>Excel</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToCSV(e.data as any[], e.name); }}>CSV</button>
        </div>
      </div>

      <div className="report-tabs">
        {tabs.map((tb) => (
          <button key={tb.id} className={"report-tab " + (activeTab === tb.id ? "active" : "")} onClick={() => setActiveTab(tb.id)}>{tb.label}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon">🏢</div><div><div className="stat-value">{s.totalProperties}</div><div className="stat-label">اجمالي الممتلكات / Total</div></div></div>
            <div className="stat-card"><div className="stat-icon">💵</div><div><div className="stat-value">{fmt(s.totalPropertyValue)}</div><div className="stat-label">القيمة / Value</div></div></div>
            <div className="stat-card"><div className="stat-icon">📋</div><div><div className="stat-value">{s.activeLeases}</div><div className="stat-label">عقود نشطة / Active Leases</div></div></div>
            <div className="stat-card"><div className="stat-icon">💰</div><div><div className="stat-value">{fmt(s.monthlyRentalIncome)}</div><div className="stat-label">الدخل الشهري / Monthly Income</div></div></div>
            <div className="stat-card"><div className="stat-icon">📊</div><div><div className="stat-value">{fmt(s.annualRentalIncome)}</div><div className="stat-label">الدخل السنوي / Annual Income</div></div></div>
            <div className="stat-card"><div className="stat-icon">🔧</div><div><div className="stat-value">{s.maintenanceProperties}</div><div className="stat-label">صيانة / Maintenance</div></div></div>
          </div>

          <div className="dashboard-charts">
            <div className="chart-card">
              <h3>حسب النوع / By Type</h3>
              <div className="bar-chart">
                {propertiesByTypeArr.map((p) => (
                  <div key={p.type} className="bar-col">
                    <div className="bar-value">{p.count}</div>
                    <div className="bar" style={{ height: Math.min((p.count / maxCount) * 180, 180) + "px" }}></div>
                    <div className="bar-label">{typeLabels[p.type] || p.type}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chart-card">
              <h3>حالة الممتلكات والعقود / Status</h3>
              <div className="attendance-grid">
                <div className="att-item present"><div className="att-val">{ps.active}</div><div className="att-lbl">ممتلكات نشطة</div></div>
                <div className="att-item late"><div className="att-val">{ps.maintenance}</div><div className="att-lbl">صيانة</div></div>
                <div className="att-item absent"><div className="att-val">{ps.disposed}</div><div className="att-lbl">تم التخلص</div></div>
                <div className="att-item present"><div className="att-val">{ls.active}</div><div className="att-lbl">عقود نشطة</div></div>
                <div className="att-item absent"><div className="att-val">{ls.expired}</div><div className="att-lbl">عقود منتهية</div></div>
                <div className="att-item late"><div className="att-val">{ls.terminated}</div><div className="att-lbl">عقود ملغاة</div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "properties" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع الممتلكات / All Properties ({propertiesList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الاسم / Name</th><th>النوع / Type</th><th>الموقع / Location</th><th>القيمة / Value</th><th>تاريخ الشراء / Date</th><th>الحالة / Status</th></tr></thead>
              <tbody>{propertiesList.map((p, i) => (
                <tr key={p.id}><td>{i+1}</td><td>{p.name}</td><td>{typeLabels[p.type] || p.type}</td><td>{p.location}</td><td style={{fontWeight:600}}>{fmt(p.value)}</td><td>{p.acquisitionDate}</td><td><span className={getBadge(p.status)}>{p.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "leases" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع العقود / All Leases ({leasesList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>العقار / Property</th><th>المستأجر / Tenant</th><th>البداية / Start</th><th>النهاية / End</th><th>الايجار الشهري / Rent</th><th>الحالة / Status</th></tr></thead>
              <tbody>{leasesList.map((l, i) => (
                <tr key={l.id}><td>{i+1}</td><td>{l.property}</td><td>{l.tenant}</td><td>{l.startDate}</td><td>{l.endDate}</td><td style={{fontWeight:600}}>{fmt(l.monthlyRent)}</td><td><span className={getBadge(l.status)}>{l.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}
