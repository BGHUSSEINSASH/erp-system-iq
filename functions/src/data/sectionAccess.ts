/* ────────────────────────────────────────────
   Section Access Control - In-Memory Store
   Controls which sidebar sections each role can see.
   ──────────────────────────────────────────── */

export const allSections = [
  "لوحة التحكم",
  "الموارد البشرية",
  "المالية",
  "الادارة",
  "المشتريات واللوجستيات",
  "المبيعات والتسويق",
  "تكنولوجيا المعلومات",
  "الانتاج",
  "أدوات النظام",
  "الاعدادات",
];

export type SectionAccessMap = Record<string, string[]>;

// Default section access per role
const sectionAccessMap: SectionAccessMap = {
  admin: [...allSections],
  ceo: [...allSections],
  manager: [...allSections],
  hr_manager: ["لوحة التحكم", "الموارد البشرية", "أدوات النظام", "الاعدادات"],
  hr_assistant: ["لوحة التحكم", "الموارد البشرية", "أدوات النظام", "الاعدادات"],
  hr: ["لوحة التحكم", "الموارد البشرية", "أدوات النظام", "الاعدادات"],
  finance_manager: ["لوحة التحكم", "المالية", "أدوات النظام", "الاعدادات"],
  finance_assistant: ["لوحة التحكم", "المالية", "أدوات النظام", "الاعدادات"],
  finance: ["لوحة التحكم", "المالية", "أدوات النظام", "الاعدادات"],
  sales_manager: ["لوحة التحكم", "المبيعات والتسويق", "أدوات النظام", "الاعدادات"],
  sales_assistant: ["لوحة التحكم", "المبيعات والتسويق", "أدوات النظام", "الاعدادات"],
  sales: ["لوحة التحكم", "المبيعات والتسويق", "أدوات النظام", "الاعدادات"],
  it_manager: ["لوحة التحكم", "تكنولوجيا المعلومات", "أدوات النظام", "الاعدادات"],
  it_assistant: ["لوحة التحكم", "تكنولوجيا المعلومات", "أدوات النظام", "الاعدادات"],
  it: ["لوحة التحكم", "تكنولوجيا المعلومات", "أدوات النظام", "الاعدادات"],
  production_manager: ["لوحة التحكم", "الانتاج", "أدوات النظام", "الاعدادات"],
  production_assistant: ["لوحة التحكم", "الانتاج", "أدوات النظام", "الاعدادات"],
  production: ["لوحة التحكم", "الانتاج", "أدوات النظام", "الاعدادات"],
  purchasing_manager: ["لوحة التحكم", "المشتريات واللوجستيات", "أدوات النظام", "الاعدادات"],
  purchasing_assistant: ["لوحة التحكم", "المشتريات واللوجستيات", "أدوات النظام", "الاعدادات"],
  purchasing: ["لوحة التحكم", "المشتريات واللوجستيات", "أدوات النظام", "الاعدادات"],
  admin_manager: ["لوحة التحكم", "الادارة", "أدوات النظام", "الاعدادات"],
  admin_assistant: ["لوحة التحكم", "الادارة", "أدوات النظام", "الاعدادات"],
  employee: ["لوحة التحكم", "أدوات النظام", "الاعدادات"],
};

export function getSectionAccess(): SectionAccessMap {
  return sectionAccessMap;
}

export function getSectionAccessForRole(role: string): string[] {
  return sectionAccessMap[role] || ["لوحة التحكم", "أدوات النظام"];
}

export function updateSectionAccess(role: string, sections: string[]): void {
  // Admin always has access to all sections
  if (role === "admin") return;
  sectionAccessMap[role] = sections;
}
