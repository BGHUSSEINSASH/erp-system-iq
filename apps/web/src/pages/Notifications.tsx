import { useEffect, useState } from "react";
import { get, put } from "../api";

interface Notification {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    get<{ data: Notification[] }>("/notifications").then((r) => setNotifications(r.data));
  }, []);

  function markRead(id: string) {
    put("/notifications/" + id + "/read", {}).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    });
  }

  function markAllRead() {
    put("/notifications/read-all", {}).then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  var typeIcons: Record<string, string> = {
    leave: "🏖️", invoice: "🧾", ticket: "🎫", purchase: "🛒",
    payroll: "💰", system: "⚙️", approval: "✅", message: "💬",
  };

  var filtered = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;
  var unreadCount = notifications.filter((n) => !n.read).length;

  function timeAgo(dateStr: string) {
    var diff = Date.now() - new Date(dateStr).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 60) return mins + " دقيقة";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + " ساعة";
    return Math.floor(hrs / 24) + " يوم";
  }

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>🔔 الإشعارات / Notifications</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge badge-pending" style={{ fontSize: "0.9rem", padding: "6px 14px" }}>
            {unreadCount} غير مقروءة / unread
          </span>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={markAllRead}>
              تحديد الكل كمقروء / Mark all read
            </button>
          )}
        </div>
      </div>

      <div className="report-tabs" style={{ marginBottom: "20px" }}>
        <button className={"report-tab " + (filter === "all" ? "active" : "")} onClick={() => setFilter("all")}>
          الكل / All ({notifications.length})
        </button>
        <button className={"report-tab " + (filter === "unread" ? "active" : "")} onClick={() => setFilter("unread")}>
          غير مقروءة / Unread ({unreadCount})
        </button>
      </div>

      <div className="notifications-list">
        {filtered.length === 0 ? (
          <div className="chart-card" style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔔</div>
            <p style={{ color: "#94a3b8" }}>لا توجد إشعارات / No notifications</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={"notification-item " + (n.read ? "" : "unread")}
              onClick={() => !n.read && markRead(n.id)}
              style={{ cursor: n.read ? "default" : "pointer" }}
            >
              <div className="notif-icon">{typeIcons[n.type] || "📌"}</div>
              <div className="notif-content">
                <div className="notif-title">
                  {n.titleAr}
                  {!n.read && <span className="notif-dot"></span>}
                </div>
                <div className="notif-message">{n.message}</div>
                <div className="notif-time">منذ {timeAgo(n.createdAt)} / {timeAgo(n.createdAt)} ago</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
