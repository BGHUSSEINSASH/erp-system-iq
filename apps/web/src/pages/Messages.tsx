import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { get, post, put, del } from "../api";
import { useAuth } from "../context/AuthContext";

/* ═══════ Types ═══════ */
interface Attachment { id: string; name: string; type: string; size: number; }
interface ChatMessage {
  id: string; channelId: string; fromUser: string; fromName: string; body: string;
  attachments: Attachment[]; replyTo?: string; replyPreview?: string; replyFromName?: string;
  reactions: Record<string, string[]>; pinned: boolean; edited: boolean; createdAt: string;
}
interface Channel {
  id: string; name: string; nameEn: string; type: "public" | "private"; icon: string;
  members: string[]; description: string; createdBy: string; createdAt: string;
  lastMessageAt: string; readBy: Record<string, string>;
  displayName?: string; displayNameEn?: string;
  lastMessage?: { body: string; fromName: string; createdAt: string } | null;
  unreadCount?: number; memberCount?: number;
}

/* ═══════ Users ═══════ */
const ALL_USERS = [
  { username: "admin", name: "مدير النظام", nameEn: "System Admin", dept: "النظام" },
  { username: "ceo", name: "المدير العام", nameEn: "CEO", dept: "الإدارة العليا" },
  { username: "manager", name: "المدير التنفيذي", nameEn: "General Manager", dept: "الإدارة" },
  { username: "hr_manager", name: "أحمد حسن", nameEn: "Ahmed Hassan", dept: "الموارد البشرية" },
  { username: "hr", name: "ليلى ناصر", nameEn: "Layla Nasser", dept: "الموارد البشرية" },
  { username: "hr_assistant", name: "نور محمد", nameEn: "Nour Mohammed", dept: "الموارد البشرية" },
  { username: "finance_manager", name: "سارة علي", nameEn: "Sara Ali", dept: "المالية" },
  { username: "finance", name: "زينب أحمد", nameEn: "Zainab Ahmed", dept: "المالية" },
  { username: "finance_assistant", name: "عمر فيصل", nameEn: "Omar Faisal", dept: "المالية" },
  { username: "sales_manager", name: "محمد خالد", nameEn: "Mohammed Khalid", dept: "المبيعات" },
  { username: "sales", name: "مريم جاسم", nameEn: "Mariam Jasim", dept: "المبيعات" },
  { username: "sales_assistant", name: "حسين علي", nameEn: "Hussein Ali", dept: "المبيعات" },
  { username: "it_manager", name: "فاطمة نور", nameEn: "Fatima Noor", dept: "تكنولوجيا المعلومات" },
  { username: "it", name: "علي رضا", nameEn: "Ali Rida", dept: "تكنولوجيا المعلومات" },
  { username: "it_assistant", name: "كريم حسن", nameEn: "Kareem Hassan", dept: "تكنولوجيا المعلومات" },
  { username: "purchasing_manager", name: "خالد يوسف", nameEn: "Khalid Yousif", dept: "المشتريات" },
  { username: "production_manager", name: "ياسر عبد", nameEn: "Yasser Abed", dept: "الإنتاج" },
];
const uName = (u: string) => ALL_USERS.find(x => x.username === u)?.name || u;
const AVATAR_COLORS = ["#6366f1","#ec4899","#14b8a6","#f59e0b","#ef4444","#8b5cf6","#10b981","#3b82f6","#f97316","#06b6d4","#84cc16","#e11d48","#7c3aed","#0ea5e9","#d946ef","#22c55e","#64748b"];
const avatarColor = (u: string) => AVATAR_COLORS[u.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

const REACTIONS = ["👍","❤️","🎉","😂","😮","😢","🔥","👏"];
const FILE_ICONS: Record<string, string> = { pdf: "📄", spreadsheet: "📊", doc: "📝", image: "🖼️", zip: "📦" };
const fileIcon = (type: string) => FILE_ICONS[type] || "📎";
const fileSize = (s: number) => s > 1048576 ? `${(s / 1048576).toFixed(1)} MB` : `${Math.round(s / 1024)} KB`;

/* ═══════════ COMPONENT ═══════════ */
export default function Messages() {
  const { role } = useAuth();
  const currentUser = role || "admin";
  const currentName = uName(currentUser);

  /* ── State ── */
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChId, setActiveChId] = useState<string>("");
  const [activeCh, setActiveCh] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinnedMsgs, setPinnedMsgs] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [totalUnread, setTotalUnread] = useState(0);
  const [search, setSearch] = useState("");
  const [chatSearch, setChatSearch] = useState("");

  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [editText, setEditText] = useState("");

  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [showPinned, setShowPinned] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [sentPopup, setSentPopup] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [newChName, setNewChName] = useState("");
  const [newChNameEn, setNewChNameEn] = useState("");
  const [newChDesc, setNewChDesc] = useState("");
  const [newChIcon, setNewChIcon] = useState("📢");

  const [sidebarTab, setSidebarTab] = useState<"channels" | "dms">("channels");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* ── Toast ── */
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Load channels ── */
  const loadChannels = useCallback(() => {
    get<{ data: Channel[]; totalUnread: number }>(`/messages/channels?user=${currentUser}`)
      .then(r => { setChannels(r.data || []); setTotalUnread(r.totalUnread || 0); })
      .catch(() => {});
  }, [currentUser]);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  /* ── Auto-select first channel ── */
  useEffect(() => {
    if (channels.length > 0 && !activeChId) setActiveChId(channels[0].id);
  }, [channels, activeChId]);

  /* ── Load messages for active channel ── */
  const loadMessages = useCallback(() => {
    if (!activeChId) return;
    setMsgLoading(true);
    get<{ data: ChatMessage[]; pinned: ChatMessage[]; channel: Channel }>(`/messages/ch/${activeChId}`)
      .then(r => {
        setMessages(r.data || []);
        setPinnedMsgs(r.pinned || []);
        setActiveCh(r.channel || null);
        /* mark as read */
        put(`/messages/ch/${activeChId}/read?user=${currentUser}`, {}).then(() => loadChannels());
      })
      .catch(() => showToast("فشل تحميل الرسائل", "error"))
      .finally(() => setMsgLoading(false));
  }, [activeChId, currentUser, loadChannels]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, [messages]);

  /* ── Send message ── */
  const sendMessage = useCallback(() => {
    const body = inputText.trim();
    if (!body && attachments.length === 0) return;
    const payload: any = { fromUser: currentUser, fromName: currentName, body, attachments };
    if (replyTo) {
      payload.replyTo = replyTo.id;
      payload.replyPreview = replyTo.body.substring(0, 80);
      payload.replyFromName = replyTo.fromName;
    }
    post(`/messages/ch/${activeChId}`, payload).then(() => {
      setInputText("");
      setAttachments([]);
      setReplyTo(null);
      setSentPopup(true);
      setTimeout(() => setSentPopup(false), 2200);
      loadMessages();
    }).catch(() => showToast("فشل الإرسال", "error"));
  }, [inputText, attachments, replyTo, activeChId, currentUser, currentName, loadMessages]);

  /* ── Edit message ── */
  const saveEdit = useCallback(() => {
    if (!editingMsg || !editText.trim()) return;
    put(`/messages/ch/${activeChId}/msg/${editingMsg.id}`, { body: editText.trim() })
      .then(() => { setEditingMsg(null); setEditText(""); loadMessages(); showToast("تم التعديل"); })
      .catch(() => showToast("فشل التعديل", "error"));
  }, [editingMsg, editText, activeChId, loadMessages]);

  /* ── Delete message ── */
  const deleteMessage = useCallback((id: string) => {
    del(`/messages/ch/${activeChId}/msg/${id}`)
      .then(() => { setDeleteConfirm(null); loadMessages(); showToast("تم الحذف"); })
      .catch(() => showToast("فشل الحذف", "error"));
  }, [activeChId, loadMessages]);

  /* ── React ── */
  const toggleReaction = useCallback((msgId: string, emoji: string) => {
    post(`/messages/ch/${activeChId}/msg/${msgId}/react`, { emoji, user: currentUser })
      .then(() => { setShowReactions(null); loadMessages(); });
  }, [activeChId, currentUser, loadMessages]);

  /* ── Pin ── */
  const togglePin = useCallback((msgId: string) => {
    put(`/messages/ch/${activeChId}/msg/${msgId}/pin`, {}).then(() => loadMessages());
  }, [activeChId, loadMessages]);

  /* ── Create channel ── */
  const createChannel = useCallback(() => {
    if (!newChName.trim()) return;
    post("/messages/channels", { name: newChName, nameEn: newChNameEn, type: "public", icon: newChIcon, description: newChDesc, createdBy: currentUser })
      .then((ch: any) => {
        setShowNewChannel(false);
        setNewChName(""); setNewChNameEn(""); setNewChDesc(""); setNewChIcon("📢");
        loadChannels();
        setActiveChId(ch.id);
        showToast("تم إنشاء القناة بنجاح");
      }).catch(() => showToast("فشل الإنشاء", "error"));
  }, [newChName, newChNameEn, newChIcon, newChDesc, currentUser, loadChannels]);

  /* ── Start DM ── */
  const startDM = useCallback((otherUser: string) => {
    post("/messages/channels", { type: "private", members: [currentUser, otherUser] })
      .then((ch: any) => {
        setShowNewDM(false);
        loadChannels();
        setActiveChId(ch.id);
      }).catch(() => showToast("فشل فتح المحادثة", "error"));
  }, [currentUser, loadChannels]);

  /* ── File attach (simulated) ── */
  const handleFileSelect = () => {
    const fakeFiles = [
      { name: "تقرير_شهري.pdf", type: "pdf", size: 245000 },
      { name: "بيانات_الموظفين.xlsx", type: "spreadsheet", size: 180000 },
      { name: "ملاحظات.docx", type: "doc", size: 85000 },
      { name: "صورة_المشروع.png", type: "image", size: 520000 },
    ];
    const f = fakeFiles[Math.floor(Math.random() * fakeFiles.length)];
    setAttachments(prev => [...prev, { id: `att-${Date.now()}`, ...f }]);
    showToast(`📎 تم إرفاق: ${f.name}`);
  };

  /* ── Time formatting ── */
  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "الآن";
    if (m < 60) return `${m} د`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} س`;
    const dy = Math.floor(h / 24);
    if (dy < 7) return `${dy} ي`;
    return new Date(d).toLocaleDateString("ar-IQ", { month: "short", day: "numeric" });
  };
  const fullDate = (d: string) => new Date(d).toLocaleString("ar-IQ", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const chatTimeLabel = (d: string) => new Date(d).toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" });

  /* ── Filter channels ── */
  const publicChannels = useMemo(() => channels.filter(c => c.type === "public" && (c.displayName || c.name || "").toLowerCase().includes(search.toLowerCase())), [channels, search]);
  const dmChannels = useMemo(() => channels.filter(c => c.type === "private" && (c.displayName || "").toLowerCase().includes(search.toLowerCase())), [channels, search]);

  /* ── Filter chat messages ── */
  const filteredMessages = useMemo(() => {
    if (!chatSearch.trim()) return messages;
    const q = chatSearch.toLowerCase();
    return messages.filter(m => m.body.toLowerCase().includes(q) || m.fromName.toLowerCase().includes(q));
  }, [messages, chatSearch]);

  /* ── Should group messages ── */
  const shouldGroup = (curr: ChatMessage, prev: ChatMessage | null) => {
    if (!prev) return false;
    if (prev.fromUser !== curr.fromUser) return false;
    return new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime() < 300000;
  };

  /* ── Keyboard send ── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); editingMsg ? saveEdit() : sendMessage(); }
  };

  /* ═══════════ RENDER ═══════════ */
  return (
    <div className="page animate-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", overflow: "hidden" }}>

      {/* ── Toast ── */}
      {toast && (
        <div className="animate-in" style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10000,
          padding: "10px 24px", borderRadius: 12, fontSize: 13, fontWeight: 600,
          background: toast.type === "success" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)",
          color: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,.18)",
        }}>{toast.text}</div>
      )}

      {/* ── Sent popup ── */}
      {sentPopup && (
        <div className="animate-in" style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 10000,
          padding: "12px 28px", borderRadius: 14, fontSize: 14, fontWeight: 700,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
          boxShadow: "0 8px 30px rgba(99,102,241,.35)", display: "flex", alignItems: "center", gap: 8,
        }}>✅ تم إرسال الرسالة بنجاح!</div>
      )}

      {/* ── Main container ── */}
      <div style={{
        flex: 1, display: "grid", gridTemplateColumns: "280px 1fr",
        background: "var(--card)", borderRadius: 18, border: "1px solid var(--border)",
        overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,.06)", minHeight: 0,
      }}>

        {/* ═══════ SIDEBAR ═══════ */}
        <div style={{ background: "var(--bg-subtle)", borderLeft: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Sidebar header */}
          <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}>
                💬 المراسلات
                {totalUnread > 0 && <span style={{ fontSize: 10, background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>{totalUnread}</span>}
              </h3>
            </div>
            {/* Search */}
            <input type="text" placeholder="🔍 بحث..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font)", background: "var(--card)" }} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
            {[
              { id: "channels" as const, label: "القنوات", icon: "📢", count: publicChannels.length },
              { id: "dms" as const, label: "المحادثات", icon: "👤", count: dmChannels.length },
            ].map(t => (
              <button key={t.id} onClick={() => setSidebarTab(t.id)}
                style={{
                  flex: 1, padding: "10px 8px", border: "none", fontFamily: "var(--font)",
                  fontSize: 12, fontWeight: sidebarTab === t.id ? 700 : 400, cursor: "pointer",
                  background: sidebarTab === t.id ? "rgba(99,102,241,0.06)" : "transparent",
                  borderBottom: sidebarTab === t.id ? "2px solid #6366f1" : "2px solid transparent",
                  color: sidebarTab === t.id ? "#6366f1" : "var(--ink-muted)",
                }}>
                {t.icon} {t.label} <span style={{ fontSize: 10, opacity: 0.6 }}>({t.count})</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ padding: "8px 12px", display: "flex", gap: 6, flexShrink: 0 }}>
            {sidebarTab === "channels" ? (
              <button onClick={() => setShowNewChannel(true)} style={{
                flex: 1, padding: "8px", borderRadius: 10, border: "1px dashed var(--border)",
                background: "transparent", cursor: "pointer", fontSize: 11, fontFamily: "var(--font)",
                color: "#6366f1", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>+ قناة جديدة</button>
            ) : (
              <button onClick={() => setShowNewDM(true)} style={{
                flex: 1, padding: "8px", borderRadius: 10, border: "1px dashed var(--border)",
                background: "transparent", cursor: "pointer", fontSize: 11, fontFamily: "var(--font)",
                color: "#6366f1", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              }}>+ محادثة جديدة</button>
            )}
          </div>

          {/* Channel list */}
          <div style={{ overflow: "auto", flex: 1, padding: "4px 8px" }}>
            {(sidebarTab === "channels" ? publicChannels : dmChannels).map(ch => (
              <button key={ch.id}
                onClick={() => { setActiveChId(ch.id); setChatSearch(""); setShowPinned(false); setShowMembers(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px",
                  border: "none", borderRadius: 12, marginBottom: 2, cursor: "pointer", fontFamily: "var(--font)",
                  background: activeChId === ch.id ? "rgba(99,102,241,0.1)" : "transparent",
                  transition: "all .15s", textAlign: "right",
                }}>
                {/* Avatar */}
                {ch.type === "private" ? (
                  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: `linear-gradient(135deg, ${avatarColor(ch.displayNameEn || ch.id)}, ${avatarColor(ch.displayNameEn || ch.id)}cc)`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700 }}>
                    {(ch.displayName || "?").charAt(0)}
                  </div>
                ) : (
                  <div style={{ width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(99,102,241,0.05))",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {ch.icon}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: activeChId === ch.id ? 700 : 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ch.displayName || ch.name}
                    </span>
                    {ch.lastMessage && <span style={{ fontSize: 10, color: "var(--ink-muted)", flexShrink: 0 }}>{timeAgo(ch.lastMessage.createdAt)}</span>}
                  </div>
                  {ch.lastMessage && (
                    <div style={{ fontSize: 11, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                      <span style={{ fontWeight: 600 }}>{ch.lastMessage.fromName.split(" ")[0]}:</span> {ch.lastMessage.body.substring(0, 40)}
                    </div>
                  )}
                </div>

                {/* Unread badge */}
                {(ch.unreadCount || 0) > 0 && (
                  <span style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 700, flexShrink: 0 }}>
                    {ch.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Current user */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${avatarColor(currentUser)}, ${avatarColor(currentUser)}cc)`,
              display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>
              {currentName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{currentName}</div>
              <div style={{ fontSize: 10, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block" }} /> متصل
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ CHAT AREA ═══════ */}
        {activeChId ? (
          <div style={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>

            {/* ── Chat header ── */}
            <div style={{
              padding: "12px 20px", borderBottom: "1px solid var(--border)", display: "flex",
              alignItems: "center", justifyContent: "space-between", flexShrink: 0,
              background: "linear-gradient(135deg, rgba(99,102,241,.02), transparent)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{activeCh?.type === "private" ? "👤" : (activeCh?.icon || "📢")}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {activeCh?.type === "private" ?
                      uName(activeCh.members.find(m => m !== currentUser) || "") :
                      (activeCh?.name || "")}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                    {activeCh?.type === "private" ?
                      "محادثة خاصة / Private Chat" :
                      `${activeCh?.memberCount || 0} عضو · ${messages.length} رسالة`}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => setChatSearch(prev => prev ? "" : " ")} title="بحث"
                  style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: chatSearch !== "" ? "rgba(99,102,241,0.1)" : "var(--card)", cursor: "pointer", fontSize: 14 }}>🔍</button>
                <button onClick={() => setShowPinned(p => !p)} title="المثبتة"
                  style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: showPinned ? "rgba(99,102,241,0.1)" : "var(--card)", cursor: "pointer", fontSize: 14, position: "relative" }}>
                  📌 {pinnedMsgs.length > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>{pinnedMsgs.length}</span>}
                </button>
                {activeCh?.type === "public" && (
                  <button onClick={() => setShowMembers(p => !p)} title="الأعضاء"
                    style={{ width: 34, height: 34, borderRadius: 10, border: "1px solid var(--border)", background: showMembers ? "rgba(99,102,241,0.1)" : "var(--card)", cursor: "pointer", fontSize: 14 }}>👥</button>
                )}
              </div>
            </div>

            {/* ── Chat search bar ── */}
            {chatSearch !== "" && (
              <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", gap: 8 }}>
                <input type="text" placeholder="بحث في المحادثة..." value={chatSearch.trim() ? chatSearch : ""} onChange={e => setChatSearch(e.target.value)}
                  autoFocus style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, fontFamily: "var(--font)" }} />
                <button onClick={() => setChatSearch("")} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
            )}

            {/* ── Pinned messages panel ── */}
            {showPinned && pinnedMsgs.length > 0 && (
              <div className="animate-in" style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(245,158,11,0.03)", maxHeight: 150, overflow: "auto", flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>📌 الرسائل المثبتة ({pinnedMsgs.length})</div>
                {pinnedMsgs.map(p => (
                  <div key={p.id} style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(245,158,11,0.06)", marginBottom: 4, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                    <span><strong>{p.fromName.split(" ")[0]}:</strong> {p.body.substring(0, 60)}</span>
                    <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{timeAgo(p.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Members panel ── */}
            {showMembers && activeCh?.type === "public" && (
              <div className="animate-in" style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", background: "rgba(99,102,241,0.02)", maxHeight: 200, overflow: "auto", flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", marginBottom: 8 }}>👥 الأعضاء ({activeCh.members.length})</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {activeCh.members.map(m => (
                    <span key={m} style={{
                      padding: "4px 12px", borderRadius: 8, fontSize: 11,
                      background: m === currentUser ? "rgba(99,102,241,0.1)" : "var(--bg-subtle)",
                      border: "1px solid var(--border)", fontWeight: m === currentUser ? 700 : 400,
                    }}>
                      {uName(m)} {m === currentUser && "⭐"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Messages area ── */}
            <div style={{ flex: 1, overflow: "auto", padding: "16px 20px 8px", minHeight: 0 }}>
              {msgLoading ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--bg-subtle)", animation: "pulse 1.5s ease infinite", flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ height: 14, width: "30%", background: "var(--bg-subtle)", borderRadius: 6, marginBottom: 6, animation: "pulse 1.5s ease infinite" }} />
                        <div style={{ height: 40, width: `${50 + i * 8}%`, background: "var(--bg-subtle)", borderRadius: 10, animation: "pulse 1.5s ease infinite" }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", opacity: 0.4 }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>💬</div>
                  <div style={{ fontSize: 14 }}>{chatSearch ? "لا توجد نتائج" : "ابدأ المحادثة!"}</div>
                </div>
              ) : (
                filteredMessages.map((m, idx) => {
                  const isMe = m.fromUser === currentUser;
                  const grouped = shouldGroup(m, filteredMessages[idx - 1] || null);
                  return (
                    <div key={m.id} className="animate-in" style={{
                      marginBottom: grouped ? 2 : 14,
                      display: "flex", gap: 10, alignItems: "flex-start",
                      flexDirection: isMe ? "row-reverse" : "row",
                    }}>
                      {/* Avatar */}
                      {!grouped ? (
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: `linear-gradient(135deg, ${avatarColor(m.fromUser)}, ${avatarColor(m.fromUser)}cc)`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 14, fontWeight: 700,
                        }}>{m.fromName.charAt(0)}</div>
                      ) : <div style={{ width: 36, flexShrink: 0 }} />}

                      {/* Bubble */}
                      <div style={{ maxWidth: "70%", minWidth: 120 }}>
                        {/* Name + time */}
                        {!grouped && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexDirection: isMe ? "row-reverse" : "row" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: avatarColor(m.fromUser) }}>{m.fromName}</span>
                            <span style={{ fontSize: 10, color: "var(--ink-muted)" }}>{chatTimeLabel(m.createdAt)}</span>
                            {m.pinned && <span style={{ fontSize: 10 }}>📌</span>}
                            {m.edited && <span style={{ fontSize: 10, color: "var(--ink-muted)", fontStyle: "italic" }}>(معدّلة)</span>}
                          </div>
                        )}

                        {/* Reply preview */}
                        {m.replyTo && m.replyPreview && (
                          <div style={{
                            padding: "6px 10px", marginBottom: 4, borderRadius: "8px 8px 8px 2px",
                            background: "rgba(99,102,241,0.06)", borderRight: "3px solid #6366f1",
                            fontSize: 11, color: "var(--ink-muted)",
                          }}>
                            <span style={{ fontWeight: 700, color: "#6366f1" }}>{m.replyFromName}</span>
                            <div style={{ marginTop: 2 }}>{m.replyPreview}</div>
                          </div>
                        )}

                        {/* Message body */}
                        {editingMsg?.id === m.id ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <textarea value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={handleKeyDown}
                              autoFocus rows={2}
                              style={{ flex: 1, padding: "8px 12px", borderRadius: 10, border: "1px solid #6366f1", fontSize: 13, fontFamily: "var(--font)", resize: "none" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <button onClick={saveEdit} style={{ border: "none", background: "#6366f1", color: "#fff", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "var(--font)" }}>حفظ</button>
                              <button onClick={() => setEditingMsg(null)} style={{ border: "none", background: "var(--bg-subtle)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 11, fontFamily: "var(--font)" }}>إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{
                            padding: "10px 14px", fontSize: 13.5, lineHeight: 1.7,
                            borderRadius: isMe ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                            background: isMe ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-subtle)",
                            color: isMe ? "#fff" : "var(--ink)",
                            border: isMe ? "none" : "1px solid var(--border)",
                            whiteSpace: "pre-wrap", wordBreak: "break-word", position: "relative",
                          }}>
                            {m.body}

                            {/* Attachments */}
                            {m.attachments.length > 0 && (
                              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                                {m.attachments.map(a => (
                                  <div key={a.id} style={{
                                    display: "flex", alignItems: "center", gap: 8, padding: "6px 10px",
                                    borderRadius: 8, background: isMe ? "rgba(255,255,255,0.15)" : "var(--card)",
                                    border: isMe ? "none" : "1px solid var(--border)", fontSize: 11,
                                  }}>
                                    <span style={{ fontSize: 18 }}>{fileIcon(a.type)}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                                      <div style={{ fontSize: 10, opacity: 0.7 }}>{fileSize(a.size)}</div>
                                    </div>
                                    <span style={{ fontSize: 14, cursor: "pointer" }}>⬇️</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* ── Hover actions ── */}
                            <div className="chat-msg-actions" style={{
                              position: "absolute", top: -14, [isMe ? "right" : "left"]: 8,
                              display: "none", gap: 2, background: "var(--card)", borderRadius: 8,
                              border: "1px solid var(--border)", padding: 2, boxShadow: "0 4px 12px rgba(0,0,0,.08)",
                            }}>
                              <button onClick={() => setShowReactions(showReactions === m.id ? null : m.id)} title="تفاعل"
                                style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 6, fontSize: 12 }}>😀</button>
                              <button onClick={() => { setReplyTo(m); inputRef.current?.focus(); }} title="رد"
                                style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 6, fontSize: 12 }}>↩️</button>
                              <button onClick={() => togglePin(m.id)} title={m.pinned ? "إلغاء التثبيت" : "تثبيت"}
                                style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 6, fontSize: 12 }}>{m.pinned ? "📌" : "📍"}</button>
                              {isMe && (
                                <>
                                  <button onClick={() => { setEditingMsg(m); setEditText(m.body); }} title="تعديل"
                                    style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 6, fontSize: 12 }}>✏️</button>
                                  <button onClick={() => setDeleteConfirm(m.id)} title="حذف"
                                    style={{ width: 26, height: 26, border: "none", background: "none", cursor: "pointer", borderRadius: 6, fontSize: 12 }}>🗑️</button>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Reaction picker */}
                        {showReactions === m.id && (
                          <div className="animate-in" style={{
                            display: "flex", gap: 4, padding: "6px 8px", background: "var(--card)",
                            border: "1px solid var(--border)", borderRadius: 12, marginTop: 4,
                            boxShadow: "0 4px 16px rgba(0,0,0,.08)",
                          }}>
                            {REACTIONS.map(em => (
                              <button key={em} onClick={() => toggleReaction(m.id, em)}
                                style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, padding: "2px 4px", borderRadius: 6, transition: "transform .1s" }}
                                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.3)")}
                                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                              >{em}</button>
                            ))}
                          </div>
                        )}

                        {/* Reactions display */}
                        {Object.keys(m.reactions).length > 0 && (
                          <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                            {Object.entries(m.reactions).map(([emoji, users]) => (
                              <button key={emoji}
                                onClick={() => toggleReaction(m.id, emoji)}
                                style={{
                                  display: "flex", alignItems: "center", gap: 3, padding: "2px 8px",
                                  borderRadius: 10, fontSize: 12, cursor: "pointer", fontFamily: "var(--font)",
                                  background: users.includes(currentUser) ? "rgba(99,102,241,0.1)" : "var(--bg-subtle)",
                                  border: `1px solid ${users.includes(currentUser) ? "rgba(99,102,241,0.3)" : "var(--border)"}`,
                                }}>
                                {emoji} <span style={{ fontSize: 11, fontWeight: 600 }}>{users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ── Reply bar ── */}
            {replyTo && (
              <div className="animate-in" style={{
                padding: "8px 20px", borderTop: "1px solid var(--border)", background: "rgba(99,102,241,0.03)",
                display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
              }}>
                <div style={{ flex: 1, borderRight: "3px solid #6366f1", paddingRight: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6366f1" }}>↩️ الرد على {replyTo.fromName}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{replyTo.body.substring(0, 80)}</div>
                </div>
                <button onClick={() => setReplyTo(null)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 16, color: "var(--ink-muted)" }}>✕</button>
              </div>
            )}

            {/* ── Attachments bar ── */}
            {attachments.length > 0 && (
              <div style={{ padding: "8px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, flexWrap: "wrap", flexShrink: 0 }}>
                {attachments.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 8, background: "var(--bg-subtle)", border: "1px solid var(--border)", fontSize: 11 }}>
                    {fileIcon(a.type)} {a.name}
                    <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                      style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "#ef4444" }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* ── Input bar ── */}
            <div style={{
              padding: "12px 20px", borderTop: "1px solid var(--border)", display: "flex",
              alignItems: "flex-end", gap: 8, flexShrink: 0, background: "var(--bg-subtle)",
            }}>
              {/* File button */}
              <button onClick={handleFileSelect} title="إرفاق ملف"
                style={{
                  width: 38, height: 38, borderRadius: 10, border: "1px solid var(--border)",
                  background: "var(--card)", cursor: "pointer", fontSize: 16, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>📎</button>

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={inputText} onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك... (Enter للإرسال)"
                rows={1}
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12, border: "1px solid var(--border)",
                  fontSize: 13, fontFamily: "var(--font)", background: "var(--card)", resize: "none",
                  lineHeight: 1.5, maxHeight: 120, overflow: "auto",
                }} />

              {/* Send button */}
              <button onClick={sendMessage}
                disabled={!inputText.trim() && attachments.length === 0}
                style={{
                  width: 38, height: 38, borderRadius: 10, border: "none", flexShrink: 0,
                  background: (inputText.trim() || attachments.length > 0) ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "var(--bg-subtle)",
                  color: (inputText.trim() || attachments.length > 0) ? "#fff" : "var(--ink-muted)",
                  cursor: (inputText.trim() || attachments.length > 0) ? "pointer" : "default",
                  fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}>📤</button>
            </div>
          </div>
        ) : (
          /* ── No channel selected ── */
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-subtle)" }}>
            <div style={{ textAlign: "center", opacity: 0.4 }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>💬</div>
              <div style={{ fontSize: 14 }}>اختر قناة أو محادثة للبدء</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Select a channel or chat to start</div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════ New Channel Modal ═══════ */}
      {showNewChannel && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="animate-in" style={{ background: "var(--card)", borderRadius: 18, padding: "28px 32px", width: 420, maxWidth: "92vw", border: "1px solid var(--border)", boxShadow: "0 15px 40px rgba(0,0,0,.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>📢 إنشاء قناة جديدة / New Channel</h3>
              <button onClick={() => setShowNewChannel(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Icon */}
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>الأيقونة</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {["📢", "💼", "🏢", "🛒", "📊", "🔧", "📚", "🎯"].map(ic => (
                    <button key={ic} onClick={() => setNewChIcon(ic)}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${newChIcon === ic ? "#6366f1" : "var(--border)"}`, background: newChIcon === ic ? "rgba(99,102,241,0.1)" : "transparent", cursor: "pointer", fontSize: 18 }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name AR */}
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>اسم القناة (عربي) *</label>
                <input type="text" value={newChName} onChange={e => setNewChName(e.target.value)} placeholder="مثال: قسم التسويق"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--font)" }} />
              </div>

              {/* Name EN */}
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>Channel Name (English)</label>
                <input type="text" value={newChNameEn} onChange={e => setNewChNameEn(e.target.value)} placeholder="e.g. Marketing"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--font)" }} />
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>الوصف</label>
                <textarea value={newChDesc} onChange={e => setNewChDesc(e.target.value)} placeholder="وصف القناة..." rows={2}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 13, fontFamily: "var(--font)", resize: "none" }} />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button className="btn btn-primary" onClick={createChannel} disabled={!newChName.trim()} style={{ padding: "10px 24px", fontSize: 13 }}>
                  ✅ إنشاء / Create
                </button>
                <button className="btn btn-secondary" onClick={() => setShowNewChannel(false)} style={{ padding: "10px 20px", fontSize: 13 }}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ New DM Modal ═══════ */}
      {showNewDM && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="animate-in" style={{ background: "var(--card)", borderRadius: 18, padding: "28px 32px", width: 420, maxWidth: "92vw", border: "1px solid var(--border)", boxShadow: "0 15px 40px rgba(0,0,0,.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>👤 محادثة جديدة / New Chat</h3>
              <button onClick={() => setShowNewDM(false)} style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-muted)", marginBottom: 12 }}>اختر الشخص لبدء محادثة خاصة:</div>
            <div style={{ maxHeight: 320, overflow: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
              {ALL_USERS.filter(u => u.username !== currentUser).map(u => (
                <button key={u.username} onClick={() => startDM(u.username)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                    border: "1px solid var(--border)", background: "var(--card)", cursor: "pointer",
                    fontFamily: "var(--font)", transition: "all .15s", textAlign: "right",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.05)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--card)")}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${avatarColor(u.username)}, ${avatarColor(u.username)}cc)`,
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {u.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{u.dept}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Delete Confirm ═══════ */}
      {deleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="animate-in" style={{ background: "var(--card)", borderRadius: 18, padding: "28px 32px", width: 360, border: "1px solid var(--border)", boxShadow: "0 15px 40px rgba(0,0,0,.12)", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🗑️</div>
            <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>حذف الرسالة؟</h3>
            <div style={{ fontSize: 13, color: "var(--ink-muted)", marginBottom: 20 }}>لا يمكن التراجع عن الحذف</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button className="btn" onClick={() => deleteMessage(deleteConfirm)}
                style={{ padding: "9px 22px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontSize: 13 }}>
                حذف
              </button>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)} style={{ padding: "9px 22px", fontSize: 13 }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ CSS for hover actions ═══════ */}
      <style>{`
        [style*="position: relative"]:hover .chat-msg-actions { display: flex !important; }
        textarea:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.08); }
      `}</style>
    </div>
  );
}
