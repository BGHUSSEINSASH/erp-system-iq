import { useEffect, useState } from "react";
import { useI18n } from "../../i18n";
import { get, put } from "../../api";
import { useAuth } from "../../context/AuthContext";

type Permission = {
  id: string;
  roleId: string;
  roleName: string;
  module: string;
  moduleCategory: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
};

type RoleItem = { id: string; name: string; department?: string };

type PermData = {
  items: Permission[];
  roles: RoleItem[];
  modules: string[];
  categories: string[];
};

type SectionAccessData = {
  accessMap: Record<string, string[]>;
  allSections: string[];
  roles: string[];
};

const deptGroups = [
  { key: "system", label: "إدارة النظام / System", icon: "⚙️" },
  { key: "hr", label: "الموارد البشرية / HR", icon: "👥" },
  { key: "finance", label: "المالية / Finance", icon: "💰" },
  { key: "sales", label: "المبيعات / Sales", icon: "📈" },
  { key: "it", label: "تكنولوجيا المعلومات / IT", icon: "🖥️" },
  { key: "production", label: "الإنتاج / Production", icon: "🏭" },
  { key: "purchasing", label: "المشتريات / Purchasing", icon: "📦" },
  { key: "admin", label: "الإدارة / Admin", icon: "🏢" },
  { key: "none", label: "عام / General", icon: "👤" },
];

const roleNameMap: Record<string, string> = {
  admin: "مدير النظام / Admin",
  ceo: "المدير العام / CEO",
  manager: "المدير التنفيذي / Manager",
  hr_manager: "مدير الموارد البشرية",
  hr_assistant: "مساعد مدير HR",
  hr: "موظف HR",
  finance_manager: "مدير المالية",
  finance_assistant: "مساعد مدير المالية",
  finance: "موظف مالية",
  sales_manager: "مدير المبيعات",
  sales_assistant: "مساعد مدير المبيعات",
  sales: "موظف مبيعات",
  it_manager: "مدير IT",
  it_assistant: "مساعد مدير IT",
  it: "موظف IT",
  production_manager: "مدير الإنتاج",
  production_assistant: "مساعد مدير الإنتاج",
  production: "موظف إنتاج",
  purchasing_manager: "مدير المشتريات",
  purchasing_assistant: "مساعد مدير المشتريات",
  purchasing: "موظف مشتريات",
  admin_manager: "مدير الإدارة",
  admin_assistant: "مساعد مدير الإدارة",
  employee: "موظف",
};

const sectionIcons: Record<string, string> = {
  "لوحة التحكم": "📊",
  "الموارد البشرية": "👥",
  "المالية": "💰",
  "الادارة": "🏢",
  "المشتريات واللوجستيات": "📦",
  "المبيعات والتسويق": "📈",
  "تكنولوجيا المعلومات": "🖥️",
  "الانتاج": "🏭",
  "أدوات النظام": "🔧",
  "الأدوات المتقدمة": "🚀",
  "الاعدادات": "⚙️",
};

const categoryIcons: Record<string, string> = {
  "لوحة التحكم / Dashboard": "📊",
  "الموارد البشرية / HR": "👥",
  "المالية / Finance": "💰",
  "الإدارة / Admin": "🏢",
  "المشتريات / Procurement": "📦",
  "المبيعات / Sales": "📈",
  "تكنولوجيا المعلومات / IT": "🖥️",
  "الإنتاج / Production": "🏭",
  "أدوات النظام / System Tools": "🔧",
  "الأدوات المتقدمة / Advanced": "🚀",
};

export default function Permissions() {
  const { t } = useI18n();
  const { role } = useAuth();
  const [data, setData] = useState<PermData | null>(null);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"permissions" | "sections">("permissions");
  const [sectionData, setSectionData] = useState<SectionAccessData | null>(null);
  const [sectionMap, setSectionMap] = useState<Record<string, string[]>>({});
  const [sectionSaving, setSectionSaving] = useState(false);
  const [sectionSaved, setSectionSaved] = useState(false);
  const [selectedDeptGroup, setSelectedDeptGroup] = useState("system");
  const [sectionSelectedDept, setSectionSelectedDept] = useState("system");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    get<PermData>("/permissions").then(d => {
      setData(d);
      // Expand all categories by default
      const expanded: Record<string, boolean> = {};
      (d.categories || []).forEach((c: string) => { expanded[c] = true; });
      setExpandedCategories(expanded);
    });
    get<SectionAccessData>("/section-access").then((d) => {
      setSectionData(d);
      setSectionMap(d.accessMap);
    });
  }, []);

  if (role !== "admin" && role !== "ceo") {
    return (
      <div className="page">
        <div className="page-header"><h2>{t("page.permissions")}</h2></div>
        <div className="chart-card" style={{ textAlign: "center", padding: 60 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
          <h3 style={{ marginBottom: 8 }}>غير مسموح / Access Denied</h3>
          <p style={{ color: "var(--text-secondary)" }}>هذه الصفحة متاحة فقط لمدير النظام / This page is only available for system administrators</p>
        </div>
      </div>
    );
  }

  if (!data) return <div className="loading">جاري التحميل...</div>;

  const getRoleDept = (roleId: string): string => {
    if (["admin", "ceo", "manager"].includes(roleId)) return "system";
    if (roleId.startsWith("hr")) return "hr";
    if (roleId.startsWith("finance")) return "finance";
    if (roleId.startsWith("sales")) return "sales";
    if (roleId.startsWith("it")) return "it";
    if (roleId.startsWith("production")) return "production";
    if (roleId.startsWith("purchasing")) return "purchasing";
    if (roleId.startsWith("admin_")) return "admin";
    return "none";
  };

  const filteredRoles = data.roles.filter(r => getRoleDept(r.id) === selectedDeptGroup);
  const rolePerms = data.items.filter(p => p.roleId === selectedRole);

  // Group permissions by category
  const categories = data.categories || [];
  const permsByCategory: Record<string, Permission[]> = {};
  for (const cat of categories) {
    permsByCategory[cat] = rolePerms.filter(p => p.moduleCategory === cat);
  }

  const togglePerm = (permId: string, field: keyof Permission) => {
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map(p =>
          p.id === permId ? { ...p, [field]: !p[field] } : p
        ),
      };
    });
    setSaved(false);
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const toggleAllInCategory = (cat: string, field: keyof Permission, value: boolean) => {
    setData(prev => {
      if (!prev) return prev;
      const catPerms = prev.items.filter(p => p.roleId === selectedRole && p.moduleCategory === cat);
      const ids = new Set(catPerms.map(p => p.id));
      return {
        ...prev,
        items: prev.items.map(p =>
          ids.has(p.id) ? { ...p, [field]: value } : p
        ),
      };
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await put("/permissions/bulk/update", { permissions: rolePerms });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("خطأ في الحفظ / Save Error");
    }
    setSaving(false);
  };

  const toggleSectionForRole = (r: string, section: string) => {
    if (r === "admin") return;
    setSectionMap(prev => {
      const current = prev[r] || [];
      const has = current.includes(section);
      const updated = has ? current.filter(s => s !== section) : [...current, section];
      return { ...prev, [r]: updated };
    });
    setSectionSaved(false);
  };

  const handleSaveSections = async () => {
    setSectionSaving(true);
    try {
      const rolesToSave = sectionData?.roles.filter(r => r !== "admin" && r !== "ceo") || [];
      for (const r of rolesToSave) {
        if (sectionMap[r]) {
          await put("/section-access/" + r, { sections: sectionMap[r] });
        }
      }
      setSectionSaved(true);
      setTimeout(() => setSectionSaved(false), 3000);
    } catch {
      alert("خطأ في الحفظ / Save Error");
    }
    setSectionSaving(false);
  };

  const sectionFilteredRoles = (sectionData?.roles || []).filter(r => {
    if (sectionSelectedDept === "all") return true;
    return getRoleDept(r) === sectionSelectedDept;
  });

  // Count permissions summary
  const totalModules = rolePerms.length;
  const activeView = rolePerms.filter(p => p.canView).length;
  const activeCreate = rolePerms.filter(p => p.canCreate).length;
  const activeEdit = rolePerms.filter(p => p.canEdit).length;
  const activeDelete = rolePerms.filter(p => p.canDelete).length;

  return (
    <div className="page">
      <div className="page-header">
        <h2>🔐 {t("page.permissions")}</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {activeTab === "permissions" && saved && <span className="badge badge-approved" style={{ animation: "fadeIn .3s" }}>✅ تم الحفظ / Saved</span>}
          {activeTab === "sections" && sectionSaved && <span className="badge badge-approved" style={{ animation: "fadeIn .3s" }}>✅ تم الحفظ / Saved</span>}
          {activeTab === "permissions" && (
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? t("save") + "..." : t("save")}
            </button>
          )}
          {activeTab === "sections" && (
            <button className="btn btn-primary" onClick={handleSaveSections} disabled={sectionSaving}>
              {sectionSaving ? t("save") + "..." : t("save")}
            </button>
          )}
        </div>
      </div>

      {/* Main tabs */}
      <div className="report-tabs" style={{ marginBottom: 16 }}>
        <button
          className={"report-tab " + (activeTab === "permissions" ? "active" : "")}
          onClick={() => setActiveTab("permissions")}
        >
          🔐 صلاحيات الوحدات / Module Permissions
        </button>
        <button
          className={"report-tab " + (activeTab === "sections" ? "active" : "")}
          onClick={() => setActiveTab("sections")}
        >
          📂 إظهار/إخفاء الأقسام / Section Visibility
        </button>
      </div>

      {activeTab === "permissions" && (
        <>
          {/* Department group selector */}
          <div className="report-tabs" style={{ marginBottom: 12, flexWrap: "wrap" }}>
            {deptGroups.map(g => (
              <button
                key={g.key}
                className={"report-tab " + (selectedDeptGroup === g.key ? "active" : "")}
                onClick={() => { setSelectedDeptGroup(g.key); const first = data.roles.find(r => getRoleDept(r.id) === g.key); if (first) setSelectedRole(first.id); }}
                style={{ fontSize: 13 }}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          {/* Role selector within department */}
          <div className="report-tabs" style={{ marginBottom: 16 }}>
            {filteredRoles.map(r => (
              <button
                key={r.id}
                className={"report-tab " + (selectedRole === r.id ? "active" : "")}
                onClick={() => setSelectedRole(r.id)}
              >
                {roleNameMap[r.id] || r.name}
              </button>
            ))}
          </div>

          {/* Permission summary cards */}
          <div className="stats-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--primary)" }}>{totalModules}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>إجمالي الوحدات / Total Modules</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#10b981" }}>{activeView}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>عرض / View</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#3b82f6" }}>{activeCreate}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>إنشاء / Create</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#f59e0b" }}>{activeEdit}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>تعديل / Edit</div>
            </div>
            <div className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{activeDelete}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>حذف / Delete</div>
            </div>
          </div>

          {/* Permissions by category (collapsible groups) */}
          <div className="animate-in">
            {categories.map(cat => {
              const catPerms = permsByCategory[cat] || [];
              if (catPerms.length === 0) return null;
              const isExpanded = expandedCategories[cat] !== false;
              const catIcon = categoryIcons[cat] || "📁";
              const allView = catPerms.every(p => p.canView);
              const allCreate = catPerms.every(p => p.canCreate);
              const allEdit = catPerms.every(p => p.canEdit);
              const allDelete = catPerms.every(p => p.canDelete);
              const allExport = catPerms.every(p => p.canExport);

              return (
                <div key={cat} className="chart-card" style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
                  {/* Category header */}
                  <div
                    onClick={() => toggleCategory(cat)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 20px", cursor: "pointer",
                      background: "var(--glass-bg)", borderBottom: isExpanded ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{catIcon}</span>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{cat}</span>
                      <span className="badge" style={{ fontSize: 11 }}>{catPerms.length} وحدة</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      {/* Bulk toggle for entire category */}
                      <div style={{ display: "flex", gap: 8, fontSize: 11, color: "var(--text-secondary)" }} onClick={e => e.stopPropagation()}>
                        <button className="btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => toggleAllInCategory(cat, "canView", !allView)} title="Toggle all View">
                          👁 {allView ? "✓" : "○"}
                        </button>
                        <button className="btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => toggleAllInCategory(cat, "canCreate", !allCreate)} title="Toggle all Create">
                          ➕ {allCreate ? "✓" : "○"}
                        </button>
                        <button className="btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => toggleAllInCategory(cat, "canEdit", !allEdit)} title="Toggle all Edit">
                          ✏️ {allEdit ? "✓" : "○"}
                        </button>
                        <button className="btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => toggleAllInCategory(cat, "canDelete", !allDelete)} title="Toggle all Delete">
                          🗑 {allDelete ? "✓" : "○"}
                        </button>
                        <button className="btn" style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => toggleAllInCategory(cat, "canExport", !allExport)} title="Toggle all Export">
                          📥 {allExport ? "✓" : "○"}
                        </button>
                      </div>
                      <span style={{ fontSize: 16, transition: "transform .2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
                    </div>
                  </div>

                  {/* Module rows */}
                  {isExpanded && (
                    <div className="table-wrapper" style={{ margin: 0 }}>
                      <table className="data-table" style={{ margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ paddingRight: 20 }}>الوحدة / Module</th>
                            <th style={{ textAlign: "center", width: 80 }}>عرض / View</th>
                            <th style={{ textAlign: "center", width: 80 }}>إنشاء / Create</th>
                            <th style={{ textAlign: "center", width: 80 }}>تعديل / Edit</th>
                            <th style={{ textAlign: "center", width: 80 }}>حذف / Delete</th>
                            <th style={{ textAlign: "center", width: 80 }}>تصدير / Export</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catPerms.map(p => (
                            <tr key={p.id}>
                              <td style={{ fontWeight: 600, paddingRight: 20 }}>{p.module}</td>
                              {(["canView", "canCreate", "canEdit", "canDelete", "canExport"] as const).map(field => (
                                <td key={field} style={{ textAlign: "center" }}>
                                  <label className="toggle-switch">
                                    <input type="checkbox" checked={p[field]} onChange={() => togglePerm(p.id, field)} />
                                    <span className="toggle-slider" />
                                  </label>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === "sections" && sectionData && (
        <div className="animate-in">
          <div className="chart-card" style={{ padding: 20, marginBottom: 20 }}>
            <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: 14 }}>
              ⚡ تحكم في الأقسام التي تظهر لكل دور في القائمة الجانبية. المدير (Admin) و المدير العام (CEO) يملكان صلاحية الوصول لجميع الأقسام دائماً.
            </p>
          </div>

          {/* Department filter for sections */}
          <div className="report-tabs" style={{ marginBottom: 16, flexWrap: "wrap" }}>
            <button
              className={"report-tab " + (sectionSelectedDept === "all" ? "active" : "")}
              onClick={() => setSectionSelectedDept("all")}
              style={{ fontSize: 13 }}
            >
              📋 الكل / All
            </button>
            {deptGroups.map(g => (
              <button
                key={g.key}
                className={"report-tab " + (sectionSelectedDept === g.key ? "active" : "")}
                onClick={() => setSectionSelectedDept(g.key)}
                style={{ fontSize: 13 }}
              >
                {g.icon} {g.label}
              </button>
            ))}
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>القسم / Section</th>
                  {sectionFilteredRoles.filter(r => r !== "admin" && r !== "ceo").map(r => (
                    <th key={r} style={{ textAlign: "center", minWidth: 100, fontSize: 12, whiteSpace: "nowrap" }}>
                      {roleNameMap[r] || r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectionData.allSections.map(section => (
                  <tr key={section}>
                    <td style={{ fontWeight: 600 }}>
                      <span style={{ marginLeft: 8 }}>{sectionIcons[section] || "📁"}</span>
                      {section}
                    </td>
                    {sectionFilteredRoles.filter(r => r !== "admin" && r !== "ceo").map(r => {
                      const isChecked = (sectionMap[r] || []).includes(section);
                      return (
                        <td key={r} style={{ textAlign: "center" }}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSectionForRole(r, section)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
