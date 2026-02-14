import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "ar" | "en" | "ku";

type I18nContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
  dir: string;
};

var translations: Record<string, Record<Lang, string>> = {
  // ===== Section Titles =====
  "sec.dashboard": { ar: "لوحة التحكم", en: "Dashboard", ku: "داشبۆرد" },
  "sec.hr": { ar: "الموارد البشرية", en: "Human Resources", ku: "سەرچاوەکانی مرۆیی" },
  "sec.finance": { ar: "المالية", en: "Finance", ku: "دارایی" },
  "sec.admin": { ar: "الادارة", en: "Administration", ku: "بەڕێوەبردن" },
  "sec.purchasing": { ar: "المشتريات واللوجستيات", en: "Purchasing & Logistics", ku: "کڕین و لۆجستیک" },
  "sec.sales": { ar: "المبيعات والتسويق", en: "Sales & Marketing", ku: "فرۆشتن و مارکێتینگ" },
  "sec.it": { ar: "تكنولوجيا المعلومات", en: "Information Technology", ku: "تەکنەلۆژیای زانیاری" },
  "sec.production": { ar: "الانتاج", en: "Production", ku: "بەرهەمهێنان" },
  "sec.tools": { ar: "أدوات النظام", en: "System Tools", ku: "ئامرازەکانی سیستەم" },
  "sec.advanced": { ar: "الأدوات المتقدمة", en: "Advanced Tools", ku: "ئامرازە پێشکەوتووەکان" },
  "sec.settings": { ar: "الاعدادات", en: "Settings", ku: "ڕێکخستنەکان" },

  // ===== Dashboard =====
  "menu.overview": { ar: "نظرة عامة", en: "Overview", ku: "پوختە" },

  // ===== HR Items =====
  "menu.timesheets": { ar: "صفحة العمل", en: "Timesheets", ku: "کاتی کار" },
  "menu.staffCard": { ar: "بطاقة العامل", en: "Staff Card", ku: "کارتی کارمەند" },
  "menu.leaveRequests": { ar: "طلبات اجازة", en: "Leave Requests", ku: "داواکاری مۆڵەت" },
  "menu.payroll": { ar: "الرواتب", en: "Payroll", ku: "مووچە" },
  "menu.evaluations": { ar: "تقييم الموظفين", en: "Staff Evaluation", ku: "هەڵسەنگاندنی کارمەند" },
  "menu.recruitment": { ar: "طلبات التوظيف", en: "Recruitment", ku: "دامەزراندن" },
  "menu.staffNotif": { ar: "اشعار موظف جديد", en: "New Staff Notice", ku: "ئاگاداری کارمەندی نوێ" },
  "menu.reports": { ar: "التقارير", en: "Reports", ku: "ڕاپۆرتەکان" },
  "menu.options": { ar: "الاعدادات", en: "Options", ku: "هەڵبژاردنەکان" },

  // ===== Finance Items =====
  "menu.payableAccounts": { ar: "الحسابات الدائنة", en: "Payable Accounts", ku: "هەژمارە قەرزەکان" },
  "menu.receivableAccounts": { ar: "الحسابات المدينة", en: "Receivable Accounts", ku: "هەژمارە وەرگرتنەکان" },
  "menu.funds": { ar: "الأموال", en: "Funds", ku: "سەرمایە" },
  "menu.inventories": { ar: "المخازن", en: "Inventories", ku: "کۆگاکان" },
  "menu.costs": { ar: "الكلف", en: "Costs", ku: "تێچوونەکان" },
  "menu.accounts": { ar: "شجرة الحسابات", en: "Chart of Accounts", ku: "داری هەژمارەکان" },
  "menu.journalEntries": { ar: "القيود", en: "Journal Entries", ku: "تۆمارەکان" },

  // ===== Admin Items =====
  "menu.property": { ar: "الممتلكات", en: "Properties", ku: "موڵکەکان" },
  "menu.leaseAgreements": { ar: "اتفاقيات الايجار", en: "Lease Agreements", ku: "ڕێکەوتنی کرێ" },
  "menu.users": { ar: "المستخدمين", en: "Users", ku: "بەکارهێنەران" },
  "menu.permissions": { ar: "الصلاحيات", en: "Permissions", ku: "دەسەڵاتەکان" },

  // ===== Purchasing =====
  "menu.vendors": { ar: "الموردين", en: "Vendors", ku: "دابینکەران" },
  "menu.purchaseOrders": { ar: "أوامر الشراء", en: "Purchase Orders", ku: "فەرمانی کڕین" },

  // ===== Sales =====
  "menu.customers": { ar: "العملاء", en: "Customers", ku: "کڕیاران" },
  "menu.invoices": { ar: "الفواتير", en: "Invoices", ku: "پسوولەکان" },

  // ===== IT =====
  "menu.tickets": { ar: "التذاكر", en: "Tickets", ku: "تیکەتەکان" },

  // ===== Production =====
  "menu.products": { ar: "المنتجات والمخزون", en: "Products & Inventory", ku: "بەرهەمەکان و کۆگا" },

  // ===== System Tools =====
  "menu.kpi": { ar: "مؤشرات الأداء", en: "KPI Dashboard", ku: "پێوەری ئەدا" },
  "menu.messages": { ar: "المراسلات", en: "Messages", ku: "نامەکان" },
  "menu.calendar": { ar: "التقويم", en: "Calendar", ku: "ڕۆژژمێر" },
  "menu.approvals": { ar: "الموافقات", en: "Approvals", ku: "پەسەندکردنەکان" },
  "menu.notifications": { ar: "الإشعارات", en: "Notifications", ku: "ئاگاداریەکان" },
  "menu.auditLog": { ar: "سجل النشاطات", en: "Audit Log", ku: "تۆماری چالاکی" },

  // ===== Advanced Tools =====
  "menu.analytics": { ar: "التحليلات", en: "Analytics", ku: "شیکاری" },
  "menu.smartAlerts": { ar: "التنبيهات الذكية", en: "Smart Alerts", ku: "ئاگاداری زیرەک" },
  "menu.kanban": { ar: "كانبان", en: "Kanban Board", ku: "تەختەی کانبان" },
  "menu.documents": { ar: "المستندات", en: "Documents", ku: "بەڵگەنامەکان" },
  "menu.reportBuilder": { ar: "منشئ التقارير", en: "Report Builder", ku: "دروستکەری ڕاپۆرت" },
  "menu.groupChat": { ar: "المحادثات", en: "Group Chat", ku: "چاتی گرووپ" },
  "menu.map": { ar: "خريطة الفروع", en: "Branch Map", ku: "نەخشەی لقەکان" },
  "menu.signatures": { ar: "التوقيعات", en: "E-Signatures", ku: "واژووی ئەلیکترۆنی" },
  "menu.widgets": { ar: "الويدجات", en: "Widgets", ku: "ویجێتەکان" },
  "menu.backup": { ar: "النسخ الاحتياطي", en: "Backup & Restore", ku: "پاشکەوتکردن" },
  "menu.goals": { ar: "الأهداف", en: "Goals & OKR", ku: "ئامانجەکان" },
  // 15 New Features
  "menu.emailNotif": { ar: "إشعارات البريد", en: "Email Notifications", ku: "ئاگاداری ئیمەیل" },
  "menu.ceoDashboard": { ar: "لوحة المدير التنفيذي", en: "CEO Dashboard", ku: "داشبۆردی بەڕێوەبەری گشتی" },
  "menu.employeeLoans": { ar: "سلف الموظفين", en: "Employee Loans", ku: "قەرزی کارمەندان" },
  "menu.expenseRequests": { ar: "طلبات الصرف", en: "Expense Requests", ku: "داواکاری خەرجی" },
  "menu.archives": { ar: "الأرشفة الإلكترونية", en: "E-Archive", ku: "ئەرشیفی ئەلیکترۆنی" },
  "menu.fixedAssets": { ar: "الأصول الثابتة", en: "Fixed Assets", ku: "سامانە جێگیرەکان" },
  "menu.tenders": { ar: "المناقصات", en: "Tenders", ku: "مونافەسەکان" },
  "menu.projects": { ar: "إدارة المشاريع", en: "Projects", ku: "پڕۆژەکان" },
  "menu.training": { ar: "التدريب والتطوير", en: "Training", ku: "ڕاهێنان و گەشەپێدان" },
  "menu.biReports": { ar: "تقارير BI", en: "BI Reports", ku: "ڕاپۆرتی BI" },
  "menu.biometric": { ar: "الحضور البيومتري", en: "Biometric Attendance", ku: "ئامادەبوونی بایۆمەتریک" },
  "menu.vehicles": { ar: "إدارة المركبات", en: "Vehicle Management", ku: "بەڕێوەبردنی ئۆتۆمبێل" },
  "menu.crm": { ar: "إدارة العلاقات", en: "CRM", ku: "بەڕێوەبردنی پەیوەندیەکان" },
  "menu.twoFA": { ar: "المصادقة الثنائية", en: "Two-Factor Auth", ku: "دوو هەنگاوی پشتڕاستکردنەوە" },
  "menu.branches": { ar: "إدارة الفروع", en: "Branch Management", ku: "بەڕێوەبردنی لقەکان" },

  // ===== Settings =====
  "menu.generalSettings": { ar: "الاعدادات العامة", en: "General Settings", ku: "ڕێکخستنی گشتی" },

  // ===== Topbar / UI =====
  "brand": { ar: "نظام إدارة المؤسسة", en: "Enterprise Management System", ku: "سیستەمی بەڕێوەبردنی دامەزراوە" },
  "brand.main": { ar: "نظام المؤسسة", en: "Enterprise System", ku: "سیستەمی دامەزراوە" },
  "brand.sub": { ar: "Enterprise System", en: "Enterprise System", ku: "Enterprise System" },
  "search.placeholder": { ar: "بحث شامل... (Ctrl+K)", en: "Search... (Ctrl+K)", ku: "گەڕان... (Ctrl+K)" },
  "search.pages": { ar: "الصفحات", en: "Pages", ku: "لاپەڕەکان" },
  "search.data": { ar: "البيانات", en: "Data", ku: "داتاکان" },
  "logout": { ar: "خروج", en: "Logout", ku: "چوونەدەرەوە" },
  "logoutFull": { ar: "تسجيل خروج", en: "Sign Out", ku: "چوونەدەرەوە" },
  "notif.title": { ar: "الإشعارات", en: "Notifications", ku: "ئاگاداریەکان" },
  "notif.markAll": { ar: "تحديد الكل ✓", en: "Mark all ✓", ku: "هەمووی دیاریبکە ✓" },
  "notif.empty": { ar: "لا توجد إشعارات جديدة", en: "No new notifications", ku: "هیچ ئاگاداریەکی نوێ نییە" },
  "notif.viewAll": { ar: "عرض الكل", en: "View All", ku: "هەمووی ببینە" },
  "noResults": { ar: "لا توجد نتائج", en: "No results", ku: "هیچ ئەنجامێک نییە" },

  // ===== Language =====
  "language": { ar: "اللغة", en: "Language", ku: "زمان" },
  "lang.ar": { ar: "العربية", en: "Arabic", ku: "عەرەبی" },
  "lang.en": { ar: "English", en: "English", ku: "English" },
  "lang.ku": { ar: "کوردی", en: "Kurdish", ku: "کوردی" },

  // ===== Roles =====
  "role.admin": { ar: "مدير النظام", en: "System Admin", ku: "بەڕێوەبەری سیستەم" },
  "role.ceo": { ar: "المدير العام", en: "CEO", ku: "بەڕێوەبەری گشتی" },
  "role.manager": { ar: "مدير تنفيذي", en: "General Manager", ku: "بەڕێوەبەر" },
  "role.hr_manager": { ar: "مدير الموارد البشرية", en: "HR Manager", ku: "بەڕێوەبەری HR" },
  "role.hr_assistant": { ar: "مساعد مدير HR", en: "HR Assistant", ku: "یاریدەدەری HR" },
  "role.hr": { ar: "موارد بشرية", en: "HR Staff", ku: "سەرچاوەی مرۆیی" },
  "role.finance_manager": { ar: "مدير المالية", en: "Finance Manager", ku: "بەڕێوەبەری دارایی" },
  "role.finance_assistant": { ar: "مساعد مدير المالية", en: "Finance Assistant", ku: "یاریدەدەری دارایی" },
  "role.finance": { ar: "مالية", en: "Finance Staff", ku: "دارایی" },
  "role.sales_manager": { ar: "مدير المبيعات", en: "Sales Manager", ku: "بەڕێوەبەری فرۆشتن" },
  "role.sales_assistant": { ar: "مساعد مدير المبيعات", en: "Sales Assistant", ku: "یاریدەدەری فرۆشتن" },
  "role.sales": { ar: "مبيعات", en: "Sales Staff", ku: "فرۆشتن" },
  "role.it_manager": { ar: "مدير IT", en: "IT Manager", ku: "بەڕێوەبەری ئای تی" },
  "role.it_assistant": { ar: "مساعد مدير IT", en: "IT Assistant", ku: "یاریدەدەری ئای تی" },
  "role.it": { ar: "تكنولوجيا المعلومات", en: "IT Staff", ku: "ئای تی" },
  "role.production_manager": { ar: "مدير الإنتاج", en: "Production Manager", ku: "بەڕێوەبەری بەرهەمهێنان" },
  "role.production_assistant": { ar: "مساعد مدير الإنتاج", en: "Production Assistant", ku: "یاریدەدەری بەرهەمهێنان" },
  "role.production": { ar: "إنتاج", en: "Production Staff", ku: "بەرهەمهێنان" },
  "role.purchasing_manager": { ar: "مدير المشتريات", en: "Purchasing Manager", ku: "بەڕێوەبەری کڕین" },
  "role.purchasing_assistant": { ar: "مساعد مدير المشتريات", en: "Purchasing Assistant", ku: "یاریدەدەری کڕین" },
  "role.purchasing": { ar: "مشتريات", en: "Purchasing Staff", ku: "کڕین" },
  "role.admin_manager": { ar: "مدير الإدارة", en: "Admin Manager", ku: "بەڕێوەبەری بەڕێوەبەرایەتی" },
  "role.admin_assistant": { ar: "مساعد مدير الإدارة", en: "Admin Assistant", ku: "یاریدەدەری بەڕێوەبەرایەتی" },
  "role.employee": { ar: "موظف", en: "Employee", ku: "کارمەند" },

  // ===== Common =====
  "save": { ar: "حفظ", en: "Save", ku: "پاشەکەوتکردن" },
  "cancel": { ar: "إلغاء", en: "Cancel", ku: "هەڵوەشاندنەوە" },
  "delete": { ar: "حذف", en: "Delete", ku: "سڕینەوە" },
  "edit": { ar: "تعديل", en: "Edit", ku: "دەستکاری" },
  "add": { ar: "إضافة", en: "Add", ku: "زیادکردن" },
  "view": { ar: "عرض", en: "View", ku: "بینین" },
  "status": { ar: "الحالة", en: "Status", ku: "دۆخ" },
  "date": { ar: "التاريخ", en: "Date", ku: "بەروار" },
  "name": { ar: "الاسم", en: "Name", ku: "ناو" },
  "total": { ar: "الإجمالي", en: "Total", ku: "کۆ" },
  "welcome": { ar: "مرحباً", en: "Welcome", ku: "بەخێربێیت" },
  "loading": { ar: "جاري التحميل...", en: "Loading...", ku: "چاوەڕوانبە..." },
  "confirmDelete": { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?", ku: "دڵنیایت لە سڕینەوە؟" },
  "actions": { ar: "الإجراءات", en: "Actions", ku: "کردارەکان" },
  "new": { ar: "جديد", en: "New", ku: "نوێ" },
  "description": { ar: "الوصف", en: "Description", ku: "وەسف" },
  "notes": { ar: "ملاحظات", en: "Notes", ku: "تێبینیەکان" },
  "amount": { ar: "المبلغ", en: "Amount", ku: "بڕ" },
  "type": { ar: "النوع", en: "Type", ku: "جۆر" },
  "phone": { ar: "الهاتف", en: "Phone", ku: "تەلەفۆن" },
  "email": { ar: "البريد الإلكتروني", en: "Email", ku: "ئیمەیل" },
  "company": { ar: "الشركة", en: "Company", ku: "کۆمپانیا" },
  "category": { ar: "الفئة", en: "Category", ku: "پۆل" },
  "priority": { ar: "الأولوية", en: "Priority", ku: "لەپێشخستن" },
  "assignee": { ar: "المسؤول", en: "Assignee", ku: "بەرپرس" },
  "location": { ar: "الموقع", en: "Location", ku: "شوێن" },
  "active": { ar: "نشط", en: "Active", ku: "چالاک" },
  "inactive": { ar: "غير نشط", en: "Inactive", ku: "ناچالاک" },
  "pending": { ar: "قيد الانتظار", en: "Pending", ku: "چاوەڕوان" },
  "approved": { ar: "موافق عليه", en: "Approved", ku: "پەسەندکراو" },
  "rejected": { ar: "مرفوض", en: "Rejected", ku: "ڕەتکراوە" },
  "paid": { ar: "مدفوعة", en: "Paid", ku: "دراو" },
  "unpaid": { ar: "غير مدفوعة", en: "Unpaid", ku: "نەدراو" },
  "overdue": { ar: "متأخرة", en: "Overdue", ku: "دواکەوتوو" },
  "draft": { ar: "مسودة", en: "Draft", ku: "ڕەشنووس" },
  "posted": { ar: "مرحّل", en: "Posted", ku: "نێردراو" },
  "open": { ar: "مفتوح", en: "Open", ku: "کراوە" },
  "inProgress": { ar: "قيد التنفيذ", en: "In Progress", ku: "لە جێبەجێکردن" },
  "resolved": { ar: "تم الحل", en: "Resolved", ku: "چارەسەرکراو" },
  "closed": { ar: "مغلق", en: "Closed", ku: "داخراو" },
  "low": { ar: "منخفض", en: "Low", ku: "نزم" },
  "medium": { ar: "متوسط", en: "Medium", ku: "مامناوەند" },
  "high": { ar: "عالي", en: "High", ku: "بەرز" },
  "critical": { ar: "حرج", en: "Critical", ku: "کریتیکاڵ" },
  "received": { ar: "مستلم", en: "Received", ku: "وەرگیراو" },
  "cancelled": { ar: "ملغي", en: "Cancelled", ku: "هەڵوەشێنراو" },
  "processed": { ar: "تمت المعالجة", en: "Processed", ku: "پرۆسەکراو" },
  "submitted": { ar: "مقدم", en: "Submitted", ku: "پێشکەشکراو" },
  "disabled": { ar: "معطل", en: "Disabled", ku: "ناکارا" },
  "expired": { ar: "منتهية", en: "Expired", ku: "بەسەرچوو" },
  "terminated": { ar: "ملغاة", en: "Terminated", ku: "کۆتایی هات" },
  "interviewing": { ar: "مقابلة", en: "Interviewing", ku: "چاوپێکەوتن" },
  "filled": { ar: "تم الملء", en: "Filled", ku: "پڕکراوە" },
  "annual": { ar: "سنوية", en: "Annual", ku: "ساڵانە" },
  "sick": { ar: "مرضية", en: "Sick", ku: "نەخۆشی" },
  "personal": { ar: "شخصية", en: "Personal", ku: "کەسی" },
  "excellent": { ar: "ممتاز", en: "Excellent", ku: "نایاب" },
  "good": { ar: "جيد", en: "Good", ku: "باش" },
  "average": { ar: "متوسط", en: "Average", ku: "مامناوەند" },
  "poor": { ar: "ضعيف", en: "Poor", ku: "لاواز" },

  // ===== Page Titles =====
  "page.employees": { ar: "👥 الموظفين / Employees", en: "👥 Employees", ku: "👥 کارمەندان" },
  "page.departments": { ar: "🏢 الأقسام / Departments", en: "🏢 Departments", ku: "🏢 بەشەکان" },
  "page.attendance": { ar: "⏰ الحضور والانصراف / Attendance", en: "⏰ Attendance", ku: "⏰ ئامادەبوون" },
  "page.timesheets": { ar: "📋 سجل ساعات العمل / Timesheets", en: "📋 Timesheets", ku: "📋 کاتی کار" },
  "page.staffCard": { ar: "🪪 بطاقة العامل / Staff Card", en: "🪪 Staff Card", ku: "🪪 کارتی کارمەند" },
  "page.leaveRequests": { ar: "🏖️ طلبات الإجازة / Leave Requests", en: "🏖️ Leave Requests", ku: "🏖️ داواکاری مۆڵەت" },
  "page.payroll": { ar: "💵 الرواتب / Payroll", en: "💵 Payroll", ku: "💵 مووچە" },
  "page.evaluations": { ar: "⭐ تقييم الموظفين / Staff Evaluation", en: "⭐ Staff Evaluation", ku: "⭐ هەڵسەنگاندن" },
  "page.recruitment": { ar: "🎯 طلبات التوظيف / Recruitment", en: "🎯 Recruitment", ku: "🎯 دامەزراندن" },
  "page.staffNotif": { ar: "📢 إشعار موظف جديد / New Staff Notification", en: "📢 New Staff Notification", ku: "📢 ئاگاداری کارمەندی نوێ" },
  "page.accounts": { ar: "📒 شجرة الحسابات / Chart of Accounts", en: "📒 Chart of Accounts", ku: "📒 داری هەژمارەکان" },
  "page.journalEntries": { ar: "📝 القيود المحاسبية / Journal Entries", en: "📝 Journal Entries", ku: "📝 تۆمارەکان" },
  "page.payableAccounts": { ar: "📤 الحسابات الدائنة / Payable Accounts", en: "📤 Payable Accounts", ku: "📤 هەژمارە قەرزەکان" },
  "page.receivableAccounts": { ar: "📥 الحسابات المدينة / Receivable Accounts", en: "📥 Receivable Accounts", ku: "📥 هەژمارە وەرگرتنەکان" },
  "page.funds": { ar: "🏦 الصناديق المالية / Funds", en: "🏦 Funds", ku: "🏦 سەرمایە" },
  "page.inventories": { ar: "📦 المخازن / Inventories", en: "📦 Inventories", ku: "📦 کۆگاکان" },
  "page.costs": { ar: "💳 مراكز التكلفة / Cost Centers", en: "💳 Cost Centers", ku: "💳 تێچوونەکان" },
  "page.customers": { ar: "👥 العملاء / Customers", en: "👥 Customers", ku: "👥 کڕیاران" },
  "page.invoices": { ar: "🧾 الفواتير / Invoices", en: "🧾 Invoices", ku: "🧾 پسوولەکان" },
  "page.vendors": { ar: "🏪 الموردين / Vendors", en: "🏪 Vendors", ku: "🏪 دابینکەران" },
  "page.purchaseOrders": { ar: "📋 أوامر الشراء / Purchase Orders", en: "📋 Purchase Orders", ku: "📋 فەرمانی کڕین" },
  "page.products": { ar: "📦 المنتجات والمخزون / Products & Inventory", en: "📦 Products & Inventory", ku: "📦 بەرهەمەکان" },
  "page.tickets": { ar: "🎫 تذاكر الدعم الفني / IT Support Tickets", en: "🎫 IT Support Tickets", ku: "🎫 تیکەتەکانی پشتیوانی" },
  "page.users": { ar: "👤 إدارة المستخدمين / User Management", en: "👤 User Management", ku: "👤 بەڕێوەبردنی بەکارهێنەر" },
  "page.property": { ar: "🏠 الممتلكات / Properties", en: "🏠 Properties", ku: "🏠 موڵکەکان" },
  "page.leaseAgreements": { ar: "📑 اتفاقيات الإيجار / Lease Agreements", en: "📑 Lease Agreements", ku: "📑 ڕێکەوتنی کرێ" },
  "page.permissions": { ar: "🔐 إدارة الصلاحيات / Permissions", en: "🔐 Permissions", ku: "🔐 دەسەڵاتەکان" },
  "page.kpi": { ar: "📊 لوحة مؤشرات الأداء / KPI Dashboard", en: "📊 KPI Dashboard", ku: "📊 داشبۆردی KPI" },
  "page.itAssets": { ar: "🖥️ أصول تكنولوجيا المعلومات / IT Assets", en: "🖥️ IT Assets", ku: "🖥️ سامانەکانی IT" },
  "page.systemHealth": { ar: "💚 صحة النظام / System Health", en: "💚 System Health", ku: "💚 تەندروستی سیستەم" },
  "page.contracts": { ar: "📄 عقود الموظفين / Employee Contracts", en: "📄 Employee Contracts", ku: "📄 گرێبەستی کارمەندان" },
  "page.budgets": { ar: "📊 الميزانيات / Budgets", en: "📊 Budgets", ku: "📊 بودجە" },

  // ===== Field Labels =====
  "field.employee": { ar: "الموظف", en: "Employee", ku: "کارمەند" },
  "field.department": { ar: "القسم", en: "Department", ku: "بەش" },
  "field.position": { ar: "المنصب", en: "Position", ku: "پۆست" },
  "field.salary": { ar: "الراتب", en: "Salary", ku: "مووچە" },
  "field.hireDate": { ar: "تاريخ التعيين", en: "Hire Date", ku: "بەرواری دامەزراندن" },
  "field.fullName": { ar: "الاسم الكامل", en: "Full Name", ku: "ناوی تەواو" },
  "field.checkIn": { ar: "الدخول", en: "Check In", ku: "هاتن" },
  "field.checkOut": { ar: "الخروج", en: "Check Out", ku: "چوون" },
  "field.hours": { ar: "الساعات", en: "Hours", ku: "کاتژمێر" },
  "field.overtime": { ar: "إضافي", en: "Overtime", ku: "ئۆڤەرتایم" },
  "field.project": { ar: "المشروع", en: "Project", ku: "پرۆژە" },
  "field.days": { ar: "أيام", en: "Days", ku: "ڕۆژ" },
  "field.reason": { ar: "السبب", en: "Reason", ku: "هۆکار" },
  "field.startDate": { ar: "تاريخ البدء", en: "Start Date", ku: "بەرواری دەستپێکردن" },
  "field.endDate": { ar: "تاريخ الانتهاء", en: "End Date", ku: "بەرواری کۆتایی" },
  "field.basic": { ar: "الراتب الأساسي", en: "Basic Salary", ku: "مووچەی بنەڕەت" },
  "field.allowances": { ar: "البدلات", en: "Allowances", ku: "بەخشینەکان" },
  "field.deductions": { ar: "الاستقطاعات", en: "Deductions", ku: "داشکاندنەکان" },
  "field.netSalary": { ar: "صافي الراتب", en: "Net Salary", ku: "مووچەی نێت" },
  "field.month": { ar: "الشهر", en: "Month", ku: "مانگ" },
  "field.evaluator": { ar: "المقيّم", en: "Evaluator", ku: "هەڵسەنگێنەر" },
  "field.period": { ar: "الفترة", en: "Period", ku: "ماوە" },
  "field.score": { ar: "النتيجة (%)", en: "Score (%)", ku: "نمرە (%)" },
  "field.rating": { ar: "التقييم", en: "Rating", ku: "هەڵسەنگاندن" },
  "field.requestedBy": { ar: "بطلب من", en: "Requested By", ku: "داواکراوە لەلایەن" },
  "field.vacancies": { ar: "الشواغر", en: "Vacancies", ku: "بۆشایی" },
  "field.urgency": { ar: "الاستعجال", en: "Urgency", ku: "پەلە" },
  "field.notifiedBy": { ar: "بإشعار من", en: "Notified By", ku: "ئاگادارکراوە لەلایەن" },
  "field.code": { ar: "الرمز", en: "Code", ku: "کۆد" },
  "field.accountName": { ar: "اسم الحساب", en: "Account Name", ku: "ناوی هەژمار" },
  "field.account": { ar: "الحساب", en: "Account", ku: "هەژمار" },
  "field.balance": { ar: "الرصيد", en: "Balance", ku: "باڵانس" },
  "field.debit": { ar: "مدين", en: "Debit", ku: "قەرز" },
  "field.credit": { ar: "دائن", en: "Credit", ku: "بستانە" },
  "field.vendor": { ar: "المورد", en: "Vendor", ku: "دابینکەر" },
  "field.customer": { ar: "العميل", en: "Customer", ku: "کڕیار" },
  "field.invoiceNo": { ar: "رقم الفاتورة", en: "Invoice #", ku: "ژمارەی پسوولە" },
  "field.dueDate": { ar: "تاريخ الاستحقاق", en: "Due Date", ku: "بەرواری کۆتایی" },
  "field.fundName": { ar: "اسم الصندوق", en: "Fund Name", ku: "ناوی سەرمایە" },
  "field.currency": { ar: "العملة", en: "Currency", ku: "دراو" },
  "field.lastUpdated": { ar: "آخر تحديث", en: "Last Updated", ku: "دوایین نوێکردنەوە" },
  "field.sku": { ar: "رمز المنتج", en: "SKU", ku: "SKU" },
  "field.item": { ar: "العنصر", en: "Item", ku: "بابەت" },
  "field.qty": { ar: "الكمية", en: "Quantity", ku: "ژمارە" },
  "field.unitPrice": { ar: "سعر الوحدة", en: "Unit Price", ku: "نرخی یەکە" },
  "field.warehouse": { ar: "المخزن", en: "Warehouse", ku: "کۆگا" },
  "field.minStock": { ar: "الحد الأدنى", en: "Min Stock", ku: "کەمترین کۆگا" },
  "field.approvedBy": { ar: "بموافقة", en: "Approved By", ku: "پەسەندکراوە لەلایەن" },
  "field.totalPurchases": { ar: "إجمالي المشتريات", en: "Total Purchases", ku: "کۆی کڕینەکان" },
  "field.poNumber": { ar: "رقم أمر الشراء", en: "PO Number", ku: "ژمارەی فەرمانی کڕین" },
  "field.product": { ar: "المنتج", en: "Product", ku: "بەرهەم" },
  "field.price": { ar: "السعر", en: "Price", ku: "نرخ" },
  "field.stock": { ar: "المخزون", en: "Stock", ku: "کۆگا" },
  "field.title": { ar: "العنوان", en: "Title", ku: "ناونیشان" },
  "field.created": { ar: "تاريخ الإنشاء", en: "Created", ku: "دروستکراو" },
  "field.username": { ar: "اسم المستخدم", en: "Username", ku: "ناوی بەکارهێنەر" },
  "field.role": { ar: "الدور", en: "Role", ku: "ڕۆڵ" },
  "field.area": { ar: "المساحة (م²)", en: "Area (m²)", ku: "ڕووبەر (م²)" },
  "field.value": { ar: "القيمة", en: "Value", ku: "بەها" },
  "field.acquiredDate": { ar: "تاريخ الاقتناء", en: "Acquired Date", ku: "بەرواری بەدەستهێنان" },
  "field.tenant": { ar: "المستأجر", en: "Tenant", ku: "کرێچی" },
  "field.monthlyRent": { ar: "الإيجار الشهري", en: "Monthly Rent", ku: "کرێی مانگانە" },
  "field.start": { ar: "البداية", en: "Start", ku: "دەستپێک" },
  "field.end": { ar: "النهاية", en: "End", ku: "کۆتایی" },
  "field.newEmployee": { ar: "الموظف الجديد", en: "New Employee", ku: "کارمەندی نوێ" },
  "field.notifDate": { ar: "تاريخ الإشعار", en: "Notification Date", ku: "بەرواری ئاگادارکردنەوە" },
  "field.manager": { ar: "المدير", en: "Manager", ku: "بەڕێوەبەر" },
  "field.employeeCount": { ar: "عدد الموظفين", en: "Employee Count", ku: "ژمارەی کارمەندان" },
  "field.todayAttendance": { ar: "سجلات الحضور اليومية", en: "Today's attendance records", ku: "تۆماری ئامادەبوونی ئەمڕۆ" },

  // ===== Asset Types =====
  "asset.building": { ar: "مبنى", en: "Building", ku: "بینا" },
  "asset.land": { ar: "أرض", en: "Land", ku: "زەوی" },
  "asset.vehicle": { ar: "مركبة", en: "Vehicle", ku: "ئۆتۆمبیل" },
  "asset.equipment": { ar: "معدات", en: "Equipment", ku: "ئامێر" },
  "asset.underMaint": { ar: "تحت الصيانة", en: "Under Maintenance", ku: "لەژێر چاککردنەوە" },
  "asset.disposed": { ar: "تم التخلص", en: "Disposed", ku: "فڕێدراو" },

  // ===== Fund Types =====
  "fund.cash": { ar: "نقدي", en: "Cash", ku: "نەقد" },
  "fund.bank": { ar: "بنكي", en: "Bank", ku: "بانک" },
  "fund.investment": { ar: "استثمار", en: "Investment", ku: "وەبەرهێنان" },
  "fund.frozen": { ar: "مجمد", en: "Frozen", ku: "بەستەنراو" },

  // ===== Account Types =====
  "acct.asset": { ar: "أصول", en: "Asset", ku: "سامان" },
  "acct.liability": { ar: "التزامات", en: "Liability", ku: "قەرز" },
  "acct.equity": { ar: "حقوق ملكية", en: "Equity", ku: "هاوبەشی" },
  "acct.revenue": { ar: "إيرادات", en: "Revenue", ku: "داهات" },
  "acct.expense": { ar: "مصاريف", en: "Expense", ku: "خەرجی" },

  // ===== Inventory Status =====
  "inv.inStock": { ar: "متوفر", en: "In Stock", ku: "لە کۆگا" },
  "inv.lowStock": { ar: "مخزون منخفض", en: "Low Stock", ku: "کۆگای کەم" },
  "inv.outOfStock": { ar: "نافد", en: "Out of Stock", ku: "تەواوبوو" },

  // ===== Product Status =====
  "prod.discontinued": { ar: "متوقف", en: "Discontinued", ku: "ڕاگیراو" },

  // ===== IT =====
  "menu.itAssets": { ar: "أصول تقنية المعلومات", en: "IT Assets", ku: "سامانەکانی IT" },
  "menu.systemHealth": { ar: "صحة النظام", en: "System Health", ku: "تەندروستی سیستەم" },

  // ===== IT Asset Categories =====
  "itCat.laptop": { ar: "حاسوب محمول", en: "Laptop", ku: "لاپتۆپ" },
  "itCat.desktop": { ar: "حاسوب مكتبي", en: "Desktop", ku: "دێسکتۆپ" },
  "itCat.network": { ar: "شبكات", en: "Network", ku: "تۆڕ" },
  "itCat.printer": { ar: "طابعة", en: "Printer", ku: "پرینتەر" },
  "itCat.tablet": { ar: "جهاز لوحي", en: "Tablet", ku: "تابلێت" },
  "itCat.infrastructure": { ar: "بنية تحتية", en: "Infrastructure", ku: "ئینفراستڕاکچەر" },
  "maintenance": { ar: "صيانة", en: "Maintenance", ku: "چاککردنەوە" },
  "retired": { ar: "مسحوب", en: "Retired", ku: "بەکارنەهاتوو" },

  // ===== Contract Types =====
  "contract.fullTime": { ar: "دوام كامل", en: "Full-time", ku: "تەواو وەقت" },
  "contract.partTime": { ar: "دوام جزئي", en: "Part-time", ku: "نیو وەقت" },
  "contract.contract": { ar: "عقد مؤقت", en: "Contract", ku: "گرێبەست" },
  "contract.internship": { ar: "تدريب", en: "Internship", ku: "ڕاهێنان" },

  // ===== Budget =====
  "field.allocated": { ar: "المخصص", en: "Allocated", ku: "تەرخانکراو" },
  "field.spent": { ar: "المصروف", en: "Spent", ku: "خەرجکراو" },
  "field.remaining": { ar: "المتبقي", en: "Remaining", ku: "ماوە" },
  "field.year": { ar: "السنة", en: "Year", ku: "ساڵ" },
  "overbudget": { ar: "تجاوز الميزانية", en: "Over Budget", ku: "زیاتر لە بودجە" },
  "budCat.salaries": { ar: "رواتب", en: "Salaries", ku: "مووچەکان" },
  "budCat.equipment": { ar: "معدات", en: "Equipment", ku: "ئامێرەکان" },
  "budCat.advertising": { ar: "إعلانات", en: "Advertising", ku: "ڕیکلام" },
  "budCat.maintenance": { ar: "صيانة", en: "Maintenance", ku: "چاککردنەوە" },
  "budCat.software": { ar: "برمجيات", en: "Software", ku: "نەرمەکاڵا" },
  "budCat.travel": { ar: "سفر", en: "Travel", ku: "گەشت" },
  "budCat.training": { ar: "تدريب", en: "Training", ku: "ڕاهێنان" },
  "budCat.other": { ar: "أخرى", en: "Other", ku: "هیتر" },

  // ===== Quotation =====
  "page.quotations": { ar: "📝 عروض الأسعار / Quotations", en: "📝 Quotations", ku: "📝 نرخەکان" },
  "field.quoteNo": { ar: "رقم العرض", en: "Quote #", ku: "ژمارەی نرخ" },
  "field.validUntil": { ar: "صالح حتى", en: "Valid Until", ku: "بەردەوامە تا" },
  "sent": { ar: "مرسل", en: "Sent", ku: "نێردراو" },
  "accepted": { ar: "مقبول", en: "Accepted", ku: "پەسەندکراو" },

  // ===== Work Order =====
  "page.workOrders": { ar: "📋 أوامر العمل / Work Orders", en: "📋 Work Orders", ku: "📋 فەرمانی کار" },
  "field.orderNo": { ar: "رقم الأمر", en: "Order #", ku: "ژمارەی فەرمان" },
  "field.quantity": { ar: "الكمية", en: "Quantity", ku: "بڕ" },
  "completed": { ar: "مكتمل", en: "Completed", ku: "تەواوبوو" },

  // ===== Menu Items =====
  "menu.contracts": { ar: "عقود الموظفين", en: "Employee Contracts", ku: "گرێبەستی کارمەندان" },
  "menu.budgets": { ar: "الميزانيات", en: "Budgets", ku: "بودجەکان" },
  "menu.quotations": { ar: "عروض الأسعار", en: "Quotations", ku: "نرخەکان" },
  "menu.workOrders": { ar: "أوامر العمل", en: "Work Orders", ku: "فەرمانی کار" },
};

const I18nContext = createContext<I18nContextType>({
  lang: "ar",
  setLang: function () {},
  t: function (key) { return key; },
  dir: "rtl",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(function () {
    return (localStorage.getItem("erp_lang") as Lang) || "ar";
  });

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("erp_lang", l);
    document.documentElement.dir = l === "en" ? "ltr" : "rtl";
    document.documentElement.lang = l;
  }

  useEffect(function () {
    document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.documentElement.lang = lang;
  }, []);

  function t(key: string): string {
    var entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry["ar"] || key;
  }

  var dir = lang === "en" ? "ltr" : "rtl";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export default I18nContext;
