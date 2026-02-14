import { useEffect, useState } from "react";
import { get, post, put, del } from "../api";

export default function GoalsOKR() {
  const [goals, setGoals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", titleEn: "", department: "", type: "quarterly", target: 0, current: 0, unit: "", startDate: "", endDate: "", status: "on-track", owner: "admin" });

  useEffect(function () { loadData(); }, []);

  function loadData() {
    get("/goals").then(function (r: any) { setGoals(r.goals); setStats(r.stats); setLoading(false); });
  }

  function addGoal() {
    post("/goals", { ...newGoal, target: Number(newGoal.target), current: Number(newGoal.current) }).then(function () { loadData(); setShowAdd(false); });
  }

  function updateProgress(id: string, current: number) {
    put("/goals/" + id, { current: current }).then(function () { loadData(); });
  }

  function deleteGoal(id: string) {
    if (confirm("حذف الهدف؟")) del("/goals/" + id).then(function () { loadData(); });
  }

  function getStatusIcon(s: string) {
    if (s === "on-track") return "🟢";
    if (s === "at-risk") return "🟡";
    if (s === "behind") return "🔴";
    if (s === "completed") return "✅";
    return "⚪";
  }

  function getStatusLabel(s: string) {
    if (s === "on-track") return "على المسار";
    if (s === "at-risk") return "في خطر";
    if (s === "behind") return "متأخر";
    if (s === "completed") return "مكتمل";
    return s;
  }

  function getProgress(g: any) {
    if (g.target === 0) return 0;
    return Math.min(100, Math.round((g.current / g.target) * 100));
  }

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  var filtered = goals.filter(function (g) { return filter === "all" || g.status === filter; });

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🎯 الأهداف والنتائج الرئيسية / OKR & Goals</h2>
        <button className="btn btn-primary" onClick={function () { setShowAdd(true); }}>+ هدف جديد</button>
      </div>

      {/* Stats */}
      <div className="goals-stats">
        <div className="goal-stat-card"><span className="goal-stat-num">{stats.total}</span><span>إجمالي</span></div>
        <div className="goal-stat-card on-track"><span className="goal-stat-num">{stats.onTrack}</span><span>🟢 على المسار</span></div>
        <div className="goal-stat-card at-risk"><span className="goal-stat-num">{stats.atRisk}</span><span>🟡 في خطر</span></div>
        <div className="goal-stat-card behind"><span className="goal-stat-num">{stats.behind}</span><span>🔴 متأخر</span></div>
        <div className="goal-stat-card completed"><span className="goal-stat-num">{stats.completed}</span><span>✅ مكتمل</span></div>
      </div>

      <div className="alert-filters">
        {["all", "on-track", "at-risk", "behind", "completed"].map(function (f) {
          return <button key={f} className={"filter-btn" + (filter === f ? " active" : "")} onClick={function () { setFilter(f); }}>{f === "all" ? "الكل" : getStatusLabel(f)}</button>;
        })}
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={function () { setShowAdd(false); }}>
          <div className="modal-content" onClick={function (e) { e.stopPropagation(); }}>
            <h2>هدف جديد / New Goal</h2>
            <div className="form-grid">
              <div className="form-group"><label>العنوان بالعربي</label><input value={newGoal.title} onChange={function (e) { setNewGoal({ ...newGoal, title: e.target.value }); }} /></div>
              <div className="form-group"><label>العنوان بالإنجليزي</label><input value={newGoal.titleEn} onChange={function (e) { setNewGoal({ ...newGoal, titleEn: e.target.value }); }} /></div>
              <div className="form-group"><label>القسم</label><input value={newGoal.department} onChange={function (e) { setNewGoal({ ...newGoal, department: e.target.value }); }} /></div>
              <div className="form-group"><label>النوع</label><select value={newGoal.type} onChange={function (e) { setNewGoal({ ...newGoal, type: e.target.value }); }}><option value="quarterly">ربع سنوي</option><option value="annual">سنوي</option></select></div>
              <div className="form-group"><label>الهدف</label><input type="number" value={newGoal.target} onChange={function (e) { setNewGoal({ ...newGoal, target: e.target.value as any }); }} /></div>
              <div className="form-group"><label>الحالي</label><input type="number" value={newGoal.current} onChange={function (e) { setNewGoal({ ...newGoal, current: e.target.value as any }); }} /></div>
              <div className="form-group"><label>الوحدة</label><input value={newGoal.unit} onChange={function (e) { setNewGoal({ ...newGoal, unit: e.target.value }); }} /></div>
              <div className="form-group"><label>تاريخ البداية</label><input type="date" value={newGoal.startDate} onChange={function (e) { setNewGoal({ ...newGoal, startDate: e.target.value }); }} /></div>
              <div className="form-group"><label>تاريخ النهاية</label><input type="date" value={newGoal.endDate} onChange={function (e) { setNewGoal({ ...newGoal, endDate: e.target.value }); }} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addGoal}>حفظ</button>
              <button className="btn btn-outline" onClick={function () { setShowAdd(false); }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="goals-grid">
        {filtered.map(function (goal: any) {
          var pct = getProgress(goal);
          return (
            <div key={goal.id} className={"goal-card status-" + goal.status}>
              <div className="goal-header">
                <span className="goal-status-icon">{getStatusIcon(goal.status)}</span>
                <div>
                  <h4>{goal.title}</h4>
                  <span className="goal-title-en">{goal.titleEn}</span>
                </div>
                <button className="btn btn-xs btn-danger" onClick={function () { deleteGoal(goal.id); }}>🗑️</button>
              </div>
              <div className="goal-meta">
                <span>📁 {goal.department}</span>
                <span>📅 {goal.type === "quarterly" ? "ربع سنوي" : "سنوي"}</span>
                <span>👤 {goal.owner}</span>
              </div>
              <div className="goal-progress">
                <div className="progress-header">
                  <span>{goal.current} / {goal.target} {goal.unit}</span>
                  <span className="progress-pct">{pct}%</span>
                </div>
                <div className="progress-bar-container">
                  <div className={"progress-bar-fill status-" + goal.status} style={{ width: pct + "%" }}></div>
                </div>
              </div>
              <div className="goal-dates">
                <span>🟢 {goal.startDate}</span>
                <span>🏁 {goal.endDate}</span>
              </div>
              <div className="goal-actions">
                <input type="range" min="0" max={goal.target} value={goal.current} onChange={function (e) { updateProgress(goal.id, Number(e.target.value)); }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
