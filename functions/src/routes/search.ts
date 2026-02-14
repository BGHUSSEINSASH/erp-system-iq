import { Router } from "express";
import { employees, departments, customers, vendors, products, tickets, invoices, purchaseOrders, accounts } from "../data/store.js";
import { leaveRequests, payrollRecords, properties, leaseAgreements, funds } from "../data/extended.js";

const router = Router();

router.get("/", (req, res) => {
  const q = ((req.query.q as string) || "").toLowerCase().trim();
  if (!q || q.length < 2) return res.json([]);

  const results: { category: string; categoryAr: string; id: string; title: string; subtitle: string; path: string }[] = [];
  const max = 5;

  // Employees
  employees.filter((e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.position.toLowerCase().includes(q)).slice(0, max)
    .forEach((e) => results.push({ category: "Employees", categoryAr: "الموظفين", id: e.id, title: e.name, subtitle: e.position + " - " + e.department, path: "/hr/staff-card" }));

  // Departments
  departments.filter((d) => d.name.toLowerCase().includes(q) || d.manager.toLowerCase().includes(q)).slice(0, max)
    .forEach((d) => results.push({ category: "Departments", categoryAr: "الأقسام", id: d.id, title: d.name, subtitle: "Manager: " + d.manager, path: "/hr/departments" }));

  // Customers
  customers.filter((c) => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)).slice(0, max)
    .forEach((c) => results.push({ category: "Customers", categoryAr: "العملاء", id: c.id, title: c.name, subtitle: c.company, path: "/sales/customers" }));

  // Vendors
  vendors.filter((v) => v.name.toLowerCase().includes(q) || v.company.toLowerCase().includes(q)).slice(0, max)
    .forEach((v) => results.push({ category: "Vendors", categoryAr: "الموردين", id: v.id, title: v.name, subtitle: v.company, path: "/procurement/vendors" }));

  // Products
  products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, max)
    .forEach((p) => results.push({ category: "Products", categoryAr: "المنتجات", id: p.id, title: p.name, subtitle: "SKU: " + p.sku + " | Stock: " + p.stock, path: "/production/products" }));

  // Invoices
  invoices.filter((i) => i.invoiceNo.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)).slice(0, max)
    .forEach((i) => results.push({ category: "Invoices", categoryAr: "الفواتير", id: i.id, title: i.invoiceNo, subtitle: i.customerName + " - " + i.total.toLocaleString() + " د.ع", path: "/sales/invoices" }));

  // Purchase Orders
  purchaseOrders.filter((p) => p.poNumber.toLowerCase().includes(q) || p.vendorName.toLowerCase().includes(q)).slice(0, max)
    .forEach((p) => results.push({ category: "Purchase Orders", categoryAr: "أوامر الشراء", id: p.id, title: p.poNumber, subtitle: p.vendorName + " - " + p.total.toLocaleString() + " د.ع", path: "/procurement/purchase-orders" }));

  // Tickets
  tickets.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)).slice(0, max)
    .forEach((t) => results.push({ category: "Tickets", categoryAr: "التذاكر", id: t.id, title: t.title, subtitle: t.priority + " - " + t.status, path: "/it/tickets" }));

  // Accounts
  accounts.filter((a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q)).slice(0, max)
    .forEach((a) => results.push({ category: "Accounts", categoryAr: "الحسابات", id: a.id, title: a.code + " - " + a.name, subtitle: a.type + " | " + a.balance.toLocaleString() + " د.ع", path: "/finance/accounts" }));

  // Properties
  properties.filter((p) => p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)).slice(0, max)
    .forEach((p) => results.push({ category: "Properties", categoryAr: "الممتلكات", id: p.id, title: p.name, subtitle: p.location, path: "/admin/property" }));

  // Leave Requests
  leaveRequests.filter((l: any) => (l.employeeName || "").toLowerCase().includes(q) || (l.type || "").toLowerCase().includes(q)).slice(0, max)
    .forEach((l: any) => results.push({ category: "Leave Requests", categoryAr: "طلبات الإجازة", id: l.id, title: l.employeeName || "طلب إجازة", subtitle: (l.type || "") + " - " + (l.status || ""), path: "/hr/leave-requests" }));

  // Funds
  funds.filter((f: any) => (f.name || "").toLowerCase().includes(q) || (f.type || "").toLowerCase().includes(q)).slice(0, max)
    .forEach((f: any) => results.push({ category: "Funds", categoryAr: "الصناديق", id: f.id, title: f.name, subtitle: (f.type || "") + " | " + (f.balance || 0).toLocaleString() + " د.ع", path: "/finance/funds" }));

  res.json(results.slice(0, 30));
});

export default router;
