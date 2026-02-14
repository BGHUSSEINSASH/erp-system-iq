import { useEffect, useState } from "react";
import { get, post } from "../api";

export default function ReportBuilder() {
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState("");
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [reportData, setReportData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(function () {
    get("/report-builder/sources").then(function (r: any) { setSources(r.sources); setLoading(false); });
  }, []);

  function onSourceChange(source: string) {
    setSelectedSource(source);
    var s = sources.find(function (x) { return x.id === source; });
    if (s) { setAvailableFields(s.fields); setSelectedFields(s.fields.slice(0, 5)); }
    setReportData(null);
    setFilters([]);
  }

  function toggleField(field: string) {
    if (selectedFields.indexOf(field) >= 0) {
      setSelectedFields(selectedFields.filter(function (f) { return f !== field; }));
    } else {
      setSelectedFields([].concat(selectedFields as any, field as any));
    }
  }

  function addFilter() {
    setFilters([].concat(filters as any, { field: availableFields[0] || "", operator: "contains", value: "" } as any));
  }

  function updateFilter(idx: number, key: string, value: string) {
    var updated = filters.map(function (f, i) { return i === idx ? { ...f, [key]: value } : f; });
    setFilters(updated);
  }

  function removeFilter(idx: number) {
    setFilters(filters.filter(function (_, i) { return i !== idx; }));
  }

  function generateReport() {
    setGenerating(true);
    post("/report-builder/generate", { source: selectedSource, fields: selectedFields, filters: filters.filter(function (f) { return f.value; }), sortBy, sortDir }).then(function (r: any) {
      setReportData(r.data);
      setGenerating(false);
    });
  }

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🛠️ منشئ التقارير / Report Builder</h2>
      </div>

      <div className="report-builder-layout">
        {/* Config Panel */}
        <div className="rb-config-panel">
          <div className="rb-section">
            <h3>📦 مصدر البيانات / Data Source</h3>
            <select value={selectedSource} onChange={function (e) { onSourceChange(e.target.value); }} className="rb-select">
              <option value="">اختر مصدر البيانات...</option>
              {sources.map(function (s) { return <option key={s.id} value={s.id}>{s.label} ({s.count} سجل)</option>; })}
            </select>
          </div>

          {selectedSource && (
            <>
              <div className="rb-section">
                <h3>📋 الحقول / Fields</h3>
                <div className="rb-fields-list">
                  {availableFields.map(function (field) {
                    return (
                      <label key={field} className="rb-field-check">
                        <input type="checkbox" checked={selectedFields.indexOf(field) >= 0} onChange={function () { toggleField(field); }} />
                        <span>{field}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="rb-section">
                <h3>🔍 الفلاتر / Filters</h3>
                {filters.map(function (f, idx) {
                  return (
                    <div key={idx} className="rb-filter-row">
                      <select value={f.field} onChange={function (e) { updateFilter(idx, "field", e.target.value); }}>
                        {availableFields.map(function (af) { return <option key={af} value={af}>{af}</option>; })}
                      </select>
                      <select value={f.operator} onChange={function (e) { updateFilter(idx, "operator", e.target.value); }}>
                        <option value="contains">يحتوي</option>
                        <option value="equals">يساوي</option>
                        <option value="gt">أكبر من</option>
                        <option value="lt">أصغر من</option>
                      </select>
                      <input value={f.value} onChange={function (e) { updateFilter(idx, "value", e.target.value); }} placeholder="القيمة" />
                      <button className="btn btn-xs btn-danger" onClick={function () { removeFilter(idx); }}>✕</button>
                    </div>
                  );
                })}
                <button className="btn btn-sm btn-outline" onClick={addFilter}>+ فلتر</button>
              </div>

              <div className="rb-section">
                <h3>🔄 الترتيب / Sort</h3>
                <div className="rb-sort-row">
                  <select value={sortBy} onChange={function (e) { setSortBy(e.target.value); }}>
                    <option value="">بدون ترتيب</option>
                    {selectedFields.map(function (f) { return <option key={f} value={f}>{f}</option>; })}
                  </select>
                  <select value={sortDir} onChange={function (e) { setSortDir(e.target.value); }}>
                    <option value="asc">تصاعدي ↑</option>
                    <option value="desc">تنازلي ↓</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary btn-block" onClick={generateReport} disabled={generating}>{generating ? "جاري التوليد..." : "🚀 توليد التقرير"}</button>
            </>
          )}
        </div>

        {/* Results Area */}
        <div className="rb-results">
          {!reportData && <div className="empty-state"><p>اختر مصدر البيانات وقم بتوليد التقرير</p></div>}
          {reportData && (
            <>
              <div className="rb-results-header">
                <h3>النتائج ({reportData.length} سجل)</h3>
              </div>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>{selectedFields.map(function (f) { return <th key={f}>{f}</th>; })}</tr>
                  </thead>
                  <tbody>
                    {reportData.slice(0, 100).map(function (row: any, i: number) {
                      return (
                        <tr key={i}>
                          {selectedFields.map(function (f) {
                            var val = row[f];
                            return <td key={f}>{typeof val === "number" ? val.toLocaleString() : String(val || "—")}</td>;
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
