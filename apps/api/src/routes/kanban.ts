import { Router } from "express";

const router = Router();

type KanbanTask = { id: string; title: string; description: string; assignee: string; priority: string; column: string; createdAt: string; dueDate: string; tags: string[] };

let taskIdCounter = 10;
const tasks: KanbanTask[] = [
  { id: "kt-1", title: "مراجعة تقارير الربع الأول", description: "مراجعة شاملة لتقارير Q1", assignee: "أحمد", priority: "high", column: "todo", createdAt: "2026-02-01", dueDate: "2026-02-15", tags: ["مالية", "تقارير"] },
  { id: "kt-2", title: "تحديث بيانات الموظفين", description: "تحديث بطاقات جميع الموظفين", assignee: "سارة", priority: "medium", column: "todo", createdAt: "2026-02-03", dueDate: "2026-02-20", tags: ["HR"] },
  { id: "kt-3", title: "إعداد الفواتير الشهرية", description: "إصدار فواتير شهر فبراير", assignee: "محمد", priority: "high", column: "in-progress", createdAt: "2026-02-05", dueDate: "2026-02-10", tags: ["مالية"] },
  { id: "kt-4", title: "صيانة الخوادم", description: "صيانة دورية لخوادم النظام", assignee: "علي", priority: "low", column: "in-progress", createdAt: "2026-02-02", dueDate: "2026-02-12", tags: ["IT"] },
  { id: "kt-5", title: "تدريب الموظفين الجدد", description: "برنامج تدريب الموظفين", assignee: "ليلى", priority: "medium", column: "done", createdAt: "2026-01-20", dueDate: "2026-02-05", tags: ["HR", "تدريب"] },
  { id: "kt-6", title: "تجديد عقد الإيجار", description: "تجديد عقد المكتب الرئيسي", assignee: "عمر", priority: "high", column: "todo", createdAt: "2026-02-08", dueDate: "2026-02-28", tags: ["إدارة"] },
  { id: "kt-7", title: "جرد المخزون", description: "جرد شهري للمواد", assignee: "خالد", priority: "medium", column: "review", createdAt: "2026-02-04", dueDate: "2026-02-11", tags: ["مخزون"] },
];

const columns = [
  { id: "todo", title: "قيد الانتظار / To Do", color: "#6366f1" },
  { id: "in-progress", title: "جاري العمل / In Progress", color: "#f59e0b" },
  { id: "review", title: "مراجعة / Review", color: "#8b5cf6" },
  { id: "done", title: "مكتمل / Done", color: "#10b981" },
];

router.get("/", (_req, res) => {
  res.json({ tasks, columns });
});

router.post("/", (req, res) => {
  const t: KanbanTask = { id: "kt-" + (++taskIdCounter), ...req.body, createdAt: new Date().toISOString().slice(0, 10) };
  tasks.push(t);
  res.status(201).json(t);
});

router.put("/:id", (req, res) => {
  const idx = tasks.findIndex(function(t) { return t.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  Object.assign(tasks[idx], req.body);
  res.json(tasks[idx]);
});

router.put("/:id/move", (req, res) => {
  const idx = tasks.findIndex(function(t) { return t.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  tasks[idx].column = req.body.column;
  res.json(tasks[idx]);
});

router.delete("/:id", (req, res) => {
  const idx = tasks.findIndex(function(t) { return t.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  tasks.splice(idx, 1);
  res.status(204).send();
});

export default router;
