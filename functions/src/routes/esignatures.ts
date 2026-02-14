import { Router } from "express";

const router = Router();

type Signature = { id: string; documentName: string; documentType: string; requestedBy: string; signers: { name: string; role: string; status: string; signedAt: string | null }[]; status: string; createdAt: string };

let sigIdCounter = 10;
const signatures: Signature[] = [
  { id: "sig-1", documentName: "عقد إيجار المكتب الرئيسي", documentType: "lease", requestedBy: "admin", signers: [
    { name: "مدير النظام", role: "admin", status: "signed", signedAt: "2026-02-01T10:00:00" },
    { name: "المدير المالي", role: "finance", status: "signed", signedAt: "2026-02-01T14:00:00" },
  ], status: "completed", createdAt: "2026-02-01" },
  { id: "sig-2", documentName: "عقد عمل - موظف جديد", documentType: "contract", requestedBy: "hr", signers: [
    { name: "مدير HR", role: "hr", status: "signed", signedAt: "2026-02-05T09:00:00" },
    { name: "المدير العام", role: "manager", status: "pending", signedAt: null },
  ], status: "pending", createdAt: "2026-02-05" },
  { id: "sig-3", documentName: "أمر شراء #PO-003", documentType: "purchase", requestedBy: "finance", signers: [
    { name: "المدير المالي", role: "finance", status: "signed", signedAt: "2026-02-08T11:00:00" },
    { name: "المدير العام", role: "manager", status: "pending", signedAt: null },
    { name: "مدير النظام", role: "admin", status: "pending", signedAt: null },
  ], status: "pending", createdAt: "2026-02-08" },
  { id: "sig-4", documentName: "موافقة إجازة - سارة", documentType: "approval", requestedBy: "hr", signers: [
    { name: "مدير HR", role: "hr", status: "rejected", signedAt: "2026-02-09T15:00:00" },
  ], status: "rejected", createdAt: "2026-02-09" },
];

router.get("/", (_req, res) => {
  res.json({ signatures, stats: { total: signatures.length, pending: signatures.filter(function(s) { return s.status === "pending"; }).length, completed: signatures.filter(function(s) { return s.status === "completed"; }).length, rejected: signatures.filter(function(s) { return s.status === "rejected"; }).length } });
});

router.post("/", (req, res) => {
  var sig: Signature = { id: "sig-" + (++sigIdCounter), ...req.body, status: "pending", createdAt: new Date().toISOString().slice(0, 10) };
  signatures.push(sig);
  res.status(201).json(sig);
});

router.put("/:id/sign", (req, res) => {
  var sig = signatures.find(function(s) { return s.id === req.params.id; });
  if (!sig) return res.status(404).json({ error: "Not found" });
  var signer = sig.signers.find(function(s) { return s.role === req.body.role; });
  if (signer) {
    signer.status = req.body.action || "signed";
    signer.signedAt = new Date().toISOString();
  }
  var allDone = sig.signers.every(function(s) { return s.status === "signed" || s.status === "rejected"; });
  if (allDone) {
    sig.status = sig.signers.some(function(s) { return s.status === "rejected"; }) ? "rejected" : "completed";
  }
  res.json(sig);
});

export default router;
