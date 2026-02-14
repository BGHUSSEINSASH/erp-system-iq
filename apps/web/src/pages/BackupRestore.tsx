import { useState, useEffect } from "react";
import { get, post } from "../api";

export default function BackupRestore() {
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  useEffect(function () {
    get("/backup/history").then(function (r: any) { setBackups(r.backups); setLoading(false); });
  }, []);

  function exportBackup() {
    setExporting(true);
    get("/backup/export").then(function (data: any) {
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "erp_backup_" + new Date().toISOString().slice(0, 10) + ".json";
      a.click();
      URL.revokeObjectURL(url);
      setExporting(false);
    });
  }

  function handleImport(e: any) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev: any) {
      try {
        var data = JSON.parse(ev.target.result);
        post("/backup/import", data).then(function (r: any) { setImportResult(r); });
      } catch (err) {
        setImportResult({ ok: false, message: "ملف غير صالح / Invalid file" });
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>💾 النسخ الاحتياطي والاستعادة / Backup & Restore</h2>
      </div>

      {/* Actions */}
      <div className="backup-actions">
        <div className="backup-action-card">
          <div className="backup-icon">📤</div>
          <h3>تصدير نسخة احتياطية / Export Backup</h3>
          <p>تنزيل نسخة كاملة من جميع البيانات بصيغة JSON</p>
          <button className="btn btn-primary" onClick={exportBackup} disabled={exporting}>{exporting ? "جاري التصدير..." : "🔽 تصدير الآن"}</button>
        </div>

        <div className="backup-action-card">
          <div className="backup-icon">📥</div>
          <h3>استيراد نسخة احتياطية / Import Backup</h3>
          <p>استعادة البيانات من ملف نسخة احتياطية</p>
          <label className="btn btn-outline file-input-label">
            🔼 اختر ملف
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {importResult && (
        <div className={"import-result " + (importResult.ok ? "success" : "error")}>
          <p>{importResult.ok ? "✅" : "❌"} {importResult.message}</p>
          {importResult.tables && <p>📦 {importResult.tables} جداول، {importResult.totalRecords} سجل</p>}
        </div>
      )}

      {/* Backup History */}
      <div className="backup-history">
        <h2>📋 سجل النسخ الاحتياطية / Backup History</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>التاريخ / Date</th>
                <th>الحجم / Size</th>
                <th>النوع / Type</th>
                <th>الحالة / Status</th>
              </tr>
            </thead>
            <tbody>
              {backups.map(function (b: any) {
                return (
                  <tr key={b.id}>
                    <td>{b.date}</td>
                    <td>{b.size}</td>
                    <td><span className={"backup-type-badge " + b.type}>{b.type === "auto" ? "تلقائي" : "يدوي"}</span></td>
                    <td><span className={"status-badge " + b.status}>{b.status === "success" ? "✅ ناجح" : "❌ فشل"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
