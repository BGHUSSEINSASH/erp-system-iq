import { Router, type Request, type Response } from "express";

const router = Router();

export type Permission = {
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

/* ═══ All System Modules (~50) with category & department ═══ */
const moduleDefs: { name: string; category: string; dept: string }[] = [
  // Dashboard
  { name: "لوحة التحكم / Dashboard", category: "لوحة التحكم / Dashboard", dept: "all" },
  { name: "لوحة المدير العام / CEO Dashboard", category: "لوحة التحكم / Dashboard", dept: "system" },
  { name: "التحليلات / Analytics", category: "لوحة التحكم / Dashboard", dept: "all" },
  // HR
  { name: "الموظفون / Employees", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "الحضور البيومتري / Biometric Attendance", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "بطاقة الموظف / Staff Card", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "طلبات الإجازات / Leave Requests", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "الرواتب / Payroll", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "التقييمات / Evaluations", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "التوظيف / Recruitment", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "قروض الموظفين / Employee Loans", category: "الموارد البشرية / HR", dept: "hr" },
  { name: "التدريب / Training", category: "الموارد البشرية / HR", dept: "hr" },
  // Finance
  { name: "الحسابات / Accounts", category: "المالية / Finance", dept: "finance" },
  { name: "الذمم الدائنة / Payable Accounts", category: "المالية / Finance", dept: "finance" },
  { name: "الذمم المدينة / Receivable Accounts", category: "المالية / Finance", dept: "finance" },
  { name: "الصناديق / Funds", category: "المالية / Finance", dept: "finance" },
  { name: "القيود اليومية / Journal Entries", category: "المالية / Finance", dept: "finance" },
  { name: "الميزانيات / Budgets", category: "المالية / Finance", dept: "finance" },
  { name: "التكاليف / Costs", category: "المالية / Finance", dept: "finance" },
  { name: "طلبات الصرف / Expense Requests", category: "المالية / Finance", dept: "finance" },
  { name: "الأصول الثابتة / Fixed Assets", category: "المالية / Finance", dept: "finance" },
  // Admin
  { name: "الممتلكات / Properties", category: "الإدارة / Admin", dept: "admin" },
  { name: "عقود الإيجار / Lease Agreements", category: "الإدارة / Admin", dept: "admin" },
  { name: "المستخدمون / Users", category: "الإدارة / Admin", dept: "system" },
  { name: "الصلاحيات / Permissions", category: "الإدارة / Admin", dept: "system" },
  { name: "الفروع / Branches", category: "الإدارة / Admin", dept: "admin" },
  { name: "الأرشيف / Archives", category: "الإدارة / Admin", dept: "admin" },
  { name: "العقود / Contracts", category: "الإدارة / Admin", dept: "admin" },
  // Procurement
  { name: "الموردون / Vendors", category: "المشتريات / Procurement", dept: "purchasing" },
  { name: "أوامر الشراء / Purchase Orders", category: "المشتريات / Procurement", dept: "purchasing" },
  { name: "المناقصات / Tenders", category: "المشتريات / Procurement", dept: "purchasing" },
  { name: "المخزون / Inventories", category: "المشتريات / Procurement", dept: "purchasing" },
  // Sales
  { name: "العملاء / Customers", category: "المبيعات / Sales", dept: "sales" },
  { name: "الفواتير / Invoices", category: "المبيعات / Sales", dept: "sales" },
  { name: "عروض الأسعار / Quotations", category: "المبيعات / Sales", dept: "sales" },
  { name: "إدارة علاقات العملاء / CRM", category: "المبيعات / Sales", dept: "sales" },
  // IT
  { name: "تذاكر الدعم / Tickets", category: "تكنولوجيا المعلومات / IT", dept: "it" },
  { name: "أصول تكنولوجيا المعلومات / IT Assets", category: "تكنولوجيا المعلومات / IT", dept: "it" },
  { name: "صحة النظام / System Health", category: "تكنولوجيا المعلومات / IT", dept: "it" },
  // Production
  { name: "المنتجات / Products", category: "الإنتاج / Production", dept: "production" },
  { name: "أوامر العمل / Work Orders", category: "الإنتاج / Production", dept: "production" },
  // System Tools
  { name: "الموافقات / Approvals", category: "أدوات النظام / System Tools", dept: "all" },
  { name: "الرسائل / Messages", category: "أدوات النظام / System Tools", dept: "all" },
  { name: "التقويم / Calendar", category: "أدوات النظام / System Tools", dept: "all" },
  { name: "الإشعارات / Notifications", category: "أدوات النظام / System Tools", dept: "all" },
  { name: "سجل التدقيق / Audit Log", category: "أدوات النظام / System Tools", dept: "system" },
  { name: "المستندات / Documents", category: "أدوات النظام / System Tools", dept: "all" },
  // Advanced Tools
  { name: "لوحة كانبان / Kanban", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "منشئ التقارير / Report Builder", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "الأهداف / Goals", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "النسخ الاحتياطي / Backup", category: "الأدوات المتقدمة / Advanced", dept: "system" },
  { name: "التنبيهات الذكية / Smart Alerts", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "التقارير / Reports", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "المشاريع / Projects", category: "الأدوات المتقدمة / Advanced", dept: "all" },
  { name: "المركبات / Vehicles", category: "الأدوات المتقدمة / Advanced", dept: "admin" },
];

const moduleNames = moduleDefs.map(m => m.name);
const categories = [...new Set(moduleDefs.map(m => m.category))];

const roles = [
  { id: "admin", name: "مدير النظام / System Admin", department: "system" },
  { id: "ceo", name: "المدير العام / CEO", department: "system" },
  { id: "manager", name: "مدير تنفيذي / General Manager", department: "system" },
  { id: "hr_manager", name: "مدير الموارد البشرية / HR Manager", department: "hr" },
  { id: "hr_assistant", name: "مساعد مدير الموارد البشرية / HR Asst.", department: "hr" },
  { id: "hr", name: "موظف موارد بشرية / HR Staff", department: "hr" },
  { id: "finance_manager", name: "مدير المالية / Finance Manager", department: "finance" },
  { id: "finance_assistant", name: "مساعد مدير المالية / Finance Asst.", department: "finance" },
  { id: "finance", name: "موظف مالية / Finance Staff", department: "finance" },
  { id: "sales_manager", name: "مدير المبيعات / Sales Manager", department: "sales" },
  { id: "sales_assistant", name: "مساعد مدير المبيعات / Sales Asst.", department: "sales" },
  { id: "sales", name: "موظف مبيعات / Sales Staff", department: "sales" },
  { id: "it_manager", name: "مدير تكنولوجيا المعلومات / IT Manager", department: "it" },
  { id: "it_assistant", name: "مساعد مدير تكنولوجيا المعلومات / IT Asst.", department: "it" },
  { id: "it", name: "موظف تكنولوجيا المعلومات / IT Staff", department: "it" },
  { id: "production_manager", name: "مدير الإنتاج / Production Manager", department: "production" },
  { id: "production_assistant", name: "مساعد مدير الإنتاج / Production Asst.", department: "production" },
  { id: "production", name: "موظف إنتاج / Production Staff", department: "production" },
  { id: "purchasing_manager", name: "مدير المشتريات / Purchasing Manager", department: "purchasing" },
  { id: "purchasing_assistant", name: "مساعد مدير المشتريات / Purchasing Asst.", department: "purchasing" },
  { id: "purchasing", name: "موظف مشتريات / Purchasing Staff", department: "purchasing" },
  { id: "admin_manager", name: "مدير الإدارة / Admin Manager", department: "admin" },
  { id: "admin_assistant", name: "مساعد مدير الإدارة / Admin Asst.", department: "admin" },
  { id: "employee", name: "موظف / Employee", department: "none" },
];

let permissions: Permission[] = [];
let idC = 0;

/* Department-to-module matching map */
const deptCategoryMap: Record<string, string> = {
  hr: "الموارد البشرية / HR",
  finance: "المالية / Finance",
  sales: "المبيعات / Sales",
  it: "تكنولوجيا المعلومات / IT",
  production: "الإنتاج / Production",
  purchasing: "المشتريات / Procurement",
  admin: "الإدارة / Admin",
};

// Initialize default permissions for all modules × all roles
for (const role of roles) {
  for (const mod of moduleDefs) {
    idC++;
    const isAdmin = role.id === "admin" || role.id === "ceo";
    const isManager = role.id === "manager";
    const isDeptManager = role.id.endsWith("_manager") && !["admin"].includes(role.id);
    const isDeptAssistant = role.id.endsWith("_assistant");

    const roleDept = role.department || "none";
    const moduleMatchesDept = deptCategoryMap[roleDept] === mod.category;
    const isAllModule = mod.dept === "all";
    const isSystemModule = mod.dept === "system";
    const isDashboard = mod.category.includes("Dashboard");
    const isToolModule = mod.category.includes("أدوات النظام") || mod.category.includes("الأدوات المتقدمة");

    permissions.push({
      id: `perm-${idC}`,
      roleId: role.id,
      roleName: role.name,
      module: mod.name,
      moduleCategory: mod.category,
      canView: isAdmin || isManager || (isDeptManager && (moduleMatchesDept || isAllModule)) || (isDeptAssistant && (moduleMatchesDept || isAllModule)) || moduleMatchesDept || isDashboard || (isToolModule && !isSystemModule),
      canCreate: isAdmin || (isManager && !isSystemModule) || (isDeptManager && moduleMatchesDept) || (isDeptAssistant && moduleMatchesDept),
      canEdit: isAdmin || (isManager && !isSystemModule) || (isDeptManager && moduleMatchesDept) || (isDeptAssistant && moduleMatchesDept),
      canDelete: isAdmin || (isDeptManager && moduleMatchesDept),
      canExport: isAdmin || isManager || (isDeptManager && (moduleMatchesDept || isAllModule)) || (isDeptAssistant && moduleMatchesDept),
    });
  }
}

router.get("/", (_req: Request, res: Response) => {
  res.json({ items: permissions, total: permissions.length, roles, modules: moduleNames, categories, moduleDefs });
});

router.get("/roles", (_req: Request, res: Response) => {
  res.json({ roles, modules: moduleNames, categories, moduleDefs });
});

router.put("/:id", (req: Request, res: Response) => {
  const idx = permissions.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  permissions[idx] = { ...permissions[idx], ...req.body, id: permissions[idx].id };
  return res.json(permissions[idx]);
});

router.put("/bulk/update", (req: Request, res: Response) => {
  const updates: Partial<Permission>[] = req.body.permissions;
  if (!Array.isArray(updates)) return res.status(400).json({ message: "Invalid data" });
  for (const upd of updates) {
    const idx = permissions.findIndex(p => p.id === upd.id);
    if (idx !== -1) {
      permissions[idx] = { ...permissions[idx], ...upd, id: permissions[idx].id };
    }
  }
  return res.json({ message: "Updated", total: updates.length });
});

export default router;
