import { useState, useEffect } from "react";

type Widget = { id: string; type: string; title: string; size: string; enabled: boolean; order: number };

export default function CustomWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>(function () {
    var saved = localStorage.getItem("erp_widgets");
    if (saved) return JSON.parse(saved);
    return [
      { id: "w-1", type: "revenue", title: "الإيرادات / Revenue", size: "large", enabled: true, order: 0 },
      { id: "w-2", type: "employees", title: "الموظفين / Employees", size: "small", enabled: true, order: 1 },
      { id: "w-3", type: "invoices", title: "الفواتير / Invoices", size: "small", enabled: true, order: 2 },
      { id: "w-4", type: "alerts", title: "التنبيهات / Alerts", size: "medium", enabled: true, order: 3 },
      { id: "w-5", type: "tasks", title: "المهام / Tasks", size: "medium", enabled: true, order: 4 },
      { id: "w-6", type: "calendar", title: "التقويم / Calendar", size: "small", enabled: false, order: 5 },
      { id: "w-7", type: "goals", title: "الأهداف / Goals", size: "medium", enabled: false, order: 6 },
      { id: "w-8", type: "chat", title: "المحادثات / Chat", size: "small", enabled: false, order: 7 },
    ];
  });

  useEffect(function () {
    localStorage.setItem("erp_widgets", JSON.stringify(widgets));
  }, [widgets]);

  function toggleWidget(id: string) {
    setWidgets(widgets.map(function (w) { return w.id === id ? { ...w, enabled: !w.enabled } : w; }));
  }

  function changeSize(id: string, size: string) {
    setWidgets(widgets.map(function (w) { return w.id === id ? { ...w, size: size } : w; }));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    var newWidgets = [...widgets];
    var temp = newWidgets[idx];
    newWidgets[idx] = newWidgets[idx - 1];
    newWidgets[idx - 1] = temp;
    newWidgets.forEach(function (w, i) { w.order = i; });
    setWidgets(newWidgets);
  }

  function moveDown(idx: number) {
    if (idx >= widgets.length - 1) return;
    var newWidgets = [...widgets];
    var temp = newWidgets[idx];
    newWidgets[idx] = newWidgets[idx + 1];
    newWidgets[idx + 1] = temp;
    newWidgets.forEach(function (w, i) { w.order = i; });
    setWidgets(newWidgets);
  }

  function resetDefaults() {
    localStorage.removeItem("erp_widgets");
    window.location.reload();
  }

  var enabledWidgets = widgets.filter(function (w) { return w.enabled; });
  var disabledWidgets = widgets.filter(function (w) { return !w.enabled; });

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🧩 تخصيص الويدجات / Customize Widgets</h2>
        <button className="btn btn-outline" onClick={resetDefaults}>↩ إعادة تعيين</button>
      </div>

      {/* Preview */}
      <div className="widgets-preview">
        <h3>👁️ المعاينة / Preview</h3>
        <div className="widgets-grid-preview">
          {enabledWidgets.map(function (w) {
            return (
              <div key={w.id} className={"widget-preview-item size-" + w.size}>
                <span className="widget-type-icon">{w.type === "revenue" ? "💰" : w.type === "employees" ? "👥" : w.type === "invoices" ? "🧾" : w.type === "alerts" ? "🔔" : w.type === "tasks" ? "📋" : w.type === "calendar" ? "📅" : w.type === "goals" ? "🎯" : "💬"}</span>
                <span>{w.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config List */}
      <div className="widgets-config">
        <h3>⚙️ الويدجات المفعلة ({enabledWidgets.length})</h3>
        <div className="widget-list">
          {widgets.map(function (widget, idx) {
            return (
              <div key={widget.id} className={"widget-config-item" + (widget.enabled ? " enabled" : " disabled")}>
                <div className="widget-drag-handle">⠿</div>
                <div className="widget-config-info">
                  <span className="widget-config-title">{widget.title}</span>
                  <span className="widget-config-type">{widget.type}</span>
                </div>
                <div className="widget-config-controls">
                  <select value={widget.size} onChange={function (e) { changeSize(widget.id, e.target.value); }}>
                    <option value="small">صغير</option>
                    <option value="medium">متوسط</option>
                    <option value="large">كبير</option>
                  </select>
                  <button className="btn btn-xs" onClick={function () { moveUp(idx); }} disabled={idx === 0}>⬆</button>
                  <button className="btn btn-xs" onClick={function () { moveDown(idx); }} disabled={idx >= widgets.length - 1}>⬇</button>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={widget.enabled} onChange={function () { toggleWidget(widget.id); }} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
