import { useState, useEffect } from "react";
import { get } from "../api";
import { useAuth } from "../context/AuthContext";

type UserInfo = { id: string; username: string; name: string; role: string; email?: string; phone?: string; department?: string; lastLogin?: string; status?: string };
type SystemInfo = { version: string; uptime: string; nodeVersion: string; platform: string; memory: string; cpu: string; dbSize: string; apiCalls: number };

const TABS = [
  { id: "general", label: "\u2699\ufe0f عام / General" },
  { id: "appearance", label: "\ud83c\udfa8 المظهر / Appearance" },
  { id: "security", label: "\ud83d\udd12 الأمان / Security" },
  { id: "notifications", label: "\ud83d\udd14 الإشعارات / Notifications" },
  { id: "users", label: "\ud83d\udc65 المستخدمين / Users" },
  { id: "backup", label: "\ud83d\udcbe النسخ الاحتياطي / Backup" },
  { id: "email", label: "\ud83d\udce7 البريد الإلكتروني / Email" },
  { id: "integration", label: "\ud83d\udd17 التكاملات / Integrations" },
  { id: "about", label: "\u2139\ufe0f حول النظام / About" },
] as const;

export default function Settings() {
  const { role } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("general");
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);

  // General
  const [company, setCompany] = useState("شركة المؤسسة");
  const [companyNameEn, setCompanyNameEn] = useState("Al-Muassasa Company");
  const [currency, setCurrency] = useState("IQD");
  const [secondaryCurrency, setSecondaryCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("1480");
  const [tz, setTz] = useState("Asia/Baghdad");
  const [lang, setLang] = useState("ar-en");
  const [fiscalYearStart, setFiscalYearStart] = useState("01");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");
  const [companyPhone, setCompanyPhone] = useState("+964 770 000 0000");
  const [companyEmail, setCompanyEmail] = useState("info@company.iq");
  const [companyAddress, setCompanyAddress] = useState("بغداد، العراق");
  const [taxNumber, setTaxNumber] = useState("");

  // Appearance
  const [theme, setTheme] = useState("dark");
  const [fontSize, setFontSize] = useState("medium");
  const [layoutDir, setLayoutDir] = useState("rtl");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#6366f1");

  // Security
  const [twoFA, setTwoFA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [auditLog, setAuditLog] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState("");
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [passwordExpiry, setPasswordExpiry] = useState("90");
  const [requireCaptcha, setRequireCaptcha] = useState(false);

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [payrollReminder, setPayrollReminder] = useState(true);
  const [leaveAlerts, setLeaveAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [contractExpiry, setContractExpiry] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [approvalAlerts, setApprovalAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  // Backup
  const [backupSchedule, setBackupSchedule] = useState("daily");
  const [backupRetention, setBackupRetention] = useState("30");
  const [backupLocation, setBackupLocation] = useState("local");
  const [autoBackup, setAutoBackup] = useState(true);
  const [backupEncrypt, setBackupEncrypt] = useState(true);

  // Email / SMTP
  const [smtpHost, setSmtpHost] = useState("smtp.gmail.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [smtpSecure, setSmtpSecure] = useState("tls");
  const [senderName, setSenderName] = useState("نظام ERP");
  const [senderEmail, setSenderEmail] = useState("noreply@company.iq");

  // Integrations
  const [apiEnabled, setApiEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [smsProvider, setSmsProvider] = useState("none");
  const [smsApiKey, setSmsApiKey] = useState("");

  // System info
  const [sysInfo] = useState<SystemInfo>({
    version: "2.1.0", uptime: "15 يوم 8 ساعة", nodeVersion: "v20.11.0",
    platform: "Linux x64", memory: "1.2 GB / 4 GB", cpu: "2 vCPU",
    dbSize: "256 MB", apiCalls: 15420
  });

  useEffect(() => {
    get<{ items: UserInfo[] }>("/users").then(r => setUsers(r.items || [])).catch(() => {});
  }, []);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const cardStyle = { background: "var(--card)", borderRadius: 16, padding: 24, border: "1px solid var(--border)", marginBottom: 16 };

  const sectionTitle = (icon: string, title: string) => (
    <h3 style={{ margin: "0 0 20px 0", fontSize: 16, display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 20 }}>{icon}</span> {title}
    </h3>
  );

  const fieldLabel = (label: string) => (
    <label style={{ fontSize: 12, color: "var(--ink-muted)", display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
  );

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-subtle)", color: "var(--ink)", fontSize: 13, fontFamily: "var(--font)" };
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: "pointer" };

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    width: 44, height: 24, borderRadius: 12, background: active ? "#6366f1" : "var(--bg-subtle)",
    border: `1px solid ${active ? "#6366f1" : "var(--border)"}`, cursor: "pointer",
    position: "relative", transition: "all .2s", display: "inline-block"
  });

  const toggleDot = (active: boolean): React.CSSProperties => ({
    width: 18, height: 18, borderRadius: "50%", background: "#fff",
    position: "absolute", top: 2, transition: "all .2s",
    ...(active ? { left: 22 } : { left: 2 }),
    boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
  });

  const Toggle = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      <div style={toggleStyle(checked)} onClick={() => onChange(!checked)}>
        <div style={toggleDot(checked)} />
      </div>
    </div>
  );

  return (
    <div className="page animate-in">
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h2>{"\u2699\ufe0f"} الاعدادات العامة / System Settings</h2>
          <p style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>إدارة إعدادات النظام والتخصيصات / Manage system settings and configurations</p>
        </div>
        {saved && (
          <div style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: 13, fontWeight: 600, border: "1px solid rgba(16,185,129,0.2)" }}>
            {"\u2705"} تم حفظ الاعدادات بنجاح / Settings saved!
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="report-tabs" style={{ flexWrap: "wrap", marginBottom: 24, gap: 6 }}>
        {TABS.map(tab => (
          <button key={tab.id} className={"report-tab " + (activeTab === tab.id ? "active" : "")}
            onClick={() => setActiveTab(tab.id)} style={{ fontSize: 12, padding: "8px 14px" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== GENERAL ===== */}
      {activeTab === "general" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83c\udfe2", "معلومات الشركة / Company Info")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("اسم الشركة (عربي) / Company Name (Arabic)")}
                  <input type="text" value={company} onChange={e => setCompany(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  {fieldLabel("اسم الشركة (إنكليزي) / Company Name (English)")}
                  <input type="text" value={companyNameEn} onChange={e => setCompanyNameEn(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    {fieldLabel("هاتف الشركة / Phone")}
                    <input type="text" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    {fieldLabel("البريد الإلكتروني / Email")}
                    <input type="email" value={companyEmail} onChange={e => setCompanyEmail(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  {fieldLabel("العنوان / Address")}
                  <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  {fieldLabel("الرقم الضريبي / Tax Number")}
                  <input type="text" value={taxNumber} onChange={e => setTaxNumber(e.target.value)} style={inputStyle} placeholder="اختياري / Optional" />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83c\udf10", "الإعدادات الإقليمية / Regional Settings")}
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    {fieldLabel("العملة الرئيسية / Primary Currency")}
                    <select value={currency} onChange={e => setCurrency(e.target.value)} style={selectStyle}>
                      <option value="IQD">د.ع – دينار عراقي / IQD</option>
                      <option value="USD">$ – دولار أمريكي / USD</option>
                    </select>
                  </div>
                  <div>
                    {fieldLabel("العملة الثانوية / Secondary Currency")}
                    <select value={secondaryCurrency} onChange={e => setSecondaryCurrency(e.target.value)} style={selectStyle}>
                      <option value="USD">$ – دولار أمريكي / USD</option>
                      <option value="IQD">د.ع – دينار عراقي / IQD</option>
                    </select>
                  </div>
                </div>
                <div>
                  {fieldLabel("سعر الصرف / Exchange Rate (1 USD = ? IQD)")}
                  <input type="number" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    {fieldLabel("المنطقة الزمنية / Timezone")}
                    <select value={tz} onChange={e => setTz(e.target.value)} style={selectStyle}>
                      <option value="Asia/Baghdad">بغداد (UTC+3)</option>
                      <option value="Asia/Riyadh">الرياض (UTC+3)</option>
                      <option value="Asia/Dubai">دبي (UTC+4)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div>
                    {fieldLabel("لغة النظام / Language")}
                    <select value={lang} onChange={e => setLang(e.target.value)} style={selectStyle}>
                      <option value="ar">العربية / Arabic</option>
                      <option value="en">الإنكليزية / English</option>
                      <option value="ar-en">ثنائي اللغة / Bilingual</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    {fieldLabel("بداية السنة المالية / Fiscal Year Start")}
                    <select value={fiscalYearStart} onChange={e => setFiscalYearStart(e.target.value)} style={selectStyle}>
                      {["يناير/Jan","فبراير/Feb","مارس/Mar","أبريل/Apr","مايو/May","يونيو/Jun","يوليو/Jul","أغسطس/Aug","سبتمبر/Sep","أكتوبر/Oct","نوفمبر/Nov","ديسمبر/Dec"].map((m, i) => (
                        <option key={i} value={String(i + 1).padStart(2, "0")}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {fieldLabel("صيغة التاريخ / Date Format")}
                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} style={selectStyle}>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ الإعدادات / Save Settings</button>
          </div>
        </div>
      )}

      {/* ===== APPEARANCE ===== */}
      {activeTab === "appearance" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83c\udfa8", "السمة والألوان / Theme & Colors")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("السمة / Theme")}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                    {[
                      { id: "dark", label: "\ud83c\udf19 داكن / Dark", bg: "#1a1a2e" },
                      { id: "light", label: "\u2600\ufe0f فاتح / Light", bg: "#f8fafc" },
                      { id: "auto", label: "\ud83d\udd04 تلقائي / Auto", bg: "linear-gradient(135deg, #1a1a2e 50%, #f8fafc 50%)" },
                    ].map(t => (
                      <div key={t.id} onClick={() => setTheme(t.id)}
                        style={{ padding: "14px 10px", borderRadius: 12, textAlign: "center", cursor: "pointer",
                          background: theme === t.id ? "rgba(99,102,241,0.12)" : "var(--bg-subtle)",
                          border: `2px solid ${theme === t.id ? "#6366f1" : "transparent"}`, transition: "all .2s" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.bg, margin: "0 auto 8px", border: "1px solid var(--border)" }} />
                        <div style={{ fontSize: 11, fontWeight: 600 }}>{t.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  {fieldLabel("اللون الأساسي / Primary Color")}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["#6366f1", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"].map(c => (
                      <div key={c} onClick={() => setPrimaryColor(c)}
                        style={{ width: 36, height: 36, borderRadius: 10, background: c, cursor: "pointer",
                          border: `3px solid ${primaryColor === c ? "#fff" : "transparent"}`,
                          boxShadow: primaryColor === c ? `0 0 0 2px ${c}` : "none", transition: "all .2s" }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcd0", "التخطيط / Layout")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("حجم الخط / Font Size")}
                  <select value={fontSize} onChange={e => setFontSize(e.target.value)} style={selectStyle}>
                    <option value="small">صغير / Small (13px)</option>
                    <option value="medium">متوسط / Medium (14px)</option>
                    <option value="large">كبير / Large (16px)</option>
                    <option value="xlarge">كبير جداً / X-Large (18px)</option>
                  </select>
                </div>
                <div>
                  {fieldLabel("اتجاه الواجهة / Layout Direction")}
                  <select value={layoutDir} onChange={e => setLayoutDir(e.target.value)} style={selectStyle}>
                    <option value="rtl">يمين لليسار / RTL</option>
                    <option value="ltr">يسار لليمين / LTR</option>
                  </select>
                </div>
                <Toggle checked={sidebarCollapsed} onChange={setSidebarCollapsed} label="طي القائمة الجانبية / Collapse Sidebar" />
                <Toggle checked={animations} onChange={setAnimations} label="الرسوم المتحركة / Animations" />
                <Toggle checked={compactMode} onChange={setCompactMode} label="الوضع المضغوط / Compact Mode" />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== SECURITY ===== */}
      {activeTab === "security" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udd10", "المصادقة / Authentication")}
              <div style={{ display: "grid", gap: 6 }}>
                <Toggle checked={twoFA} onChange={setTwoFA} label="المصادقة الثنائية (2FA) / Two-Factor Auth" />
                <Toggle checked={requireCaptcha} onChange={setRequireCaptcha} label="طلب CAPTCHA عند الدخول / Require CAPTCHA" />
                <Toggle checked={auditLog} onChange={setAuditLog} label="تسجيل جميع الأنشطة / Audit Logging" />
                <div style={{ marginTop: 10 }}>
                  {fieldLabel("مهلة الجلسة (دقيقة) / Session Timeout (min)")}
                  <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  {fieldLabel("حد محاولات الدخول / Max Login Attempts")}
                  <input type="number" value={maxLoginAttempts} onChange={e => setMaxLoginAttempts(e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udd11", "كلمة المرور / Password Policy")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("سياسة كلمة المرور / Password Strength")}
                  <select value={passwordPolicy} onChange={e => setPasswordPolicy(e.target.value)} style={selectStyle}>
                    <option value="basic">أساسية / Basic (6+ حروف)</option>
                    <option value="strong">قوية / Strong (8+ مختلطة)</option>
                    <option value="strict">صارمة / Strict (12+ مختلطة + رمز)</option>
                  </select>
                </div>
                <div>
                  {fieldLabel("انتهاء كلمة المرور (يوم) / Password Expiry (days)")}
                  <select value={passwordExpiry} onChange={e => setPasswordExpiry(e.target.value)} style={selectStyle}>
                    <option value="0">بدون انتهاء / Never</option>
                    <option value="30">30 يوم</option>
                    <option value="60">60 يوم</option>
                    <option value="90">90 يوم</option>
                    <option value="180">180 يوم</option>
                  </select>
                </div>
                <div>
                  {fieldLabel("قائمة IP المسموح بها / IP Whitelist")}
                  <textarea value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} rows={3}
                    placeholder="أدخل عناوين IP مفصولة بسطر جديد... / Enter IPs, one per line..."
                    style={{ ...inputStyle, resize: "vertical" }} />
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== NOTIFICATIONS ===== */}
      {activeTab === "notifications" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcec", "تنبيهات الموارد البشرية / HR Alerts")}
              <Toggle checked={payrollReminder} onChange={setPayrollReminder} label="تذكير الرواتب / Payroll Reminder" />
              <Toggle checked={leaveAlerts} onChange={setLeaveAlerts} label="تنبيهات الإجازات / Leave Alerts" />
              <Toggle checked={attendanceAlerts} onChange={setAttendanceAlerts} label="تنبيهات الحضور / Attendance Alerts" />
              <Toggle checked={approvalAlerts} onChange={setApprovalAlerts} label="تنبيهات الموافقات / Approval Alerts" />
            </div>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcb0", "تنبيهات المالية والمخزون / Finance & Inventory")}
              <Toggle checked={emailAlerts} onChange={setEmailAlerts} label="تنبيهات البريد / Email Alerts" />
              <Toggle checked={lowStock} onChange={setLowStock} label="تحذير المخزون المنخفض / Low Stock Warnings" />
              <Toggle checked={budgetAlerts} onChange={setBudgetAlerts} label="تنبيهات تجاوز الميزانية / Budget Exceed Alerts" />
              <Toggle checked={contractExpiry} onChange={setContractExpiry} label="انتهاء العقود / Contract Expiry" />
            </div>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udda5\ufe0f", "تنبيهات النظام / System")}
              <Toggle checked={dailySummary} onChange={setDailySummary} label="ملخص يومي / Daily Summary" />
              <Toggle checked={systemAlerts} onChange={setSystemAlerts} label="تنبيهات صحة النظام / System Health Alerts" />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== USERS ===== */}
      {activeTab === "users" && (
        <div className="animate-in">
          <div style={cardStyle}>
            {sectionTitle("\ud83d\udc65", "إدارة المستخدمين / User Management")}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
              {[
                { l: "إجمالي المستخدمين", v: users.length, c: "#6366f1", i: "\ud83d\udc65" },
                { l: "نشط / Active", v: users.filter(u => u.status !== "disabled").length, c: "#10b981", i: "\u2705" },
                { l: "مدراء / Admins", v: users.filter(u => u.role === "admin").length, c: "#f59e0b", i: "\ud83d\udc51" },
                { l: "موارد بشرية / HR", v: users.filter(u => ["hr", "hr_manager"].includes(u.role)).length, c: "#8b5cf6", i: "\ud83e\uddd1\u200d\ud83d\udcbc" },
              ].map((s, i) => (
                <div key={i} style={{ background: `${s.c}10`, borderRadius: 12, padding: 14, textAlign: "center", border: `1px solid ${s.c}20` }}>
                  <div style={{ fontSize: 18 }}>{s.i}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead><tr><th>#</th><th>المستخدم / Username</th><th>الاسم / Name</th><th>الدور / Role</th><th>البريد / Email</th><th>القسم / Dept</th><th>الحالة / Status</th></tr></thead>
                <tbody>
                  {users.map((u, i) => {
                    const roleLabels: Record<string, string> = { admin: "مدير النظام", ceo: "المدير العام", manager: "مدير", hr: "موارد بشرية", hr_manager: "مدير HR", finance: "مالية", finance_manager: "مدير مالية", sales: "مبيعات", employee: "موظف" };
                    const roleColors: Record<string, string> = { admin: "#ef4444", ceo: "#f59e0b", manager: "#8b5cf6", hr: "#3b82f6", hr_manager: "#3b82f6", finance: "#10b981", finance_manager: "#10b981", sales: "#06b6d4" };
                    return (
                      <tr key={u.id}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{u.username}</td>
                        <td>{u.name}</td>
                        <td>
                          <span className="badge" style={{ background: `${roleColors[u.role] || "#888"}20`, color: roleColors[u.role] || "#888", borderRadius: 20 }}>
                            {roleLabels[u.role] || u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: "var(--ink-muted)" }}>{u.email || "\u2014"}</td>
                        <td>{u.department || "\u2014"}</td>
                        <td>
                          <span className="badge" style={{ background: u.status === "disabled" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: u.status === "disabled" ? "#ef4444" : "#10b981", borderRadius: 20 }}>
                            {u.status === "disabled" ? "معطل" : "نشط"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 24, opacity: 0.5 }}>لا يوجد مستخدمين</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===== BACKUP ===== */}
      {activeTab === "backup" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\u23f0", "جدولة النسخ / Backup Schedule")}
              <div style={{ display: "grid", gap: 14 }}>
                <Toggle checked={autoBackup} onChange={setAutoBackup} label="النسخ التلقائي / Auto Backup" />
                <Toggle checked={backupEncrypt} onChange={setBackupEncrypt} label="تشفير النسخ / Encrypt Backups" />
                <div>
                  {fieldLabel("جدول النسخ / Schedule")}
                  <select value={backupSchedule} onChange={e => setBackupSchedule(e.target.value)} style={selectStyle}>
                    <option value="hourly">كل ساعة / Hourly</option>
                    <option value="daily">يوميًا / Daily</option>
                    <option value="weekly">أسبوعيًا / Weekly</option>
                    <option value="monthly">شهريًا / Monthly</option>
                  </select>
                </div>
                <div>
                  {fieldLabel("مدة الاحتفاظ / Retention")}
                  <select value={backupRetention} onChange={e => setBackupRetention(e.target.value)} style={selectStyle}>
                    <option value="7">7 أيام / 7 Days</option>
                    <option value="14">14 يوم / 14 Days</option>
                    <option value="30">30 يوم / 30 Days</option>
                    <option value="60">60 يوم / 60 Days</option>
                    <option value="90">90 يوم / 90 Days</option>
                  </select>
                </div>
                <div>
                  {fieldLabel("موقع النسخ / Storage Location")}
                  <select value={backupLocation} onChange={e => setBackupLocation(e.target.value)} style={selectStyle}>
                    <option value="local">محلي / Local Server</option>
                    <option value="s3">Amazon S3</option>
                    <option value="gcs">Google Cloud Storage</option>
                    <option value="azure">Azure Blob Storage</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udccb", "سجل النسخ / Backup History")}
              <div style={{ display: "grid", gap: 8 }}>
                {[
                  { date: "2026-02-10 03:00", size: "245 MB", status: "success", type: "auto" },
                  { date: "2026-02-09 03:00", size: "243 MB", status: "success", type: "auto" },
                  { date: "2026-02-08 14:30", size: "240 MB", status: "success", type: "manual" },
                  { date: "2026-02-08 03:00", size: "238 MB", status: "failed", type: "auto" },
                  { date: "2026-02-07 03:00", size: "236 MB", status: "success", type: "auto" },
                ].map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{b.date}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{b.size} · {b.type === "auto" ? "تلقائي" : "يدوي"}</div>
                    </div>
                    <span className="badge" style={{
                      background: b.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      color: b.status === "success" ? "#10b981" : "#ef4444", borderRadius: 20
                    }}>
                      {b.status === "success" ? "\u2705 ناجح" : "\u274c فشل"}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="btn btn-primary" onClick={() => alert("\ud83d\udd04 جاري إنشاء نسخة احتياطية...")}>{"\ud83d\udcbe"} نسخ الآن / Backup Now</button>
                <button className="btn btn-secondary" onClick={() => alert("\ud83d\udce5 جاري استعادة آخر نسخة...")}>{"\ud83d\udce5"} استعادة / Restore</button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== EMAIL / SMTP ===== */}
      {activeTab === "email" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udce7", "إعدادات SMTP / SMTP Settings")}
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10 }}>
                  <div>
                    {fieldLabel("خادم SMTP / SMTP Host")}
                    <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    {fieldLabel("المنفذ / Port")}
                    <input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} style={inputStyle} />
                  </div>
                </div>
                <div>
                  {fieldLabel("اسم المستخدم / Username")}
                  <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} style={inputStyle} placeholder="user@gmail.com" />
                </div>
                <div>
                  {fieldLabel("كلمة المرور / Password")}
                  <input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} style={inputStyle} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                </div>
                <div>
                  {fieldLabel("التشفير / Encryption")}
                  <select value={smtpSecure} onChange={e => setSmtpSecure(e.target.value)} style={selectStyle}>
                    <option value="tls">TLS (منفذ 587)</option>
                    <option value="ssl">SSL (منفذ 465)</option>
                    <option value="none">بدون / None</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\u2709\ufe0f", "إعدادات المرسل / Sender Settings")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("اسم المرسل / Sender Name")}
                  <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  {fieldLabel("بريد المرسل / Sender Email")}
                  <input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} style={inputStyle} />
                </div>
                <button className="btn btn-secondary" onClick={() => alert("\ud83d\udce7 جاري إرسال بريد تجريبي...")} style={{ marginTop: 8 }}>
                  {"\ud83d\udce8"} إرسال بريد تجريبي / Send Test Email
                </button>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== INTEGRATIONS ===== */}
      {activeTab === "integration" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\ud83d\udd17", "واجهة برمجة التطبيقات (API) / API Settings")}
              <div style={{ display: "grid", gap: 14 }}>
                <Toggle checked={apiEnabled} onChange={setApiEnabled} label="تفعيل API / Enable API Access" />
                <div>
                  {fieldLabel("مفتاح API / API Key")}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input type="text" value="sk-erp-xxxxx-xxxxx-xxxxx" readOnly style={{ ...inputStyle, flex: 1, opacity: 0.6 }} />
                    <button className="btn btn-secondary" style={{ padding: "8px 14px", fontSize: 11 }} onClick={() => alert("\ud83d\udd04 تم إنشاء مفتاح جديد")}>{"\ud83d\udd04"} تجديد</button>
                  </div>
                </div>
                <div>
                  {fieldLabel("Webhook URL")}
                  <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} style={inputStyle} placeholder="https://your-webhook-url.com/endpoint" />
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcf1", "خدمة الرسائل القصيرة / SMS Service")}
              <div style={{ display: "grid", gap: 14 }}>
                <div>
                  {fieldLabel("مزود الخدمة / SMS Provider")}
                  <select value={smsProvider} onChange={e => setSmsProvider(e.target.value)} style={selectStyle}>
                    <option value="none">غير مفعل / Disabled</option>
                    <option value="twilio">Twilio</option>
                    <option value="nexmo">Vonage (Nexmo)</option>
                    <option value="local">مزود محلي / Local Provider</option>
                  </select>
                </div>
                {smsProvider !== "none" && (
                  <div>
                    {fieldLabel("مفتاح API / API Key")}
                    <input type="password" value={smsApiKey} onChange={e => setSmsApiKey(e.target.value)} style={inputStyle} placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" />
                  </div>
                )}
                <button className="btn btn-secondary" onClick={() => alert("\ud83d\udcf1 جاري إرسال رسالة تجريبية...")} disabled={smsProvider === "none"}>
                  {"\ud83d\udcf1"} إرسال رسالة تجريبية / Send Test SMS
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcca", "استيراد وتصدير البيانات / Import & Export")}
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => alert("\ud83d\udce5 جاري تصدير قاعدة البيانات...")}>
                    {"\ud83d\udce5"} تصدير البيانات / Export Data (JSON)
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => alert("\ud83d\udce4 جاري استيراد البيانات...")}>
                    {"\ud83d\udce4"} استيراد بيانات / Import Data
                  </button>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => alert("\ud83d\udcca جاري تصدير Excel...")}>
                    {"\ud83d\udcca"} تصدير Excel / Export Excel
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1, padding: "12px" }} onClick={() => alert("\ud83d\udcc4 جاري تصدير CSV...")}>
                    {"\ud83d\udcc4"} تصدير CSV / Export CSV
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "var(--ink-muted)", marginTop: 4 }}>
                  {"\u26a0\ufe0f"} تصدير البيانات يشمل جميع الجداول / Export includes all tables
                </p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button className="btn btn-primary" style={{ padding: "10px 32px", fontSize: 14 }} onClick={save}>{"\ud83d\udcbe"} حفظ / Save</button>
          </div>
        </div>
      )}

      {/* ===== ABOUT ===== */}
      {activeTab === "about" && (
        <div className="animate-in">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 16 }}>
            <div style={cardStyle}>
              {sectionTitle("\u2139\ufe0f", "معلومات النظام / System Info")}
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { l: "الإصدار / Version", v: sysInfo.version, i: "\ud83d\udccc" },
                  { l: "النوع / Type", v: "Enterprise ERP System", i: "\ud83c\udfe2" },
                  { l: "الترخيص / License", v: "Enterprise - Unlimited Users", i: "\ud83d\udcdc" },
                  { l: "آخر تحديث / Last Update", v: "2026-02-10", i: "\ud83d\udd04" },
                  { l: "الخادم / Backend", v: "Node.js + Express + TypeScript", i: "\u26a1" },
                  { l: "الواجهة / Frontend", v: "React 18 + Vite + TypeScript", i: "\u269b\ufe0f" },
                  { l: "قاعدة البيانات / Database", v: "In-Memory Store", i: "\ud83d\udcbe" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{item.i}</span>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.l}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "#6366f1", fontWeight: 500 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udda5\ufe0f", "أداء الخادم / Server Performance")}
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  { l: "وقت التشغيل / Uptime", v: sysInfo.uptime, c: "#10b981", pct: 95 },
                  { l: "استخدام الذاكرة / Memory", v: sysInfo.memory, c: "#f59e0b", pct: 30 },
                  { l: "المعالج / CPU", v: sysInfo.cpu, c: "#3b82f6", pct: 15 },
                  { l: "حجم قاعدة البيانات / DB Size", v: sysInfo.dbSize, c: "#8b5cf6", pct: 25 },
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{item.l}</span>
                      <span style={{ fontSize: 12, color: item.c, fontWeight: 600 }}>{item.v}</span>
                    </div>
                    <div style={{ width: "100%", height: 8, background: "var(--bg-subtle)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: `linear-gradient(90deg, ${item.c}, ${item.c}88)`, borderRadius: 4, transition: "width .5s" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 8, padding: "10px 14px", borderRadius: 10, background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{"\ud83d\udcca"} إجمالي طلبات API / Total API Calls</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#6366f1" }}>{sysInfo.apiCalls.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={cardStyle}>
              {sectionTitle("\ud83d\udcdd", "سجل التحديثات / Changelog")}
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  { ver: "v2.1.0", date: "2026-02-10", changes: ["نظام حضور بايومتري متقدم", "تقارير PDF لجميع الأقسام", "تحسين الأداء والأمان"] },
                  { ver: "v2.0.0", date: "2026-01-15", changes: ["إعادة تصميم الواجهة بالكامل", "نظام صلاحيات متقدم", "لوحة تحكم CEO"] },
                  { ver: "v1.5.0", date: "2025-11-20", changes: ["إضافة نظام الأرشفة", "دعم ثنائي اللغة", "تحسينات الأداء"] },
                ].map((release, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-subtle)", border: `1px solid ${i === 0 ? "rgba(99,102,241,0.2)" : "var(--border)"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, color: i === 0 ? "#6366f1" : "var(--ink)" }}>{release.ver}</span>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>{release.date}</span>
                    </div>
                    <ul style={{ margin: 0, paddingInlineStart: 18, fontSize: 12, color: "var(--ink-muted)", lineHeight: 1.8 }}>
                      {release.changes.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
