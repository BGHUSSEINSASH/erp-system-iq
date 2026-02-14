import { Router, type Request, type Response } from "express";
import { employeeLoans } from "../data/newFeatures.js";
import { nextId } from "../data/store.js";

const router = Router();

// GET all loans with optional filters
router.get("/", (req: Request, res: Response) => {
  let list = [...employeeLoans];
  if (req.query.status) list = list.filter(l => l.status === req.query.status);
  if (req.query.department) list = list.filter(l => l.department === req.query.department);
  const pendingCount = employeeLoans.filter(l => l.status === "pending").length;
  res.json({ items: list, total: list.length, pendingCount });
});

// GET single
router.get("/:id", (req: Request, res: Response) => {
  const item = employeeLoans.find(l => l.id === req.params.id);
  if (!item) return res.status(404).json({ message: "Not found" });
  return res.json(item);
});

// POST - create new loan request (any department can request)
router.post("/", (req: Request, res: Response) => {
  const loan = {
    ...req.body,
    id: nextId("loan"),
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
    requestDate: new Date().toISOString().split("T")[0],
    totalPaid: 0,
    paidInstallments: 0,
    remaining: req.body.loanAmount || 0,
    monthlyDeduction: (req.body.loanAmount || 0) / (req.body.installments || 10),
  };
  employeeLoans.push(loan);
  return res.status(201).json(loan);
});

// PUT - update loan
router.put("/:id", (req: Request, res: Response) => {
  const idx = employeeLoans.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  employeeLoans[idx] = { ...employeeLoans[idx], ...req.body, id: req.params.id };
  return res.json(employeeLoans[idx]);
});

// PUT - approve loan (3-level: dept_manager → finance_manager → ceo/manager)
router.put("/:id/approve", (req: Request, res: Response) => {
  const item = employeeLoans.find(l => l.id === req.params.id) as any;
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
    item.status = "active";
    item.approvedBy = approverName;
    item.approvedAt = now;
    item.approvalStage = "completed";
    return res.json(item);
  }
  return res.status(400).json({ message: "Already processed" });
});

// PUT - reject loan
router.put("/:id/reject", (req: Request, res: Response) => {
  const item = employeeLoans.find(l => l.id === req.params.id) as any;
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

// DELETE
router.delete("/:id", (req: Request, res: Response) => {
  const idx = employeeLoans.findIndex(l => l.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  employeeLoans.splice(idx, 1);
  return res.json({ message: "Deleted" });
});

export default router;
