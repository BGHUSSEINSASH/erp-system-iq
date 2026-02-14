import { nextId } from "./store.js";

export type Approval = {
  id: string;
  type: "leave" | "purchase" | "invoice" | "expense" | "recruitment";
  referenceId: string;
  title: string;
  titleAr: string;
  requestedBy: string;
  requestedByName: string;
  amount?: number;
  description: string;
  status: "pending" | "approved" | "rejected";
  approver: string;
  approverName: string;
  comments: string;
  createdAt: string;
  resolvedAt?: string;
};

export const approvals: Approval[] = [
  { id: "ap-1", type: "leave", referenceId: "lr-2", title: "Sick Leave Request", titleAr: "طلب إجازة مرضية", requestedBy: "sales", requestedByName: "Mohammed Khalid", description: "2 days sick leave - Medical appointment", status: "pending", approver: "hr", approverName: "Ahmed Hassan", comments: "", createdAt: "2026-02-10T09:30:00" },
  { id: "ap-2", type: "leave", referenceId: "lr-3", title: "Personal Leave Request", titleAr: "طلب إجازة شخصية", requestedBy: "finance", requestedByName: "Nadia Samir", description: "1 day personal leave", status: "pending", approver: "hr", approverName: "Ahmed Hassan", comments: "", createdAt: "2026-02-10T08:00:00" },
  { id: "ap-3", type: "purchase", referenceId: "po-3", title: "Purchase Order Approval", titleAr: "موافقة أمر شراء", requestedBy: "sales", requestedByName: "Omar Youssef", amount: 120000, description: "PO-2003 - Raw Materials Ltd bulk material purchase", status: "pending", approver: "manager", approverName: "General Manager", comments: "", createdAt: "2026-02-01T10:00:00" },
  { id: "ap-4", type: "purchase", referenceId: "po-4", title: "Purchase Order Approval", titleAr: "موافقة أمر شراء", requestedBy: "sales", requestedByName: "Omar Youssef", amount: 45000, description: "PO-2004 - Steel Works Inc materials", status: "pending", approver: "manager", approverName: "General Manager", comments: "", createdAt: "2026-02-05T11:00:00" },
  { id: "ap-5", type: "expense", referenceId: "cr-3", title: "Expense Approval", titleAr: "موافقة مصروف", requestedBy: "hr", requestedByName: "Khaled Mansour", amount: 12000, description: "Production line maintenance cost", status: "pending", approver: "manager", approverName: "General Manager", comments: "", createdAt: "2026-02-05T09:00:00" },
  { id: "ap-6", type: "leave", referenceId: "lr-1", title: "Annual Leave Request", titleAr: "طلب إجازة سنوية", requestedBy: "hr", requestedByName: "Layla Ibrahim", description: "5 days annual leave - Family vacation", status: "approved", approver: "hr", approverName: "Ahmed Hassan", comments: "Approved. Enjoy your vacation!", createdAt: "2026-02-08T10:00:00", resolvedAt: "2026-02-08T14:00:00" },
  { id: "ap-7", type: "purchase", referenceId: "po-2", title: "Purchase Order Approval", titleAr: "موافقة أمر شراء", requestedBy: "sales", requestedByName: "Omar Youssef", amount: 32000, description: "PO-2002 - Tech Supply Co IT equipment", status: "approved", approver: "manager", approverName: "General Manager", comments: "Approved", createdAt: "2026-01-18T09:00:00", resolvedAt: "2026-01-19T10:00:00" },
  { id: "ap-8", type: "leave", referenceId: "lr-4", title: "Annual Leave Request", titleAr: "طلب إجازة سنوية", requestedBy: "sales", requestedByName: "Omar Youssef", description: "7 days travel leave", status: "rejected", approver: "hr", approverName: "Ahmed Hassan", comments: "Insufficient leave balance this quarter", createdAt: "2026-02-07T08:00:00", resolvedAt: "2026-02-07T16:00:00" },
];

export function addApproval(a: Omit<Approval, "id" | "status" | "comments" | "createdAt">) {
  const entry: Approval = { ...a, id: nextId("ap"), status: "pending", comments: "", createdAt: new Date().toISOString() };
  approvals.unshift(entry);
  return entry;
}
