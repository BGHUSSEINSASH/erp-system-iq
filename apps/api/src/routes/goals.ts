import { Router } from "express";

const router = Router();

type Goal = { id: string; title: string; titleEn: string; department: string; type: string; target: number; current: number; unit: string; startDate: string; endDate: string; status: string; owner: string };

let goalIdCounter = 10;
const goals: Goal[] = [
  { id: "g-1", title: "زيادة الإيرادات", titleEn: "Increase Revenue", department: "المبيعات", type: "quarterly", target: 500000, current: 320000, unit: "د.ع", startDate: "2026-01-01", endDate: "2026-03-31", status: "on-track", owner: "sales" },
  { id: "g-2", title: "تقليل التكاليف التشغيلية", titleEn: "Reduce Operating Costs", department: "المالية", type: "quarterly", target: 15, current: 8, unit: "%", startDate: "2026-01-01", endDate: "2026-03-31", status: "on-track", owner: "finance" },
  { id: "g-3", title: "توظيف موظفين جدد", titleEn: "Hire New Employees", department: "الموارد البشرية", type: "quarterly", target: 5, current: 2, unit: "موظف", startDate: "2026-01-01", endDate: "2026-03-31", status: "at-risk", owner: "hr" },
  { id: "g-4", title: "رضا العملاء", titleEn: "Customer Satisfaction", department: "المبيعات", type: "annual", target: 95, current: 87, unit: "%", startDate: "2026-01-01", endDate: "2026-12-31", status: "on-track", owner: "sales" },
  { id: "g-5", title: "تدريب الموظفين", titleEn: "Employee Training", department: "الموارد البشرية", type: "annual", target: 40, current: 12, unit: "ساعة", startDate: "2026-01-01", endDate: "2026-12-31", status: "on-track", owner: "hr" },
  { id: "g-6", title: "تحسين وقت الاستجابة", titleEn: "Improve Response Time", department: "IT", type: "quarterly", target: 2, current: 3.5, unit: "ساعة", startDate: "2026-01-01", endDate: "2026-03-31", status: "behind", owner: "admin" },
  { id: "g-7", title: "زيادة المبيعات الجديدة", titleEn: "New Sales Growth", department: "المبيعات", type: "annual", target: 20, current: 5, unit: "عميل", startDate: "2026-01-01", endDate: "2026-12-31", status: "on-track", owner: "sales" },
  { id: "g-8", title: "خفض معدل الدوران الوظيفي", titleEn: "Reduce Turnover Rate", department: "الموارد البشرية", type: "annual", target: 5, current: 8, unit: "%", startDate: "2026-01-01", endDate: "2026-12-31", status: "at-risk", owner: "hr" },
];

router.get("/", (_req, res) => {
  var stats = {
    total: goals.length,
    onTrack: goals.filter(function(g) { return g.status === "on-track"; }).length,
    atRisk: goals.filter(function(g) { return g.status === "at-risk"; }).length,
    behind: goals.filter(function(g) { return g.status === "behind"; }).length,
    completed: goals.filter(function(g) { return g.status === "completed"; }).length,
  };
  res.json({ goals, stats });
});

router.post("/", (req, res) => {
  var goal: Goal = { id: "g-" + (++goalIdCounter), ...req.body };
  goals.push(goal);
  res.status(201).json(goal);
});

router.put("/:id", (req, res) => {
  var idx = goals.findIndex(function(g) { return g.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  Object.assign(goals[idx], req.body);
  // Auto-update status
  var g = goals[idx];
  var pct = g.unit === "%" && g.title.indexOf("تقليل") >= 0 ? (g.current / g.target) * 100 : (g.current / g.target) * 100;
  if (pct >= 100) g.status = "completed";
  res.json(goals[idx]);
});

router.delete("/:id", (req, res) => {
  var idx = goals.findIndex(function(g) { return g.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  goals.splice(idx, 1);
  res.status(204).send();
});

export default router;
