import { Router } from "express";
import { employees, accounts, invoices } from "../data/store.js";
import { payrollRecords, costRecords, payableAccounts, receivableAccounts, funds } from "../data/extended.js";

const router = Router();

router.get("/", (_req, res) => {
  // Monthly revenue data (last 12 months)
  var months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  var revenueData = months.map(function(m, i) {
    return { month: m, revenue: Math.round(50000 + Math.random() * 150000), expenses: Math.round(30000 + Math.random() * 80000), profit: 0 };
  });
  revenueData.forEach(function(d) { d.profit = d.revenue - d.expenses; });

  // Yearly comparison
  var yearlyComparison = [
    { year: "2024", revenue: 1850000, expenses: 1200000, profit: 650000 },
    { year: "2025", revenue: 2100000, expenses: 1350000, profit: 750000 },
    { year: "2026", revenue: 580000, expenses: 380000, profit: 200000 },
  ];

  // Department expenses breakdown
  var deptExpenses = [
    { name: "الموارد البشرية / HR", value: 450000, color: "#6366f1" },
    { name: "المالية / Finance", value: 320000, color: "#10b981" },
    { name: "المبيعات / Sales", value: 280000, color: "#f59e0b" },
    { name: "IT", value: 150000, color: "#ef4444" },
    { name: "الإدارة / Admin", value: 200000, color: "#8b5cf6" },
  ];

  // Invoice status breakdown
  var invoiceStats = {
    paid: invoices.filter(function(i) { return i.status === "paid"; }).length,
    unpaid: invoices.filter(function(i) { return i.status === "unpaid"; }).length,
    overdue: invoices.filter(function(i) { return i.status === "overdue"; }).length,
  };

  // Cash flow (weekly)
  var cashFlow = [];
  for (var w = 1; w <= 8; w++) {
    cashFlow.push({ week: "W" + w, inflow: Math.round(40000 + Math.random() * 60000), outflow: Math.round(25000 + Math.random() * 40000) });
  }

  // Employee growth
  var empGrowth = [
    { quarter: "Q1 2025", count: 32 },
    { quarter: "Q2 2025", count: 35 },
    { quarter: "Q3 2025", count: 38 },
    { quarter: "Q4 2025", count: 40 },
    { quarter: "Q1 2026", count: employees.length },
  ];

  // KPIs
  var totalRevenue = accounts.filter(function(a) { return a.type === "revenue"; }).reduce(function(s, a) { return s + a.balance; }, 0);
  var totalExpenses = accounts.filter(function(a) { return a.type === "expense"; }).reduce(function(s, a) { return s + a.balance; }, 0);
  var totalPayables = payableAccounts.reduce(function(s, p) { return s + p.amount; }, 0);
  var totalReceivables = receivableAccounts.reduce(function(s, r) { return s + r.amount; }, 0);

  res.json({
    revenueData, yearlyComparison, deptExpenses, invoiceStats, cashFlow, empGrowth,
    kpis: {
      totalRevenue, totalExpenses, netProfit: totalRevenue - totalExpenses,
      totalPayables, totalReceivables, employeeCount: employees.length,
      invoiceCount: invoices.length, fundBalance: funds.reduce(function(s, f) { return s + f.balance; }, 0),
    }
  });
});

export default router;
