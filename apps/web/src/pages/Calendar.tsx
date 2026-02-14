import { useEffect, useState } from "react";
import { get, post } from "../api";

interface CalEvent {
  id: string;
  title: string;
  titleAr: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  color: string;
}

var typeLabels: Record<string, string> = {
  meeting: "اجتماع / Meeting",
  leave: "إجازة / Leave",
  deadline: "موعد نهائي / Deadline",
  holiday: "عطلة / Holiday",
  training: "تدريب / Training",
  other: "أخرى / Other",
};

var typeIcons: Record<string, string> = {
  meeting: "🤝", leave: "🏖️", deadline: "⏰", holiday: "🎉", training: "📚", other: "📌",
};

export default function Calendar() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "", titleAr: "", type: "meeting", date: "", startTime: "09:00", endTime: "10:00",
    location: "", description: "", color: "#6366f1",
  });

  useEffect(() => {
    get<CalEvent[]>("/calendar?month=" + currentMonth).then(setEvents);
  }, [currentMonth]);

  var year = parseInt(currentMonth.split("-")[0]);
  var month = parseInt(currentMonth.split("-")[1]);
  var daysInMonth = new Date(year, month, 0).getDate();
  var firstDay = new Date(year, month - 1, 1).getDay();
  // Adjust for Saturday start (Arabic calendar)
  var startOffset = (firstDay + 1) % 7;

  var days: (number | null)[] = [];
  for (var i = 0; i < startOffset; i++) days.push(null);
  for (var d = 1; d <= daysInMonth; d++) days.push(d);

  var dayNames = ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"];
  var monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

  function getEventsForDay(day: number) {
    var dateStr = currentMonth + "-" + String(day).padStart(2, "0");
    return events.filter((e) => e.date === dateStr);
  }

  function prevMonth() {
    var m = month - 1;
    var y = year;
    if (m < 1) { m = 12; y--; }
    setCurrentMonth(y + "-" + String(m).padStart(2, "0"));
  }

  function nextMonth() {
    var m = month + 1;
    var y = year;
    if (m > 12) { m = 1; y++; }
    setCurrentMonth(y + "-" + String(m).padStart(2, "0"));
  }

  function addEvent() {
    post("/calendar", { ...newEvent, attendees: [], createdBy: "admin" }).then(() => {
      setShowForm(false);
      setNewEvent({ title: "", titleAr: "", type: "meeting", date: "", startTime: "09:00", endTime: "10:00", location: "", description: "", color: "#6366f1" });
      get<CalEvent[]>("/calendar?month=" + currentMonth).then(setEvents);
    });
  }

  var selectedEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>📅 التقويم والمواعيد / Calendar</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          ➕ موعد جديد / New Event
        </button>
      </div>

      {showForm && (
        <div className="chart-card animate-in" style={{ marginBottom: "20px" }}>
          <h3>➕ إضافة موعد / Add Event</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "12px" }}>
            <div>
              <label>العنوان (English)</label>
              <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>العنوان (عربي)</label>
              <input type="text" value={newEvent.titleAr} onChange={(e) => setNewEvent({ ...newEvent, titleAr: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>النوع / Type</label>
              <select value={newEvent.type} onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }}>
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label>التاريخ / Date</label>
              <input type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>من / From</label>
              <input type="time" value={newEvent.startTime} onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>إلى / To</label>
              <input type="time" value={newEvent.endTime} onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>المكان / Location</label>
              <input type="text" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px" }} />
            </div>
            <div>
              <label>اللون / Color</label>
              <input type="color" value={newEvent.color} onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                style={{ width: "60px", height: "38px", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "4px", cursor: "pointer" }} />
            </div>
          </div>
          <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
            <button className="btn btn-primary" onClick={addEvent} disabled={!newEvent.title || !newEvent.date}>
              حفظ / Save
            </button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>إلغاء / Cancel</button>
          </div>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-main">
          <div className="calendar-header">
            <button className="btn btn-secondary" onClick={prevMonth}>◀</button>
            <h3>{monthNames[month - 1]} {year}</h3>
            <button className="btn btn-secondary" onClick={nextMonth}>▶</button>
          </div>

          <div className="calendar-grid">
            {dayNames.map((dn) => (
              <div key={dn} className="cal-day-name">{dn}</div>
            ))}
            {days.map((day, idx) => {
              if (day === null) return <div key={"e-" + idx} className="cal-day empty"></div>;
              var dateStr = currentMonth + "-" + String(day).padStart(2, "0");
              var dayEvents = getEventsForDay(day);
              var isToday = dateStr === new Date().toISOString().split("T")[0];
              var isSelected = dateStr === selectedDate;
              return (
                <div
                  key={day}
                  className={"cal-day " + (isToday ? "today " : "") + (isSelected ? "selected " : "") + (dayEvents.length > 0 ? "has-events" : "")}
                  onClick={() => setSelectedDate(dateStr)}
                >
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-day-events">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="cal-event-dot" style={{ background: ev.color }} title={ev.titleAr}></div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="calendar-sidebar-panel">
          <h3>
            {selectedDate
              ? new Date(selectedDate + "T00:00:00").toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
              : "اختر يوم / Select a day"}
          </h3>
          {selectedDate && selectedEvents.length === 0 && (
            <p style={{ color: "#94a3b8", marginTop: "16px" }}>لا توجد مواعيد / No events</p>
          )}
          {selectedEvents.map((ev) => (
            <div key={ev.id} className="cal-event-card" style={{ borderRightColor: ev.color }}>
              <div className="cal-event-type">{typeIcons[ev.type] || "📌"} {typeLabels[ev.type] || ev.type}</div>
              <div className="cal-event-title">{ev.titleAr}</div>
              <div className="cal-event-time">
                {ev.startTime !== "00:00" ? ev.startTime + " - " + ev.endTime : "طوال اليوم / All day"}
              </div>
              {ev.location && <div className="cal-event-loc">📍 {ev.location}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
