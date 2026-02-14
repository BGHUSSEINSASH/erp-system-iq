import { useState } from "react";

export default function FinanceOptions() {
  const [currency, setCurrency] = useState("IQD");
  const [fiscalYear, setFiscalYear] = useState("January");
  const [taxRate, setTaxRate] = useState("15");
  const [autoReconcile, setAutoReconcile] = useState(true);

  return (
    <div className="page">
      <div className="page-header"><h2>اعدادات المالية / Finance Options</h2></div>
      <div className="card animate-in" style={{padding:24,maxWidth:600}}>
        <div className="form-grid">
          <div className="form-field"><label>العملة الافتراضية / Default Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="IQD">د.ع – دينار عراقي / Iraqi Dinar</option>
              <option value="USD">$ – دولار / US Dollar</option>
            </select>
          </div>
          <div className="form-field"><label>بداية السنة المالية / Fiscal Year Start</label>
            <select value={fiscalYear} onChange={e => setFiscalYear(e.target.value)}>
              <option>يناير / January</option>
              <option>أبريل / April</option>
              <option>يوليو / July</option>
              <option>أكتوبر / October</option>
            </select>
          </div>
          <div className="form-field"><label>نسبة الضريبة (%) / Tax Rate</label><input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} /></div>
          <div className="form-field"><label><input type="checkbox" checked={autoReconcile} onChange={e => setAutoReconcile(e.target.checked)} /> مطابقة تلقائية / Auto Reconcile</label></div>
        </div>
        <div className="form-actions" style={{marginTop:16}}><button className="btn btn-primary" onClick={() => alert("✅ تم حفظ الاعدادات")}>💾 حفظ / Save</button></div>
      </div>
    </div>
  );
}
