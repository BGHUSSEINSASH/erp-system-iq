export type Role =
  | "admin"
  | "ceo"
  | "manager"
  | "hr_manager"
  | "hr_assistant"
  | "hr"
  | "finance_manager"
  | "finance_assistant"
  | "finance"
  | "sales_manager"
  | "sales_assistant"
  | "sales"
  | "it_manager"
  | "it_assistant"
  | "it"
  | "production_manager"
  | "production_assistant"
  | "production"
  | "purchasing_manager"
  | "purchasing_assistant"
  | "purchasing"
  | "admin_manager"
  | "admin_assistant"
  | "employee";

export type Permission =
  | "users.read"
  | "users.write"
  | "roles.read"
  | "roles.write"
  | "permissions.read"
  | "permissions.write";

const rolePermissions: Record<Role, Permission[]> = {
  admin: ["users.read", "users.write", "roles.read", "roles.write", "permissions.read", "permissions.write"],
  ceo: ["users.read", "users.write", "roles.read", "roles.write", "permissions.read", "permissions.write"],
  manager: ["users.read", "roles.read", "permissions.read"],
  hr_manager: ["users.read", "roles.read"],
  hr_assistant: ["users.read", "roles.read"],
  hr: ["users.read"],
  finance_manager: ["users.read", "roles.read"],
  finance_assistant: ["users.read"],
  finance: ["users.read"],
  sales_manager: ["users.read", "roles.read"],
  sales_assistant: ["users.read"],
  sales: ["users.read"],
  it_manager: ["users.read", "roles.read"],
  it_assistant: ["users.read"],
  it: ["users.read"],
  production_manager: ["users.read", "roles.read"],
  production_assistant: ["users.read"],
  production: ["users.read"],
  purchasing_manager: ["users.read", "roles.read"],
  purchasing_assistant: ["users.read"],
  purchasing: ["users.read"],
  admin_manager: ["users.read", "roles.read"],
  admin_assistant: ["users.read"],
  employee: [],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export const roles = Object.keys(rolePermissions) as Role[];

/** Role display info */
export const roleInfo: Record<string, { nameAr: string; nameEn: string; level: number; department: string }> = {
  admin: { nameAr: "مدير النظام", nameEn: "System Admin", level: 0, department: "system" },
  ceo: { nameAr: "المدير العام", nameEn: "CEO", level: 0, department: "system" },
  manager: { nameAr: "مدير تنفيذي", nameEn: "General Manager", level: 1, department: "system" },
  hr_manager: { nameAr: "مدير الموارد البشرية", nameEn: "HR Manager", level: 2, department: "hr" },
  hr_assistant: { nameAr: "مساعد مدير الموارد البشرية", nameEn: "HR Assistant Manager", level: 3, department: "hr" },
  hr: { nameAr: "موظف موارد بشرية", nameEn: "HR Staff", level: 4, department: "hr" },
  finance_manager: { nameAr: "مدير المالية", nameEn: "Finance Manager", level: 2, department: "finance" },
  finance_assistant: { nameAr: "مساعد مدير المالية", nameEn: "Finance Assistant Manager", level: 3, department: "finance" },
  finance: { nameAr: "موظف مالية", nameEn: "Finance Staff", level: 4, department: "finance" },
  sales_manager: { nameAr: "مدير المبيعات", nameEn: "Sales Manager", level: 2, department: "sales" },
  sales_assistant: { nameAr: "مساعد مدير المبيعات", nameEn: "Sales Assistant Manager", level: 3, department: "sales" },
  sales: { nameAr: "موظف مبيعات", nameEn: "Sales Staff", level: 4, department: "sales" },
  it_manager: { nameAr: "مدير تكنولوجيا المعلومات", nameEn: "IT Manager", level: 2, department: "it" },
  it_assistant: { nameAr: "مساعد مدير تكنولوجيا المعلومات", nameEn: "IT Assistant Manager", level: 3, department: "it" },
  it: { nameAr: "موظف تكنولوجيا المعلومات", nameEn: "IT Staff", level: 4, department: "it" },
  production_manager: { nameAr: "مدير الإنتاج", nameEn: "Production Manager", level: 2, department: "production" },
  production_assistant: { nameAr: "مساعد مدير الإنتاج", nameEn: "Production Assistant Manager", level: 3, department: "production" },
  production: { nameAr: "موظف إنتاج", nameEn: "Production Staff", level: 4, department: "production" },
  purchasing_manager: { nameAr: "مدير المشتريات", nameEn: "Purchasing Manager", level: 2, department: "purchasing" },
  purchasing_assistant: { nameAr: "مساعد مدير المشتريات", nameEn: "Purchasing Assistant Manager", level: 3, department: "purchasing" },
  purchasing: { nameAr: "موظف مشتريات", nameEn: "Purchasing Staff", level: 4, department: "purchasing" },
  admin_manager: { nameAr: "مدير الإدارة", nameEn: "Admin Manager", level: 2, department: "admin" },
  admin_assistant: { nameAr: "مساعد مدير الإدارة", nameEn: "Admin Assistant Manager", level: 3, department: "admin" },
  employee: { nameAr: "موظف", nameEn: "Employee", level: 5, department: "none" },
};
