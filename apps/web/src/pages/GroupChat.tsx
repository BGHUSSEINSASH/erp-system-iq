import { useEffect, useState, useRef } from "react";
import { get, post } from "../api";
import { useAuth } from "../context/AuthContext";

export default function GroupChat() {
  const { name, role } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(function () {
    get("/chat-rooms/rooms").then(function (r: any) {
      setRooms(r.rooms);
      if (r.rooms.length > 0) { setActiveRoom(r.rooms[0].id); }
      setLoading(false);
    });
  }, []);

  useEffect(function () {
    if (activeRoom) {
      get("/chat-rooms/rooms/" + activeRoom + "/messages").then(function (r: any) {
        setMessages(r.messages);
        setRoomInfo(r.room);
      });
    }
  }, [activeRoom]);

  useEffect(function () {
    if (msgEndRef.current) msgEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage() {
    if (!text.trim()) return;
    post("/chat-rooms/rooms/" + activeRoom + "/messages", { sender: name || role, senderRole: role, text: text }).then(function (r: any) {
      setMessages(function (prev) { return [].concat(prev as any, r as any); });
      setText("");
    });
  }

  function handleKeyPress(e: any) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function getRoleColor(r: string) {
    if (r === "admin") return "#6366f1";
    if (r === "hr") return "#10b981";
    if (r === "finance") return "#f59e0b";
    if (r === "sales") return "#ef4444";
    if (r === "manager") return "#8b5cf6";
    return "#64748b";
  }

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page animate-in">
      <div className="page-header">
        <h2>💬 المحادثات / Group Chat</h2>
      </div>

      <div className="chat-layout">
        {/* Rooms Sidebar */}
        <div className="chat-rooms-sidebar">
          <h3>الغرف / Rooms</h3>
          {rooms.map(function (room: any) {
            return (
              <div key={room.id} className={"chat-room-item" + (activeRoom === room.id ? " active" : "")} onClick={function () { setActiveRoom(room.id); }}>
                <span className="room-icon">{room.icon}</span>
                <div className="room-info">
                  <span className="room-name">{room.name}</span>
                  <span className="room-msg-count">{room.messageCount} رسالة</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {roomInfo && (
            <div className="chat-header">
              <span className="room-icon-lg">{roomInfo.icon}</span>
              <div>
                <h3>{roomInfo.name}</h3>
                <span className="room-members">{roomInfo.members.length} عضو</span>
              </div>
            </div>
          )}

          <div className="chat-messages">
            {messages.map(function (msg: any) {
              var isMe = msg.sender === (name || role);
              return (
                <div key={msg.id} className={"chat-msg" + (isMe ? " mine" : "")}>
                  <div className="msg-avatar" style={{ background: getRoleColor(msg.senderRole) }}>{msg.sender.charAt(0).toUpperCase()}</div>
                  <div className="msg-content">
                    <div className="msg-header">
                      <span className="msg-sender" style={{ color: getRoleColor(msg.senderRole) }}>{msg.sender}</span>
                      <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <div className="msg-text">{msg.text}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEndRef}></div>
          </div>

          <div className="chat-input">
            <input value={text} onChange={function (e) { setText(e.target.value); }} onKeyDown={handleKeyPress} placeholder="اكتب رسالتك... / Type your message..." />
            <button className="btn btn-primary" onClick={sendMessage}>إرسال ↩</button>
          </div>
        </div>
      </div>
    </div>
  );
}
