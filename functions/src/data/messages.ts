import { nextId } from "./store.js";

/* ═══ Types ═══ */
export interface Attachment { id: string; name: string; type: string; size: number; }

export interface ChatMessage {
  id: string; channelId: string; fromUser: string; fromName: string; body: string;
  attachments: Attachment[]; replyTo?: string; replyPreview?: string; replyFromName?: string;
  reactions: Record<string, string[]>; pinned: boolean; edited: boolean; createdAt: string;
}

export interface Channel {
  id: string; name: string; nameEn: string; type: "public" | "private"; icon: string;
  members: string[]; description: string; createdBy: string; createdAt: string;
  lastMessageAt: string; readBy: Record<string, string>;
}

/* ═══ User map ═══ */
const U: Record<string, string> = {
  admin: "مدير النظام", ceo: "المدير العام", manager: "المدير التنفيذي",
  hr_manager: "أحمد حسن", hr: "ليلى ناصر", hr_assistant: "نور محمد",
  finance_manager: "سارة علي", finance: "زينب أحمد", finance_assistant: "عمر فيصل",
  sales_manager: "محمد خالد", sales: "مريم جاسم", sales_assistant: "حسين علي",
  it_manager: "فاطمة نور", it: "علي رضا", it_assistant: "كريم حسن",
  purchasing_manager: "خالد يوسف", production_manager: "ياسر عبد",
};
export function userName(u: string) { return U[u] || u; }
const ALL = Object.keys(U);

/* ═══ Channels ═══ */
export const channels: Channel[] = [
  { id: "ch-general", name: "القناة العامة", nameEn: "General", type: "public", icon: "📢", members: [...ALL], description: "القناة العامة لجميع الموظفين", createdBy: "admin", createdAt: "2026-01-01T08:00:00", lastMessageAt: "2026-02-14T10:30:00", readBy: {} },
  { id: "ch-announcements", name: "الإعلانات", nameEn: "Announcements", type: "public", icon: "📋", members: [...ALL], description: "إعلانات الشركة الرسمية", createdBy: "admin", createdAt: "2026-01-01T08:00:00", lastMessageAt: "2026-02-13T09:00:00", readBy: {} },
  { id: "ch-it-support", name: "الدعم الفني", nameEn: "IT Support", type: "public", icon: "💻", members: [...ALL], description: "طلبات الدعم الفني والتقني", createdBy: "it_manager", createdAt: "2026-01-05T08:00:00", lastMessageAt: "2026-02-14T09:15:00", readBy: {} },
  { id: "dm-admin-hr_manager", name: "", nameEn: "", type: "private", icon: "👤", members: ["admin", "hr_manager"], description: "", createdBy: "admin", createdAt: "2026-01-10T08:00:00", lastMessageAt: "2026-02-14T08:45:00", readBy: {} },
  { id: "dm-admin-finance_manager", name: "", nameEn: "", type: "private", icon: "👤", members: ["admin", "finance_manager"], description: "", createdBy: "admin", createdAt: "2026-01-10T09:00:00", lastMessageAt: "2026-02-13T14:20:00", readBy: {} },
  { id: "dm-hr_manager-manager", name: "", nameEn: "", type: "private", icon: "👤", members: ["hr_manager", "manager"], description: "", createdBy: "hr_manager", createdAt: "2026-01-15T08:00:00", lastMessageAt: "2026-02-12T16:30:00", readBy: {} },
  { id: "dm-finance_manager-sales_manager", name: "", nameEn: "", type: "private", icon: "👤", members: ["finance_manager", "sales_manager"], description: "", createdBy: "finance_manager", createdAt: "2026-01-20T08:00:00", lastMessageAt: "2026-02-11T11:00:00", readBy: {} },
];

/* ═══ Chat Messages ═══ */
export const chatMessages: ChatMessage[] = [
  /* General channel */
  { id: "cm-1", channelId: "ch-general", fromUser: "admin", fromName: U.admin!, body: "صباح الخير جميعاً! 🌅 تم إصدار التحديث الجديد للنظام. يرجى مراجعة التغييرات.", attachments: [], reactions: { "👍": ["hr_manager","finance_manager","sales_manager"], "🎉": ["ceo","manager"] }, pinned: true, edited: false, createdAt: "2026-02-14T08:00:00" },
  { id: "cm-2", channelId: "ch-general", fromUser: "hr_manager", fromName: U.hr_manager!, body: "شكراً على التحديث. هل هناك تغييرات في نظام الحضور البيومتري؟", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:15:00" },
  { id: "cm-3", channelId: "ch-general", fromUser: "admin", fromName: U.admin!, body: "نعم، تم إضافة ميزة البصمة البيومترية وتحسين تقارير الحضور.", attachments: [], reactions: { "👍": ["hr_manager","hr"] }, pinned: false, edited: false, createdAt: "2026-02-14T08:20:00" },
  { id: "cm-4", channelId: "ch-general", fromUser: "finance_manager", fromName: U.finance_manager!, body: "ممتاز! هل تم تحديث نظام الفواتير أيضاً؟", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:30:00" },
  { id: "cm-5", channelId: "ch-general", fromUser: "admin", fromName: U.admin!, body: "سيتم تحديثه في الإصدار القادم إن شاء الله.", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:35:00" },
  { id: "cm-6", channelId: "ch-general", fromUser: "sales_manager", fromName: U.sales_manager!, body: "صباح الخير! حققنا هدف المبيعات لهذا الشهر 🎉🎊", attachments: [], reactions: { "🎉": ["admin","ceo","manager","hr_manager"], "❤️": ["sales","sales_assistant"], "👍": ["finance_manager"] }, pinned: false, edited: false, createdAt: "2026-02-14T09:00:00" },
  { id: "cm-7", channelId: "ch-general", fromUser: "ceo", fromName: U.ceo!, body: "أحسنتم! عمل رائع من فريق المبيعات 👏 أفتخر بالجميع.", attachments: [], reactions: { "❤️": ["admin","manager","sales_manager","hr_manager"] }, pinned: false, edited: false, createdAt: "2026-02-14T09:15:00" },
  { id: "cm-8", channelId: "ch-general", fromUser: "it_manager", fromName: U.it_manager!, body: "⚠️ تذكير: صيانة الخادم الجمعة 11 مساءً - 2 صباحاً. يرجى حفظ أعمالكم.", attachments: [], reactions: { "👍": ["admin","hr_manager","finance_manager"] }, pinned: true, edited: false, createdAt: "2026-02-14T09:30:00" },
  { id: "cm-9", channelId: "ch-general", fromUser: "hr_manager", fromName: U.hr_manager!, body: "تم الانتهاء من تقييمات الربع الأول. النتائج متاحة للمدراء.", attachments: [{ id: "att-1", name: "تقييمات_Q1_2026.pdf", type: "pdf", size: 245000 }], reactions: { "👍": ["manager","ceo"] }, pinned: false, edited: false, createdAt: "2026-02-14T10:00:00" },
  { id: "cm-10", channelId: "ch-general", fromUser: "manager", fromName: U.manager!, body: "شكراً أحمد. سأراجع التقييمات اليوم.", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T10:15:00" },
  { id: "cm-11", channelId: "ch-general", fromUser: "purchasing_manager", fromName: U.purchasing_manager!, body: "تم استلام طلبات الشراء الجديدة. سيتم معالجتها خلال يومين.", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T10:30:00" },
  /* Announcements */
  { id: "cm-20", channelId: "ch-announcements", fromUser: "ceo", fromName: U.ceo!, body: "📢 يسعدني الإعلان عن توقيع عقد شراكة مع شركة النور للتجارة! 🇮🇶", attachments: [{ id: "att-3", name: "press_release.pdf", type: "pdf", size: 320000 }], reactions: { "🎉": ["admin","manager","hr_manager","finance_manager","sales_manager","it_manager"], "❤️": ["hr","finance","sales"] }, pinned: true, edited: false, createdAt: "2026-02-10T10:00:00" },
  { id: "cm-21", channelId: "ch-announcements", fromUser: "hr_manager", fromName: U.hr_manager!, body: "📢 نرحب بالموظفين الجدد:\n• نور محمد - الموارد البشرية\n• كريم حسن - تكنولوجيا المعلومات\nتمنياتنا بالتوفيق! 🎉", attachments: [], reactions: { "🎉": ["admin","ceo","manager"], "❤️": ["hr","it_manager"] }, pinned: false, edited: false, createdAt: "2026-02-12T09:00:00" },
  { id: "cm-22", channelId: "ch-announcements", fromUser: "admin", fromName: U.admin!, body: "📢 تغيير ساعات العمل بدءاً من 1 مارس 2026.\nالساعات الجديدة: 8:00 ص - 4:00 م.", attachments: [{ id: "att-2", name: "جدول_العمل_الجديد.pdf", type: "pdf", size: 180000 }], reactions: { "👍": ["hr_manager","finance_manager","sales_manager","it_manager"] }, pinned: true, edited: false, createdAt: "2026-02-13T08:00:00" },
  { id: "cm-23", channelId: "ch-announcements", fromUser: "manager", fromName: U.manager!, body: "📢 اجتماع شهري لرؤساء الأقسام كل أول أحد. الموعد: 9:00 ص.", attachments: [], reactions: { "👍": ["hr_manager","finance_manager","sales_manager","it_manager","purchasing_manager"] }, pinned: false, edited: false, createdAt: "2026-02-13T09:00:00" },
  /* IT Support */
  { id: "cm-30", channelId: "ch-it-support", fromUser: "finance", fromName: U.finance!, body: "كيف أصدّر التقارير بصيغة PDF؟", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:30:00" },
  { id: "cm-31", channelId: "ch-it-support", fromUser: "it", fromName: U.it!, body: "التقارير ← اختاري التقرير ← زر التصدير 📥 ← اختاري PDF.", attachments: [], reactions: { "👍": ["finance"] }, pinned: false, edited: false, createdAt: "2026-02-14T08:35:00" },
  { id: "cm-32", channelId: "ch-it-support", fromUser: "finance", fromName: U.finance!, body: "شكراً! نجح الأمر 👍", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:40:00" },
  { id: "cm-33", channelId: "ch-it-support", fromUser: "hr_assistant", fromName: U.hr_assistant!, body: "النظام بطيء جداً اليوم 😕", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T09:00:00" },
  { id: "cm-34", channelId: "ch-it-support", fromUser: "it_manager", fromName: U.it_manager!, body: "نعمل على حل المشكلة. التحسين خلال ساعة إن شاء الله.", attachments: [], reactions: { "👍": ["hr_assistant"] }, pinned: false, edited: false, createdAt: "2026-02-14T09:05:00" },
  { id: "cm-35", channelId: "ch-it-support", fromUser: "it_manager", fromName: U.it_manager!, body: "✅ تم حل المشكلة. السبب: تحديث قاعدة البيانات التلقائي.", attachments: [], reactions: { "🎉": ["hr_assistant","finance"], "👍": ["admin"] }, pinned: false, edited: false, createdAt: "2026-02-14T09:15:00" },
  /* DM: admin <-> hr_manager */
  { id: "cm-40", channelId: "dm-admin-hr_manager", fromUser: "admin", fromName: U.admin!, body: "أحمد، هل تم تحديث بيانات الموظفين الجدد؟", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:00:00" },
  { id: "cm-41", channelId: "dm-admin-hr_manager", fromUser: "hr_manager", fromName: U.hr_manager!, body: "نعم، تم إضافة جميع البيانات. مرفق التقرير.", attachments: [{ id: "att-4", name: "بيانات_الموظفين.xlsx", type: "spreadsheet", size: 156000 }], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:15:00" },
  { id: "cm-42", channelId: "dm-admin-hr_manager", fromUser: "admin", fromName: U.admin!, body: "ممتاز، شكراً لك 👍", attachments: [], reactions: { "👍": ["hr_manager"] }, pinned: false, edited: false, createdAt: "2026-02-14T08:30:00" },
  { id: "cm-43", channelId: "dm-admin-hr_manager", fromUser: "hr_manager", fromName: U.hr_manager!, body: "عفواً. هل لديك وقت لمناقشة الإجازات المتراكمة؟", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-14T08:45:00" },
  /* DM: admin <-> finance_manager */
  { id: "cm-50", channelId: "dm-admin-finance_manager", fromUser: "finance_manager", fromName: U.finance_manager!, body: "مرفق تقرير ميزانية يناير 2026.", attachments: [{ id: "att-5", name: "ميزانية_يناير.pdf", type: "pdf", size: 420000 }, { id: "att-6", name: "المصروفات.xlsx", type: "spreadsheet", size: 280000 }], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-13T14:00:00" },
  { id: "cm-51", channelId: "dm-admin-finance_manager", fromUser: "admin", fromName: U.admin!, body: "استلمت التقارير. سأراجعها وأعود إليك.", attachments: [], reactions: { "👍": ["finance_manager"] }, pinned: false, edited: false, createdAt: "2026-02-13T14:20:00" },
  /* DM: hr_manager <-> manager */
  { id: "cm-60", channelId: "dm-hr_manager-manager", fromUser: "hr_manager", fromName: U.hr_manager!, body: "نحتاج لتعيين مطورين اثنين لقسم IT.", attachments: [{ id: "att-7", name: "طلب_توظيف.pdf", type: "pdf", size: 95000 }], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-12T15:00:00" },
  { id: "cm-61", channelId: "dm-hr_manager-manager", fromUser: "manager", fromName: U.manager!, body: "تمت الموافقة. ابدأ التوظيف فوراً.", attachments: [], reactions: { "👍": ["hr_manager"] }, pinned: false, edited: false, createdAt: "2026-02-12T16:30:00" },
  /* DM: finance_manager <-> sales_manager */
  { id: "cm-70", channelId: "dm-finance_manager-sales_manager", fromUser: "sales_manager", fromName: U.sales_manager!, body: "يرجى إعداد فاتورة لعميل Omega Group بمبلغ 150,000,000 د.ع", attachments: [], reactions: {}, pinned: false, edited: false, createdAt: "2026-02-11T10:00:00" },
  { id: "cm-71", channelId: "dm-finance_manager-sales_manager", fromUser: "finance_manager", fromName: U.finance_manager!, body: "تم إعداد الفاتورة. الرقم: INV-2026-0234", attachments: [{ id: "att-8", name: "فاتورة_Omega.pdf", type: "pdf", size: 78000 }], reactions: { "👍": ["sales_manager"] }, pinned: false, edited: false, createdAt: "2026-02-11T11:00:00" },
];

/* ═══ Helpers ═══ */
export function addChannel(ch: Omit<Channel, "id" | "createdAt" | "lastMessageAt" | "readBy">) {
  const entry: Channel = { ...ch, id: nextId("ch"), createdAt: new Date().toISOString(), lastMessageAt: new Date().toISOString(), readBy: {} };
  channels.push(entry);
  return entry;
}

export function addChatMessage(msg: { channelId: string; fromUser: string; fromName: string; body: string; attachments?: Attachment[]; replyTo?: string; replyPreview?: string; replyFromName?: string }) {
  const entry: ChatMessage = { id: nextId("cm"), channelId: msg.channelId, fromUser: msg.fromUser, fromName: msg.fromName, body: msg.body, attachments: msg.attachments || [], replyTo: msg.replyTo, replyPreview: msg.replyPreview, replyFromName: msg.replyFromName, reactions: {}, pinned: false, edited: false, createdAt: new Date().toISOString() };
  chatMessages.push(entry);
  const ch = channels.find(c => c.id === msg.channelId);
  if (ch) ch.lastMessageAt = entry.createdAt;
  return entry;
}

export function findOrCreateDM(user1: string, user2: string): Channel {
  const existing = channels.find(c => c.type === "private" && c.members.length === 2 && c.members.includes(user1) && c.members.includes(user2));
  if (existing) return existing;
  return addChannel({ name: "", nameEn: "", type: "private", icon: "👤", members: [user1, user2], description: "", createdBy: user1 });
}
