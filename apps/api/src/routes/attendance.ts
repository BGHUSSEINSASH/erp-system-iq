import { Router } from "express";
import { attendance } from "../data/store.js";

const router = Router();

// GET all attendance records (optionally filter by date)
router.get("/", (req, res) => {
  const { date, from, to } = req.query;
  let items = attendance;
  if (date) items = items.filter(a => a.date === date);
  if (from && to) items = items.filter(a => a.date >= String(from) && a.date <= String(to));
  res.json({ items, total: items.length });
});

// GET attendance for a specific employee
router.get("/employee/:name", (req, res) => {
  const items = attendance.filter(a => a.employeeName === req.params.name);
  res.json({ items, total: items.length });
});

// GET exceptions
router.get("/exceptions", (_req, res) => {
  const items = attendance.filter(a => a.exceptionReason);
  res.json({ items, total: items.length });
});

// POST new attendance record (check-in)
router.post("/", (req, res) => {
  const id = "a-" + Date.now();
  const record = { id, ...req.body };
  attendance.push(record);
  res.json(record);
});

// PUT update attendance record (check-out, late minutes, etc.)
router.put("/:id", (req, res) => {
  const idx = attendance.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "not found" });
  attendance[idx] = { ...attendance[idx], ...req.body };
  res.json(attendance[idx]);
});

// POST add exception
router.post("/exception", (req, res) => {
  const { attendanceId, reason, approvedBy, employeeName, date, checkIn, checkOut, status } = req.body;

  // If attendanceId provided, update existing record
  if (attendanceId) {
    const rec = attendance.find(a => a.id === attendanceId);
    if (!rec) return res.status(404).json({ error: "not found" });
    rec.exceptionReason = reason;
    rec.exceptionApprovedBy = approvedBy || "";
    rec.exceptionStatus = "pending";
    rec.status = "exception";
    return res.json(rec);
  }

  // Otherwise create new exception record
  const id = "a-" + Date.now();
  const newRec = {
    id,
    employeeName: employeeName || "",
    employeeId: "",
    date: date || new Date().toISOString().split("T")[0],
    checkIn: checkIn || "",
    checkOut: checkOut || "",
    status: (status || "exception") as any,
    exceptionReason: reason,
    exceptionApprovedBy: approvedBy || "",
    exceptionStatus: "pending" as const,
    lateMinutes: 0,
  };
  attendance.push(newRec as any);
  res.json(newRec);
});

// PUT approve/reject exception
router.put("/exception/:id", (req, res) => {
  const rec = attendance.find(a => a.id === req.params.id);
  if (!rec) return res.status(404).json({ error: "not found" });
  rec.exceptionStatus = req.body.status;
  rec.exceptionApprovedBy = req.body.approvedBy || rec.exceptionApprovedBy;
  if (req.body.status === "approved") rec.status = "exception";
  res.json(rec);
});

// PUT update late minutes
router.put("/late/:id", (req, res) => {
  const rec = attendance.find(a => a.id === req.params.id);
  if (!rec) return res.status(404).json({ error: "not found" });
  rec.lateMinutes = req.body.lateMinutes;
  if (req.body.lateMinutes > 0 && rec.status === "present") rec.status = "late";
  res.json(rec);
});

// DELETE attendance record
router.delete("/:id", (req, res) => {
  const idx = attendance.findIndex(a => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "not found" });
  attendance.splice(idx, 1);
  res.json({ success: true });
});

export default router;
