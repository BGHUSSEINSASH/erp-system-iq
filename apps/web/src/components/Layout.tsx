import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { get, put } from "../api";
import { useI18n } from "../i18n";

type MenuItem = { label: string; path: string; icon: string };
type MenuSection = { key: string; title: string; icon: string; items: MenuItem[] };

const menu: MenuSection[] = [
  {
    key: "dashboard", title: "sec.dashboard", icon: "📊",
    items: [
      { label: "menu.overview", path: "/", icon: "🏠" },
      { label: "menu.ceoDashboard", path: "/ceo-dashboard", icon: "👔" },
      { label: "menu.analytics", path: "/analytics", icon: "📈" },
      { label: "menu.biometric", path: "/biometric-attendance", icon: "📷" },
    ],
  },
  {
    key: "hr", title: "sec.hr", icon: "👥",
    items: [
      { label: "menu.staffCard", path: "/hr/staff-card", icon: "🪪" },
      { label: "menu.leaveRequests", path: "/hr/leave-requests", icon: "🏖️" },
      { label: "menu.payroll", path: "/hr/payroll", icon: "💵" },
      { label: "menu.evaluations", path: "/hr/evaluations", icon: "⭐" },
      { label: "menu.recruitment", path: "/hr/recruitment", icon: "🎯" },
      { label: "menu.reports", path: "/hr/reports", icon: "📋" },
    ],
  },
  {
    key: "finance", title: "sec.finance", icon: "💰",
    items: [
      { label: "menu.accounts", path: "/finance/accounts", icon: "📒" },
      { label: "menu.payableAccounts", path: "/finance/payable-accounts", icon: "📤" },
      { label: "menu.receivableAccounts", path: "/finance/receivable-accounts", icon: "📥" },
      { label: "menu.funds", path: "/finance/funds", icon: "🏦" },
      { label: "menu.journalEntries", path: "/finance/journal-entries", icon: "📝" },
      { label: "menu.budgets", path: "/finance/budgets", icon: "📊" },
      { label: "menu.costs", path: "/finance/costs", icon: "💳" },
      { label: "menu.inventories", path: "/finance/inventories", icon: "📦" },
      { label: "menu.fixedAssets", path: "/fixed-assets", icon: "🏗️" },
      { label: "menu.reports", path: "/finance/reports", icon: "📋" },
    ],
  },
  {
    key: "admin", title: "sec.admin", icon: "🏢",
    items: [
      { label: "menu.property", path: "/admin/property", icon: "🏠" },
      { label: "menu.leaseAgreements", path: "/admin/lease-agreements", icon: "📑" },
      { label: "menu.users", path: "/admin/users", icon: "👤" },
      { label: "menu.permissions", path: "/admin/permissions", icon: "🔐" },
      { label: "menu.branches", path: "/branches", icon: "🏬" },
      { label: "menu.archives", path: "/archives", icon: "🗄️" },
      { label: "menu.reports", path: "/admin/reports", icon: "📋" },
    ],
  },
  {
    key: "purchasing", title: "sec.purchasing", icon: "📦",
    items: [
      { label: "menu.vendors", path: "/procurement/vendors", icon: "🏪" },
      { label: "menu.purchaseOrders", path: "/procurement/purchase-orders", icon: "📋" },
      { label: "menu.tenders", path: "/tenders", icon: "📜" },
    ],
  },
  {
    key: "sales", title: "sec.sales", icon: "📈",
    items: [
      { label: "menu.customers", path: "/sales/customers", icon: "👥" },
      { label: "menu.invoices", path: "/sales/invoices", icon: "🧾" },
      { label: "menu.quotations", path: "/sales/quotations", icon: "📝" },
      { label: "menu.crm", path: "/crm", icon: "🤝" },
    ],
  },
  {
    key: "it", title: "sec.it", icon: "💻",
    items: [
      { label: "menu.tickets", path: "/it/tickets", icon: "🎫" },
      { label: "menu.itAssets", path: "/it/assets", icon: "🖥️" },
      { label: "menu.systemHealth", path: "/it/system-health", icon: "💚" },
      { label: "menu.twoFA", path: "/two-factor-auth", icon: "🔒" },
    ],
  },
  {
    key: "production", title: "sec.production", icon: "🏭",
    items: [
      { label: "menu.products", path: "/production/products", icon: "📦" },
      { label: "menu.workOrders", path: "/production/work-orders", icon: "📋" },
      { label: "menu.projects", path: "/projects", icon: "📐" },
      { label: "menu.vehicles", path: "/vehicles", icon: "🚗" },
    ],
  },
  {
    key: "tools", title: "sec.tools", icon: "🔧",
    items: [
      { label: "menu.approvals", path: "/approvals", icon: "✅" },
      { label: "menu.messages", path: "/messages", icon: "💬" },
      { label: "menu.calendar", path: "/calendar", icon: "📅" },
      { label: "menu.notifications", path: "/notifications", icon: "🔔" },
      { label: "menu.auditLog", path: "/audit-log", icon: "📜" },
      { label: "menu.kanban", path: "/kanban", icon: "📌" },
      { label: "menu.documents", path: "/documents", icon: "📁" },
      { label: "menu.biReports", path: "/bi-reports", icon: "📊" },
      { label: "menu.goals", path: "/goals", icon: "🎯" },
      { label: "menu.backup", path: "/backup", icon: "💾" },
    ],
  },
  {
    key: "settings", title: "sec.settings", icon: "⚙️",
    items: [{ label: "menu.generalSettings", path: "/settings", icon: "⚙️" }],
  },
];

type SearchResult = { category: string; categoryAr: string; id: string; title: string; subtitle: string; path: string };

export default function Layout({ children }: { children: ReactNode }) {
  const { name, role, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, setLang, t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(menu.map((m) => m.key)));
  const [langOpen, setLangOpen] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("erp_dark") === "true");

  // Notifications
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<any[]>([]);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [menuResults, setMenuResults] = useState<{ icon: string; label: string; path: string; section: string }[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Hover tilt on sidebar
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Dynamic section access from API
  const [dynamicSections, setDynamicSections] = useState<string[] | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    localStorage.setItem("erp_dark", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    function fetchNotifs() {
      get<{ data: any[]; unreadCount: number }>("/notifications?unread=true")
        .then((r) => { setNotifCount(r.unreadCount); setNotifList(r.data.slice(0, 5)); })
        .catch(() => {});
    }
    fetchNotifs();
    var interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Ctrl+K shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Menu search (client-side)
  const searchMenu = useCallback((q: string) => {
    if (q.length < 1) { setMenuResults([]); return; }
    const lq = q.toLowerCase();
    const results: { icon: string; label: string; path: string; section: string }[] = [];
    for (const section of menu) {
      for (const item of section.items) {
        const translatedLabel = t(item.label).toLowerCase();
        const translatedSection = t(section.title).toLowerCase();
        if (translatedLabel.includes(lq) || translatedSection.includes(lq) || item.path.toLowerCase().includes(lq)) {
          results.push({ icon: item.icon, label: t(item.label), path: item.path, section: t(section.title) });
        }
      }
    }
    setMenuResults(results.slice(0, 8));
  }, [t]);

  // API search (debounced)
  useEffect(() => {
    searchMenu(searchQuery);
    if (searchQuery.length < 2) { setSearchResults([]); return; }
    var timer = setTimeout(() => {
      get<SearchResult[]>("/search?q=" + encodeURIComponent(searchQuery))
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchMenu]);

  // Reset highlight on results change
  const totalResults = menuResults.length + searchResults.length;
  useEffect(() => { setHighlightIdx(-1); }, [totalResults]);

  // Keyboard navigation in search dropdown
  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!searchOpen || totalResults === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx(prev => (prev + 1) % totalResults);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx(prev => (prev - 1 + totalResults) % totalResults);
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      let path = "";
      if (highlightIdx < menuResults.length) {
        path = menuResults[highlightIdx].path;
      } else {
        path = searchResults[highlightIdx - menuResults.length]?.path;
      }
      if (path) { navigate(path); setSearchOpen(false); setSearchQuery(""); }
    }
  }, [searchOpen, totalResults, highlightIdx, menuResults, searchResults, navigate]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fetch section access for the current role
  useEffect(() => {
    get<{ role: string; sections: string[] }>("/section-access/" + role)
      .then((r) => setDynamicSections(r.sections))
      .catch(() => setDynamicSections(null));
  }, [role]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const handleLogout = () => { logout(); navigate("/login"); };

  function markAllRead() {
    put("/notifications/read-all", {}).then(() => { setNotifCount(0); setNotifList([]); });
  }

  var typeIcons: Record<string, string> = {
    leave: "🏖️", invoice: "🧾", ticket: "🎫", purchase: "📦",
    payroll: "💵", system: "⚙️", approval: "✅", message: "💬",
  };

  var roleLabels: Record<string, string> = {
    admin: "مدير النظام", ceo: "المدير العام", manager: "مدير تنفيذي",
    hr_manager: "مدير HR", hr_assistant: "مساعد HR", hr: "موارد بشرية",
    finance_manager: "مدير المالية", finance_assistant: "مساعد المالية", finance: "مالية",
    sales_manager: "مدير المبيعات", sales_assistant: "مساعد المبيعات", sales: "مبيعات",
    it_manager: "مدير IT", it_assistant: "مساعد IT", it: "تكنولوجيا المعلومات",
    production_manager: "مدير الإنتاج", production_assistant: "مساعد الإنتاج", production: "إنتاج",
    purchasing_manager: "مدير المشتريات", purchasing_assistant: "مساعد المشتريات", purchasing: "مشتريات",
    admin_manager: "مدير الإدارة", admin_assistant: "مساعد الإدارة",
    employee: "موظف"
  };

  var roleIcons: Record<string, string> = {
    admin: "🛡️", ceo: "👔", manager: "💼",
    hr_manager: "👥", hr_assistant: "🧑‍💼", hr: "🧑‍💼",
    finance_manager: "💰", finance_assistant: "💳", finance: "💳",
    sales_manager: "📈", sales_assistant: "📊", sales: "📊",
    it_manager: "💻", it_assistant: "🖥️", it: "🖥️",
    production_manager: "🏭", production_assistant: "⚙️", production: "⚙️",
    purchasing_manager: "📦", purchasing_assistant: "📋", purchasing: "📋",
    admin_manager: "🏢", admin_assistant: "🏢",
    employee: "👤"
  };

  // Map API Arabic section names to keys for backward compatibility
  var arTitleToKey: Record<string, string> = {
    "لوحة التحكم": "dashboard", "الموارد البشرية": "hr", "المالية": "finance",
    "الادارة": "admin", "المشتريات واللوجستيات": "purchasing",
    "المبيعات والتسويق": "sales", "تكنولوجيا المعلومات": "it",
    "الانتاج": "production", "أدوات النظام": "tools",
    "الاعدادات": "settings"
  };
  const allSections = menu.map((m) => m.key);
  var fallbackAccess: Record<string, string[]> = {
    admin: allSections,
    ceo: allSections,
    manager: allSections,
    hr_manager: ["dashboard", "hr", "tools", "settings"],
    hr_assistant: ["dashboard", "hr", "tools", "settings"],
    hr: ["dashboard", "hr", "tools", "settings"],
    finance_manager: ["dashboard", "finance", "tools", "settings"],
    finance_assistant: ["dashboard", "finance", "tools", "settings"],
    finance: ["dashboard", "finance", "tools", "settings"],
    sales_manager: ["dashboard", "sales", "tools", "settings"],
    sales_assistant: ["dashboard", "sales", "tools", "settings"],
    sales: ["dashboard", "sales", "tools", "settings"],
    it_manager: ["dashboard", "it", "tools", "settings"],
    it_assistant: ["dashboard", "it", "tools", "settings"],
    it: ["dashboard", "it", "tools", "settings"],
    production_manager: ["dashboard", "production", "tools", "settings"],
    production_assistant: ["dashboard", "production", "tools", "settings"],
    production: ["dashboard", "production", "tools", "settings"],
    purchasing_manager: ["dashboard", "purchasing", "tools", "settings"],
    purchasing_assistant: ["dashboard", "purchasing", "tools", "settings"],
    purchasing: ["dashboard", "purchasing", "tools", "settings"],
    admin_manager: ["dashboard", "admin", "tools", "settings"],
    admin_assistant: ["dashboard", "admin", "tools", "settings"],
    employee: ["dashboard", "tools", "settings"],
  };
  var normalizedDynamic = dynamicSections
    ? dynamicSections.map(function(s) { return arTitleToKey[s] || s; })
    : null;
  const visibleSections = normalizedDynamic || fallbackAccess[role] || ["dashboard", "tools"];
  const visibleMenu = menu.filter((section) => visibleSections.includes(section.key));

  return (
    <div className={"layout-3d " + (collapsed ? "collapsed" : "")}>
      {/* Ambient background effects */}
      <div className="ambient-bg">
        <div className="ambient-orb a-orb1"></div>
        <div className="ambient-orb a-orb2"></div>
        <div className="ambient-orb a-orb3"></div>
      </div>

      {/* Sidebar */}
      <aside className="sidebar-3d">
        <div className="sidebar-glow-top"></div>
        <div className="sidebar-inner">
          <div className="sidebar-header-3d">
            <div className="logo-3d-wrap">
              <div className="logo-3d">
                <div className="logo-cube">
                  <span>ERP</span>
                </div>
              </div>
              {!collapsed && <div className="logo-text-3d">
                <span className="logo-main-text">{t("brand.main")}</span>
                <span className="logo-sub-text">{t("brand.sub")}</span>
              </div>}
            </div>
            <button className="toggle-btn-3d" onClick={() => setCollapsed(!collapsed)}>
              <div className={"hamburger " + (collapsed ? "" : "open")}>
                <span></span><span></span><span></span>
              </div>
            </button>
          </div>

          <nav className="sidebar-nav-3d">
            {visibleMenu.map((section, si) => (
              <div key={section.key} className="nav-section-3d">
                <button
                  className={"nav-section-btn " + (openSections.has(section.key) ? "open" : "")}
                  onClick={() => toggleSection(section.key)}
                  onMouseEnter={() => setHoverIndex(si)}
                  onMouseLeave={() => setHoverIndex(-1)}
                  style={hoverIndex === si ? { transform: "translateX(-4px) scale(1.02)" } : {}}
                >
                  <span className="nav-section-icon">{section.icon}</span>
                  {!collapsed && <>
                    <span className="nav-section-label">{t(section.title)}</span>
                    <span className={"nav-chevron " + (openSections.has(section.key) ? "open" : "")}>‹</span>
                  </>}
                </button>
                {!collapsed && openSections.has(section.key) && (
                  <div className="nav-items-3d">
                    {section.items.map((item) => (
                      <NavLink key={item.path} to={item.path} className={({ isActive }) => "nav-link-3d " + (isActive ? "active" : "")}>
                        <span className="nav-link-icon">{item.icon}</span>
                        <span className="nav-link-label">{t(item.label)}</span>
                        <div className="nav-link-glow"></div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User card at bottom */}
          {!collapsed && <div className="sidebar-user-card">
            <div className="user-avatar-3d">
              {roleIcons[role] || "👤"}
            </div>
            <div className="user-info-3d">
              <div className="user-name-3d">{name}</div>
              <div className="user-role-3d">{t("role." + role)}</div>
            </div>
            <button className="logout-btn-3d" onClick={handleLogout} title={t("logoutFull")}>
              ←
            </button>
          </div>}
        </div>
      </aside>

      {/* Main Area */}
      <div className="main-area-3d">
        <header className="topbar-3d">
          <div className="topbar-left-3d">
            <h1 className="brand-3d">
              <span className="brand-icon">🏛️</span>
              {t("brand")}
            </h1>
          </div>

          <div className="topbar-center-3d" ref={searchRef}>
            <div className="search-box-3d">
              <div className="search-icon-3d">🔍</div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("search.placeholder")}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                className="search-input-3d"
              />
              {searchQuery ? (
                <button className="search-clear-3d" onClick={() => { setSearchQuery(""); setSearchResults([]); setMenuResults([]); }}>✕</button>
              ) : (
                <div className="search-kbd"><kbd>Ctrl</kbd><kbd>K</kbd></div>
              )}
            </div>
            {searchOpen && (menuResults.length > 0 || searchResults.length > 0) && (
              <div className="search-dropdown-3d">
                {menuResults.length > 0 && (
                  <>
                    <div className="search-section-label">📄 {t("search.pages") || "الصفحات"}</div>
                    {menuResults.map((m, i) => (
                      <div
                        key={"m-" + m.path}
                        className={"search-result-3d" + (highlightIdx === i ? " highlighted" : "")}
                        onClick={() => { navigate(m.path); setSearchOpen(false); setSearchQuery(""); }}
                        onMouseEnter={() => setHighlightIdx(i)}
                      >
                        <div className="sr-icon">{m.icon}</div>
                        <div className="sr-body">
                          <div className="sr-cat">{m.section}</div>
                          <div className="sr-title">{m.label}</div>
                        </div>
                        <div className="sr-shortcut">↩</div>
                      </div>
                    ))}
                  </>
                )}
                {searchResults.length > 0 && (
                  <>
                    <div className="search-section-label">🗂️ {t("search.data") || "البيانات"}</div>
                    {searchResults.map((r, i) => {
                      const idx = menuResults.length + i;
                      return (
                        <div
                          key={r.id}
                          className={"search-result-3d" + (highlightIdx === idx ? " highlighted" : "")}
                          onClick={() => { navigate(r.path); setSearchOpen(false); setSearchQuery(""); }}
                          onMouseEnter={() => setHighlightIdx(idx)}
                        >
                          <div className="sr-icon">🔹</div>
                          <div className="sr-body">
                            <div className="sr-cat">{r.categoryAr}</div>
                            <div className="sr-title">{r.title}</div>
                            <div className="sr-sub">{r.subtitle}</div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
            {searchOpen && searchQuery.length >= 2 && menuResults.length === 0 && searchResults.length === 0 && (
              <div className="search-dropdown-3d">
                <div className="search-empty">
                  <span className="search-empty-icon">🔍</span>
                  {t("noResults")}
                </div>
              </div>
            )}
          </div>

          <div className="topbar-actions-3d">
            {/* Language Switcher */}
            <div className="lang-switcher-3d" ref={langRef} style={{ position: "relative" }}>
              <button className="action-orb" onClick={() => setLangOpen(!langOpen)} title={t("language")}>
                <span className="orb-icon">{lang === "ar" ? "عر" : lang === "en" ? "EN" : "کو"}</span>
                <div className="orb-ring"></div>
              </button>
              {langOpen && (
                <div className="lang-dropdown-3d">
                  <button className={lang === "ar" ? "lang-opt active" : "lang-opt"} onClick={() => { setLang("ar"); setLangOpen(false); }}>
                    🇮🇶 {t("lang.ar")}
                  </button>
                  <button className={lang === "en" ? "lang-opt active" : "lang-opt"} onClick={() => { setLang("en"); setLangOpen(false); }}>
                    🇬🇧 {t("lang.en")}
                  </button>
                  <button className={lang === "ku" ? "lang-opt active" : "lang-opt"} onClick={() => { setLang("ku"); setLangOpen(false); }}>
                    🇰🇼 {t("lang.ku")}
                  </button>
                </div>
              )}
            </div>

            {/* Dark mode */}
            <button className="action-orb" onClick={() => setDarkMode(!darkMode)} title={darkMode ? "Light Mode" : "Dark Mode"}>
              <span className="orb-icon">{darkMode ? "☀️" : "🌙"}</span>
              <div className="orb-ring"></div>
            </button>

            {/* Messages */}
            <button className="action-orb" onClick={() => navigate("/messages")} title="المراسلات">
              <span className="orb-icon">💬</span>
              <div className="orb-ring"></div>
            </button>

            {/* Notifications */}
            <div className="notif-wrap-3d" ref={notifRef}>
              <button className="action-orb" onClick={() => setNotifOpen(!notifOpen)}>
                <span className="orb-icon">🔔</span>
                <div className="orb-ring"></div>
                {notifCount > 0 && <span className="notif-badge-3d">{notifCount}</span>}
              </button>
              {notifOpen && (
                <div className="notif-panel-3d">
                  <div className="notif-panel-header">
                    <strong>{t("notif.title")}</strong>
                    {notifCount > 0 && <button className="notif-mark-btn" onClick={markAllRead}>{t("notif.markAll")}</button>}
                  </div>
                  {notifList.length === 0 ? (
                    <div className="notif-empty">{t("notif.empty")}</div>
                  ) : (
                    notifList.map((n: any) => (
                      <div key={n.id} className="notif-panel-item" style={{ cursor: "pointer" }} onClick={() => {
                        const pathMap: Record<string, string> = { leave: "/hr/leave-requests", invoice: "/sales/invoices", ticket: "/it/tickets", purchase: "/procurement/purchase-orders", payroll: "/hr/payroll", approval: "/approvals", message: "/messages" };
                        const target = pathMap[n.type] || "/notifications";
                        navigate(target);
                        setNotifOpen(false);
                        put("/notifications/" + n.id, { ...n, read: true }).catch(() => {});
                      }}>
                        <span className="notif-item-icon">{typeIcons[n.type] || "📌"}</span>
                        <div>
                          <div className="notif-item-title">{n.titleAr}</div>
                          <div className="notif-item-msg">{n.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                  <div className="notif-panel-footer" onClick={() => { navigate("/notifications"); setNotifOpen(false); }}>
                    {t("notif.viewAll")} →
                  </div>
                </div>
              )}
            </div>

            {/* User info */}
            <div className="topbar-user-3d">
              <span className="topbar-user-icon">{roleIcons[role] || "👤"}</span>
              <div className="topbar-user-info">
                <span className="topbar-user-name">{name}</span>
                <span className={"topbar-user-role badge badge-" + role}>{role}</span>
              </div>
            </div>

            <button className="logout-topbar-3d" onClick={handleLogout}>
              {t("logout")}
            </button>
          </div>
        </header>

        <main className="content-3d">{children}</main>
      </div>
    </div>
  );
}
