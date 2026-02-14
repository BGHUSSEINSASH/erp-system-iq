import { Router } from "express";
import { calendarEvents, addCalendarEvent } from "../data/calendar.js";

const router = Router();

// GET all events (optionally filter by month: ?month=2026-02)
router.get("/", (req, res) => {
  let list = [...calendarEvents];
  if (req.query.month) {
    const m = req.query.month as string;
    list = list.filter((e) => e.date.startsWith(m));
  }
  if (req.query.type) {
    list = list.filter((e) => e.type === req.query.type);
  }
  list.sort((a, b) => a.date.localeCompare(b.date));
  res.json(list);
});

// GET single
router.get("/:id", (req, res) => {
  const e = calendarEvents.find((x) => x.id === req.params.id);
  if (!e) return res.status(404).json({ message: "Not found" });
  res.json(e);
});

// POST
router.post("/", (req, res) => {
  const e = addCalendarEvent(req.body);
  res.status(201).json(e);
});

// PUT
router.put("/:id", (req, res) => {
  const idx = calendarEvents.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  calendarEvents[idx] = { ...calendarEvents[idx], ...req.body, id: calendarEvents[idx].id };
  res.json(calendarEvents[idx]);
});

// DELETE
router.delete("/:id", (req, res) => {
  const idx = calendarEvents.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  calendarEvents.splice(idx, 1);
  res.status(204).send();
});

export default router;
