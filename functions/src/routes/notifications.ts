import { Router } from "express";
import { notifications, addNotification } from "../data/notifications.js";

const router = Router();

// GET all notifications (optionally filter by ?unread=true)
router.get("/", (_req, res) => {
  const unreadOnly = _req.query.unread === "true";
  const list = unreadOnly ? notifications.filter((n) => !n.read) : notifications;
  res.json({ data: list, unreadCount: notifications.filter((n) => !n.read).length });
});

// POST create notification
router.post("/", (req, res) => {
  const n = addNotification(req.body);
  res.status(201).json(n);
});

// PUT mark as read
router.put("/:id/read", (req, res) => {
  const n = notifications.find((x) => x.id === req.params.id);
  if (!n) return res.status(404).json({ message: "Not found" });
  n.read = true;
  res.json(n);
});

// PUT mark all as read
router.put("/read-all", (_req, res) => {
  notifications.forEach((n) => (n.read = true));
  res.json({ success: true });
});

// DELETE
router.delete("/:id", (req, res) => {
  const idx = notifications.findIndex((x) => x.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  notifications.splice(idx, 1);
  res.status(204).send();
});

export default router;
