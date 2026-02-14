import { nextId } from "./store.js";

export type AuditEntry = {
  id: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "export";
  module: string;
  description: string;
  user: string;
  role: string;
  ip: string;
  timestamp: string;
};

export const auditLog: AuditEntry[] = [
  { id: "al-1", action: "login", module: "auth", description: "User logged in", user: "admin", role: "admin", ip: "192.168.1.10", timestamp: "2026-02-10T08:00:00" },
  { id: "al-2", action: "create", module: "leave-requests", description: "Created leave request for Mohammed Khalid", user: "hr", role: "hr", ip: "192.168.1.15", timestamp: "2026-02-10T09:30:00" },
  { id: "al-3", action: "update", module: "employees", description: "Updated salary for Nadia Samir", user: "hr", role: "hr", ip: "192.168.1.15", timestamp: "2026-02-10T09:45:00" },
  { id: "al-4", action: "create", module: "invoices", description: "Created invoice INV-1006 for Beta Industries", user: "finance", role: "finance", ip: "192.168.1.20", timestamp: "2026-02-10T10:00:00" },
  { id: "al-5", action: "delete", module: "tickets", description: "Deleted resolved ticket #VPN-003", user: "admin", role: "admin", ip: "192.168.1.10", timestamp: "2026-02-10T10:15:00" },
  { id: "al-6", action: "update", module: "purchase-orders", description: "Approved PO-2002 for Tech Supply Co", user: "manager", role: "manager", ip: "192.168.1.5", timestamp: "2026-02-09T14:00:00" },
  { id: "al-7", action: "export", module: "reports", description: "Exported HR Reports to Excel", user: "hr", role: "hr", ip: "192.168.1.15", timestamp: "2026-02-09T16:00:00" },
  { id: "al-8", action: "create", module: "employees", description: "Added new employee Yasser Salem", user: "hr", role: "hr", ip: "192.168.1.15", timestamp: "2026-02-08T11:00:00" },
  { id: "al-9", action: "login", module: "auth", description: "User logged in", user: "finance", role: "finance", ip: "192.168.1.20", timestamp: "2026-02-10T07:55:00" },
  { id: "al-10", action: "update", module: "funds", description: "Updated Petty Cash balance", user: "finance", role: "finance", ip: "192.168.1.20", timestamp: "2026-02-09T15:30:00" },
];

export function addAuditEntry(entry: Omit<AuditEntry, "id" | "timestamp">) {
  const log: AuditEntry = {
    ...entry,
    id: nextId("al"),
    timestamp: new Date().toISOString(),
  };
  auditLog.unshift(log);
  return log;
}
