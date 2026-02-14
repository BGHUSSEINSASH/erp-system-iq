import { Router } from "express";
import { employees, accounts, invoices, customers, vendors } from "../data/store.js";
import { payableAccounts, receivableAccounts, leaveRequests, payrollRecords, costRecords, properties, leaseAgreements, funds } from "../data/extended.js";

const router = Router();

const dataSources: Record<string, () => any[]> = {
  employees: () => employees,
  accounts: () => accounts,
  invoices: () => invoices,
  customers: () => customers,
  vendors: () => vendors,
  payables: () => payableAccounts,
  receivables: () => receivableAccounts,
  leaves: () => leaveRequests,
  payroll: () => payrollRecords,
  costs: () => costRecords,
  properties: () => properties,
  leases: () => leaseAgreements,
  funds: () => funds,
};

router.get("/sources", (_req, res) => {
  var sources = Object.keys(dataSources).map(function(key) {
    var sample = dataSources[key]();
    var fields = sample.length > 0 ? Object.keys(sample[0]) : [];
    return { id: key, label: key, fields: fields, count: sample.length };
  });
  res.json({ sources });
});

router.post("/generate", (req, res) => {
  var { source, fields, filters, sortBy, sortDir } = req.body;
  if (!dataSources[source]) return res.status(400).json({ error: "Invalid source" });

  var data = [...dataSources[source]()];

  // Apply filters
  if (filters && Array.isArray(filters)) {
    filters.forEach(function(f: any) {
      data = data.filter(function(row: any) {
        var val = String(row[f.field] || "").toLowerCase();
        var target = String(f.value || "").toLowerCase();
        if (f.operator === "contains") return val.indexOf(target) >= 0;
        if (f.operator === "equals") return val === target;
        if (f.operator === "gt") return Number(row[f.field]) > Number(f.value);
        if (f.operator === "lt") return Number(row[f.field]) < Number(f.value);
        return true;
      });
    });
  }

  // Sort
  if (sortBy) {
    data.sort(function(a: any, b: any) {
      var va = a[sortBy], vb = b[sortBy];
      if (typeof va === "number" && typeof vb === "number") return sortDir === "desc" ? vb - va : va - vb;
      return sortDir === "desc" ? String(vb).localeCompare(String(va)) : String(va).localeCompare(String(vb));
    });
  }

  // Pick fields
  if (fields && fields.length > 0) {
    data = data.map(function(row: any) {
      var obj: any = {};
      fields.forEach(function(f: string) { obj[f] = row[f]; });
      return obj;
    });
  }

  res.json({ data, total: data.length, source, fields: fields || [] });
});

export default router;
