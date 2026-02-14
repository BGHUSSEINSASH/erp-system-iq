import { Router } from "express";
import { requirePermission } from "../security.js";
import { roles, roleInfo } from "../rbac.js";

const router = Router();

router.get("/", requirePermission("roles.read"), (req, res) => {
  return res.json({ items: roles, roleInfo });
});

export default router;
