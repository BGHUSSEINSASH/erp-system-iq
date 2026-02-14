import { Router } from "express";
import { auditLog, addAuditEntry } from "../data/auditLog.js";

const router = Router();

// GET all audit entries with optional filters
router.get("/", (req, res) => {
  let list = [...auditLog];
  if (req.query.action) list = list.filter((e) => e.action === req.query.action);
  if (req.query.module) list = list.filter((e) => e.module === req.query.module);
  if (req.query.user) list = list.filter((e) => e.user === req.query.user);
  res.json(list);
});

// POST create audit entry
router.post("/", (req, res) => {
  const entry = addAuditEntry(req.body);
  res.status(201).json(entry);
});

export default router;
