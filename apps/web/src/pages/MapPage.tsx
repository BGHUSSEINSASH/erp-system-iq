import { useEffect, useState } from "react";
import { get } from "../api";

export default function MapPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");

  var branches = [
    { id: "b-1", name: "المقر الرئيسي / HQ", city: "بغداد", address: "شارع السعدون، بغداد", lat: 33.3152, lng: 44.3661, employeeCount: 15, color: "#6366f1" },
    { id: "b-2", name: "فرع أربيل / Erbil Branch", city: "أربيل", address: "شارع 60 متري، أربيل", lat: 36.1901, lng: 44.0091, employeeCount: 8, color: "#10b981" },
    { id: "b-3", name: "فرع البصرة / Basra Branch", city: "البصرة", address: "شارع الكويت، البصرة", lat: 30.5085, lng: 47.7804, employeeCount: 6, color: "#f59e0b" },
    { id: "b-4", name: "فرع السليمانية / Sulaymaniyah", city: "السليمانية", address: "شارع سالم، السليمانية", lat: 35.5574, lng: 45.4353, employeeCount: 4, color: "#ef4444" },
    { id: "b-5", name: "فرع النجف / Najaf Branch", city: "النجف", address: "شارع الكوفة، النجف", lat: 32.0025, lng: 44.3260, employeeCount: 3, color: "#8b5cf6" },
  ];

  useEffect(function () {
    get("/employees").then(function (r: any) { setEmployees(Array.isArray(r) ? r : r.employees || []); setLoading(false); });
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  var totalEmp = branches.reduce(function (s, b) { return s + b.employeeCount; }, 0);

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🗺️ خريطة الفروع والموظفين / Branch & Employee Map</h2>
        <div className="view-toggle">
          <button className={"btn btn-sm" + (viewMode === "grid" ? " btn-primary" : " btn-outline")} onClick={function () { setViewMode("grid"); }}>شبكة</button>
          <button className={"btn btn-sm" + (viewMode === "list" ? " btn-primary" : " btn-outline")} onClick={function () { setViewMode("list"); }}>قائمة</button>
        </div>
      </div>

      {/* Map Summary */}
      <div className="map-summary">
        <div className="map-stat"><span className="stat-icon">🏢</span><span className="stat-value">{branches.length}</span><span className="stat-label">فروع / Branches</span></div>
        <div className="map-stat"><span className="stat-icon">👥</span><span className="stat-value">{totalEmp}</span><span className="stat-label">موظف / Employees</span></div>
        <div className="map-stat"><span className="stat-icon">📍</span><span className="stat-value">{branches.length}</span><span className="stat-label">مدن / Cities</span></div>
      </div>

      {/* SVG Iraq Map (Simplified) */}
      <div className="map-visual">
        <svg viewBox="0 0 600 500" className="iraq-map-svg">
          <rect width="600" height="500" fill="rgba(99,102,241,0.05)" rx="12" />
          <text x="300" y="30" textAnchor="middle" fill="var(--text-color)" fontSize="16" fontWeight="bold">خريطة العراق / Iraq Map</text>

          {/* Simplified Iraq outline */}
          <path d="M180,80 L280,60 L380,80 L450,120 L480,200 L500,300 L480,380 L420,440 L340,460 L260,450 L200,400 L160,320 L140,240 L150,160 Z" fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.3)" strokeWidth="2" />

          {/* Branch pins */}
          {branches.map(function (b) {
            // Map lat/lng to SVG coords (approximate)
            var x = 140 + ((b.lng - 43) / 5) * 360;
            var y = 460 - ((b.lat - 30) / 7) * 400;
            return (
              <g key={b.id}>
                <circle cx={x} cy={y} r="18" fill={b.color} opacity="0.3" />
                <circle cx={x} cy={y} r="10" fill={b.color} stroke="white" strokeWidth="2" />
                <text x={x} y={y + 4} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">{b.employeeCount}</text>
                <text x={x} y={y - 22} textAnchor="middle" fill="var(--text-color)" fontSize="10">{b.city}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Branch Cards */}
      <div className={viewMode === "grid" ? "branches-grid" : "branches-list"}>
        {branches.map(function (branch) {
          return (
            <div key={branch.id} className="branch-card" style={{ borderRightColor: branch.color }}>
              <div className="branch-header">
                <span className="branch-dot" style={{ background: branch.color }}></span>
                <h3>{branch.name}</h3>
              </div>
              <div className="branch-details">
                <p>📍 {branch.address}</p>
                <p>🏙️ {branch.city}</p>
                <p>👥 {branch.employeeCount} موظف</p>
                <p>🌐 {branch.lat.toFixed(4)}, {branch.lng.toFixed(4)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
