import { Router } from "express";

const router = Router();

type Document = { id: string; name: string; type: string; size: string; category: string; uploadedBy: string; uploadDate: string; relatedTo: string; relatedId: string; description: string };

let docIdCounter = 10;
const documents: Document[] = [
  { id: "doc-1", name: "فاتورة_1001.pdf", type: "pdf", size: "245 KB", category: "فواتير", uploadedBy: "admin", uploadDate: "2026-02-01", relatedTo: "invoice", relatedId: "inv-1", description: "فاتورة مبيعات Alpha Corp" },
  { id: "doc-2", name: "عقد_ايجار_مكتب.pdf", type: "pdf", size: "1.2 MB", category: "عقود", uploadedBy: "admin", uploadDate: "2026-01-15", relatedTo: "lease", relatedId: "la-1", description: "عقد إيجار المكتب الرئيسي" },
  { id: "doc-3", name: "سيرة_ذلاتية_احمد.pdf", type: "pdf", size: "380 KB", category: "موارد بشرية", uploadedBy: "hr", uploadDate: "2026-02-05", relatedTo: "employee", relatedId: "e-1", description: "السيرة الذاتية" },
  { id: "doc-4", name: "تقرير_مالي_Q4.xlsx", type: "excel", size: "520 KB", category: "تقارير", uploadedBy: "finance", uploadDate: "2026-01-30", relatedTo: "report", relatedId: "r-1", description: "التقرير المالي للربع الرابع" },
  { id: "doc-5", name: "صورة_ممتلكات.jpg", type: "image", size: "2.1 MB", category: "ممتلكات", uploadedBy: "admin", uploadDate: "2026-02-03", relatedTo: "property", relatedId: "p-1", description: "صورة المبنى الرئيسي" },
  { id: "doc-6", name: "عرض_سعر_مورد.pdf", type: "pdf", size: "156 KB", category: "مشتريات", uploadedBy: "finance", uploadDate: "2026-02-07", relatedTo: "vendor", relatedId: "v-1", description: "عرض سعر من Steel Works" },
];

router.get("/", (req, res) => {
  var cat = req.query.category as string;
  var filtered = cat ? documents.filter(function(d) { return d.category === cat; }) : documents;
  var categories = [...new Set(documents.map(function(d) { return d.category; }))];
  res.json({ documents: filtered, categories, total: documents.length });
});

router.post("/", (req, res) => {
  var doc: Document = { id: "doc-" + (++docIdCounter), ...req.body, uploadDate: new Date().toISOString().slice(0, 10) };
  documents.push(doc);
  res.status(201).json(doc);
});

router.delete("/:id", (req, res) => {
  var idx = documents.findIndex(function(d) { return d.id === req.params.id; });
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  documents.splice(idx, 1);
  res.status(204).send();
});

export default router;
