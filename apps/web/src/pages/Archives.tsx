import { useEffect, useState, useRef } from "react";
import { useI18n } from "../i18n";
import { get, post, put, del } from "../api";
import DataTable, { type Column } from "../components/DataTable";
import Modal from "../components/Modal";
import FormField from "../components/FormField";
import { generatePDFReport } from "../utils/pdf";

type Doc = { id: string; title: string; category: string; department: string; uploadedBy: string; uploadDate: string; fileType: string; fileSize: string; tags: string; description: string; status: string; fileName: string; fileData: string };
type Dept = { id: string; name: string };

const empty: Omit<Doc, "id"> = { title: "", category: "other", department: "", uploadedBy: "", uploadDate: "", fileType: "PDF", fileSize: "", tags: "", description: "", status: "active", fileName: "", fileData: "" };

const catLabels: Record<string, string> = {
  contracts: "📄 عقود / Contracts", invoices: "🧾 فواتير / Invoices", reports: "📊 تقارير / Reports",
  legal: "⚖️ قانوني / Legal", hr: "👥 موارد بشرية / HR", financial: "💰 مالي / Financial",
  technical: "🔧 تقني / Technical", other: "📁 أخرى / Other",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function Archives() {
  const { t } = useI18n();
  const [items, setItems] = useState<Doc[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detail, setDetail] = useState<Doc | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => get<{ items: Doc[] }>("/archives").then(r => setItems(r.items));
  const loadDepts = () => get<{ items: Dept[] }>("/departments").then(r => setDepartments(r.items));
  useEffect(() => { load(); loadDepts(); }, []);

  const filtered = items.filter(i => {
    if (filter !== "all" && i.category !== filter) return false;
    if (searchQ && !i.title.toLowerCase().includes(searchQ.toLowerCase()) && !i.tags?.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const columns: Column<Doc>[] = [
    { key: "title", header: "📄 العنوان / Title", render: (v, row) => (
      <button onClick={() => setDetail(row)} style={{ fontWeight: 600, background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
        {getFileIcon((row as Doc).fileType)} {String(v)}
      </button>
    )},
    { key: "category", header: "📂 التصنيف", render: v => <span className="badge badge-info">{catLabels[String(v)] || String(v)}</span> },
    { key: "department", header: "🏢 القسم" },
    { key: "uploadedBy", header: "👤 المحمل" },
    { key: "uploadDate", header: "📅 تاريخ الرفع" },
    { key: "fileType", header: "📋 النوع", render: v => <span className="badge" style={{ background: "rgba(99,102,241,0.15)", color: "#6366f1" }}>{String(v)}</span> },
    { key: "fileSize", header: "💾 الحجم" },
    { key: "fileName", header: "📎 الملف", render: v => v ? <span style={{ fontSize: 12, opacity: 0.7 }}>✅ مرفق</span> : <span style={{ fontSize: 12, opacity: 0.4 }}>—</span> },
    { key: "tags", header: "🏷️ الوسوم", render: v => (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {String(v || "").split(",").filter(Boolean).map((tag, i) => <span key={i} className="badge" style={{ fontSize: 10, background: "rgba(99,102,241,0.15)" }}>{tag.trim()}</span>)}
      </div>
    )},
    { key: "status", header: "الحالة", render: v => {
      const c = String(v) === "active" ? "#22c55e" : "#f59e0b";
      return <span className="badge" style={{ background: `${c}20`, color: c }}>{String(v) === "active" ? "✅ نشط" : "📦 مؤرشف"}</span>;
    }},
  ];

  const openAdd = () => { setForm(empty); setEditId(null); setUploadedFile(null); setShowModal(true); };
  const openEdit = (item: Doc) => { setForm(item); setEditId(item.id); setUploadedFile(null); setShowModal(true); };
  const handleDelete = async (item: Doc) => { if (confirm(t("confirmDelete"))) { await del(`/archives/${item.id}`); load(); } };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    const ext = file.name.split(".").pop()?.toUpperCase() || "OTHER";
    const typeMap: Record<string, string> = { PDF: "PDF", DOCX: "DOCX", DOC: "DOCX", XLSX: "XLSX", XLS: "XLSX", JPG: "IMG", JPEG: "IMG", PNG: "IMG", GIF: "IMG" };
    setForm(f => ({
      ...f,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: typeMap[ext] || ext,
      title: f.title || file.name.replace(/\.[^.]+$/, ""),
    }));
    // Read as base64 for storage
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, fileData: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, uploadDate: editId ? form.uploadDate : new Date().toISOString().slice(0, 10) };
    if (editId) await put(`/archives/${editId}`, payload);
    else await post("/archives", payload);
    setShowModal(false); load();
  };

  const downloadFile = (doc: Doc) => {
    if (doc.fileData) {
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.fileName || doc.title;
      link.click();
    }
  };

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const exportPDF = () => {
    generatePDFReport({
      title: "تقرير الأرشيف / Archive Report",
      columns: [
        { key: "title", header: "العنوان" }, { key: "category", header: "التصنيف", render: v => catLabels[String(v)] || String(v) },
        { key: "department", header: "القسم" }, { key: "fileType", header: "النوع" },
        { key: "fileSize", header: "الحجم" }, { key: "uploadDate", header: "التاريخ" },
        { key: "status", header: "الحالة" },
      ],
      data: filtered as unknown as Record<string, unknown>[],
      stats: [
        { label: "إجمالي المستندات", value: items.length },
        { label: "نشطة", value: items.filter(i => i.status === "active").length },
        { label: "مؤرشفة", value: items.filter(i => i.status === "archived").length },
      ],
    });
  };

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🗄️ نظام الأرشفة الإلكترونية / Electronic Archive</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-primary" onClick={openAdd}>+ مستند جديد / New Document</button>
          <button className="btn btn-secondary" onClick={exportPDF}>📄 PDF</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        {[
          { icon: "📁", label: "إجمالي المستندات / Total", value: items.length, color: "#6366f1" },
          { icon: "✅", label: "نشطة / Active", value: items.filter(i => i.status === "active").length, color: "#22c55e" },
          { icon: "📦", label: "مؤرشفة / Archived", value: items.filter(i => i.status === "archived").length, color: "#f59e0b" },
          { icon: "📎", label: "مع مرفقات / With Files", value: items.filter(i => i.fileName).length, color: "#3b82f6" },
        ].map((s, i) => (
          <div key={i} style={{ background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`, borderRadius: 14, padding: 20, border: `1px solid ${s.color}30`, display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ fontSize: 32 }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="🔍 بحث / Search..." value={searchQ} onChange={e => setSearchQ(e.target.value)} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--ink)", fontSize: 13, minWidth: 200 }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button className={"btn " + (filter === "all" ? "btn-primary" : "btn-secondary")} onClick={() => setFilter("all")} style={{ fontSize: 12 }}>📋 الكل ({items.length})</button>
          {Object.entries(catLabels).map(([key, label]) => {
            const count = items.filter(i => i.category === key).length;
            return count > 0 ? <button key={key} className={"btn " + (filter === key ? "btn-primary" : "btn-secondary")} onClick={() => setFilter(key)} style={{ fontSize: 12 }}>{label} ({count})</button> : null;
          })}
        </div>
      </div>

      <DataTable columns={columns} data={filtered} onEdit={openEdit} onDelete={handleDelete} />

      {/* Detail */}
      {detail && (
        <Modal title={"📋 تفاصيل المستند — " + detail.title} onClose={() => setDetail(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 14 }}>
            <div><strong>📄 العنوان:</strong> {detail.title}</div>
            <div><strong>📂 التصنيف:</strong> {catLabels[detail.category]}</div>
            <div><strong>🏢 القسم:</strong> {detail.department || "—"}</div>
            <div><strong>👤 المحمل:</strong> {detail.uploadedBy || "—"}</div>
            <div><strong>📅 تاريخ الرفع:</strong> {detail.uploadDate}</div>
            <div><strong>📋 النوع:</strong> {detail.fileType}</div>
            <div><strong>💾 الحجم:</strong> {detail.fileSize || "—"}</div>
            <div><strong>📋 الحالة:</strong> {detail.status}</div>
            {detail.tags && <div style={{ gridColumn: "1/-1" }}><strong>🏷️ الوسوم:</strong> {detail.tags}</div>}
            {detail.description && <div style={{ gridColumn: "1/-1" }}><strong>📝 الوصف:</strong> {detail.description}</div>}
            {detail.fileName && (
              <div style={{ gridColumn: "1/-1", borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                <strong>📎 الملف المرفق:</strong> {detail.fileName}
                {detail.fileData && (
                  <button className="btn btn-primary" style={{ marginRight: 12, padding: "4px 16px", fontSize: 12 }} onClick={() => downloadFile(detail)}>
                    📥 تحميل / Download
                  </button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editId ? "✏️ تعديل مستند" : "➕ مستند جديد / New Document"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="form-grid">
            {/* File Upload Zone */}
            <div style={{ gridColumn: "1/-1", border: "2px dashed var(--border)", borderRadius: 14, padding: 30, textAlign: "center", cursor: "pointer", background: uploadedFile ? "rgba(34,197,94,0.08)" : "rgba(99,102,241,0.05)", transition: "all 0.3s" }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#6366f1"; }}
              onDragLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; }}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "var(--border)";
                const file = e.dataTransfer.files[0];
                if (file) {
                  const fakeEvent = { target: { files: [file] } } as any;
                  handleFileUpload(fakeEvent);
                }
              }}>
              <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt,.csv" />
              {uploadedFile || form.fileName ? (
                <div>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{getFileIcon(form.fileType)}</div>
                  <div style={{ fontWeight: 700, color: "#22c55e" }}>✅ {form.fileName}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>{form.fileSize} — {form.fileType}</div>
                  <div style={{ fontSize: 12, color: "#6366f1", marginTop: 8 }}>انقر لتغيير الملف / Click to change</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 48, marginBottom: 8 }}>📤</div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>اسحب الملف هنا أو انقر للتحميل</div>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>Drag & drop or click to upload</div>
                  <div style={{ fontSize: 12, opacity: 0.4, marginTop: 8 }}>PDF, DOCX, XLSX, JPG, PNG — حتى 10 MB</div>
                </div>
              )}
            </div>

            <FormField label="📄 العنوان / Title" value={form.title} onChange={set("title")} required />
            <FormField label="📂 التصنيف / Category" value={form.category} type="select" onChange={set("category")}
              options={Object.entries(catLabels).map(([v, l]) => ({ label: l, value: v }))} />
            <FormField label="🏢 القسم / Department" value={form.department} type="select" onChange={set("department")}
              options={departments.map(d => ({ label: d.name, value: d.name }))} />
            <FormField label="👤 المحمل / Uploaded By" value={form.uploadedBy} onChange={set("uploadedBy")} />
            <FormField label="🏷️ الوسوم / Tags (comma separated)" value={form.tags} onChange={set("tags")} placeholder="عقد, مالي, 2026" />
            <FormField label="📝 الوصف / Description" value={form.description} type="textarea" onChange={set("description")} />
            <FormField label="📋 الحالة / Status" value={form.status} type="select" onChange={set("status")} options={[
              { label: "✅ نشط / Active", value: "active" },
              { label: "📦 مؤرشف / Archived", value: "archived" },
            ]} />
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button type="submit" className="btn btn-primary">💾 حفظ / Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function getFileIcon(type: string): string {
  const icons: Record<string, string> = { PDF: "📕", DOCX: "📘", DOC: "📘", XLSX: "📗", XLS: "📗", IMG: "🖼️", JPG: "🖼️", PNG: "🖼️" };
  return icons[type] || "📄";
}