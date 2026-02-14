import { useState } from "react";

export default function AdminOptions() {
  const [companyName, setCompanyName] = useState("شركة المؤسسة");
  const [address, setAddress] = useState("بغداد، العراق");
  const [phone, setPhone] = useState("+964 770 000 0000");
  const [email, setEmail] = useState("info@company.iq");
  const [regNo, setRegNo] = useState("IQ-2024-00123");

  return (
    <div className="page">
      <div className="page-header"><h2>اعدادات الادارة / Admin Options</h2></div>
      <div className="card animate-in" style={{padding:24,maxWidth:600}}>
        <div className="form-grid">
          <div className="form-field"><label>اسم الشركة / Company Name</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
          <div className="form-field"><label>العنوان / Address</label><input value={address} onChange={e => setAddress(e.target.value)} /></div>
          <div className="form-field"><label>الهاتف / Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className="form-field"><label>البريد الإلكتروني / Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="form-field"><label>رقم السجل / Registration No</label><input value={regNo} onChange={e => setRegNo(e.target.value)} /></div>
        </div>
        <div className="form-actions" style={{marginTop:16}}><button className="btn btn-primary" onClick={() => alert("✅ تم حفظ الاعدادات")}>💾 حفظ / Save</button></div>
      </div>
    </div>
  );
}
