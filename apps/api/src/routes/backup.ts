import { Router } from "express";
import { employees, departments, accounts, journalEntries, customers, invoices, vendors, purchaseOrders, products, attendance } from "../data/store.js";
import { leaveRequests, payrollRecords, staffEvaluations, recruitmentRequests, timesheets, payableAccounts, receivableAccounts, funds, inventoryItems, costRecords, properties, leaseAgreements } from "../data/extended.js";

const router = Router();

// Export all data
router.get("/export", (_req, res) => {
  var backup = {
    exportDate: new Date().toISOString(),
    version: "2.0.0",
    data: {
      employees, departments, accounts, journalEntries, customers, invoices,
      vendors, purchaseOrders, products, attendance, leaveRequests, payrollRecords,
      staffEvaluations, recruitmentRequests, timesheets, payableAccounts,
      receivableAccounts, funds, inventoryItems, costRecords, properties, leaseAgreements,
    },
  };
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=erp_backup_" + new Date().toISOString().slice(0, 10) + ".json");
  res.json(backup);
});

// Backup history (simulated)
router.get("/history", (_req, res) => {
  res.json({ backups: [
    { id: "b-1", date: "2026-02-10 03:00 AM", size: "2.4 MB", type: "auto", status: "success" },
    { id: "b-2", date: "2026-02-09 03:00 AM", size: "2.3 MB", type: "auto", status: "success" },
    { id: "b-3", date: "2026-02-08 15:30 PM", size: "2.3 MB", type: "manual", status: "success" },
    { id: "b-4", date: "2026-02-07 03:00 AM", size: "2.2 MB", type: "auto", status: "success" },
    { id: "b-5", date: "2026-02-06 03:00 AM", size: "2.1 MB", type: "auto", status: "failed" },
  ]});
});

// Import (simulated - just validates)
router.post("/import", (req, res) => {
  var body = req.body;
  if (!body.version || !body.data) {
    return res.status(400).json({ error: "Invalid backup file format" });
  }
  var tables = Object.keys(body.data);
  var totalRecords = tables.reduce(function(sum, t) { return sum + (Array.isArray(body.data[t]) ? body.data[t].length : 0); }, 0);
  res.json({ ok: true, message: "تم استيراد البيانات بنجاح / Data imported successfully", tables: tables.length, totalRecords });
});

export default router;
