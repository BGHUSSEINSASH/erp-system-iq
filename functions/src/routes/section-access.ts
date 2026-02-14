import { Router } from "express";
import {
  allSections,
  getSectionAccess,
  getSectionAccessForRole,
  updateSectionAccess,
} from "../data/sectionAccess.js";

const router = Router();

// GET /section-access - returns full map of role -> sections
router.get("/", (_req, res) => {
  res.json({
    accessMap: getSectionAccess(),
    allSections,
    roles: ["admin", "ceo", "manager", "hr_manager", "hr_assistant", "hr", "finance_manager", "finance_assistant", "finance", "sales_manager", "sales_assistant", "sales", "it_manager", "it_assistant", "it", "production_manager", "production_assistant", "production", "purchasing_manager", "purchasing_assistant", "purchasing", "admin_manager", "admin_assistant", "employee"],
  });
});

// GET /section-access/:role - returns sections for a specific role
router.get("/:role", (req, res) => {
  const sections = getSectionAccessForRole(req.params.role);
  res.json({ role: req.params.role, sections });
});

// PUT /section-access/:role - update sections for a role
router.put("/:role", (req, res) => {
  const { role } = req.params;
  const { sections } = req.body;

  if (role === "admin") {
    return res.status(400).json({ error: "Cannot modify admin access" });
  }

  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: "sections must be an array" });
  }

  // Validate all sections exist
  const invalid = sections.filter((s: string) => !allSections.includes(s));
  if (invalid.length > 0) {
    return res.status(400).json({ error: "Invalid sections: " + invalid.join(", ") });
  }

  updateSectionAccess(role, sections);
  res.json({ ok: true, role, sections });
});

export default router;
