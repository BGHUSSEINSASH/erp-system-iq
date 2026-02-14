import { Router, type Request, type Response } from "express";
import {
  employees,
  tickets,
  itAssets,
  users,
} from "../data/store.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const totalAssets = itAssets.length;
  const activeAssets = itAssets.filter((a) => a.status === "active").length;
  const maintenanceAssets = itAssets.filter((a) => a.status === "maintenance").length;
  const retiredAssets = itAssets.filter((a) => a.status === "retired").length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter((t) => t.status === "in-progress").length;
  const totalEmployees = employees.length;
  const totalUsers = users.length;

  const now = new Date();
  const uptime = Math.floor(process.uptime());
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);

  const services = [
    { name: "API Server", status: "online", uptime: h + "h " + m + "m" },
    { name: "Database", status: "online", uptime: h + "h " + m + "m" },
    { name: "Email Server", status: openTickets > 2 ? "degraded" : "online", uptime: h + "h " + m + "m" },
    { name: "Backup Service", status: "online", uptime: h + "h " + m + "m" },
  ];

  // Warranty alerts – assets expiring within 90 days
  const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const warrantyAlerts = itAssets
    .filter((a) => a.status === "active" && new Date(a.warranty) <= in90)
    .map((a) => ({ id: a.id, name: a.name, warranty: a.warranty }));

  res.json({
    summary: { totalAssets, activeAssets, maintenanceAssets, retiredAssets, openTickets, inProgressTickets, totalEmployees, totalUsers },
    services,
    warrantyAlerts,
    assetsByCategory: itAssets.reduce((acc: Record<string, number>, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc; }, {}),
  });
});

export default router;
