import { Router } from "express";
import { approvals } from "../data/approvals.js";

const router = Router();

// GET all approvals with optional status filter
router.get("/", (req, res) => {
  let list = [...approvals];
  if (req.query.status) list = list.filter((a) => a.status === req.query.status);
  if (req.query.approver) list = list.filter((a) => a.approver === req.query.approver);
  if (req.query.requestedBy) list = list.filter((a) => a.requestedBy === req.query.requestedBy);
  const pendingCount = approvals.filter((a) => a.status === "pending").length;
  res.json({ data: list, pendingCount });
});

// GET single
router.get("/:id", (req, res) => {
  const a = approvals.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  res.json(a);
});

// PUT approve
router.put("/:id/approve", (req, res) => {
  const a = approvals.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  a.status = "approved";
  a.comments = req.body.comments || "Approved";
  a.resolvedAt = new Date().toISOString();
  res.json(a);
});

// PUT reject
router.put("/:id/reject", (req, res) => {
  const a = approvals.find((x) => x.id === req.params.id);
  if (!a) return res.status(404).json({ message: "Not found" });
  a.status = "rejected";
  a.comments = req.body.comments || "Rejected";
  a.resolvedAt = new Date().toISOString();
  res.json(a);
});

export default router;
