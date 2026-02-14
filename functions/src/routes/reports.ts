import { Router, type Request, type Response } from "express";
import { employees, attendance, departments, accounts, journalEntries, invoices, customers, vendors, purchaseOrders, products, tickets, itAssets, contracts, budgets, quotations, workOrders } from "../data/store.js";
import { leaveRequests, payrollRecords, staffEvaluations, recruitmentRequests, timesheets, payableAccounts, receivableAccounts, funds, inventoryItems, costRecords, properties, leaseAgreements, staffNotifications } from "../data/extended.js";

const router = Router();

/* ── HR Reports ────────────────────────────── */
router.get("/hr", (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  // Date filter helper
  const inRange = (dateStr: string) => {
    if (!from && !to) return true;
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const totalSalaries = employees.reduce((s, e) => s + e.salary, 0);
  const avgSalary = Math.round(totalSalaries / (totalEmployees || 1));

  const filteredAttendance = attendance.filter(a => inRange(a.date));
  const presentToday = filteredAttendance.filter(a => a.status === "present").length;
  const absentToday = filteredAttendance.filter(a => a.status === "absent").length;
  const lateToday = filteredAttendance.filter(a => a.status === "late").length;
  const onLeave = filteredAttendance.filter(a => a.status === "leave").length;

  const filteredLeaves = leaveRequests.filter(l => inRange(l.startDate));
  const pendingLeaves = filteredLeaves.filter(l => l.status === "pending").length;
  const approvedLeaves = filteredLeaves.filter(l => l.status === "approved").length;

  const filteredPayroll = payrollRecords.filter(p => {
    const m = p.month + "-01";
    return inRange(m);
  });
  const totalPayroll = filteredPayroll.reduce((s, p) => s + p.netSalary, 0);
  const avgEvalScore = Math.round(staffEvaluations.reduce((s, e) => s + e.score, 0) / (staffEvaluations.length || 1));
  const openPositions = recruitmentRequests.filter(r => r.status === "open" || r.status === "interviewing").reduce((s, r) => s + r.vacancies, 0);

  const departmentStats = departments.map(d => ({
    name: d.name,
    employeeCount: d.employeeCount,
    manager: d.manager,
  }));

  const attendanceSummary = { presentToday, absentToday, lateToday, onLeave, total: filteredAttendance.length };

  const leaveByType = {
    annual: filteredLeaves.filter(l => l.type === "annual").length,
    sick: filteredLeaves.filter(l => l.type === "sick").length,
    personal: filteredLeaves.filter(l => l.type === "personal").length,
    unpaid: filteredLeaves.filter(l => l.type === "unpaid").length,
  };

  const salaryByDept = departments.map(d => {
    const deptEmps = employees.filter(e => e.departmentId === d.id);
    return { department: d.name, total: deptEmps.reduce((s, e) => s + e.salary, 0), count: deptEmps.length };
  }).filter(x => x.count > 0);

  const evaluationSummary = {
    excellent: staffEvaluations.filter(e => e.rating === "excellent").length,
    good: staffEvaluations.filter(e => e.rating === "good").length,
    average: staffEvaluations.filter(e => e.rating === "average").length,
    poor: staffEvaluations.filter(e => e.rating === "poor").length,
  };

  res.json({
    summary: { totalEmployees, activeEmployees, totalSalaries, avgSalary, totalPayroll, avgEvalScore, openPositions, pendingLeaves, approvedLeaves },
    attendanceSummary,
    leaveByType,
    salaryByDept,
    departmentStats,
    evaluationSummary,
    // Full data arrays
    employees,
    attendanceList: filteredAttendance,
    leaveRequestsList: filteredLeaves,
    payrollList: filteredPayroll,
    evaluationsList: staffEvaluations,
    timesheetsList: timesheets.filter(t => inRange(t.date)),
    recruitmentList: recruitmentRequests,
    contractsList: contracts,
    staffNotificationsList: staffNotifications,
  });
});

/* ── Finance Reports ───────────────────────── */
router.get("/finance", (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;

  const inRange = (dateStr: string) => {
    if (!from && !to) return true;
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  const totalAssets = accounts.filter(a => a.type === "asset").reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.type === "liability").reduce((s, a) => s + a.balance, 0);
  const totalEquity = accounts.filter(a => a.type === "equity").reduce((s, a) => s + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.type === "revenue").reduce((s, a) => s + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.type === "expense").reduce((s, a) => s + a.balance, 0);

  const acctArr = [
    { type: "الأصول / Assets", count: accounts.filter(a => a.type === "asset").length, total: totalAssets },
    { type: "الخصوم / Liabilities", count: accounts.filter(a => a.type === "liability").length, total: totalLiabilities },
    { type: "حقوق الملكية / Equity", count: accounts.filter(a => a.type === "equity").length, total: totalEquity },
    { type: "الإيرادات / Revenue", count: accounts.filter(a => a.type === "revenue").length, total: totalRevenue },
    { type: "المصروفات / Expenses", count: accounts.filter(a => a.type === "expense").length, total: totalExpenses },
  ];

  const payStatuses = ["pending", "paid", "overdue"];
  const payablesArr = payStatuses.map(st => ({
    status: st,
    count: payableAccounts.filter(p => p.status === st).length,
    total: payableAccounts.filter(p => p.status === st).reduce((s, p) => s + p.amount, 0),
  })).filter(x => x.count > 0);

  const recStatuses = ["pending", "received", "collected", "overdue"];
  const receivablesArr = recStatuses.map(st => ({
    status: st,
    count: receivableAccounts.filter(r => r.status === st).length,
    total: receivableAccounts.filter(r => r.status === st).reduce((s, r) => s + r.amount, 0),
  })).filter(x => x.count > 0);

  const filteredCosts = costRecords.filter(c => inRange(c.date));
  const costsByCategory = filteredCosts.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + c.amount;
    return acc;
  }, {} as Record<string, number>);
  const costsArr = Object.entries(costsByCategory).map(([category, total]) => ({ category, total }));

  const filteredJournal = journalEntries.filter((j: any) => inRange(j.date));
  const journalArr = filteredJournal.map((j: any) => ({
    id: j.id, date: j.date, description: j.description || j.memo || "",
    debit: j.debit ?? j.amount ?? 0, credit: j.credit ?? j.amount ?? 0,
    accountName: j.accountName || "", status: j.status || "posted",
  }));

  res.json({
    accounts: acctArr,
    payables: payablesArr,
    receivables: receivablesArr,
    costs: costsArr,
    funds,
    journalEntries: journalArr,
    totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity, revenue: totalRevenue, expenses: totalExpenses },
    // Full data arrays
    accountsList: accounts,
    payablesList: payableAccounts,
    receivablesList: receivableAccounts,
    costsList: filteredCosts,
    budgetsList: budgets,
    inventoryList: inventoryItems,
    invoicesList: invoices.filter(i => inRange(i.date)),
  });
});

/* ── Admin Reports ─────────────────────────── */
router.get("/admin", (_req: Request, res: Response) => {
  const totalProperties = properties.length;
  const totalPropertyValue = properties.reduce((s, p) => s + p.value, 0);
  const activeProperties = properties.filter(p => p.status === "active").length;
  const maintenanceProperties = properties.filter(p => p.status === "maintenance").length;
  const totalLeases = leaseAgreements.length;
  const activeLeases = leaseAgreements.filter(l => l.status === "active").length;
  const monthlyRentalIncome = leaseAgreements.filter(l => l.status === "active").reduce((s, l) => s + l.monthlyRent, 0);
  const annualRentalIncome = monthlyRentalIncome * 12;

  const propertiesByType = properties.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const propertiesByTypeArr = Object.entries(propertiesByType).map(([type, count]) => ({ type, count }));

  const propertiesByStatus = {
    active: activeProperties,
    maintenance: maintenanceProperties,
    disposed: properties.filter(p => p.status === "disposed").length,
  };

  const leasesByStatus = {
    active: activeLeases,
    expired: leaseAgreements.filter(l => l.status === "expired").length,
    terminated: leaseAgreements.filter(l => l.status === "terminated").length,
  };

  res.json({
    summary: { totalProperties, totalPropertyValue, activeProperties, maintenanceProperties, totalLeases, activeLeases, monthlyRentalIncome, annualRentalIncome },
    propertiesByTypeArr,
    propertiesByStatus,
    leasesByStatus,
    propertiesList: properties,
    leasesList: leaseAgreements,
  });
});

/* ── Sales Reports ─────────────────────────── */
router.get("/sales", (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const inRange = (dateStr: string) => {
    if (!from && !to) return true;
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  const filteredInvoices = invoices.filter(i => inRange(i.date));
  const totalRevenue = filteredInvoices.reduce((s, i) => s + i.total, 0);
  const paidInvoices = filteredInvoices.filter(i => i.status === "paid");
  const unpaidInvoices = filteredInvoices.filter(i => i.status === "unpaid");
  const overdueInvoices = filteredInvoices.filter(i => i.status === "overdue");
  const filteredQuotations = quotations.filter(q => inRange(q.date));

  res.json({
    summary: {
      totalCustomers: customers.length,
      activeCustomers: customers.filter(c => c.status === "active").length,
      totalRevenue,
      totalInvoices: filteredInvoices.length,
      paidCount: paidInvoices.length,
      paidTotal: paidInvoices.reduce((s, i) => s + i.total, 0),
      unpaidCount: unpaidInvoices.length,
      unpaidTotal: unpaidInvoices.reduce((s, i) => s + i.total, 0),
      overdueCount: overdueInvoices.length,
      overdueTotal: overdueInvoices.reduce((s, i) => s + i.total, 0),
      totalQuotations: filteredQuotations.length,
    },
    customersList: customers,
    invoicesList: filteredInvoices,
    quotationsList: filteredQuotations,
  });
});

/* ── Purchasing Reports ────────────────────── */
router.get("/purchasing", (req: Request, res: Response) => {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const inRange = (dateStr: string) => {
    if (!from && !to) return true;
    if (from && dateStr < from) return false;
    if (to && dateStr > to) return false;
    return true;
  };

  const filteredPOs = purchaseOrders.filter(p => inRange(p.date));
  const totalValue = filteredPOs.reduce((s, p) => s + p.total, 0);

  res.json({
    summary: {
      totalVendors: vendors.length,
      activeVendors: vendors.filter(v => v.status === "active").length,
      totalPOs: filteredPOs.length,
      totalValue,
      pendingPOs: filteredPOs.filter(p => p.status === "pending").length,
      approvedPOs: filteredPOs.filter(p => p.status === "approved").length,
      receivedPOs: filteredPOs.filter(p => p.status === "received").length,
    },
    vendorsList: vendors,
    purchaseOrdersList: filteredPOs,
  });
});

/* ── IT Reports ────────────────────────────── */
router.get("/it", (_req: Request, res: Response) => {
  res.json({
    summary: {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === "open").length,
      inProgressTickets: tickets.filter(t => t.status === "in-progress").length,
      resolvedTickets: tickets.filter(t => t.status === "resolved").length,
      criticalTickets: tickets.filter(t => t.priority === "critical").length,
      totalAssets: itAssets.length,
      activeAssets: itAssets.filter(a => a.status === "active").length,
    },
    ticketsList: tickets,
    assetsList: itAssets,
  });
});

/* ── Production Reports ────────────────────── */
router.get("/production", (_req: Request, res: Response) => {
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const lowStock = products.filter(p => p.stock <= p.minStock).length;
  const totalInventoryValue = products.reduce((s, p) => s + (p.price * p.stock), 0);

  res.json({
    summary: {
      totalProducts,
      activeProducts,
      lowStock,
      totalInventoryValue,
      totalWorkOrders: workOrders.length,
      pendingWO: workOrders.filter(w => w.status === "pending").length,
      inProgressWO: workOrders.filter(w => w.status === "in-progress").length,
      completedWO: workOrders.filter(w => w.status === "completed").length,
    },
    productsList: products,
    workOrdersList: workOrders,
  });
});

export default router;
