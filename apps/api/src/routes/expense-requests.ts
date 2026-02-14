import { Router, type Request, type Response } from "express";
import { expenseRequests } from "../data/newFeatures.js";
import { nextId } from "../data/store.js";

const router = Router();

// GET all expense requests with optional filters
router.get("/", (req: Request, res: Response) => {
  let list = [...expenseRequests];
  if (req.query.status) list = list.filter(e => e.status === req.query.status);
  if (req.query.department) list = list.filter(e => e.department === req.query.department);
  const pendingCount = expenseRequests.filter(e => e.status === "pending").length;
  const totalPending = expenseRequests.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);
  res.json({ items: list, total: list.length, pendingCount, totalPending });
});

// GET single
router.get("/:id", (req: Request, res: Response) => {
  const item = expenseRequests.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
});

// POST - create new expense request (any department can request)
router.post("/", (req: Request, res: Response) => {
  const count = expenseRequests.length + 1;
  const expense = {
    ...req.body,
    id: nextId("exp"),
    requestNo: `EXP-2026-${String(count).padStart(3, "0")}`,
    status: "pending_dept",
    approvalStage: "dept_manager",
    approvedBy: "",
    approvedAt: "",
    deptApprovedBy: "",
    deptApprovedAt: "",
    financeApprovedBy: "",
    financeApprovedAt: "",
    rejectedBy: "",
    rejectedAt: "",
    rejectionReason: "",
    paidAt: "",
    requestDate: new Date().toISOString().split("T")[0],
  };
  expenseRequests.push(expense);
  return res.status(201).json(expense);
});

// PUT - update expense
router.put("/:id", (req: Request, res: Response) => {
  const idx = expenseRequests.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  expenseRequests[idx] = { ...expenseRequests[idx], ...req.body, id: req.params.id };
  return res.json(expenseRequests[idx]);
});

// PUT - approve expense (3-level: dept_manager → finance_manager → ceo/manager)
router.put("/:id/approve", (req: Request, res: Response) => {
  const item = expenseRequests.find(e => e.id === req.params.id) as any;
  if (!item) return res.status(404).json({ message: "Not found" });
  const role = req.body.role || "";
  const approverName = req.body.approverName || role;
  const now = new Date().toISOString().split("T")[0];

  const deptManagerRoles = ["hr_manager", "finance_manager", "sales_manager", "it_manager", "production_manager", "purchasing_manager", "admin_manager"];
  const financeRoles = ["finance_manager", "finance_assistant", "finance"];
  const topRoles = ["admin", "ceo", "manager"];
  const stage = item.approvalStage || "dept_manager";

  if (stage === "dept_manager") {
    if (![...deptManagerRoles, ...topRoles].includes(role)) {
      return res.status(403).json({ message: "Only department managers can approve at this stage" });
    }
    item.deptApprovedBy = approverName;
    item.deptApprovedAt = now;
    item.approvalStage = "finance_manager";
    item.status = "pending_finance";
    return res.json(item);
  }
  if (stage === "finance_manager") {
    if (![...financeRoles, ...topRoles].includes(role)) {
      return res.status(403).json({ message: "Only finance managers can approve at this stage" });
    }
    item.financeApprovedBy = approverName;
    item.financeApprovedAt = now;
    item.approvalStage = "ceo";
    item.status = "pending_ceo";
    return res.json(item);
  }
  if (stage === "ceo") {
    if (!topRoles.includes(role)) {
      return res.status(403).json({ message: "Only CEO/Manager can give final approval" });
    }
    item.status = "approved";
    item.approvedBy = approverName;
    item.approvedAt = now;
    item.approvalStage = "completed";
    return res.json(item);
  }
  return res.status(400).json({ message: "Already processed" });
});

// PUT - reject expense
router.put("/:id/reject", (req: Request, res: Response) => {
  const item = expenseRequests.find(e => e.id === req.params.id) as any;
  if (!item) return res.status(404).json({ message: "Not found" });
  const role = req.body.role || "";
  const allApprovers = ["admin", "ceo", "manager", "hr_manager", "finance_manager", "sales_manager", "it_manager", "production_manager", "purchasing_manager", "admin_manager", "finance_assistant", "finance"];
  if (!allApprovers.includes(role)) {
    return res.status(403).json({ message: "Not authorized to reject" });
  }
  item.status = "rejected";
  item.rejectedBy = req.body.approverName || role;
  item.rejectedAt = new Date().toISOString().split("T")[0];
  item.rejectionReason = req.body.reason || "";
  return res.json(item);
});

// PUT - mark as paid (finance only)
router.put("/:id/pay", (req: Request, res: Response) => {
  const item = expenseRequests.find(e => e.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  if (item.status !== "approved") return res.status(400).json({ message: "Must be approved first" });
  item.status = "paid";
  item.paidAt = new Date().toISOString().split("T")[0];
  return res.json(item);
});

// DELETE
router.delete("/:id", (req: Request, res: Response) => {
  const idx = expenseRequests.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  expenseRequests.splice(idx, 1);
  return res.json({ message: "Deleted" });
});

export default router;
