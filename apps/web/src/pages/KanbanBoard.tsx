import { useEffect, useState } from "react";
import { get, post, put, del } from "../api";

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignee: "", priority: "medium", dueDate: "", tags: "" });

  useEffect(function () { loadData(); }, []);

  function loadData() {
    get("/kanban").then(function (r: any) { setTasks(r.tasks); setColumns(r.columns); setLoading(false); });
  }

  function addTask() {
    var t = { ...newTask, column: "todo", tags: newTask.tags.split(",").map(function (s) { return s.trim(); }).filter(Boolean) };
    post("/kanban", t).then(function () { loadData(); setShowAdd(false); setNewTask({ title: "", description: "", assignee: "", priority: "medium", dueDate: "", tags: "" }); });
  }

  function moveTask(taskId: string, newColumn: string) {
    put("/kanban/" + taskId + "/move", { column: newColumn }).then(function () { loadData(); });
  }

  function deleteTask(id: string) {
    if (confirm("حذف المهمة؟")) del("/kanban/" + id).then(function () { loadData(); });
  }

  function handleDragStart(taskId: string) { setDraggedTask(taskId); }
  function handleDragOver(e: any) { e.preventDefault(); }
  function handleDrop(e: any, columnId: string) {
    e.preventDefault();
    if (draggedTask) { moveTask(draggedTask, columnId); setDraggedTask(null); }
  }

  function getPriorityIcon(p: string) {
    if (p === "high") return "🔴";
    if (p === "medium") return "🟡";
    return "🟢";
  }

  if (loading) return <div className="page-loading"><div className="spinner"></div><p>جاري التحميل...</p></div>;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📋 لوحة كانبان / Kanban Board</h2>
        <button className="btn btn-primary" onClick={function () { setShowAdd(true); }}>+ إضافة مهمة</button>
      </div>

      {showAdd && (
        <div className="modal-overlay" onClick={function () { setShowAdd(false); }}>
          <div className="modal-content" onClick={function (e) { e.stopPropagation(); }}>
            <h2>مهمة جديدة / New Task</h2>
            <div className="form-grid">
              <div className="form-group"><label>العنوان / Title</label><input value={newTask.title} onChange={function (e) { setNewTask({ ...newTask, title: e.target.value }); }} /></div>
              <div className="form-group"><label>الوصف / Description</label><input value={newTask.description} onChange={function (e) { setNewTask({ ...newTask, description: e.target.value }); }} /></div>
              <div className="form-group"><label>المسؤول / Assignee</label><input value={newTask.assignee} onChange={function (e) { setNewTask({ ...newTask, assignee: e.target.value }); }} /></div>
              <div className="form-group"><label>الأولوية / Priority</label><select value={newTask.priority} onChange={function (e) { setNewTask({ ...newTask, priority: e.target.value }); }}><option value="high">عالية</option><option value="medium">متوسطة</option><option value="low">منخفضة</option></select></div>
              <div className="form-group"><label>تاريخ الاستحقاق</label><input type="date" value={newTask.dueDate} onChange={function (e) { setNewTask({ ...newTask, dueDate: e.target.value }); }} /></div>
              <div className="form-group"><label>الوسوم (مفصولة بفواصل)</label><input value={newTask.tags} onChange={function (e) { setNewTask({ ...newTask, tags: e.target.value }); }} /></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={addTask}>حفظ</button>
              <button className="btn btn-outline" onClick={function () { setShowAdd(false); }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      <div className="kanban-board">
        {columns.map(function (col: any) {
          var colTasks = tasks.filter(function (t: any) { return t.column === col.id; });
          return (
            <div key={col.id} className="kanban-column" onDragOver={handleDragOver} onDrop={function (e) { handleDrop(e, col.id); }}>
              <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
                <h3>{col.title}</h3>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map(function (task: any) {
                  return (
                    <div key={task.id} className={"kanban-card priority-" + task.priority} draggable onDragStart={function () { handleDragStart(task.id); }}>
                      <div className="kanban-card-header">
                        <span className="kanban-priority">{getPriorityIcon(task.priority)}</span>
                        <button className="kanban-delete" onClick={function () { deleteTask(task.id); }}>✕</button>
                      </div>
                      <h4>{task.title}</h4>
                      <p className="kanban-desc">{task.description}</p>
                      <div className="kanban-meta">
                        <span className="kanban-assignee">👤 {task.assignee}</span>
                        {task.dueDate && <span className="kanban-due">📅 {task.dueDate}</span>}
                      </div>
                      <div className="kanban-tags">
                        {(task.tags || []).map(function (tag: string, i: number) { return <span key={i} className="kanban-tag">{tag}</span>; })}
                      </div>
                      <div className="kanban-move-btns">
                        {columns.filter(function (c: any) { return c.id !== col.id; }).map(function (c: any) {
                          return <button key={c.id} className="btn btn-xs" onClick={function () { moveTask(task.id, c.id); }} title={c.title}>→ {c.title.split("/")[0].trim()}</button>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
