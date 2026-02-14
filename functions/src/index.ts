import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { onRequest } from "firebase-functions/v2/https";

import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import employeesRoutes from "./routes/employees.js";
import departmentsRoutes from "./routes/departments.js";
import attendanceRoutes from "./routes/attendance.js";
import accountsRoutes from "./routes/accounts.js";
import journalRoutes from "./routes/journal-entries.js";
import customersRoutes from "./routes/customers.js";
import invoicesRoutes from "./routes/invoices.js";
import vendorsRoutes from "./routes/vendors.js";
import poRoutes from "./routes/purchase-orders.js";
import productsRoutes from "./routes/products.js";
import ticketsRoutes from "./routes/tickets.js";
import usersRoutes from "./routes/users.js";
import rolesRoutes from "./routes/roles.js";
import timesheetsRoutes from "./routes/timesheets.js";
import leaveRequestsRoutes from "./routes/leave-requests.js";
import payrollRoutes from "./routes/payroll.js";
import evaluationsRoutes from "./routes/evaluations.js";
import recruitmentRoutes from "./routes/recruitment.js";
import staffNotifRoutes from "./routes/staff-notifications.js";
import payableRoutes from "./routes/payable-accounts.js";
import receivableRoutes from "./routes/receivable-accounts.js";
import fundsRoutes from "./routes/funds.js";
import inventoriesRoutes from "./routes/inventories.js";
import costsRoutes from "./routes/costs.js";
import propertiesRoutes from "./routes/properties.js";
import leaseRoutes from "./routes/lease-agreements.js";
import reportsRoutes from "./routes/reports.js";
import permissionsRoutes from "./routes/permissions.js";
import notificationsRoutes from "./routes/notifications.js";
import auditLogRoutes from "./routes/audit-log.js";
import messagesRoutes from "./routes/messages.js";
import calendarRoutes from "./routes/calendar.js";
import approvalsRoutes from "./routes/approvals.js";
import searchRoutes from "./routes/search.js";
import sectionAccessRoutes from "./routes/section-access.js";
import analyticsRoutes from "./routes/analytics.js";
import smartAlertsRoutes from "./routes/smart-alerts.js";
import kanbanRoutes from "./routes/kanban.js";
import documentsRoutes from "./routes/documents.js";
import reportBuilderRoutes from "./routes/report-builder.js";
import chatRoomsRoutes from "./routes/chat-rooms.js";
import esignaturesRoutes from "./routes/esignatures.js";
import backupRoutes from "./routes/backup.js";
import goalsRoutes from "./routes/goals.js";
import itAssetsRoutes from "./routes/it-assets.js";
import systemHealthRoutes from "./routes/system-health.js";
import contractsRoutes from "./routes/contracts.js";
import budgetsRoutes from "./routes/budgets.js";
import quotationsRoutes from "./routes/quotations.js";
import workOrdersRoutes from "./routes/work-orders.js";
// New Features
import emailNotifRoutes from "./routes/email-notifications.js";
import ceoDashboardRoutes from "./routes/ceo-dashboard.js";
import employeeLoansRoutes from "./routes/employee-loans.js";
import archivesRoutes from "./routes/archives.js";
import fixedAssetsRoutes from "./routes/fixed-assets.js";
import tendersRoutes from "./routes/tenders.js";
import projectsRoutes from "./routes/projects.js";
import trainingRoutes from "./routes/training.js";
import vehiclesRoutes from "./routes/vehicles.js";
import crmRoutes from "./routes/crm.js";
import branchesRoutes from "./routes/branches.js";
import expenseRequestsRoutes from "./routes/expense-requests.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

/* Public */
app.use("/auth", authRoutes);

/* All other routes (no JWT guard for demo – add authenticate middleware in production) */
app.use("/dashboard", dashboardRoutes);
app.use("/employees", employeesRoutes);
app.use("/departments", departmentsRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/accounts", accountsRoutes);
app.use("/journal-entries", journalRoutes);
app.use("/customers", customersRoutes);
app.use("/invoices", invoicesRoutes);
app.use("/vendors", vendorsRoutes);
app.use("/purchase-orders", poRoutes);
app.use("/products", productsRoutes);
app.use("/tickets", ticketsRoutes);
app.use("/users", usersRoutes);
app.use("/roles", rolesRoutes);
app.use("/timesheets", timesheetsRoutes);
app.use("/leave-requests", leaveRequestsRoutes);
app.use("/payroll", payrollRoutes);
app.use("/evaluations", evaluationsRoutes);
app.use("/recruitment", recruitmentRoutes);
app.use("/staff-notifications", staffNotifRoutes);
app.use("/payable-accounts", payableRoutes);
app.use("/receivable-accounts", receivableRoutes);
app.use("/funds", fundsRoutes);
app.use("/inventories", inventoriesRoutes);
app.use("/costs", costsRoutes);
app.use("/properties", propertiesRoutes);
app.use("/lease-agreements", leaseRoutes);
app.use("/reports", reportsRoutes);
app.use("/permissions", permissionsRoutes);
app.use("/notifications", notificationsRoutes);
app.use("/audit-log", auditLogRoutes);
app.use("/messages", messagesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/approvals", approvalsRoutes);
app.use("/search", searchRoutes);
app.use("/section-access", sectionAccessRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/smart-alerts", smartAlertsRoutes);
app.use("/kanban", kanbanRoutes);
app.use("/documents", documentsRoutes);
app.use("/report-builder", reportBuilderRoutes);
app.use("/chat-rooms", chatRoomsRoutes);
app.use("/esignatures", esignaturesRoutes);
app.use("/backup", backupRoutes);
app.use("/goals", goalsRoutes);
app.use("/it-assets", itAssetsRoutes);
app.use("/system-health", systemHealthRoutes);
app.use("/contracts", contractsRoutes);
app.use("/budgets", budgetsRoutes);
app.use("/quotations", quotationsRoutes);
app.use("/work-orders", workOrdersRoutes);
// New Features
app.use("/email-notifications", emailNotifRoutes);
app.use("/ceo-dashboard", ceoDashboardRoutes);
app.use("/employee-loans", employeeLoansRoutes);
app.use("/archives", archivesRoutes);
app.use("/fixed-assets", fixedAssetsRoutes);
app.use("/tenders", tendersRoutes);
app.use("/projects", projectsRoutes);
app.use("/training", trainingRoutes);
app.use("/vehicles", vehiclesRoutes);
app.use("/crm", crmRoutes);
app.use("/branches", branchesRoutes);
app.use("/expense-requests", expenseRequestsRoutes);

/* ═══ Firebase Cloud Function Export ═══ */
// Wrap Express app behind /api prefix for Firebase Hosting rewrites
const firebaseApp = express();
firebaseApp.use(cors());
firebaseApp.use("/api", app);

export const api = onRequest({ region: "us-central1", timeoutSeconds: 60, memory: "256MiB" }, firebaseApp);
