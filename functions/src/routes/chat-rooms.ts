import { Router } from "express";

const router = Router();

type ChatMessage = { id: string; roomId: string; sender: string; senderRole: string; text: string; timestamp: string };
type ChatRoom = { id: string; name: string; department: string; icon: string; members: string[] };

let msgIdCounter = 20;
const rooms: ChatRoom[] = [
  { id: "room-general", name: "عام / General", department: "all", icon: "💬", members: ["admin", "manager", "hr", "finance", "sales"] },
  { id: "room-hr", name: "الموارد البشرية / HR", department: "hr", icon: "👥", members: ["admin", "manager", "hr"] },
  { id: "room-finance", name: "المالية / Finance", department: "finance", icon: "💰", members: ["admin", "manager", "finance"] },
  { id: "room-sales", name: "المبيعات / Sales", department: "sales", icon: "📈", members: ["admin", "manager", "sales"] },
  { id: "room-it", name: "تكنولوجيا المعلومات / IT", department: "it", icon: "🖥️", members: ["admin", "manager"] },
];

const chatMessages: ChatMessage[] = [
  { id: "cm-1", roomId: "room-general", sender: "admin", senderRole: "admin", text: "مرحباً بالجميع في قناة المحادثة العامة", timestamp: "2026-02-10T09:00:00" },
  { id: "cm-2", roomId: "room-general", sender: "hr", senderRole: "hr", text: "صباح الخير، تم تحديث سجلات الحضور", timestamp: "2026-02-10T09:05:00" },
  { id: "cm-3", roomId: "room-general", sender: "finance", senderRole: "finance", text: "التقارير المالية جاهزة للمراجعة", timestamp: "2026-02-10T09:10:00" },
  { id: "cm-4", roomId: "room-hr", sender: "hr", senderRole: "hr", text: "تم إنهاء تقييمات الموظفين للربع الأول", timestamp: "2026-02-10T10:00:00" },
  { id: "cm-5", roomId: "room-hr", sender: "admin", senderRole: "admin", text: "ممتاز، يرجى إرسال التقرير النهائي", timestamp: "2026-02-10T10:05:00" },
  { id: "cm-6", roomId: "room-finance", sender: "finance", senderRole: "finance", text: "الفواتير المتأخرة بحاجة لمتابعة عاجلة", timestamp: "2026-02-10T10:15:00" },
  { id: "cm-7", roomId: "room-sales", sender: "sales", senderRole: "sales", text: "تم إغلاق صفقة جديدة مع Omega Group", timestamp: "2026-02-10T11:00:00" },
];

router.get("/rooms", (_req, res) => {
  var roomsWithCount = rooms.map(function(r) {
    var msgCount = chatMessages.filter(function(m) { return m.roomId === r.id; }).length;
    return { ...r, messageCount: msgCount };
  });
  res.json({ rooms: roomsWithCount });
});

router.get("/rooms/:roomId/messages", (req, res) => {
  var msgs = chatMessages.filter(function(m) { return m.roomId === req.params.roomId; });
  var room = rooms.find(function(r) { return r.id === req.params.roomId; });
  res.json({ messages: msgs, room: room || null });
});

router.post("/rooms/:roomId/messages", (req, res) => {
  var msg: ChatMessage = {
    id: "cm-" + (++msgIdCounter),
    roomId: req.params.roomId,
    sender: req.body.sender || "admin",
    senderRole: req.body.senderRole || "admin",
    text: req.body.text,
    timestamp: new Date().toISOString(),
  };
  chatMessages.push(msg);
  res.status(201).json(msg);
});

export default router;
