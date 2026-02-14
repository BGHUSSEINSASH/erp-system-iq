/* ────────────────────────────────────────────
   ERP In-Memory Data Store
   Replace with SQL Server queries later.
   ──────────────────────────────────────────── */

let idCounter = 100;
export function nextId(prefix: string) {
  return `${prefix}-${++idCounter}`;
}

/* ── Types ─────────────────────────────────── */

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  department: string;
  position: string;
  salary: number;
  hireDate: string;
  status: "active" | "inactive";
};

export type Department = {
  id: string;
  name: string;
  manager: string;
  employeeCount: number;
};

export type Attendance = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: "present" | "absent" | "late" | "leave" | "exception";
  photo?: string;
  bgPhoto?: string;
  latitude?: number;
  longitude?: number;
  locationAddress?: string;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkOutLocationAddress?: string;
  lateMinutes?: number;
  exceptionReason?: string;
  exceptionApprovedBy?: string;
  exceptionStatus?: "pending" | "approved" | "rejected";
  device?: string;
};

export type Account = {
  id: string;
  code: string;
  name: string;
  type: "asset" | "liability" | "equity" | "revenue" | "expense";
  balance: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  accountName: string;
  status: "posted" | "draft";
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalPurchases: number;
  status: "active" | "inactive";
};

export type Invoice = {
  id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  dueDate: string;
  total: number;
  status: "paid" | "unpaid" | "overdue";
};

export type Vendor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  rating: number;
  status: "active" | "inactive";
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  vendorName: string;
  date: string;
  total: number;
  status: "pending" | "approved" | "received" | "cancelled";
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  status: "active" | "discontinued";
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  assignee: string;
  requesterName: string;
  requesterDepartment: string;
  createdAt: string;
};

export type ITAsset = {
  id: string;
  name: string;
  category: string;
  serialNumber: string;
  assignedTo: string;
  location: string;
  purchaseDate: string;
  warranty: string;
  status: string;
};

export type Contract = {
  id: string;
  employeeName: string;
  type: string;
  startDate: string;
  endDate: string;
  salary: number;
  status: string;
};

export type Budget = {
  id: string;
  department: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  year: string;
  status: string;
};

export type Quotation = {
  id: string;
  quoteNo: string;
  customerName: string;
  date: string;
  validUntil: string;
  total: number;
  status: string;
};

export type WorkOrder = {
  id: string;
  orderNo: string;
  product: string;
  quantity: number;
  startDate: string;
  dueDate: string;
  assignedTo: string;
  status: string;
};

export type User = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "disabled";
  password: string;
};

/* ── Sample Data ───────────────────────────── */

export const employees: Employee[] = [
  { id: "e-1", name: "Ahmed Hassan", email: "ahmed@erp.local", phone: "0501234567", departmentId: "d-1", department: "Human Resources", position: "HR Manager", salary: 18000, hireDate: "2022-03-15", status: "active" },
  { id: "e-2", name: "Sara Ali", email: "sara@erp.local", phone: "0507654321", departmentId: "d-2", department: "Finance", position: "Chief Accountant", salary: 20000, hireDate: "2021-07-01", status: "active" },
  { id: "e-3", name: "Mohammed Khalid", email: "mkhalid@erp.local", phone: "0509876543", departmentId: "d-3", department: "Sales", position: "Sales Lead", salary: 15000, hireDate: "2023-01-10", status: "active" },
  { id: "e-4", name: "Fatima Noor", email: "fatima@erp.local", phone: "0502345678", departmentId: "d-4", department: "IT", position: "Systems Admin", salary: 16000, hireDate: "2022-09-20", status: "active" },
  { id: "e-5", name: "Omar Youssef", email: "omar@erp.local", phone: "0503456789", departmentId: "d-5", department: "Procurement", position: "Procurement Officer", salary: 13000, hireDate: "2023-06-05", status: "active" },
  { id: "e-6", name: "Layla Ibrahim", email: "layla@erp.local", phone: "0504567890", departmentId: "d-6", department: "Marketing", position: "Marketing Specialist", salary: 14000, hireDate: "2024-02-14", status: "active" },
  { id: "e-7", name: "Khaled Mansour", email: "khaled@erp.local", phone: "0505678901", departmentId: "d-7", department: "Production", position: "Production Supervisor", salary: 17000, hireDate: "2021-11-30", status: "active" },
  { id: "e-8", name: "Nadia Samir", email: "nadia@erp.local", phone: "0506789012", departmentId: "d-2", department: "Finance", position: "Accountant", salary: 11000, hireDate: "2024-04-01", status: "active" },
];

export const departments: Department[] = [
  { id: "d-1", name: "Human Resources", manager: "Ahmed Hassan", employeeCount: 5 },
  { id: "d-2", name: "Finance", manager: "Sara Ali", employeeCount: 8 },
  { id: "d-3", name: "Sales", manager: "Mohammed Khalid", employeeCount: 12 },
  { id: "d-4", name: "IT", manager: "Fatima Noor", employeeCount: 6 },
  { id: "d-5", name: "Procurement", manager: "Omar Youssef", employeeCount: 4 },
  { id: "d-6", name: "Marketing", manager: "Layla Ibrahim", employeeCount: 5 },
  { id: "d-7", name: "Production", manager: "Khaled Mansour", employeeCount: 15 },
  { id: "d-8", name: "Administration", manager: "Admin", employeeCount: 3 },
];

/* ── Dynamic Attendance Demo Data Generator ── */
function fmtDate(d: Date): string { return d.toISOString().split("T")[0]; }
function generateDemoAttendance(): Attendance[] {
  const data: Attendance[] = [];
  const emps = [
    { id: "e-1", name: "Ahmed Hassan" },
    { id: "e-2", name: "Sara Ali" },
    { id: "e-3", name: "Mohammed Khalid" },
    { id: "e-4", name: "Fatima Noor" },
    { id: "e-5", name: "Omar Youssef" },
    { id: "e-6", name: "Layla Ibrahim" },
    { id: "e-7", name: "Khaled Mansour" },
    { id: "e-8", name: "Nadia Samir" },
  ];
  const locations = [
    { lat: 33.3152, lng: 44.3661, addr: "بغداد - الكرادة" },
    { lat: 33.3400, lng: 44.3900, addr: "بغداد - المنصور" },
    { lat: 33.3100, lng: 44.3700, addr: "بغداد - الجادرية" },
    { lat: 33.3300, lng: 44.4000, addr: "بغداد - زيونة" },
  ];
  let idC = 1;
  const today = new Date();
  const todayStr = fmtDate(today);

  for (let off = 35; off >= 0; off--) {
    const d = new Date(today); d.setDate(d.getDate() - off);
    const dow = d.getDay();
    // Skip only Fridays for past days; always include today & Saturdays for realism
    if (dow === 5 && off > 0) continue;
    const ds = fmtDate(d);
    const isToday = ds === todayStr;

    for (let ei = 0; ei < emps.length; ei++) {
      const emp = emps[ei];
      const seed = (off * 17 + ei * 31 + 42) % 100;
      const loc = locations[seed % locations.length];
      let status = "present";
      let checkIn = "", checkOut = "";
      let lateMinutes = 0;
      let lat: number | undefined, lng: number | undefined, addr: string | undefined;

      if (seed < 50) {
        // Present on-time (50%)
        status = "present";
        const m = seed % 25; // 07:35 – 07:59
        checkIn = `07:${String(35 + m).padStart(2, "0")}`;
        checkOut = isToday ? "" : `17:${String(seed % 30).padStart(2, "0")}`;
        lat = loc.lat; lng = loc.lng; addr = loc.addr;
      } else if (seed < 72) {
        // Late (22%)
        status = "late";
        const lateVal = 10 + (seed % 45);
        const totalM = 480 + lateVal;
        checkIn = `${String(Math.floor(totalM / 60)).padStart(2, "0")}:${String(totalM % 60).padStart(2, "0")}`;
        checkOut = isToday ? "" : `17:${String(10 + seed % 20).padStart(2, "0")}`;
        lateMinutes = lateVal;
        lat = loc.lat; lng = loc.lng; addr = loc.addr;
      } else if (seed < 88) {
        // Absent (16%)
        status = "absent";
      } else {
        // Leave (12%)
        status = "leave";
      }

      data.push({
        id: `a-${idC++}`, employeeId: emp.id, employeeName: emp.name,
        date: ds, checkIn, checkOut, status: status as Attendance["status"],
        latitude: lat, longitude: lng, locationAddress: addr,
        lateMinutes, device: checkIn ? "Web Camera" : undefined,
      });
    }
  }

  // ── Add exception records for realism ──
  // Approved exception: Mohammed Khalid (first late record)
  const mkLate = data.find(r => r.employeeName === "Mohammed Khalid" && r.status === "late");
  if (mkLate) {
    mkLate.exceptionReason = "ظروف عائلية طارئة";
    mkLate.exceptionApprovedBy = "Ahmed Hassan";
    mkLate.exceptionStatus = "approved";
    mkLate.status = "exception";
  }
  // Pending exception: Fatima Noor (first absent record)
  const fnAbs = data.find(r => r.employeeName === "Fatima Noor" && r.status === "absent");
  if (fnAbs) {
    fnAbs.exceptionReason = "مراجعة طبية عاجلة";
    fnAbs.exceptionStatus = "pending";
    fnAbs.status = "exception";
  }
  // Rejected exception: Layla Ibrahim (first late record)
  const laLate = data.find(r => r.employeeName === "Layla Ibrahim" && r.status === "late");
  if (laLate) {
    laLate.exceptionReason = "ازدحام مروري شديد";
    laLate.exceptionApprovedBy = "Ahmed Hassan";
    laLate.exceptionStatus = "rejected";
  }
  // Another pending: Sara Ali (second late record)
  const saLate = data.filter(r => r.employeeName === "Sara Ali" && r.status === "late")[1];
  if (saLate) {
    saLate.exceptionReason = "عطل في وسيلة النقل";
    saLate.exceptionStatus = "pending";
    saLate.status = "exception";
  }

  return data;
}
export const attendance: Attendance[] = generateDemoAttendance();

export const accounts: Account[] = [
  { id: "ac-1", code: "1001", name: "Cash", type: "asset", balance: 250000 },
  { id: "ac-2", code: "1002", name: "Bank – Main", type: "asset", balance: 1450000 },
  { id: "ac-3", code: "1100", name: "Accounts Receivable", type: "asset", balance: 320000 },
  { id: "ac-4", code: "1200", name: "Inventory", type: "asset", balance: 580000 },
  { id: "ac-5", code: "2001", name: "Accounts Payable", type: "liability", balance: 210000 },
  { id: "ac-6", code: "2100", name: "Salaries Payable", type: "liability", balance: 95000 },
  { id: "ac-7", code: "3001", name: "Owner Equity", type: "equity", balance: 2000000 },
  { id: "ac-8", code: "4001", name: "Sales Revenue", type: "revenue", balance: 780000 },
  { id: "ac-9", code: "5001", name: "Cost of Goods Sold", type: "expense", balance: 420000 },
  { id: "ac-10", code: "5100", name: "Operating Expenses", type: "expense", balance: 185000 },
];

export const journalEntries: JournalEntry[] = [
  { id: "je-1", date: "2026-02-01", description: "Sales revenue – Invoice #1001", debit: 50000, credit: 0, accountName: "Cash", status: "posted" },
  { id: "je-2", date: "2026-02-01", description: "Sales revenue – Invoice #1001", debit: 0, credit: 50000, accountName: "Sales Revenue", status: "posted" },
  { id: "je-3", date: "2026-02-03", description: "Office supplies purchase", debit: 3500, credit: 0, accountName: "Operating Expenses", status: "posted" },
  { id: "je-4", date: "2026-02-03", description: "Office supplies purchase", debit: 0, credit: 3500, accountName: "Cash", status: "posted" },
  { id: "je-5", date: "2026-02-05", description: "Salary payment – January", debit: 95000, credit: 0, accountName: "Salaries Payable", status: "posted" },
  { id: "je-6", date: "2026-02-05", description: "Salary payment – January", debit: 0, credit: 95000, accountName: "Bank – Main", status: "posted" },
  { id: "je-7", date: "2026-02-08", description: "Inventory purchase", debit: 120000, credit: 0, accountName: "Inventory", status: "draft" },
  { id: "je-8", date: "2026-02-08", description: "Inventory purchase", debit: 0, credit: 120000, accountName: "Accounts Payable", status: "draft" },
];

export const customers: Customer[] = [
  { id: "c-1", name: "Alpha Corp", email: "info@alphacorp.com", phone: "0112345678", company: "Alpha Corporation", totalPurchases: 450000, status: "active" },
  { id: "c-2", name: "Beta Industries", email: "sales@betaind.com", phone: "0113456789", company: "Beta Industries Ltd", totalPurchases: 320000, status: "active" },
  { id: "c-3", name: "Gamma Trading", email: "contact@gamma.com", phone: "0114567890", company: "Gamma Trading Co", totalPurchases: 180000, status: "active" },
  { id: "c-4", name: "Delta Services", email: "hello@delta.com", phone: "0115678901", company: "Delta Services LLC", totalPurchases: 95000, status: "inactive" },
  { id: "c-5", name: "Omega Group", email: "info@omega.com", phone: "0116789012", company: "Omega Group Holdings", totalPurchases: 720000, status: "active" },
];

export const invoices: Invoice[] = [
  { id: "inv-1", invoiceNo: "INV-1001", customerName: "Alpha Corp", date: "2026-01-15", dueDate: "2026-02-15", total: 75000, status: "paid" },
  { id: "inv-2", invoiceNo: "INV-1002", customerName: "Beta Industries", date: "2026-01-20", dueDate: "2026-02-20", total: 42000, status: "unpaid" },
  { id: "inv-3", invoiceNo: "INV-1003", customerName: "Gamma Trading", date: "2026-01-25", dueDate: "2026-02-25", total: 18500, status: "unpaid" },
  { id: "inv-4", invoiceNo: "INV-1004", customerName: "Omega Group", date: "2026-01-05", dueDate: "2026-02-05", total: 120000, status: "overdue" },
  { id: "inv-5", invoiceNo: "INV-1005", customerName: "Alpha Corp", date: "2026-02-01", dueDate: "2026-03-01", total: 55000, status: "unpaid" },
  { id: "inv-6", invoiceNo: "INV-1006", customerName: "Beta Industries", date: "2026-02-05", dueDate: "2026-03-05", total: 38000, status: "paid" },
];

export const vendors: Vendor[] = [
  { id: "v-1", name: "Steel Works Inc", email: "sales@steelworks.com", phone: "0221234567", company: "Steel Works International", rating: 5, status: "active" },
  { id: "v-2", name: "Tech Supply Co", email: "info@techsupply.com", phone: "0222345678", company: "Tech Supply Company", rating: 4, status: "active" },
  { id: "v-3", name: "Raw Materials Ltd", email: "orders@rawmat.com", phone: "0223456789", company: "Raw Materials Limited", rating: 4, status: "active" },
  { id: "v-4", name: "Logistics Pro", email: "ship@logpro.com", phone: "0224567890", company: "Logistics Pro Services", rating: 3, status: "inactive" },
];

export const purchaseOrders: PurchaseOrder[] = [
  { id: "po-1", poNumber: "PO-2001", vendorName: "Steel Works Inc", date: "2026-01-10", total: 85000, status: "received" },
  { id: "po-2", poNumber: "PO-2002", vendorName: "Tech Supply Co", date: "2026-01-18", total: 32000, status: "approved" },
  { id: "po-3", poNumber: "PO-2003", vendorName: "Raw Materials Ltd", date: "2026-02-01", total: 120000, status: "pending" },
  { id: "po-4", poNumber: "PO-2004", vendorName: "Steel Works Inc", date: "2026-02-05", total: 45000, status: "pending" },
  { id: "po-5", poNumber: "PO-2005", vendorName: "Tech Supply Co", date: "2026-02-08", total: 18000, status: "cancelled" },
];

export const products: Product[] = [
  { id: "p-1", name: "Steel Beam A100", sku: "STL-A100", category: "Raw Materials", price: 2500, stock: 150, minStock: 50, status: "active" },
  { id: "p-2", name: "Circuit Board X20", sku: "CB-X20", category: "Electronics", price: 450, stock: 300, minStock: 100, status: "active" },
  { id: "p-3", name: "Plastic Housing P5", sku: "PH-P5", category: "Components", price: 80, stock: 1200, minStock: 200, status: "active" },
  { id: "p-4", name: "Motor Unit M3", sku: "MU-M3", category: "Components", price: 3200, stock: 45, minStock: 20, status: "active" },
  { id: "p-5", name: "Assembly Kit K1", sku: "AK-K1", category: "Finished Goods", price: 8500, stock: 25, minStock: 10, status: "active" },
  { id: "p-6", name: "Sensor Module S7", sku: "SM-S7", category: "Electronics", price: 680, stock: 8, minStock: 30, status: "active" },
  { id: "p-7", name: "Cable Harness CH2", sku: "CH-CH2", category: "Components", price: 120, stock: 500, minStock: 100, status: "discontinued" },
];

export const tickets: Ticket[] = [
  { id: "t-1", title: "Email server down", description: "Main email server is not responding", priority: "critical", status: "open", assignee: "فاطمة نور / Fatima Noor", requesterName: "أحمد حسن / Ahmed Hassan", requesterDepartment: "الموارد البشرية / HR", createdAt: "2026-02-10T08:30:00" },
  { id: "t-2", title: "New laptop request", description: "Need a new laptop for the marketing team", priority: "low", status: "in-progress", assignee: "كريم حسن / Kareem Hassan", requesterName: "سارة علي / Sara Ali", requesterDepartment: "المالية / Finance", createdAt: "2026-02-09T10:00:00" },
  { id: "t-3", title: "VPN access issue", description: "Cannot connect to VPN from home", priority: "medium", status: "resolved", assignee: "فاطمة نور / Fatima Noor", requesterName: "محمد خالد / Mohammed Khalid", requesterDepartment: "المبيعات / Sales", createdAt: "2026-02-08T14:20:00" },
  { id: "t-4", title: "Printer malfunction – 3rd floor", description: "Printer not printing, paper jam error", priority: "medium", status: "open", assignee: "كريم حسن / Kareem Hassan", requesterName: "خالد منصور / Khaled Mansour", requesterDepartment: "الإنتاج / Production", createdAt: "2026-02-10T09:15:00" },
  { id: "t-5", title: "Database backup failed", description: "Nightly backup job failed with timeout", priority: "high", status: "in-progress", assignee: "فاطمة نور / Fatima Noor", requesterName: "عمر يوسف / Omar Youssef", requesterDepartment: "الإدارة / Admin", createdAt: "2026-02-09T23:05:00" },
];

export const users: User[] = [
  { id: "u-1", username: "admin", name: "مدير النظام / System Admin", email: "admin@erp.local", role: "admin", department: "system", status: "active", password: "admin" },
  { id: "u-2", username: "ceo", name: "المدير العام / CEO", email: "ceo@erp.local", role: "ceo", department: "system", status: "active", password: "ceo" },
  { id: "u-3", username: "manager", name: "المدير التنفيذي / General Manager", email: "gm@erp.local", role: "manager", department: "system", status: "active", password: "manager" },
  { id: "u-4", username: "hr_manager", name: "أحمد حسن / Ahmed Hassan", email: "ahmed@erp.local", role: "hr_manager", department: "hr", status: "active", password: "hr_manager" },
  { id: "u-5", username: "hr_assistant", name: "نور محمد / Nour Mohammed", email: "nour@erp.local", role: "hr_assistant", department: "hr", status: "active", password: "hr_assistant" },
  { id: "u-6", username: "hr", name: "ليلى ناصر / Layla Nasser", email: "layla@erp.local", role: "hr", department: "hr", status: "active", password: "hr" },
  { id: "u-7", username: "finance_manager", name: "سارة علي / Sara Ali", email: "sara@erp.local", role: "finance_manager", department: "finance", status: "active", password: "finance_manager" },
  { id: "u-8", username: "finance_assistant", name: "عمر فيصل / Omar Faisal", email: "omar@erp.local", role: "finance_assistant", department: "finance", status: "active", password: "finance_assistant" },
  { id: "u-9", username: "finance", name: "زينب أحمد / Zainab Ahmed", email: "zainab@erp.local", role: "finance", department: "finance", status: "active", password: "finance" },
  { id: "u-10", username: "sales_manager", name: "محمد خالد / Mohammed Khalid", email: "mkhalid@erp.local", role: "sales_manager", department: "sales", status: "active", password: "sales_manager" },
  { id: "u-11", username: "sales_assistant", name: "حسين علي / Hussein Ali", email: "hussein@erp.local", role: "sales_assistant", department: "sales", status: "active", password: "sales_assistant" },
  { id: "u-12", username: "sales", name: "مريم جاسم / Mariam Jasim", email: "mariam@erp.local", role: "sales", department: "sales", status: "active", password: "sales" },
  { id: "u-13", username: "it_manager", name: "فاطمة نور / Fatima Noor", email: "fatima@erp.local", role: "it_manager", department: "it", status: "active", password: "it_manager" },
  { id: "u-14", username: "it_assistant", name: "كريم حسن / Kareem Hassan", email: "kareem@erp.local", role: "it_assistant", department: "it", status: "active", password: "it_assistant" },
  { id: "u-15", username: "it", name: "علي رضا / Ali Rida", email: "ali@erp.local", role: "it", department: "it", status: "active", password: "it" },
  { id: "u-16", username: "purchasing_manager", name: "خالد يوسف / Khalid Yousif", email: "khalid@erp.local", role: "purchasing_manager", department: "purchasing", status: "active", password: "purchasing_manager" },
  { id: "u-17", username: "production_manager", name: "ياسر عبد / Yasser Abed", email: "yasser@erp.local", role: "production_manager", department: "production", status: "active", password: "production_manager" },
];

export const itAssets: ITAsset[] = [
  { id: "ia-1", name: "Dell Latitude 5540", category: "laptop", serialNumber: "DL-2024-0012", assignedTo: "Ahmed Hassan", location: "HR Office", purchaseDate: "2024-06-15", warranty: "2027-06-15", status: "active" },
  { id: "ia-2", name: "HP ProDesk 400", category: "desktop", serialNumber: "HP-2024-0045", assignedTo: "Sara Ali", location: "Finance Dept", purchaseDate: "2024-03-20", warranty: "2027-03-20", status: "active" },
  { id: "ia-3", name: "Cisco Switch 2960X", category: "network", serialNumber: "CS-2023-0071", assignedTo: "", location: "Server Room", purchaseDate: "2023-11-01", warranty: "2026-11-01", status: "active" },
  { id: "ia-4", name: "Samsung Galaxy Tab S9", category: "tablet", serialNumber: "SG-2025-0003", assignedTo: "Mohammed Khalid", location: "Sales Dept", purchaseDate: "2025-01-10", warranty: "2027-01-10", status: "active" },
  { id: "ia-5", name: "Canon ImageRunner C3530", category: "printer", serialNumber: "CI-2023-0022", assignedTo: "", location: "3rd Floor", purchaseDate: "2023-08-25", warranty: "2025-08-25", status: "maintenance" },
  { id: "ia-6", name: "Lenovo ThinkPad X1", category: "laptop", serialNumber: "LN-2022-0091", assignedTo: "", location: "IT Storage", purchaseDate: "2022-04-10", warranty: "2025-04-10", status: "retired" },
  { id: "ia-7", name: "Ubiquiti UniFi AP", category: "network", serialNumber: "UB-2024-0018", assignedTo: "", location: "Conference Room", purchaseDate: "2024-09-05", warranty: "2027-09-05", status: "active" },
  { id: "ia-8", name: "APC UPS 1500VA", category: "infrastructure", serialNumber: "APC-2023-0008", assignedTo: "", location: "Server Room", purchaseDate: "2023-05-15", warranty: "2026-05-15", status: "active" },
];

export const contracts: Contract[] = [
  { id: "con-1", employeeName: "Ahmed Hassan", type: "full-time", startDate: "2023-01-15", endDate: "2025-01-15", salary: 1500000, status: "active" },
  { id: "con-2", employeeName: "Sara Ali", type: "full-time", startDate: "2022-06-01", endDate: "2024-06-01", salary: 1800000, status: "expired" },
  { id: "con-3", employeeName: "Mohammed Khalid", type: "contract", startDate: "2024-03-01", endDate: "2025-03-01", salary: 1200000, status: "active" },
  { id: "con-4", employeeName: "Layla Nasser", type: "part-time", startDate: "2024-09-01", endDate: "2025-09-01", salary: 750000, status: "active" },
  { id: "con-5", employeeName: "Omar Faisal", type: "internship", startDate: "2025-01-10", endDate: "2025-07-10", salary: 400000, status: "active" },
];

export const budgets: Budget[] = [
  { id: "bud-1", department: "HR", category: "salaries", allocated: 50000000, spent: 42000000, remaining: 8000000, year: "2025", status: "active" },
  { id: "bud-2", department: "IT", category: "equipment", allocated: 20000000, spent: 15000000, remaining: 5000000, year: "2025", status: "active" },
  { id: "bud-3", department: "Marketing", category: "advertising", allocated: 15000000, spent: 14500000, remaining: 500000, year: "2025", status: "overbudget" },
  { id: "bud-4", department: "Operations", category: "maintenance", allocated: 10000000, spent: 6000000, remaining: 4000000, year: "2025", status: "active" },
  { id: "bud-5", department: "Finance", category: "software", allocated: 8000000, spent: 3000000, remaining: 5000000, year: "2025", status: "active" },
];

export const quotations: Quotation[] = [
  { id: "q-1", quoteNo: "QT-2025-001", customerName: "Baghdad Construction Co.", date: "2025-01-15", validUntil: "2025-02-15", total: 12500000, status: "sent" },
  { id: "q-2", quoteNo: "QT-2025-002", customerName: "Erbil Tech Solutions", date: "2025-01-20", validUntil: "2025-02-20", total: 4800000, status: "accepted" },
  { id: "q-3", quoteNo: "QT-2025-003", customerName: "Basra Oil Services", date: "2025-02-01", validUntil: "2025-03-01", total: 35000000, status: "draft" },
  { id: "q-4", quoteNo: "QT-2025-004", customerName: "Sulaymaniyah Trading", date: "2025-02-05", validUntil: "2025-03-05", total: 7200000, status: "expired" },
];

export const workOrders: WorkOrder[] = [
  { id: "wo-1", orderNo: "WO-2025-001", product: "Assembly Kit K1", quantity: 50, startDate: "2025-01-20", dueDate: "2025-02-20", assignedTo: "Production Team A", status: "in-progress" },
  { id: "wo-2", orderNo: "WO-2025-002", product: "Circuit Board X20", quantity: 200, startDate: "2025-02-01", dueDate: "2025-02-28", assignedTo: "Production Team B", status: "pending" },
  { id: "wo-3", orderNo: "WO-2025-003", product: "Motor Unit M3", quantity: 30, startDate: "2025-01-10", dueDate: "2025-01-25", assignedTo: "Production Team A", status: "completed" },
  { id: "wo-4", orderNo: "WO-2025-004", product: "Sensor Module S7", quantity: 100, startDate: "2025-02-10", dueDate: "2025-03-10", assignedTo: "Production Team C", status: "pending" },
];

/* ═══ Add ownership tracking to demo data ═══ */
function stampOwnership<T extends { id: string }>(arr: T[], createdBy: string, createdByDept: string) {
  arr.forEach((item: any) => {
    item.createdBy = createdBy;
    item.createdByDept = createdByDept;
  });
}

stampOwnership(employees, "hr_manager", "hr");
stampOwnership(journalEntries, "finance_manager", "finance");
stampOwnership(customers, "sales_manager", "sales");
stampOwnership(vendors, "purchasing_manager", "purchasing");
stampOwnership(products, "production_manager", "production");
stampOwnership(itAssets, "it_manager", "it");
stampOwnership(contracts, "hr_manager", "hr");
stampOwnership(budgets, "finance_manager", "finance");
stampOwnership(workOrders, "production_manager", "production");

// Mixed ownership for invoices
invoices.forEach((inv: any, i: number) => {
  inv.createdBy = i % 2 === 0 ? "sales_manager" : "finance_manager";
  inv.createdByDept = i % 2 === 0 ? "sales" : "finance";
});

// Mixed ownership for purchase orders
purchaseOrders.forEach((po: any, i: number) => {
  po.createdBy = i % 2 === 0 ? "purchasing_manager" : "purchasing";
  po.createdByDept = "purchasing";
});

// Tickets reflect their requester
tickets.forEach((t: any) => {
  if (t.requesterDepartment?.includes("HR")) { t.createdBy = "hr_manager"; t.createdByDept = "hr"; }
  else if (t.requesterDepartment?.includes("Finance")) { t.createdBy = "finance_manager"; t.createdByDept = "finance"; }
  else if (t.requesterDepartment?.includes("Sales")) { t.createdBy = "sales_manager"; t.createdByDept = "sales"; }
  else if (t.requesterDepartment?.includes("Production")) { t.createdBy = "production_manager"; t.createdByDept = "production"; }
  else { t.createdBy = "admin"; t.createdByDept = "system"; }
});

// Quotations
stampOwnership(quotations, "sales_manager", "sales");
