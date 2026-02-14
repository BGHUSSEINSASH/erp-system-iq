import { useEffect, useState } from "react";
import { get, post, del } from "../api";

export default function DocumentsManager() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: "", type: "pdf", category: "", description: "", relatedTo: "", relatedId: "", size: "N/A", uploadedBy: "admin" });

  useEffect(function () { loadData(); }, []);

  function loadData() {
    var url = filter ? "/documents?category=" + encodeURIComponent(filter) : "/documents";
    get(url).then(function (r: any) { setDocuments(r.documents); setCategories(r.categories); setLoading(false); });
  }

  useEffect(function () { loadData(); }, [filter]);

  function addDoc() {
    post("/documents", newDoc).then(function () { loadData(); setShowAdd(false); setNewDoc({ name: "", type: "pdf", category: "", description: "", relatedTo: "", relatedId: "", size: "N/A", uploadedBy: "admin" }); });
  }

  function deleteDoc(id: string) {
    if (confirm("حذف المستند؟")) del("/documents/" + id).then(function () { loadData(); });
  }

  function getTypeIcon(type: string) {
    if (type === "pdf") return "📄";
    if (type === "excel") return "📊";
    if (type === "image") return "🖼️";
    if (type === "word") return "📝";
    return "📎";
  }

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📁 المستندات والمرفقات / Documents</h2>
        <button className="btn btn-primary" onClick={function () { setShowAdd(true); }}>+ إضافة مستند</button>
      </div>

      <div className="doc-filters">
        <button className={"filter-btn" + (filter === "" ? " active" : "")} onClick={function () { setFilter(""); }}>الكل ({documents.length})</button>
        {categories.map(function (cat) {
          return <button key={cat} className={"filter-btn" + (filter === cat ? " active" : "")} onClick={function () { setFilter(cat); }}>{cat}</button>;
        })}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={function () { setShowAdd(false); }}>
          <div className="modal-content" onClick={function (e) { e.stopPropagation(); }}>
            <h2>إضافة مستند / Add Document</h2>
            <div className="form-grid">
              <div className="form-group"><label>اسم الملف</label><input value={newDoc.name} onChange={function (e) { setNewDoc({ ...newDoc, name: e.target.value }); }} /></div>
              <div className="form-group"><label>النوع</label><select value={newDoc.type} onChange={function (e) { setNewDoc({ ...newDoc, type: e.target.value }); }}><option value="pdf">PDF</option><option value="excel">Excel</option><option value="image">Image</option><option value="word">Word</option></select></div>
              <div className="form-group"><label>التصنيف</label><input value={newDoc.category} onChange={function (e) { setNewDoc({ ...newDoc, category: e.target.value }); }} /></div>
              <div className="form-group"><label>الوصف</label><input value={newDoc.description} onChange={function (e) { setNewDoc({ ...newDoc, description: e.target.value }); }} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addDoc}>حفظ</button>
              <button className="btn btn-outline" onClick={function () { setShowAdd(false); }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="documents-grid">
        {documents.map(function (doc: any) {
          return (
            <div key={doc.id} className="doc-card">
              <div className="doc-icon">{getTypeIcon(doc.type)}</div>
              <div className="doc-info">
                <h4>{doc.name}</h4>
                <p>{doc.description}</p>
                <div className="doc-meta">
                  <span>📁 {doc.category}</span>
                  <span>📏 {doc.size}</span>
                  <span>👤 {doc.uploadedBy}</span>
                  <span>📅 {doc.uploadDate}</span>
                </div>
              </div>
              <div className="doc-actions">
                <button className="btn btn-sm btn-outline" onClick={function () { deleteDoc(doc.id); }}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
