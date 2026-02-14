import { nextId } from "./store.js";

export type CalendarEvent = {
  id: string;
  title: string;
  titleAr: string;
  type: "meeting" | "leave" | "deadline" | "holiday" | "training" | "other";
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  attendees: string[];
  createdBy: string;
  color: string;
};

export const calendarEvents: CalendarEvent[] = [
  { id: "ev-1", title: "Board Meeting", titleAr: "اجتماع مجلس الإدارة", type: "meeting", date: "2026-02-10", startTime: "10:00", endTime: "12:00", location: "قاعة الاجتماعات الرئيسية", description: "Monthly board meeting", attendees: ["admin", "manager", "hr", "finance"], createdBy: "admin", color: "#6366f1" },
  { id: "ev-2", title: "Layla Ibrahim - Annual Leave", titleAr: "ليلى ابراهيم - إجازة سنوية", type: "leave", date: "2026-02-10", startTime: "00:00", endTime: "23:59", location: "", description: "Annual leave 5 days", attendees: ["hr"], createdBy: "hr", color: "#10b981" },
  { id: "ev-3", title: "Invoice Due: INV-1002", titleAr: "موعد فاتورة: INV-1002", type: "deadline", date: "2026-02-20", startTime: "00:00", endTime: "23:59", location: "", description: "Beta Industries invoice due", attendees: ["finance"], createdBy: "finance", color: "#f59e0b" },
  { id: "ev-4", title: "Server Migration", titleAr: "ترحيل الخادم", type: "other", date: "2026-02-15", startTime: "22:00", endTime: "02:00", location: "مركز البيانات", description: "Production server migration", attendees: ["admin"], createdBy: "admin", color: "#ef4444" },
  { id: "ev-5", title: "Safety Training", titleAr: "تدريب السلامة", type: "training", date: "2026-02-12", startTime: "09:00", endTime: "11:00", location: "قاعة التدريب", description: "Annual workplace safety training", attendees: ["hr", "manager"], createdBy: "hr", color: "#3b82f6" },
  { id: "ev-6", title: "National Day Holiday", titleAr: "عطلة اليوم الوطني", type: "holiday", date: "2026-02-14", startTime: "00:00", endTime: "23:59", location: "", description: "Public holiday", attendees: [], createdBy: "admin", color: "#8b5cf6" },
  { id: "ev-7", title: "Sales Review", titleAr: "مراجعة المبيعات", type: "meeting", date: "2026-02-11", startTime: "14:00", endTime: "15:30", location: "مكتب المبيعات", description: "Weekly sales performance review", attendees: ["sales", "manager"], createdBy: "manager", color: "#6366f1" },
  { id: "ev-8", title: "Payroll Processing", titleAr: "معالجة الرواتب", type: "deadline", date: "2026-02-25", startTime: "00:00", endTime: "23:59", location: "", description: "February payroll processing deadline", attendees: ["hr", "finance"], createdBy: "hr", color: "#f59e0b" },
  { id: "ev-9", title: "Team Building", titleAr: "بناء الفريق", type: "other", date: "2026-02-18", startTime: "15:00", endTime: "18:00", location: "حديقة الشركة", description: "Quarterly team building activity", attendees: ["admin", "hr", "manager", "finance", "sales"], createdBy: "hr", color: "#10b981" },
  { id: "ev-10", title: "IT Equipment Delivery", titleAr: "تسليم معدات تقنية", type: "deadline", date: "2026-02-13", startTime: "09:00", endTime: "12:00", location: "المخزن B", description: "New laptops and monitors delivery", attendees: ["admin"], createdBy: "admin", color: "#3b82f6" },
];

export function addCalendarEvent(e: Omit<CalendarEvent, "id">) {
  const entry: CalendarEvent = { ...e, id: nextId("ev") };
  calendarEvents.push(entry);
  return entry;
}
