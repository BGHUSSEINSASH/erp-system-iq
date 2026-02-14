import { nextId } from "./store.js";

export type Notification = {
  id: string;
  type: "leave" | "invoice" | "ticket" | "purchase" | "payroll" | "system" | "approval" | "message";
  title: string;
  titleAr: string;
  message: string;
  userId?: string;
  read: boolean;
  createdAt: string;
};

export const notifications: Notification[] = [
  { id: "n-1", type: "leave", title: "New Leave Request", titleAr: "طلب إجازة جديد", message: "Mohammed Khalid requested 2 days sick leave", read: false, createdAt: "2026-02-10T09:30:00" },
  { id: "n-2", type: "invoice", title: "Invoice Overdue", titleAr: "فاتورة متأخرة", message: "Invoice INV-1004 from Omega Group is overdue", read: false, createdAt: "2026-02-10T08:00:00" },
  { id: "n-3", type: "ticket", title: "Critical Ticket", titleAr: "تذكرة حرجة", message: "Email server down - assigned to Fatima Noor", read: false, createdAt: "2026-02-10T08:30:00" },
  { id: "n-4", type: "purchase", title: "PO Pending Approval", titleAr: "أمر شراء بانتظار الموافقة", message: "PO-2003 from Raw Materials Ltd needs approval", read: true, createdAt: "2026-02-09T14:00:00" },
  { id: "n-5", type: "system", title: "Backup Complete", titleAr: "اكتمل النسخ الاحتياطي", message: "Nightly database backup completed successfully", read: true, createdAt: "2026-02-09T23:30:00" },
  { id: "n-6", type: "payroll", title: "Payroll Draft Ready", titleAr: "مسودة الرواتب جاهزة", message: "February 2026 payroll draft is ready for review", read: false, createdAt: "2026-02-10T07:00:00" },
];

export function addNotification(n: Omit<Notification, "id" | "read" | "createdAt">) {
  const entry: Notification = {
    ...n,
    id: nextId("n"),
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(entry);
  return entry;
}
