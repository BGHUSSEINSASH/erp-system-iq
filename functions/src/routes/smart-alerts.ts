import { Router } from "express";
import { invoices } from "../data/store.js";
import { leaveRequests, payableAccounts, leaseAgreements, funds } from "../data/extended.js";

const router = Router();

router.get("/", (_req, res) => {
  var alerts: any[] = [];
  var id = 1;

  // Overdue invoices
  invoices.filter(function(i) { return i.status === "overdue"; }).forEach(function(inv) {
    alerts.push({ id: "sa-" + id++, type: "invoice", severity: "high", titleAr: "فاتورة متأخرة", titleEn: "Overdue Invoice", message: inv.invoiceNo + " - " + inv.customerName + " - " + inv.total.toLocaleString() + " د.ع", icon: "🧾", date: inv.dueDate, actionPath: "/sales/invoices" });
  });

  // Low fund balance
  funds.filter(function(f) { return f.balance < 100000; }).forEach(function(f) {
    alerts.push({ id: "sa-" + id++, type: "fund", severity: "high", titleAr: "رصيد منخفض", titleEn: "Low Balance", message: f.name + " - " + f.balance.toLocaleString() + " " + f.currency, icon: "💰", date: new Date().toISOString().slice(0, 10), actionPath: "/finance/funds" });
  });

  // Pending leave requests
  leaveRequests.filter(function(l) { return l.status === "pending"; }).forEach(function(l) {
    alerts.push({ id: "sa-" + id++, type: "leave", severity: "medium", titleAr: "طلب إجازة معلق", titleEn: "Pending Leave", message: l.employeeName + " - " + l.type + " (" + l.startDate + " إلى " + l.endDate + ")", icon: "🏖️", date: l.startDate, actionPath: "/hr/leave-requests" });
  });

  // Overdue payables
  payableAccounts.filter(function(p) { return p.status === "overdue"; }).forEach(function(p) {
    alerts.push({ id: "sa-" + id++, type: "payable", severity: "high", titleAr: "ذمة متأخرة", titleEn: "Overdue Payable", message: p.vendorName + " - " + p.amount.toLocaleString() + " د.ع", icon: "📥", date: p.dueDate, actionPath: "/finance/payable-accounts" });
  });

  // Expiring leases (within 60 days)
  var today = new Date();
  leaseAgreements.filter(function(l) {
    var end = new Date(l.endDate);
    var diff = (end.getTime() - today.getTime()) / (1000*60*60*24);
    return diff > 0 && diff <= 60 && l.status === "active";
  }).forEach(function(l) {
    alerts.push({ id: "sa-" + id++, type: "lease", severity: "medium", titleAr: "عقد ينتهي قريباً", titleEn: "Expiring Lease", message: l.property + " - " + l.tenant + " (ينتهي " + l.endDate + ")", icon: "📄", date: l.endDate, actionPath: "/admin/lease-agreements" });
  });

  // Unpaid invoices warning
  var unpaidCount = invoices.filter(function(i) { return i.status === "unpaid"; }).length;
  if (unpaidCount > 2) {
    alerts.push({ id: "sa-" + id++, type: "invoice", severity: "medium", titleAr: "فواتير غير مدفوعة", titleEn: "Unpaid Invoices", message: unpaidCount + " فاتورة بحاجة للتحصيل", icon: "📄", date: new Date().toISOString().slice(0, 10), actionPath: "/sales/invoices" });
  }

  // Sort by severity
  var sevOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  alerts.sort(function(a, b) { return (sevOrder[a.severity] || 2) - (sevOrder[b.severity] || 2); });

  res.json({ alerts, counts: { high: alerts.filter(function(a) { return a.severity === "high"; }).length, medium: alerts.filter(function(a) { return a.severity === "medium"; }).length, low: alerts.filter(function(a) { return a.severity === "low"; }).length, total: alerts.length } });
});

export default router;
