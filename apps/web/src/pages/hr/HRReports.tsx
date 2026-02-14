import { useEffect, useState } from "react";
import { get } from "../../api";
import { exportToCSV, exportToExcel, exportToPDF } from "../../utils/exportUtils";

type Employee = { id: string; name: string; email: string; phone: string; department: string; position: string; salary: number; hireDate: string; status: string };
type AttendanceRec = { id: string; employeeName: string; date: string; checkIn: string; checkOut: string; status: string };
type LeaveReq = { id: string; employeeName: string; department: string; type: string; startDate: string; endDate: string; days: number; reason: string; status: string; approvedBy: string };
type PayrollRec = { id: string; employeeName: string; month: string; basicSalary: number; allowances: number; deductions: number; netSalary: number; status: string };
type EvalRec = { id: string; employeeName: string; evaluator: string; period: string; score: number; rating: string; comments: string; date: string };
type TimesheetRec = { id: string; employeeName: string; date: string; hoursWorked: number; overtime: number; project: string; status: string };
type RecruitRec = { id: string; position: string; department: string; requestedBy: string; date: string; vacancies: number; urgency: string; status: string; description: string };
type ContractRec = { id: string; employeeName: string; type: string; startDate: string; endDate: string; salary: number; status: string };

type HRReportData = {
  summary: { totalEmployees: number; activeEmployees: number; totalSalaries: number; avgSalary: number; totalPayroll: number; avgEvalScore: number; openPositions: number; pendingLeaves: number; approvedLeaves: number };
  attendanceSummary: { presentToday: number; absentToday: number; lateToday: number; onLeave: number; total: number };
  leaveByType: { annual: number; sick: number; personal: number; unpaid: number };
  salaryByDept: { department: string; total: number; count: number }[];
  departmentStats: { name: string; employeeCount: number; manager: string }[];
  evaluationSummary: { excellent: number; good: number; average: number; poor: number };
  employees: Employee[];
  attendanceList: AttendanceRec[];
  leaveRequestsList: LeaveReq[];
  payrollList: PayrollRec[];
  evaluationsList: EvalRec[];
  timesheetsList: TimesheetRec[];
  recruitmentList: RecruitRec[];
  contractsList: ContractRec[];
};

const tabsList = [
  { id: "overview", label: "نظرة عامة / Overview" },
  { id: "employees", label: "الموظفين / Employees" },
  { id: "attendance", label: "الحضور / Attendance" },
  { id: "leaves", label: "الاجازات / Leaves" },
  { id: "payroll", label: "الرواتب / Payroll" },
  { id: "evaluations", label: "التقييمات / Evaluations" },
  { id: "timesheets", label: "سجل العمل / Timesheets" },
  { id: "recruitment", label: "التوظيف / Recruitment" },
  { id: "contracts", label: "العقود / Contracts" },
];

function fmt(n: number) { return n.toLocaleString("en-US") + " د.ع"; }

function getBadge(status: string) {
  if (["approved", "active", "present", "paid", "excellent", "filled"].includes(status)) return "badge badge-approved";
  if (["rejected", "absent", "expired", "poor", "cancelled", "inactive"].includes(status)) return "badge badge-rejected";
  return "badge badge-pending";
}

export default function HRReports() {
  const [data, setData] = useState<HRReportData | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2027-01-01");

  useEffect(() => {
    get<HRReportData>("/reports/hr?from=" + dateFrom + "&to=" + dateTo).then(setData);
  }, [dateFrom, dateTo]);

  if (!data) return <div className="loading">جاري التحميل...</div>;

  const { summary: s, attendanceSummary: att, leaveByType, salaryByDept, departmentStats, evaluationSummary: ev } = data;
  const maxSalary = Math.max(...salaryByDept.map(d => d.total), 1);

  const getExportData = () => {
    switch (activeTab) {
      case "employees": return { data: data.employees, name: "HR_Employees" };
      case "attendance": return { data: data.attendanceList, name: "HR_Attendance" };
      case "leaves": return { data: data.leaveRequestsList, name: "HR_Leaves" };
      case "payroll": return { data: data.payrollList, name: "HR_Payroll" };
      case "evaluations": return { data: data.evaluationsList, name: "HR_Evaluations" };
      case "timesheets": return { data: data.timesheetsList, name: "HR_Timesheets" };
      case "recruitment": return { data: data.recruitmentList, name: "HR_Recruitment" };
      case "contracts": return { data: data.contractsList, name: "HR_Contracts" };
      default: return { data: data.employees, name: "HR_Report" };
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>📋 تقارير الموارد البشرية / HR Reports</h2>
        <div className="export-btns">
          <button className="btn btn-secondary" onClick={() => exportToPDF("تقارير الموارد البشرية")}>PDF</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToExcel(e.data as any[], e.name); }}>Excel</button>
          <button className="btn btn-secondary" onClick={() => { const e = getExportData(); exportToCSV(e.data as any[], e.name); }}>CSV</button>
        </div>
      </div>

      <div className="chart-card" style={{ padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, fontSize: 13 }}>فترة التقرير / Report Period:</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>من / From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <label style={{ fontSize: 12, color: "#64748b" }}>إلى / To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }} />
        </div>
      </div>

      <div className="report-tabs" style={{ flexWrap: "wrap" }}>
        {tabsList.map(t => (
          <button key={t.id} className={"report-tab " + (activeTab === t.id ? "active" : "")} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card" style={{borderColor:"#6366f1"}}><div className="stat-icon" style={{background:"#eef2ff"}}>👥</div><div><div className="stat-value">{s.totalEmployees}</div><div className="stat-label">اجمالي الموظفين / Total Employees</div></div></div>
            <div className="stat-card" style={{borderColor:"#10b981"}}><div className="stat-icon" style={{background:"#ecfdf5"}}>✅</div><div><div className="stat-value">{s.activeEmployees}</div><div className="stat-label">نشطين / Active</div></div></div>
            <div className="stat-card" style={{borderColor:"#f59e0b"}}><div className="stat-icon" style={{background:"#fffbeb"}}>💰</div><div><div className="stat-value">{fmt(s.avgSalary)}</div><div className="stat-label">متوسط الراتب / Avg Salary</div></div></div>
            <div className="stat-card" style={{borderColor:"#8b5cf6"}}><div className="stat-icon" style={{background:"#f5f3ff"}}>📊</div><div><div className="stat-value">{s.avgEvalScore}%</div><div className="stat-label">متوسط التقييم / Avg Eval</div></div></div>
            <div className="stat-card" style={{borderColor:"#ef4444"}}><div className="stat-icon" style={{background:"#fef2f2"}}>📋</div><div><div className="stat-value">{s.pendingLeaves}</div><div className="stat-label">اجازات معلقة / Pending Leaves</div></div></div>
            <div className="stat-card" style={{borderColor:"#3b82f6"}}><div className="stat-icon" style={{background:"#eff6ff"}}>🔍</div><div><div className="stat-value">{s.openPositions}</div><div className="stat-label">وظائف شاغرة / Open Positions</div></div></div>
          </div>
          <div className="dashboard-charts">
            <div className="chart-card">
              <h3>الاقسام / Departments</h3>
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>القسم / Dept</th><th>المدير / Manager</th><th>الموظفين / Count</th></tr></thead>
                <tbody>{departmentStats.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.manager}</td><td>{d.employeeCount}</td></tr>)}</tbody>
              </table></div>
            </div>
            <div className="chart-card">
              <h3>الاجازات حسب النوع / Leaves by Type</h3>
              <div className="attendance-grid">
                <div className="att-item present"><div className="att-val">{leaveByType.annual}</div><div className="att-lbl">سنوية / Annual</div></div>
                <div className="att-item absent"><div className="att-val">{leaveByType.sick}</div><div className="att-lbl">مرضية / Sick</div></div>
                <div className="att-item late"><div className="att-val">{leaveByType.personal}</div><div className="att-lbl">شخصية / Personal</div></div>
                <div className="att-item leave"><div className="att-val">{leaveByType.unpaid}</div><div className="att-lbl">بدون راتب / Unpaid</div></div>
              </div>
            </div>
          </div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>الرواتب حسب القسم / Salaries by Department</h3>
            <div className="hbar-chart">{salaryByDept.map(d => (
              <div key={d.department} className="hbar-row">
                <span className="hbar-name">{d.department}</span>
                <div className="hbar-track"><div className="hbar-fill" style={{width:(d.total/maxSalary)*100+"%"}} /></div>
                <span className="hbar-val">{fmt(d.total)}</span>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      {activeTab === "employees" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع الموظفين / All Employees ({data.employees.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الاسم / Name</th><th>البريد / Email</th><th>الهاتف / Phone</th><th>القسم / Dept</th><th>المنصب / Position</th><th>الراتب / Salary</th><th>تاريخ التعيين / Hired</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.employees.map((e, i) => (
                <tr key={e.id}><td>{i+1}</td><td>{e.name}</td><td>{e.email}</td><td>{e.phone}</td><td>{e.department}</td><td>{e.position}</td><td>{fmt(e.salary)}</td><td>{e.hireDate}</td><td><span className={getBadge(e.status)}>{e.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "attendance" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card" style={{borderColor:"#10b981"}}><div className="stat-icon" style={{background:"#ecfdf5"}}>✅</div><div><div className="stat-value">{att.presentToday}</div><div className="stat-label">حاضر / Present</div></div></div>
            <div className="stat-card" style={{borderColor:"#ef4444"}}><div className="stat-icon" style={{background:"#fef2f2"}}>❌</div><div><div className="stat-value">{att.absentToday}</div><div className="stat-label">غائب / Absent</div></div></div>
            <div className="stat-card" style={{borderColor:"#f59e0b"}}><div className="stat-icon" style={{background:"#fffbeb"}}>⏰</div><div><div className="stat-value">{att.lateToday}</div><div className="stat-label">متأخر / Late</div></div></div>
            <div className="stat-card" style={{borderColor:"#3b82f6"}}><div className="stat-icon" style={{background:"#eff6ff"}}>🏖️</div><div><div className="stat-value">{att.onLeave}</div><div className="stat-label">في اجازة / On Leave</div></div></div>
          </div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>سجل الحضور الكامل / Full Attendance Log ({data.attendanceList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>التاريخ / Date</th><th>الدخول / In</th><th>الخروج / Out</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.attendanceList.map((a, i) => (
                <tr key={a.id}><td>{i+1}</td><td>{a.employeeName}</td><td>{a.date}</td><td>{a.checkIn || "—"}</td><td>{a.checkOut || "—"}</td><td><span className={getBadge(a.status)}>{a.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "leaves" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع طلبات الاجازة / All Leave Requests ({data.leaveRequestsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>القسم / Dept</th><th>النوع / Type</th><th>من / From</th><th>الى / To</th><th>الايام / Days</th><th>السبب / Reason</th><th>الحالة / Status</th><th>المعتمد / Approver</th></tr></thead>
              <tbody>{data.leaveRequestsList.map((l, i) => (
                <tr key={l.id}><td>{i+1}</td><td>{l.employeeName}</td><td>{l.department}</td><td>{l.type}</td><td>{l.startDate}</td><td>{l.endDate}</td><td>{l.days}</td><td>{l.reason}</td><td><span className={getBadge(l.status)}>{l.status}</span></td><td>{l.approvedBy || "—"}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "payroll" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card" style={{borderColor:"#6366f1"}}><div className="stat-icon" style={{background:"#eef2ff"}}>💵</div><div><div className="stat-value">{fmt(s.totalSalaries)}</div><div className="stat-label">اجمالي الرواتب / Total</div></div></div>
            <div className="stat-card" style={{borderColor:"#10b981"}}><div className="stat-icon" style={{background:"#ecfdf5"}}>📊</div><div><div className="stat-value">{fmt(s.avgSalary)}</div><div className="stat-label">المتوسط / Average</div></div></div>
            <div className="stat-card" style={{borderColor:"#f59e0b"}}><div className="stat-icon" style={{background:"#fffbeb"}}>💰</div><div><div className="stat-value">{fmt(s.totalPayroll)}</div><div className="stat-label">الرواتب المدفوعة / Paid</div></div></div>
          </div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>سجل الرواتب الكامل / Full Payroll Records ({data.payrollList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>الشهر / Month</th><th>الاساسي / Basic</th><th>البدلات / Allow.</th><th>الخصومات / Deduct.</th><th>الصافي / Net</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.payrollList.map((p, i) => (
                <tr key={p.id}><td>{i+1}</td><td>{p.employeeName}</td><td>{p.month}</td><td>{fmt(p.basicSalary)}</td><td>{fmt(p.allowances)}</td><td>{fmt(p.deductions)}</td><td style={{fontWeight:600}}>{fmt(p.netSalary)}</td><td><span className={getBadge(p.status)}>{p.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "evaluations" && (
        <div className="report-section animate-in">
          <div className="stats-grid">
            <div className="stat-card" style={{borderColor:"#10b981"}}><div className="stat-icon" style={{background:"#ecfdf5"}}>⭐</div><div><div className="stat-value">{ev.excellent}</div><div className="stat-label">ممتاز / Excellent</div></div></div>
            <div className="stat-card" style={{borderColor:"#3b82f6"}}><div className="stat-icon" style={{background:"#eff6ff"}}>👍</div><div><div className="stat-value">{ev.good}</div><div className="stat-label">جيد / Good</div></div></div>
            <div className="stat-card" style={{borderColor:"#f59e0b"}}><div className="stat-icon" style={{background:"#fffbeb"}}>📊</div><div><div className="stat-value">{ev.average}</div><div className="stat-label">متوسط / Average</div></div></div>
            <div className="stat-card" style={{borderColor:"#ef4444"}}><div className="stat-icon" style={{background:"#fef2f2"}}>⚠️</div><div><div className="stat-value">{ev.poor}</div><div className="stat-label">ضعيف / Poor</div></div></div>
          </div>
          <div className="chart-card" style={{marginTop:16}}>
            <h3>جميع التقييمات / All Evaluations ({data.evaluationsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>المقيّم / Evaluator</th><th>الفترة / Period</th><th>الدرجة / Score</th><th>التقييم / Rating</th><th>الملاحظات / Comments</th><th>التاريخ / Date</th></tr></thead>
              <tbody>{data.evaluationsList.map((e, i) => (
                <tr key={e.id}><td>{i+1}</td><td>{e.employeeName}</td><td>{e.evaluator}</td><td>{e.period}</td><td style={{fontWeight:600}}>{e.score}%</td><td><span className={getBadge(e.rating)}>{e.rating}</span></td><td>{e.comments}</td><td>{e.date}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "timesheets" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>جميع سجلات الدوام / All Timesheets ({data.timesheetsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>التاريخ / Date</th><th>ساعات العمل / Hours</th><th>اضافي / Overtime</th><th>المشروع / Project</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.timesheetsList.map((t, i) => (
                <tr key={t.id}><td>{i+1}</td><td>{t.employeeName}</td><td>{t.date}</td><td>{t.hoursWorked}</td><td>{t.overtime}</td><td>{t.project}</td><td><span className={getBadge(t.status)}>{t.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "recruitment" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>طلبات التوظيف / Recruitment Requests ({data.recruitmentList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>المنصب / Position</th><th>القسم / Dept</th><th>طالب / Requested By</th><th>التاريخ / Date</th><th>الشواغر / Vacancies</th><th>الاولوية / Urgency</th><th>الحالة / Status</th><th>الوصف / Description</th></tr></thead>
              <tbody>{data.recruitmentList.map((r, i) => (
                <tr key={r.id}><td>{i+1}</td><td>{r.position}</td><td>{r.department}</td><td>{r.requestedBy}</td><td>{r.date}</td><td>{r.vacancies}</td><td><span className={getBadge(r.urgency)}>{r.urgency}</span></td><td><span className={getBadge(r.status)}>{r.status}</span></td><td>{r.description}</td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}

      {activeTab === "contracts" && (
        <div className="report-section animate-in">
          <div className="chart-card">
            <h3>العقود / Contracts ({data.contractsList.length})</h3>
            <div className="table-wrapper"><table className="data-table">
              <thead><tr><th>#</th><th>الموظف / Employee</th><th>النوع / Type</th><th>البداية / Start</th><th>النهاية / End</th><th>الراتب / Salary</th><th>الحالة / Status</th></tr></thead>
              <tbody>{data.contractsList.map((c, i) => (
                <tr key={c.id}><td>{i+1}</td><td>{c.employeeName}</td><td>{c.type}</td><td>{c.startDate}</td><td>{c.endDate}</td><td>{fmt(c.salary)}</td><td><span className={getBadge(c.status)}>{c.status}</span></td></tr>
              ))}</tbody>
            </table></div>
          </div>
        </div>
      )}
    </div>
  );
}
