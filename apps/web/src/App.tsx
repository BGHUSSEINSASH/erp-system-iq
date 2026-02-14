import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { I18nProvider } from "./i18n";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
// HR
import Employees from "./pages/hr/Employees";
import Departments from "./pages/hr/Departments";
import Attendance from "./pages/hr/Attendance";
import Timesheets from "./pages/hr/Timesheets";
import StaffCard from "./pages/hr/StaffCard";
import LeaveRequests from "./pages/hr/LeaveRequests";
import Payroll from "./pages/hr/Payroll";
import StaffEvaluation from "./pages/hr/StaffEvaluation";
import Recruitment from "./pages/hr/Recruitment";
import NewStaffNotification from "./pages/hr/NewStaffNotification";
import HRReports from "./pages/hr/HRReports";
import HROptions from "./pages/hr/HROptions";
import Contracts from "./pages/hr/Contracts";
// Finance
import Accounts from "./pages/finance/Accounts";
import JournalEntries from "./pages/finance/JournalEntries";
import PayableAccounts from "./pages/finance/PayableAccounts";
import ReceivableAccounts from "./pages/finance/ReceivableAccounts";
import Funds from "./pages/finance/Funds";
import Inventories from "./pages/finance/Inventories";
import Costs from "./pages/finance/Costs";
import FinanceReports from "./pages/finance/FinanceReports";
import FinanceOptions from "./pages/finance/FinanceOptions";
import Budgets from "./pages/finance/Budgets";
// Sales
import Customers from "./pages/sales/Customers";
import Invoices from "./pages/sales/Invoices";
import Quotations from "./pages/sales/Quotations";
// Procurement
import Vendors from "./pages/procurement/Vendors";
import PurchaseOrders from "./pages/procurement/PurchaseOrders";
// Production
import Products from "./pages/production/Products";
import WorkOrders from "./pages/production/WorkOrders";
// IT
import Tickets from "./pages/it/Tickets";
import ITAssets from "./pages/it/ITAssets";
import SystemHealth from "./pages/it/SystemHealth";
// Admin
import Users from "./pages/admin/Users";
import Property from "./pages/admin/Property";
import LeaseAgreements from "./pages/admin/LeaseAgreements";
import AdminReports from "./pages/admin/AdminReports";
import AdminOptions from "./pages/admin/AdminOptions";
import Permissions from "./pages/admin/Permissions";
// Settings
import Settings from "./pages/Settings";
// New Features
import NotificationsPage from "./pages/Notifications";
import AuditLog from "./pages/AuditLog";
import KPIDashboard from "./pages/KPIDashboard";
import MessagesPage from "./pages/Messages";
import CalendarPage from "./pages/Calendar";
import ApprovalsPage from "./pages/Approvals";
// 12 New Features
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import SmartAlerts from "./pages/SmartAlerts";
import KanbanBoard from "./pages/KanbanBoard";
import DocumentsManager from "./pages/DocumentsManager";
import ReportBuilder from "./pages/ReportBuilder";
import GroupChat from "./pages/GroupChat";
import MapPage from "./pages/MapPage";
import ESignatures from "./pages/ESignatures";
import CustomWidgets from "./pages/CustomWidgets";
import BackupRestore from "./pages/BackupRestore";
import GoalsOKR from "./pages/GoalsOKR";
// 15 New Features
import EmailNotifications from "./pages/EmailNotifications";
import CEODashboard from "./pages/CEODashboard";
import EmployeeLoans from "./pages/EmployeeLoans";
import ExpenseRequests from "./pages/ExpenseRequests";
import Archives from "./pages/Archives";
import FixedAssets from "./pages/FixedAssets";
import Tenders from "./pages/Tenders";
import ProjectsPage from "./pages/ProjectsPage";
import TrainingPage from "./pages/TrainingPage";
import BIReports from "./pages/BIReports";
import BiometricAttendance from "./pages/BiometricAttendance";
import VehicleManagement from "./pages/VehicleManagement";
import CRMPage from "./pages/CRMPage";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import BranchManagement from "./pages/BranchManagement";

function ProtectedRoutes() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* HR */}
        <Route path="/hr/timesheets" element={<Timesheets />} />
        <Route path="/hr/staff-card" element={<StaffCard />} />
        <Route path="/hr/leave-requests" element={<LeaveRequests />} />
        <Route path="/hr/payroll" element={<Payroll />} />
        <Route path="/hr/evaluations" element={<StaffEvaluation />} />
        <Route path="/hr/recruitment" element={<Recruitment />} />
        <Route path="/hr/staff-notifications" element={<NewStaffNotification />} />
        <Route path="/hr/employees" element={<Employees />} />
        <Route path="/hr/departments" element={<Departments />} />
        <Route path="/hr/attendance" element={<Attendance />} />
        <Route path="/hr/reports" element={<HRReports />} />
        <Route path="/hr/options" element={<HROptions />} />
        <Route path="/hr/contracts" element={<Contracts />} />
        {/* Finance */}
        <Route path="/finance/payable-accounts" element={<PayableAccounts />} />
        <Route path="/finance/receivable-accounts" element={<ReceivableAccounts />} />
        <Route path="/finance/funds" element={<Funds />} />
        <Route path="/finance/inventories" element={<Inventories />} />
        <Route path="/finance/costs" element={<Costs />} />
        <Route path="/finance/accounts" element={<Accounts />} />
        <Route path="/finance/journal-entries" element={<JournalEntries />} />
        <Route path="/finance/reports" element={<FinanceReports />} />
        <Route path="/finance/options" element={<FinanceOptions />} />
        <Route path="/finance/budgets" element={<Budgets />} />
        {/* Sales */}
        <Route path="/sales/customers" element={<Customers />} />
        <Route path="/sales/invoices" element={<Invoices />} />
        <Route path="/sales/quotations" element={<Quotations />} />
        {/* Procurement */}
        <Route path="/procurement/vendors" element={<Vendors />} />
        <Route path="/procurement/purchase-orders" element={<PurchaseOrders />} />
        {/* Production */}
        <Route path="/production/products" element={<Products />} />
        <Route path="/production/work-orders" element={<WorkOrders />} />
        {/* IT */}
        <Route path="/it/tickets" element={<Tickets />} />
        <Route path="/it/assets" element={<ITAssets />} />
        <Route path="/it/system-health" element={<SystemHealth />} />
        {/* Admin */}
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/property" element={<Property />} />
        <Route path="/admin/lease-agreements" element={<LeaseAgreements />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/options" element={<AdminOptions />} />
        <Route path="/admin/permissions" element={<Permissions />} />
        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        {/* New Features */}
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/audit-log" element={<AuditLog />} />
        <Route path="/kpi" element={<KPIDashboard />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        {/* 12 New Features */}
        <Route path="/analytics" element={<AnalyticsDashboard />} />
        <Route path="/smart-alerts" element={<SmartAlerts />} />
        <Route path="/kanban" element={<KanbanBoard />} />
        <Route path="/documents" element={<DocumentsManager />} />
        <Route path="/report-builder" element={<ReportBuilder />} />
        <Route path="/group-chat" element={<GroupChat />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/esignatures" element={<ESignatures />} />
        <Route path="/custom-widgets" element={<CustomWidgets />} />
        <Route path="/backup" element={<BackupRestore />} />
        <Route path="/goals" element={<GoalsOKR />} />
        {/* 15 New Features */}
        <Route path="/email-notifications" element={<EmailNotifications />} />
        <Route path="/ceo-dashboard" element={<CEODashboard />} />
        <Route path="/employee-loans" element={<EmployeeLoans />} />
        <Route path="/expense-requests" element={<ExpenseRequests />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/fixed-assets" element={<FixedAssets />} />
        <Route path="/tenders" element={<Tenders />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/training" element={<TrainingPage />} />
        <Route path="/bi-reports" element={<BIReports />} />
        <Route path="/biometric-attendance" element={<BiometricAttendance />} />
        <Route path="/vehicles" element={<VehicleManagement />} />
        <Route path="/crm" element={<CRMPage />} />
        <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
        <Route path="/branches" element={<BranchManagement />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
