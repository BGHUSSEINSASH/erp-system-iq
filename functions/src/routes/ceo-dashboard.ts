import { Router } from "express";
import { employees, departments, customers, invoices, vendors, purchaseOrders, tickets, users } from "../data/store.js";
import { leaveRequests, payrollRecords, costRecords } from "../data/extended.js";
import { employeeLoans, projects, vehicles, crmContacts, branches, trainingPrograms } from "../data/newFeatures.js";

const router = Router();

router.get("/", (_req, res) => {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === "active").length;
  const totalDepartments = departments.length;
  const totalCustomers = customers.length;
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);
  const pendingInvoices = invoices.filter(i => i.status === "unpaid").length;
  const overdueInvoices = invoices.filter(i => i.status === "overdue").length;
  const totalVendors = vendors.filter(v => v.status === "active").length;
  const pendingPOs = purchaseOrders.filter(p => p.status === "pending").length;
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in-progress").length;
  const pendingLeaves = leaveRequests.filter(l => l.status === "pending").length;
  const totalPayroll = payrollRecords.filter(p => p.status === "paid").reduce((s, p) => s + p.netSalary, 0);
  const totalCosts = costRecords.reduce((s, c) => s + c.amount, 0);
  const activeLoans = employeeLoans.filter(l => l.status === "active").length;
  const totalLoanAmount = employeeLoans.filter(l => l.status === "active").reduce((s, l) => s + l.remaining, 0);
  const activeProjects = projects.filter(p => p.status === "in-progress").length;
  const projectBudgetTotal = projects.reduce((s, p) => s + p.budget, 0);
  const projectSpentTotal = projects.reduce((s, p) => s + p.spent, 0);
  const activeVehicles = vehicles.filter(v => v.status === "active").length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "maintenance").length;
  const crmDeals = crmContacts.filter(c => c.pipeline !== "won" && c.pipeline !== "lost").length;
  const crmTotalValue = crmContacts.filter(c => c.pipeline !== "lost").reduce((s, c) => s + c.dealValue, 0);
  const activeBranches = branches.filter(b => b.status === "active").length;
  const upcomingTraining = trainingPrograms.filter(t => t.status === "upcoming").length;
  const totalUsers = users.length;

  // Department breakdown
  const deptBreakdown = departments.map(d => ({
    name: d.name,
    employees: d.employeeCount,
    manager: d.manager,
  }));

  // Monthly revenue trend (mock)
  const revenueTrend = [
    { month: "Sep", amount: 95000 },
    { month: "Oct", amount: 110000 },
    { month: "Nov", amount: 88000 },
    { month: "Dec", amount: 125000 },
    { month: "Jan", amount: 113000 },
    { month: "Feb", amount: totalRevenue },
  ];

  res.json({
    summary: {
      totalEmployees, activeEmployees, totalDepartments, totalCustomers,
      totalRevenue, pendingInvoices, overdueInvoices, totalVendors,
      pendingPOs, openTickets, pendingLeaves, totalPayroll, totalCosts,
      activeLoans, totalLoanAmount, activeProjects, projectBudgetTotal,
      projectSpentTotal, activeVehicles, maintenanceVehicles, crmDeals,
      crmTotalValue, activeBranches, upcomingTraining, totalUsers,
    },
    deptBreakdown,
    revenueTrend,
    recentLeaves: leaveRequests.filter(l => l.status === "pending").slice(0, 5),
    recentProjects: projects.filter(p => p.status === "in-progress").slice(0, 5),
  });
});

export default router;
