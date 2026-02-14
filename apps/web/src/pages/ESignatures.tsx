import { useEffect, useState } from "react";
import { get, put, post } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ESignatures() {
  const { role } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newSig, setNewSig] = useState({ documentName: "", documentType: "contract", signers: [{ name: "", role: "admin", status: "pending", signedAt: null }] });

  useEffect(function () { loadData(); }, []);

  function loadData() {
    get("/esignatures").then(function (r: any) { setData(r); setLoading(false); });
  }

  function signDocument(sigId: string, action: string) {
    put("/esignatures/" + sigId + "/sign", { role: role, action: action }).then(function () { loadData(); });
  }

  function addSignature() {
    post("/esignatures", { ...newSig, requestedBy: role }).then(function () { loadData(); setShowAdd(false); });
  }

  function addSigner() {
    var s = { name: "", role: "admin", status: "pending", signedAt: null };
    setNewSig({ ...newSig, signers: [].concat(newSig.signers as any, s as any) });
  }

  function updateSigner(idx: number, key: string, value: string) {
    var updated = newSig.signers.map(function (s: any, i: number) { return i === idx ? { ...s, [key]: value } : s; });
    setNewSig({ ...newSig, signers: updated });
  }

  function getStatusIcon(s: string) {
    if (s === "completed") return "✅";
    if (s === "pending") return "⏳";
    if (s === "rejected") return "❌";
    return "📄";
  }

  function getStatusLabel(s: string) {
    if (s === "completed") return "مكتمل / Completed";
    if (s === "pending") return "قيد الانتظار / Pending";
    if (s === "rejected") return "مرفوض / Rejected";
    return s;
  }

  if (loading || !data) return <div className="page-loading"><div className="spinner"></div></div>;

  var filtered = data.signatures.filter(function (s: any) { return filter === "all" || s.status === filter; });

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>✍️ التوقيعات الإلكترونية / E-Signatures</h2>
        <button className="btn btn-primary" onClick={function () { setShowAdd(true); }}>+ طلب توقيع جديد</button>
      </div>

      {/* Stats */}
      <div className="sig-stats">
        <div className="sig-stat"><span className="sig-stat-num">{data.stats.total}</span><span>إجمالي</span></div>
        <div className="sig-stat pending"><span className="sig-stat-num">{data.stats.pending}</span><span>قيد الانتظار</span></div>
        <div className="sig-stat completed"><span className="sig-stat-num">{data.stats.completed}</span><span>مكتمل</span></div>
        <div className="sig-stat rejected"><span className="sig-stat-num">{data.stats.rejected}</span><span>مرفوض</span></div>
      </div>

      <div className="alert-filters">
        {["all", "pending", "completed", "rejected"].map(function (f) {
          return <button key={f} className={"filter-btn" + (filter === f ? " active" : "")} onClick={function () { setFilter(f); }}>{f === "all" ? "الكل" : getStatusLabel(f)}</button>;
        })}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={function () { setShowAdd(false); }}>
          <div className="modal-content" onClick={function (e) { e.stopPropagation(); }}>
            <h2>طلب توقيع جديد / New Signature Request</h2>
            <div className="form-grid">
              <div className="form-group"><label>اسم المستند</label><input value={newSig.documentName} onChange={function (e) { setNewSig({ ...newSig, documentName: e.target.value }); }} /></div>
              <div className="form-group"><label>نوع المستند</label><select value={newSig.documentType} onChange={function (e) { setNewSig({ ...newSig, documentType: e.target.value }); }}><option value="contract">عقد</option><option value="lease">إيجار</option><option value="purchase">مشتريات</option><option value="approval">موافقة</option></select></div>
            </div>
            <h4>الموقعين / Signers</h4>
            {newSig.signers.map(function (s: any, idx: number) {
              return (
                <div key={idx} className="rb-filter-row">
                  <input placeholder="الاسم" value={s.name} onChange={function (e) { updateSigner(idx, "name", e.target.value); }} />
                  <select value={s.role} onChange={function (e) { updateSigner(idx, "role", e.target.value); }}><option value="admin">مدير</option><option value="manager">المدير العام</option><option value="hr">HR</option><option value="finance">المالية</option><option value="sales">المبيعات</option></select>
                </div>
              );
            })}
            <button className="btn btn-sm btn-outline" onClick={addSigner}>+ إضافة موقع</button>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addSignature}>إرسال</button>
              <button className="btn btn-outline" onClick={function () { setShowAdd(false); }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="signatures-list">
        {filtered.map(function (sig: any) {
          return (
            <div key={sig.id} className={"sig-card status-" + sig.status}>
              <div className="sig-card-header">
                <span className="sig-status-icon">{getStatusIcon(sig.status)}</span>
                <div>
                  <h4>{sig.documentName}</h4>
                  <span className="sig-type">{sig.documentType}</span>
                </div>
                <span className={"sig-status-badge " + sig.status}>{getStatusLabel(sig.status)}</span>
              </div>
              <div className="sig-signers">
                <h5>الموقعين:</h5>
                {sig.signers.map(function (signer: any, i: number) {
                  return (
                    <div key={i} className={"signer-row status-" + signer.status}>
                      <span className="signer-icon">{signer.status === "signed" ? "✅" : signer.status === "rejected" ? "❌" : "⏳"}</span>
                      <span className="signer-name">{signer.name} ({signer.role})</span>
                      {signer.signedAt && <span className="signer-date">{new Date(signer.signedAt).toLocaleString("ar-IQ")}</span>}
                      {signer.status === "pending" && signer.role === role && (
                        <div className="signer-actions">
                          <button className="btn btn-xs btn-primary" onClick={function () { signDocument(sig.id, "signed"); }}>✍️ توقيع</button>
                          <button className="btn btn-xs btn-danger" onClick={function () { signDocument(sig.id, "rejected"); }}>❌ رفض</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="sig-footer">
                <span>👤 {sig.requestedBy}</span>
                <span>📅 {sig.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
