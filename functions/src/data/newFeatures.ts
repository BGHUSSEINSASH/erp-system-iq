/* ────────────────────────────────────────────
   New ERP Features Data Store
   Features: Email Notifications, CEO Dashboard, Loans, Archives,
   Fixed Assets, Tenders, Projects, Training, Vehicles, CRM, Branches
   ──────────────────────────────────────────── */
import { nextId } from "./store.js";

/* ── Types ─────────────────────────────────── */

export type EmailNotification = {
  id: string;
  to: string;
  toEmail: string;
  subject: string;
  body: string;
  type: "leave-approved" | "leave-rejected" | "po-approved" | "po-rejected" | "general" | "salary" | "training";
  status: "sent" | "pending" | "failed";
  sentAt: string;
  relatedId: string;
};

export type EmployeeLoan = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  loanAmount: number;
  monthlyDeduction: number;
  totalPaid: number;
  remaining: number;
  installments: number;
  paidInstallments: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "active" | "completed" | "pending" | "rejected";
  approvedBy: string;
  approvedAt: string;
  rejectedBy: string;
  rejectedAt: string;
  rejectionReason: string;
  requestedBy: string;
  requestDate: string;
};

export type ExpenseRequest = {
  id: string;
  requestNo: string;
  title: string;
  description: string;
  department: string;
  requestedBy: string;
  requestedByName: string;
  amount: number;
  category: "office" | "travel" | "maintenance" | "equipment" | "training" | "marketing" | "other";
  urgency: "low" | "medium" | "high" | "urgent";
  attachments: string;
  requestDate: string;
  approvedBy: string;
  approvedAt: string;
  rejectedBy: string;
  rejectedAt: string;
  rejectionReason: string;
  paidAt: string;
  status: "pending" | "approved" | "rejected" | "paid" | "cancelled";
};

export type ArchiveDocument = {
  id: string;
  title: string;
  category: "contracts" | "invoices" | "reports" | "legal" | "hr" | "financial" | "technical" | "other";
  department: string;
  uploadedBy: string;
  uploadDate: string;
  fileType: string;
  fileSize: string;
  tags: string;
  description: string;
  status: "active" | "archived" | "deleted";
};

export type FixedAsset = {
  id: string;
  name: string;
  assetCode: string;
  category: "buildings" | "vehicles" | "machinery" | "furniture" | "computers" | "land" | "other";
  department: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  currentValue: number;
  depreciationRate: number;
  depreciationMethod: "straight-line" | "declining-balance";
  usefulLife: number;
  accumulatedDepreciation: number;
  status: "active" | "maintenance" | "disposed" | "transferred";
};

export type Tender = {
  id: string;
  tenderNo: string;
  title: string;
  description: string;
  department: string;
  estimatedBudget: number;
  publishDate: string;
  closingDate: string;
  bidsCount: number;
  winnerVendor: string;
  winnerAmount: number;
  status: "draft" | "published" | "evaluation" | "awarded" | "cancelled" | "closed";
};

export type TenderBid = {
  id: string;
  tenderId: string;
  vendorName: string;
  amount: number;
  submissionDate: string;
  technicalScore: number;
  financialScore: number;
  totalScore: number;
  notes: string;
  status: "submitted" | "evaluated" | "winner" | "rejected";
};

export type Project = {
  id: string;
  name: string;
  code: string;
  department: string;
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  progress: number;
  priority: "low" | "medium" | "high" | "critical";
  status: "planning" | "in-progress" | "on-hold" | "completed" | "cancelled";
  description: string;
  milestones: string;
};

export type TrainingProgram = {
  id: string;
  title: string;
  category: "technical" | "management" | "safety" | "soft-skills" | "compliance" | "certification";
  trainer: string;
  department: string;
  startDate: string;
  endDate: string;
  duration: string;
  maxParticipants: number;
  enrolled: number;
  location: string;
  cost: number;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  description: string;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  make: string;
  model: string;
  year: number;
  type: "sedan" | "suv" | "truck" | "van" | "bus" | "motorcycle";
  assignedTo: string;
  department: string;
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid";
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  insuranceExpiry: string;
  monthlyFuelCost: number;
  status: "active" | "maintenance" | "retired" | "reserved";
};

export type CRMContact = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: "lead" | "prospect" | "customer" | "partner";
  source: "website" | "referral" | "social-media" | "cold-call" | "exhibition" | "other";
  assignedTo: string;
  lastContact: string;
  nextFollowUp: string;
  dealValue: number;
  pipeline: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  notes: string;
  status: "active" | "inactive";
};

export type Branch = {
  id: string;
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
  manager: string;
  employeeCount: number;
  openDate: string;
  status: "active" | "inactive" | "under-construction";
  latitude: number;
  longitude: number;
};

/* ── Sample Data ───────────────────────────── */

export const emailNotifications: EmailNotification[] = [
  { id: "en-1", to: "Layla Ibrahim", toEmail: "layla@erp.local", subject: "تمت الموافقة على إجازتك", body: "تمت الموافقة على طلب الإجازة من 2026-02-10 إلى 2026-02-14", type: "leave-approved", status: "sent", sentAt: "2026-02-09T14:30:00", relatedId: "lr-1" },
  { id: "en-2", to: "Omar Youssef", toEmail: "omar@erp.local", subject: "تم رفض طلب الإجازة", body: "تم رفض طلب الإجازة - يرجى مراجعة المدير", type: "leave-rejected", status: "sent", sentAt: "2026-02-08T10:15:00", relatedId: "lr-4" },
  { id: "en-3", to: "Steel Works Inc", toEmail: "sales@steelworks.com", subject: "تمت الموافقة على أمر الشراء PO-2001", body: "تم اعتماد أمر الشراء بقيمة 85,000 د.ع", type: "po-approved", status: "sent", sentAt: "2026-01-12T09:00:00", relatedId: "po-1" },
  { id: "en-4", to: "Ahmed Hassan", toEmail: "ahmed@erp.local", subject: "تنبيه: موعد تقييم الأداء", body: "لديك موعد تقييم أداء في 2026-03-01", type: "general", status: "pending", sentAt: "", relatedId: "" },
  { id: "en-5", to: "All Employees", toEmail: "all@erp.local", subject: "إشعار: صرف الرواتب", body: "تم صرف رواتب شهر يناير 2026", type: "salary", status: "sent", sentAt: "2026-02-01T08:00:00", relatedId: "" },
];

export const employeeLoans: EmployeeLoan[] = [
  { id: "loan-1", employeeId: "e-1", employeeName: "Ahmed Hassan", department: "Human Resources", loanAmount: 5000000, monthlyDeduction: 500000, totalPaid: 2000000, remaining: 3000000, installments: 10, paidInstallments: 4, startDate: "2025-10-01", endDate: "2026-07-01", reason: "Home renovation", status: "active", approvedBy: "CEO", approvedAt: "2025-09-28", rejectedBy: "", rejectedAt: "", rejectionReason: "", requestedBy: "hr", requestDate: "2025-09-25" },
  { id: "loan-2", employeeId: "e-3", employeeName: "Mohammed Khalid", department: "Sales", loanAmount: 3000000, monthlyDeduction: 300000, totalPaid: 900000, remaining: 2100000, installments: 10, paidInstallments: 3, startDate: "2025-11-01", endDate: "2026-08-01", reason: "Car purchase", status: "active", approvedBy: "CEO", approvedAt: "2025-10-28", rejectedBy: "", rejectedAt: "", rejectionReason: "", requestedBy: "sales", requestDate: "2025-10-25" },
  { id: "loan-3", employeeId: "e-8", employeeName: "Nadia Samir", department: "Finance", loanAmount: 2000000, monthlyDeduction: 200000, totalPaid: 2000000, remaining: 0, installments: 10, paidInstallments: 10, startDate: "2025-04-01", endDate: "2026-01-01", reason: "Medical expenses", status: "completed", approvedBy: "CEO", approvedAt: "2025-03-28", rejectedBy: "", rejectedAt: "", rejectionReason: "", requestedBy: "finance", requestDate: "2025-03-25" },
  { id: "loan-4", employeeId: "e-5", employeeName: "Omar Youssef", department: "Procurement", loanAmount: 1500000, monthlyDeduction: 150000, totalPaid: 0, remaining: 1500000, installments: 10, paidInstallments: 0, startDate: "2026-03-01", endDate: "2026-12-01", reason: "Emergency", status: "pending", approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "", requestedBy: "hr", requestDate: "2026-02-08" },
  { id: "loan-5", employeeId: "e-6", employeeName: "Layla Ibrahim", department: "IT", loanAmount: 4000000, monthlyDeduction: 400000, totalPaid: 0, remaining: 4000000, installments: 10, paidInstallments: 0, startDate: "2026-04-01", endDate: "2027-01-01", reason: "Wedding expenses", status: "pending", approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "", requestedBy: "it", requestDate: "2026-02-10" },
];

export const expenseRequests: ExpenseRequest[] = [
  { id: "exp-1", requestNo: "EXP-2026-001", title: "صيانة مكيفات المكتب", description: "صيانة دورية لأجهزة التكييف في الطابق الثاني", department: "Administration", requestedBy: "admin", requestedByName: "Admin User", amount: 750000, category: "maintenance", urgency: "medium", attachments: "maintenance_quote.pdf", requestDate: "2026-02-01", approvedBy: "CEO", approvedAt: "2026-02-02", rejectedBy: "", rejectedAt: "", rejectionReason: "", paidAt: "2026-02-05", status: "paid" },
  { id: "exp-2", requestNo: "EXP-2026-002", title: "شراء أجهزة حاسوب محمولة", description: "3 أجهزة لابتوب لقسم تكنولوجيا المعلومات", department: "IT", requestedBy: "it", requestedByName: "Fatima Noor", amount: 4500000, category: "equipment", urgency: "high", attachments: "laptops_quotation.pdf", requestDate: "2026-02-05", approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "", paidAt: "", status: "pending" },
  { id: "exp-3", requestNo: "EXP-2026-003", title: "سفر مندوب مبيعات - أربيل", description: "تكاليف سفر وإقامة لزيارة عميل في أربيل", department: "Sales", requestedBy: "sales", requestedByName: "Mohammed Khalid", amount: 1200000, category: "travel", urgency: "medium", attachments: "", requestDate: "2026-02-08", approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "", paidAt: "", status: "pending" },
  { id: "exp-4", requestNo: "EXP-2026-004", title: "قرطاسية ومستلزمات مكتبية", description: "شراء أوراق وأقلام وملفات للأقسام", department: "Human Resources", requestedBy: "hr", requestedByName: "Ahmed Hassan", amount: 350000, category: "office", urgency: "low", attachments: "", requestDate: "2026-02-09", approvedBy: "مدير المالية", approvedAt: "2026-02-09", rejectedBy: "", rejectedAt: "", rejectionReason: "", paidAt: "", status: "approved" },
  { id: "exp-5", requestNo: "EXP-2026-005", title: "حملة تسويقية - فيسبوك", description: "إعلانات ممولة على فيسبوك لمدة شهر", department: "Sales", requestedBy: "sales", requestedByName: "Mohammed Khalid", amount: 2000000, category: "marketing", urgency: "high", attachments: "marketing_plan.pdf", requestDate: "2026-02-10", rejectedBy: "CEO", rejectedAt: "2026-02-10", rejectionReason: "الميزانية التسويقية مستنفدة هذا الشهر", approvedBy: "", approvedAt: "", paidAt: "", status: "rejected" },
  { id: "exp-6", requestNo: "EXP-2026-006", title: "دورة تدريبية - محاسبة", description: "تسجيل 3 موظفين في دورة محاسبة متقدمة", department: "Finance", requestedBy: "finance", requestedByName: "Nadia Samir", amount: 3000000, category: "training", urgency: "medium", attachments: "training_brochure.pdf", requestDate: "2026-02-11", approvedBy: "", approvedAt: "", rejectedBy: "", rejectedAt: "", rejectionReason: "", paidAt: "", status: "pending" },
];

export const archiveDocuments: ArchiveDocument[] = [
  { id: "arc-1", title: "عقد إيجار - مبنى المكتب الرئيسي", category: "contracts", department: "Administration", uploadedBy: "Admin", uploadDate: "2025-06-15", fileType: "PDF", fileSize: "2.4 MB", tags: "إيجار,عقد,مكتب", description: "عقد إيجار المبنى الرئيسي لمدة 3 سنوات", status: "active" },
  { id: "arc-2", title: "تقرير مالي - الربع الرابع 2025", category: "financial", department: "Finance", uploadedBy: "Sara Ali", uploadDate: "2026-01-15", fileType: "XLSX", fileSize: "1.8 MB", tags: "تقرير,مالي,ربع سنوي", description: "التقرير المالي للربع الأخير من 2025", status: "active" },
  { id: "arc-3", title: "سياسة الموارد البشرية 2026", category: "hr", department: "Human Resources", uploadedBy: "Ahmed Hassan", uploadDate: "2026-01-01", fileType: "DOCX", fileSize: "850 KB", tags: "سياسة,موارد بشرية", description: "السياسة المحدثة للموارد البشرية", status: "active" },
  { id: "arc-4", title: "فاتورة مشتريات - Steel Works", category: "invoices", department: "Procurement", uploadedBy: "Omar Youssef", uploadDate: "2026-02-05", fileType: "PDF", fileSize: "350 KB", tags: "فاتورة,مشتريات", description: "فاتورة شراء مواد خام", status: "active" },
  { id: "arc-5", title: "تقرير صيانة المعدات", category: "technical", department: "Production", uploadedBy: "Khaled Mansour", uploadDate: "2026-02-08", fileType: "PDF", fileSize: "1.2 MB", tags: "صيانة,تقرير,معدات", description: "تقرير صيانة خط الإنتاج", status: "archived" },
];

export const fixedAssets: FixedAsset[] = [
  { id: "fa-1", name: "مبنى المكتب الرئيسي", assetCode: "FA-BLD-001", category: "buildings", department: "Administration", location: "بغداد، الكرادة", purchaseDate: "2020-06-15", purchaseCost: 500000000, currentValue: 450000000, depreciationRate: 2, depreciationMethod: "straight-line", usefulLife: 50, accumulatedDepreciation: 50000000, status: "active" },
  { id: "fa-2", name: "مخزن A", assetCode: "FA-BLD-002", category: "buildings", department: "Production", location: "المنطقة الصناعية", purchaseDate: "2021-03-01", purchaseCost: 120000000, currentValue: 108000000, depreciationRate: 2, depreciationMethod: "straight-line", usefulLife: 50, accumulatedDepreciation: 12000000, status: "active" },
  { id: "fa-3", name: "شاحنة توصيل #1", assetCode: "FA-VEH-001", category: "vehicles", department: "Logistics", location: "الساحة اللوجستية", purchaseDate: "2023-08-10", purchaseCost: 45000000, currentValue: 33750000, depreciationRate: 10, depreciationMethod: "declining-balance", usefulLife: 10, accumulatedDepreciation: 11250000, status: "active" },
  { id: "fa-4", name: "ماكينة CNC", assetCode: "FA-MCH-001", category: "machinery", department: "Production", location: "قاعة الإنتاج", purchaseDate: "2022-11-20", purchaseCost: 85000000, currentValue: 68000000, depreciationRate: 10, depreciationMethod: "straight-line", usefulLife: 10, accumulatedDepreciation: 17000000, status: "maintenance" },
  { id: "fa-5", name: "أثاث مكتبي - الطابق 3", assetCode: "FA-FRN-001", category: "furniture", department: "Administration", location: "الطابق الثالث", purchaseDate: "2024-01-15", purchaseCost: 8000000, currentValue: 6800000, depreciationRate: 15, depreciationMethod: "straight-line", usefulLife: 7, accumulatedDepreciation: 1200000, status: "active" },
  { id: "fa-6", name: "خادم Dell PowerEdge", assetCode: "FA-CMP-001", category: "computers", department: "IT", location: "غرفة الخوادم", purchaseDate: "2024-06-01", purchaseCost: 15000000, currentValue: 12000000, depreciationRate: 20, depreciationMethod: "straight-line", usefulLife: 5, accumulatedDepreciation: 3000000, status: "active" },
];

export const tenders: Tender[] = [
  { id: "tnd-1", tenderNo: "TND-2026-001", title: "توريد معدات مكتبية", description: "توريد وتركيب أثاث ومعدات مكتبية للطابق الجديد", department: "Administration", estimatedBudget: 25000000, publishDate: "2026-01-15", closingDate: "2026-02-15", bidsCount: 4, winnerVendor: "", winnerAmount: 0, status: "evaluation" },
  { id: "tnd-2", tenderNo: "TND-2026-002", title: "صيانة أنظمة التكييف", description: "عقد صيانة سنوي لنظام التكييف المركزي", department: "Facilities", estimatedBudget: 8000000, publishDate: "2026-01-20", closingDate: "2026-02-20", bidsCount: 3, winnerVendor: "Cool Tech Services", winnerAmount: 7200000, status: "awarded" },
  { id: "tnd-3", tenderNo: "TND-2026-003", title: "تطوير نظام ERP", description: "تطوير وتحسين نظام إدارة الموارد", department: "IT", estimatedBudget: 50000000, publishDate: "2026-02-01", closingDate: "2026-03-01", bidsCount: 0, winnerVendor: "", winnerAmount: 0, status: "published" },
  { id: "tnd-4", tenderNo: "TND-2025-010", title: "بناء مخزن جديد", description: "إنشاء مخزن بمساحة 500م² في المنطقة الصناعية", department: "Operations", estimatedBudget: 200000000, publishDate: "2025-10-01", closingDate: "2025-11-01", bidsCount: 6, winnerVendor: "Baghdad Construction", winnerAmount: 185000000, status: "closed" },
];

export const tenderBids: TenderBid[] = [
  { id: "tb-1", tenderId: "tnd-1", vendorName: "Office Plus", amount: 23000000, submissionDate: "2026-02-01", technicalScore: 85, financialScore: 90, totalScore: 87, notes: "Best price", status: "evaluated" },
  { id: "tb-2", tenderId: "tnd-1", vendorName: "Modern Furniture Co", amount: 26000000, submissionDate: "2026-02-03", technicalScore: 92, financialScore: 78, totalScore: 86, notes: "High quality", status: "evaluated" },
  { id: "tb-3", tenderId: "tnd-1", vendorName: "Budget Office", amount: 20000000, submissionDate: "2026-02-05", technicalScore: 70, financialScore: 95, totalScore: 80, notes: "Lowest price but lower quality", status: "evaluated" },
  { id: "tb-4", tenderId: "tnd-2", vendorName: "Cool Tech Services", amount: 7200000, submissionDate: "2026-02-10", technicalScore: 95, financialScore: 88, totalScore: 92, notes: "Winner", status: "winner" },
];

export const projects: Project[] = [
  { id: "prj-1", name: "تطوير نظام ERP", code: "PRJ-001", department: "IT", manager: "Fatima Noor", startDate: "2025-06-01", endDate: "2026-06-01", budget: 50000000, spent: 30000000, progress: 65, priority: "high", status: "in-progress", description: "تطوير نظام إدارة موارد المؤسسة المتكامل", milestones: "Phase 1 ✓, Phase 2 ✓, Phase 3 ⏳" },
  { id: "prj-2", name: "توسعة خط الإنتاج", code: "PRJ-002", department: "Production", manager: "Khaled Mansour", startDate: "2026-01-01", endDate: "2026-08-01", budget: 120000000, spent: 25000000, progress: 20, priority: "high", status: "in-progress", description: "إضافة خط إنتاج جديد لزيادة الطاقة الإنتاجية", milestones: "Design ✓, Procurement ⏳" },
  { id: "prj-3", name: "حملة تسويق الربع الأول", code: "PRJ-003", department: "Marketing", manager: "Layla Ibrahim", startDate: "2026-01-01", endDate: "2026-03-31", budget: 15000000, spent: 10000000, progress: 70, priority: "medium", status: "in-progress", description: "حملة تسويقية شاملة عبر الوسائل المختلفة", milestones: "Social Media ✓, TV Ad ⏳, Events ⏳" },
  { id: "prj-4", name: "تحديث البنية التحتية", code: "PRJ-004", department: "IT", manager: "Fatima Noor", startDate: "2025-01-01", endDate: "2025-12-31", budget: 30000000, spent: 28000000, progress: 100, priority: "critical", status: "completed", description: "تحديث الخوادم والشبكات", milestones: "All completed ✓" },
  { id: "prj-5", name: "افتتاح فرع أربيل", code: "PRJ-005", department: "Operations", manager: "General Manager", startDate: "2026-03-01", endDate: "2026-09-01", budget: 80000000, spent: 0, progress: 0, priority: "medium", status: "planning", description: "افتتاح فرع جديد في أربيل", milestones: "Not started" },
];

export const trainingPrograms: TrainingProgram[] = [
  { id: "trn-1", title: "أساسيات الأمان السيبراني", category: "technical", trainer: "Dr. Ali Karim", department: "IT", startDate: "2026-02-15", endDate: "2026-02-17", duration: "3 days", maxParticipants: 20, enrolled: 15, location: "قاعة التدريب - الطابق 2", cost: 2000000, status: "upcoming", description: "دورة في أساسيات الأمان السيبراني وحماية البيانات" },
  { id: "trn-2", title: "مهارات القيادة والإدارة", category: "management", trainer: "Prof. Sarah Hussein", department: "All", startDate: "2026-03-01", endDate: "2026-03-03", duration: "3 days", maxParticipants: 15, enrolled: 12, location: "فندق روتانا - قاعة المؤتمرات", cost: 5000000, status: "upcoming", description: "تطوير المهارات القيادية للمدراء" },
  { id: "trn-3", title: "السلامة المهنية في بيئة العمل", category: "safety", trainer: "Eng. Mustafa Adel", department: "Production", startDate: "2026-01-20", endDate: "2026-01-21", duration: "2 days", maxParticipants: 30, enrolled: 28, location: "قاعة الإنتاج", cost: 1000000, status: "completed", description: "تدريب على إجراءات السلامة والإسعافات الأولية" },
  { id: "trn-4", title: "Excel المتقدم للمحاسبين", category: "technical", trainer: "Trainer: Online", department: "Finance", startDate: "2026-02-20", endDate: "2026-02-22", duration: "3 days", maxParticipants: 10, enrolled: 8, location: "Online / Teams", cost: 500000, status: "upcoming", description: "مهارات Excel المتقدمة للتقارير المالية" },
  { id: "trn-5", title: "مهارات التواصل الفعال", category: "soft-skills", trainer: "Dr. Noor Jamal", department: "All", startDate: "2026-04-10", endDate: "2026-04-11", duration: "2 days", maxParticipants: 25, enrolled: 5, location: "قاعة التدريب - الطابق 2", cost: 1500000, status: "upcoming", description: "تطوير مهارات التواصل مع العملاء والزملاء" },
];

export const vehicles: Vehicle[] = [
  { id: "veh-1", plateNumber: "12345 ب", make: "Toyota", model: "Hilux", year: 2024, type: "truck", assignedTo: "Logistics Team", department: "Logistics", fuelType: "diesel", mileage: 25000, lastMaintenance: "2026-01-15", nextMaintenance: "2026-04-15", insuranceExpiry: "2026-12-31", monthlyFuelCost: 450000, status: "active" },
  { id: "veh-2", plateNumber: "67890 ع", make: "Toyota", model: "Camry", year: 2023, type: "sedan", assignedTo: "General Manager", department: "Administration", fuelType: "gasoline", mileage: 45000, lastMaintenance: "2026-02-01", nextMaintenance: "2026-05-01", insuranceExpiry: "2026-08-15", monthlyFuelCost: 350000, status: "active" },
  { id: "veh-3", plateNumber: "11223 د", make: "Hyundai", model: "H-1", year: 2022, type: "van", assignedTo: "Delivery Team", department: "Sales", fuelType: "diesel", mileage: 78000, lastMaintenance: "2025-12-20", nextMaintenance: "2026-03-20", insuranceExpiry: "2026-06-30", monthlyFuelCost: 500000, status: "maintenance" },
  { id: "veh-4", plateNumber: "44556 ن", make: "Kia", model: "Sportage", year: 2025, type: "suv", assignedTo: "Sales Director", department: "Sales", fuelType: "gasoline", mileage: 5000, lastMaintenance: "2026-02-05", nextMaintenance: "2026-08-05", insuranceExpiry: "2027-01-15", monthlyFuelCost: 300000, status: "active" },
  { id: "veh-5", plateNumber: "77889 ر", make: "Mitsubishi", model: "L200", year: 2021, type: "truck", assignedTo: "", department: "Production", fuelType: "diesel", mileage: 120000, lastMaintenance: "2025-11-01", nextMaintenance: "2026-02-01", insuranceExpiry: "2026-03-15", monthlyFuelCost: 0, status: "retired" },
];

export const crmContacts: CRMContact[] = [
  { id: "crm-1", name: "عمر الشمري", company: "شركة الشمري للتجارة", email: "omar@shamri.com", phone: "07701234567", type: "customer", source: "referral", assignedTo: "Mohammed Khalid", lastContact: "2026-02-08", nextFollowUp: "2026-02-15", dealValue: 15000000, pipeline: "won", notes: "عميل مميز - طلبات شهرية", status: "active" },
  { id: "crm-2", name: "فاطمة العلي", company: "مؤسسة العلي الصناعية", email: "fatima@alali.com", phone: "07709876543", type: "prospect", source: "exhibition", assignedTo: "Mohammed Khalid", lastContact: "2026-02-05", nextFollowUp: "2026-02-12", dealValue: 35000000, pipeline: "proposal", notes: "أبدت اهتمام بمنتجات الإنتاج", status: "active" },
  { id: "crm-3", name: "حسين كاظم", company: "شركة كاظم للبناء", email: "hussein@kazim.com", phone: "07711112222", type: "lead", source: "website", assignedTo: "Mohammed Khalid", lastContact: "2026-02-01", nextFollowUp: "2026-02-10", dealValue: 0, pipeline: "new", notes: "تواصل عبر الموقع - يسأل عن أسعار الحديد", status: "active" },
  { id: "crm-4", name: "نور الهاشمي", company: "Hashimi Group", email: "noor@hashimi.com", phone: "07733334444", type: "customer", source: "cold-call", assignedTo: "Mohammed Khalid", lastContact: "2026-01-20", nextFollowUp: "2026-03-01", dealValue: 8000000, pipeline: "won", notes: "عقد سنوي للصيانة", status: "active" },
  { id: "crm-5", name: "سامر يوسف", company: "Youssef Trading", email: "samer@youssef.com", phone: "07755556666", type: "lead", source: "social-media", assignedTo: "Mohammed Khalid", lastContact: "2026-02-09", nextFollowUp: "2026-02-16", dealValue: 5000000, pipeline: "contacted", notes: "أرسل استفسار عبر انستغرام", status: "active" },
  { id: "crm-6", name: "زينب عبد الله", company: "مجموعة عبد الله", email: "zeinab@abdullah.com", phone: "07777778888", type: "prospect", source: "referral", assignedTo: "Mohammed Khalid", lastContact: "2026-01-25", nextFollowUp: "2026-02-20", dealValue: 22000000, pipeline: "negotiation", notes: "مفاوضات جارية على عقد كبير", status: "active" },
];

export const branches: Branch[] = [
  { id: "br-1", name: "المقر الرئيسي - بغداد", code: "HQ-BGD", city: "بغداد", address: "شارع الكرادة، بغداد", phone: "07801234567", manager: "General Manager", employeeCount: 45, openDate: "2018-01-01", status: "active", latitude: 33.3152, longitude: 44.3661 },
  { id: "br-2", name: "فرع أربيل", code: "BR-EBL", city: "أربيل", address: "شارع 60 متري، أربيل", phone: "07501234567", manager: "Ali Hamid", employeeCount: 12, openDate: "2023-06-01", status: "active", latitude: 36.1901, longitude: 44.0091 },
  { id: "br-3", name: "فرع البصرة", code: "BR-BSR", city: "البصرة", address: "شارع الجزائر، البصرة", phone: "07701234567", manager: "Hassan Ali", employeeCount: 8, openDate: "2024-03-15", status: "active", latitude: 30.5085, longitude: 47.7804 },
  { id: "br-4", name: "فرع السليمانية", code: "BR-SLM", city: "السليمانية", address: "شارع سالم، السليمانية", phone: "07701112233", manager: "", employeeCount: 0, openDate: "2026-06-01", status: "under-construction", latitude: 35.5571, longitude: 45.4351 },
];
