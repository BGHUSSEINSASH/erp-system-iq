/* ────────────────────────────────────────────
   Extended ERP Data – HR, Finance, Admin extras
   ──────────────────────────────────────────── */
import { nextId } from "./store.js";

/* ── Types ─────────────────────────────────── */

export type Timesheet = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  hoursWorked: number;
  overtime: number;
  project: string;
  status: "submitted" | "approved" | "rejected";
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: "annual" | "sick" | "personal" | "unpaid";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  approvedBy: string;
};

export type PayrollRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "draft" | "processed" | "paid";
};

export type StaffEvaluation = {
  id: string;
  employeeId: string;
  employeeName: string;
  evaluator: string;
  period: string;
  score: number;
  rating: "excellent" | "good" | "average" | "poor";
  comments: string;
  date: string;
};

export type RecruitmentRequest = {
  id: string;
  position: string;
  department: string;
  requestedBy: string;
  date: string;
  vacancies: number;
  urgency: "low" | "medium" | "high";
  status: "open" | "interviewing" | "filled" | "cancelled";
  description: string;
};

export type StaffNotification = {
  id: string;
  employeeName: string;
  department: string;
  position: string;
  startDate: string;
  notifiedBy: string;
  date: string;
  notes: string;
};

export type PayableAccount = {
  id: string;
  vendorName: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid" | "overdue";
  description: string;
};

export type ReceivableAccount = {
  id: string;
  customerName: string;
  invoiceNo: string;
  amount: number;
  dueDate: string;
  status: "pending" | "received" | "overdue";
  description: string;
};

export type Fund = {
  id: string;
  name: string;
  type: "operating" | "reserve" | "investment" | "petty-cash";
  balance: number;
  currency: string;
  lastUpdated: string;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  lastReceived: string;
  status: "in-stock" | "low" | "out-of-stock";
};

export type CostRecord = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  department: string;
  status: "recorded" | "approved" | "rejected";
};

export type Property = {
  id: string;
  name: string;
  type: "building" | "land" | "vehicle" | "equipment" | "furniture";
  location: string;
  value: number;
  acquisitionDate: string;
  status: "active" | "maintenance" | "disposed";
};

export type LeaseAgreement = {
  id: string;
  property: string;
  tenant: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  status: "active" | "expired" | "terminated";
  notes: string;
};

/* ── Sample Data ───────────────────────────── */

export const timesheets: Timesheet[] = [
  { id: "ts-1", employeeId: "e-1", employeeName: "Ahmed Hassan", date: "2026-02-10", hoursWorked: 8, overtime: 1, project: "ERP Development", status: "approved" },
  { id: "ts-2", employeeId: "e-2", employeeName: "Sara Ali", date: "2026-02-10", hoursWorked: 8, overtime: 0, project: "Financial Reports", status: "submitted" },
  { id: "ts-3", employeeId: "e-3", employeeName: "Mohammed Khalid", date: "2026-02-10", hoursWorked: 7, overtime: 0, project: "Client Meetings", status: "submitted" },
  { id: "ts-4", employeeId: "e-4", employeeName: "Fatima Noor", date: "2026-02-10", hoursWorked: 8, overtime: 2, project: "Server Migration", status: "approved" },
  { id: "ts-5", employeeId: "e-7", employeeName: "Khaled Mansour", date: "2026-02-10", hoursWorked: 9, overtime: 1, project: "Production Line A", status: "submitted" },
];

export const leaveRequests: LeaveRequest[] = [
  { id: "lr-1", employeeId: "e-6", employeeName: "Layla Ibrahim", department: "Marketing", type: "annual", startDate: "2026-02-10", endDate: "2026-02-14", days: 5, reason: "Family vacation", status: "approved", approvedBy: "المدير العام / CEO" },
  { id: "lr-2", employeeId: "e-3", employeeName: "Mohammed Khalid", department: "Sales", type: "sick", startDate: "2026-02-12", endDate: "2026-02-13", days: 2, reason: "Medical appointment", status: "pending", approvedBy: "" },
  { id: "lr-3", employeeId: "e-8", employeeName: "Nadia Samir", department: "Finance", type: "personal", startDate: "2026-02-15", endDate: "2026-02-15", days: 1, reason: "Personal matters", status: "pending", approvedBy: "" },
  { id: "lr-4", employeeId: "e-5", employeeName: "Omar Youssef", department: "Procurement", type: "annual", startDate: "2026-03-01", endDate: "2026-03-07", days: 7, reason: "Travel", status: "rejected", approvedBy: "المدير العام / CEO" },
  { id: "lr-5", employeeId: "e-4", employeeName: "Fatima Noor", department: "IT", type: "sick", startDate: "2026-02-18", endDate: "2026-02-19", days: 2, reason: "Flu recovery", status: "pending", approvedBy: "" },
  { id: "lr-6", employeeId: "e-1", employeeName: "Ahmed Hassan", department: "Human Resources", type: "annual", startDate: "2026-03-15", endDate: "2026-03-20", days: 6, reason: "Family event", status: "pending", approvedBy: "" },
];

export const payrollRecords: PayrollRecord[] = [
  { id: "pr-1", employeeId: "e-1", employeeName: "Ahmed Hassan", month: "2026-01", basicSalary: 18000, allowances: 3000, deductions: 1800, netSalary: 19200, status: "paid" },
  { id: "pr-2", employeeId: "e-2", employeeName: "Sara Ali", month: "2026-01", basicSalary: 20000, allowances: 4000, deductions: 2000, netSalary: 22000, status: "paid" },
  { id: "pr-3", employeeId: "e-3", employeeName: "Mohammed Khalid", month: "2026-01", basicSalary: 15000, allowances: 2500, deductions: 1500, netSalary: 16000, status: "paid" },
  { id: "pr-4", employeeId: "e-4", employeeName: "Fatima Noor", month: "2026-01", basicSalary: 16000, allowances: 2000, deductions: 1600, netSalary: 16400, status: "paid" },
  { id: "pr-5", employeeId: "e-1", employeeName: "Ahmed Hassan", month: "2026-02", basicSalary: 18000, allowances: 3000, deductions: 1800, netSalary: 19200, status: "draft" },
  { id: "pr-6", employeeId: "e-2", employeeName: "Sara Ali", month: "2026-02", basicSalary: 20000, allowances: 4000, deductions: 2000, netSalary: 22000, status: "draft" },
];

export const staffEvaluations: StaffEvaluation[] = [
  { id: "se-1", employeeId: "e-1", employeeName: "Ahmed Hassan", evaluator: "General Manager", period: "H2-2025", score: 92, rating: "excellent", comments: "Outstanding leadership", date: "2026-01-15" },
  { id: "se-2", employeeId: "e-2", employeeName: "Sara Ali", evaluator: "General Manager", period: "H2-2025", score: 88, rating: "good", comments: "Reliable and thorough", date: "2026-01-15" },
  { id: "se-3", employeeId: "e-3", employeeName: "Mohammed Khalid", evaluator: "Ahmed Hassan", period: "H2-2025", score: 75, rating: "good", comments: "Good sales numbers", date: "2026-01-16" },
  { id: "se-4", employeeId: "e-7", employeeName: "Khaled Mansour", evaluator: "General Manager", period: "H2-2025", score: 95, rating: "excellent", comments: "Exceptional production management", date: "2026-01-16" },
];

export const recruitmentRequests: RecruitmentRequest[] = [
  { id: "rr-1", position: "Junior Developer", department: "IT", requestedBy: "Fatima Noor", date: "2026-02-01", vacancies: 2, urgency: "high", status: "open", description: "Need 2 developers for new project" },
  { id: "rr-2", position: "Sales Representative", department: "Sales", requestedBy: "Mohammed Khalid", date: "2026-02-03", vacancies: 1, urgency: "medium", status: "interviewing", description: "Expansion of sales team" },
  { id: "rr-3", position: "Accountant", department: "Finance", requestedBy: "Sara Ali", date: "2026-01-20", vacancies: 1, urgency: "low", status: "filled", description: "Replacement for departing staff" },
];

export const staffNotifications: StaffNotification[] = [
  { id: "sn-1", employeeName: "Yasser Salem", department: "IT", position: "Junior Developer", startDate: "2026-03-01", notifiedBy: "Ahmed Hassan", date: "2026-02-08", notes: "New hire for development team" },
  { id: "sn-2", employeeName: "Mona Faris", department: "Finance", position: "Accountant", startDate: "2026-02-15", notifiedBy: "Ahmed Hassan", date: "2026-02-05", notes: "Replacement position" },
];

export const payableAccounts: PayableAccount[] = [
  { id: "pa-1", vendorName: "Steel Works Inc", invoiceNo: "SW-4501", amount: 85000, dueDate: "2026-02-20", status: "pending", description: "Raw materials order" },
  { id: "pa-2", vendorName: "Tech Supply Co", invoiceNo: "TS-1122", amount: 32000, dueDate: "2026-02-15", status: "paid", description: "IT equipment" },
  { id: "pa-3", vendorName: "Raw Materials Ltd", invoiceNo: "RM-789", amount: 120000, dueDate: "2026-03-01", status: "pending", description: "Bulk material purchase" },
  { id: "pa-4", vendorName: "Logistics Pro", invoiceNo: "LP-345", amount: 15000, dueDate: "2026-02-05", status: "overdue", description: "Shipping services" },
];

export const receivableAccounts: ReceivableAccount[] = [
  { id: "ra-1", customerName: "Alpha Corp", invoiceNo: "INV-1001", amount: 75000, dueDate: "2026-02-15", status: "received", description: "Product delivery" },
  { id: "ra-2", customerName: "Beta Industries", invoiceNo: "INV-1002", amount: 42000, dueDate: "2026-02-20", status: "pending", description: "Services rendered" },
  { id: "ra-3", customerName: "Omega Group", invoiceNo: "INV-1004", amount: 120000, dueDate: "2026-02-05", status: "overdue", description: "Large order – delayed payment" },
  { id: "ra-4", customerName: "Gamma Trading", invoiceNo: "INV-1003", amount: 18500, dueDate: "2026-02-25", status: "pending", description: "Consulting fee" },
];

export const funds: Fund[] = [
  { id: "f-1", name: "Main Operating Fund", type: "operating", balance: 1450000, currency: "IQD", lastUpdated: "2026-02-10" },
  { id: "f-2", name: "Emergency Reserve", type: "reserve", balance: 500000, currency: "IQD", lastUpdated: "2026-01-31" },
  { id: "f-3", name: "Investment Fund", type: "investment", balance: 2000000, currency: "USD", lastUpdated: "2026-02-01" },
  { id: "f-4", name: "Petty Cash – Main Office", type: "petty-cash", balance: 5000, currency: "IQD", lastUpdated: "2026-02-09" },
];

export const inventoryItems: InventoryItem[] = [
  { id: "ii-1", name: "Steel Beam A100", sku: "STL-A100", warehouse: "Warehouse A", quantity: 150, unitCost: 2500, totalValue: 375000, lastReceived: "2026-02-01", status: "in-stock" },
  { id: "ii-2", name: "Circuit Board X20", sku: "CB-X20", warehouse: "Warehouse B", quantity: 300, unitCost: 450, totalValue: 135000, lastReceived: "2026-01-25", status: "in-stock" },
  { id: "ii-3", name: "Sensor Module S7", sku: "SM-S7", warehouse: "Warehouse B", quantity: 8, unitCost: 680, totalValue: 5440, lastReceived: "2026-01-10", status: "low" },
  { id: "ii-4", name: "Motor Unit M3", sku: "MU-M3", warehouse: "Warehouse A", quantity: 45, unitCost: 3200, totalValue: 144000, lastReceived: "2026-01-20", status: "in-stock" },
  { id: "ii-5", name: "Plastic Housing P5", sku: "PH-P5", warehouse: "Warehouse C", quantity: 0, unitCost: 80, totalValue: 0, lastReceived: "2025-12-15", status: "out-of-stock" },
];

export const costRecords: CostRecord[] = [
  { id: "cr-1", category: "Salaries", description: "January salaries", amount: 145000, date: "2026-01-31", department: "All", status: "approved" },
  { id: "cr-2", category: "Utilities", description: "Electricity – January", amount: 8500, date: "2026-02-01", department: "Administration", status: "approved" },
  { id: "cr-3", category: "Maintenance", description: "Production line maintenance", amount: 12000, date: "2026-02-05", department: "Production", status: "recorded" },
  { id: "cr-4", category: "Marketing", description: "Social media campaign Q1", amount: 25000, date: "2026-02-03", department: "Marketing", status: "approved" },
  { id: "cr-5", category: "IT", description: "Cloud hosting – February", amount: 4200, date: "2026-02-01", department: "IT", status: "recorded" },
];

export const properties: Property[] = [
  { id: "prop-1", name: "Main Office Building", type: "building", location: "بغداد، الكرادة", value: 5000000, acquisitionDate: "2020-06-15", status: "active" },
  { id: "prop-2", name: "Warehouse A", type: "building", location: "المنطقة الصناعية", value: 1200000, acquisitionDate: "2021-03-01", status: "active" },
  { id: "prop-3", name: "Delivery Truck #1", type: "vehicle", location: "الساحة اللوجستية", value: 180000, acquisitionDate: "2023-08-10", status: "active" },
  { id: "prop-4", name: "CNC Machine", type: "equipment", location: "قاعة الانتاج", value: 350000, acquisitionDate: "2022-11-20", status: "maintenance" },
  { id: "prop-5", name: "Office Furniture Set", type: "furniture", location: "المكتب الرئيسي – الطابق الثالث", value: 45000, acquisitionDate: "2024-01-15", status: "active" },
];

export const leaseAgreements: LeaseAgreement[] = [
  { id: "la-1", property: "Warehouse B", tenant: "Beta Industries", startDate: "2025-01-01", endDate: "2026-12-31", monthlyRent: 15000, status: "active", notes: "Annual renewal" },
  { id: "la-2", property: "Parking Lot – South", tenant: "Gamma Trading", startDate: "2025-06-01", endDate: "2026-05-31", monthlyRent: 5000, status: "active", notes: "" },
  { id: "la-3", property: "Shop Unit 3", tenant: "Delta Services", startDate: "2024-01-01", endDate: "2025-12-31", monthlyRent: 8000, status: "expired", notes: "Tenant moved out" },
];
