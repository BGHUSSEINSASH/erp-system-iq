import { useState } from "react";

export default function HROptions() {
  const [workHours, setWorkHours] = useState("8");
  const [leavePolicy, setLeavePolicy] = useState("30");
  const [probation, setProbation] = useState("90");
  const [overtimeRate, setOvertimeRate] = useState("1.5");
  const [currency, setCurrency] = useState("IQD");

  return (
    <div className="page">
      <div className="page-header"><h2>اعدادات الموارد البشرية / HR Options</h2></div>
      <div className="card animate-in" style={{padding:24,maxWidth:600}}>
        <div className="form-grid">
          <div className="form-field"><label>ساعات العمل اليومية / Work Hours/Day</label><input type="number" value={workHours} onChange={e => setWorkHours(e.target.value)} /></div>
          <div className="form-field"><label>أيام الإجازة السنوية / Annual Leave Days</label><input type="number" value={leavePolicy} onChange={e => setLeavePolicy(e.target.value)} /></div>
          <div className="form-field"><label>فترة التجربة (يوم) / Probation (days)</label><input type="number" value={probation} onChange={e => setProbation(e.target.value)} /></div>
          <div className="form-field"><label>معدل العمل الإضافي / Overtime Rate</label><input type="number" step="0.1" value={overtimeRate} onChange={e => setOvertimeRate(e.target.value)} /></div>
          <div className="form-field"><label>عملة الرواتب / Salary Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="IQD">د.ع – دينار عراقي / Iraqi Dinar</option>
              <option value="USD">$ – دولار / US Dollar</option>
            </select>
          </div>
        </div>
        <div className="form-actions" style={{marginTop:16}}><button className="btn btn-primary" onClick={() => alert("✅ تم حفظ الاعدادات")}>💾 حفظ / Save</button></div>
      </div>
    </div>
  );
}
