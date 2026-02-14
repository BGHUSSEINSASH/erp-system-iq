import { Router } from "express";
import { channels, chatMessages, addChannel, addChatMessage, findOrCreateDM, userName } from "../data/messages.js";

const router = Router();

/* GET channels for a user */
router.get("/channels", (req, res) => {
  const user = (req.query.user as string) || (req.query._user as string) || "admin";
  const userChannels = channels.filter(c => c.members.includes(user));
  const enriched = userChannels.map(ch => {
    const msgs = chatMessages.filter(m => m.channelId === ch.id);
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const lastRead = ch.readBy[user] || "1970-01-01";
    const unreadCount = msgs.filter(m => m.createdAt > lastRead && m.fromUser !== user).length;
    let displayName = ch.name;
    let displayNameEn = ch.nameEn;
    if (ch.type === "private") {
      const other = ch.members.find(m => m !== user) || "";
      displayName = userName(other);
      displayNameEn = other;
    }
    return { ...ch, displayName, displayNameEn, lastMessage: lastMsg ? { body: lastMsg.body, fromName: lastMsg.fromName, createdAt: lastMsg.createdAt } : null, unreadCount, memberCount: ch.members.length, isAdmin: ch.createdBy === user || user === "admin" || user === "ceo" };
  });
  enriched.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  const totalUnread = enriched.reduce((sum, ch) => sum + ch.unreadCount, 0);
  res.json({ data: enriched, totalUnread });
});

/* POST create channel */
router.post("/channels", (req, res) => {
  const { name, nameEn, type, icon, members, description, createdBy } = req.body;
  const creator = createdBy || (req.query._user as string) || "admin";
  if (type === "private" && members?.length === 2) {
    return res.status(201).json(findOrCreateDM(members[0], members[1]));
  }
  const allUsers = [...new Set(channels[0]?.members || [])];
  const channelMembers = members && members.length > 0 ? [...new Set([creator, ...members])] : allUsers;
  const ch = addChannel({ name: name || "", nameEn: nameEn || "", type: type || "public", icon: icon || "📢", members: channelMembers, description: description || "", createdBy: creator });
  res.status(201).json(ch);
});

/* PUT update channel (owner/admin only) */
router.put("/channels/:channelId", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Channel not found" });
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const isOwner = ch.createdBy === user || user === "admin" || user === "ceo";
  if (!isOwner) return res.status(403).json({ message: "Only channel admin can edit this channel" });
  if (req.body.name !== undefined) ch.name = req.body.name;
  if (req.body.nameEn !== undefined) ch.nameEn = req.body.nameEn;
  if (req.body.icon !== undefined) ch.icon = req.body.icon;
  if (req.body.description !== undefined) ch.description = req.body.description;
  res.json(ch);
});

/* DELETE channel (owner/admin only) */
router.delete("/channels/:channelId", (req, res) => {
  const idx = channels.findIndex(c => c.id === req.params.channelId);
  if (idx === -1) return res.status(404).json({ message: "Channel not found" });
  const ch = channels[idx];
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const isOwner = ch.createdBy === user || user === "admin" || user === "ceo";
  if (!isOwner) return res.status(403).json({ message: "Only channel admin can delete this channel" });
  // Remove messages
  for (let i = chatMessages.length - 1; i >= 0; i--) {
    if (chatMessages[i].channelId === ch.id) chatMessages.splice(i, 1);
  }
  channels.splice(idx, 1);
  res.status(204).send();
});

/* PUT manage channel members (owner/admin only) */
router.put("/channels/:channelId/members", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Channel not found" });
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const isOwner = ch.createdBy === user || user === "admin" || user === "ceo";
  if (!isOwner) return res.status(403).json({ message: "Only channel admin can manage members" });
  const { action, member } = req.body;
  if (action === "add" && member && !ch.members.includes(member)) {
    ch.members.push(member);
  } else if (action === "remove" && member && member !== ch.createdBy) {
    ch.members = ch.members.filter(m => m !== member);
  } else if (action === "set" && Array.isArray(req.body.members)) {
    ch.members = [...new Set([ch.createdBy, ...req.body.members])];
  }
  res.json({ members: ch.members, memberCount: ch.members.length });
});

/* GET channel info */
router.get("/channels/:channelId/info", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Channel not found" });
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const isOwner = ch.createdBy === user || user === "admin" || user === "ceo";
  const memberNames = ch.members.map(m => ({ id: m, name: userName(m) }));
  res.json({ ...ch, isAdmin: isOwner, memberDetails: memberNames });
});

/* GET messages for a channel */
router.get("/ch/:channelId", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Channel not found" });
  const msgs = chatMessages.filter(m => m.channelId === req.params.channelId);
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const isOwner = ch.createdBy === user || user === "admin" || user === "ceo";
  res.json({ data: msgs, pinned: msgs.filter(m => m.pinned), channel: { ...ch, isAdmin: isOwner } });
});

/* POST send message to channel */
router.post("/ch/:channelId", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Channel not found" });
  const user = (req.query._user as string) || req.body.fromUser || "";
  if (!ch.members.includes(user) && user !== "admin") {
    return res.status(403).json({ message: "Not a member of this channel" });
  }
  const msg = addChatMessage({ channelId: req.params.channelId, ...req.body });
  res.status(201).json(msg);
});

/* PUT edit message (only message author or channel admin) */
router.put("/ch/:channelId/msg/:msgId", (req, res) => {
  const m = chatMessages.find(x => x.id === req.params.msgId && x.channelId === req.params.channelId);
  if (!m) return res.status(404).json({ message: "Not found" });
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const ch = channels.find(c => c.id === req.params.channelId);
  const isChannelAdmin = ch && (ch.createdBy === user || user === "admin" || user === "ceo");
  if (m.fromUser !== user && !isChannelAdmin) {
    return res.status(403).json({ message: "Cannot edit others' messages" });
  }
  if (req.body.body) { m.body = req.body.body; m.edited = true; }
  res.json(m);
});

/* DELETE message (only message author or channel admin) */
router.delete("/ch/:channelId/msg/:msgId", (req, res) => {
  const idx = chatMessages.findIndex(x => x.id === req.params.msgId && x.channelId === req.params.channelId);
  if (idx === -1) return res.status(404).json({ message: "Not found" });
  const m = chatMessages[idx];
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const ch = channels.find(c => c.id === req.params.channelId);
  const isChannelAdmin = ch && (ch.createdBy === user || user === "admin" || user === "ceo");
  if (m.fromUser !== user && !isChannelAdmin) {
    return res.status(403).json({ message: "Cannot delete others' messages" });
  }
  chatMessages.splice(idx, 1);
  res.status(204).send();
});

/* POST toggle reaction */
router.post("/ch/:channelId/msg/:msgId/react", (req, res) => {
  const m = chatMessages.find(x => x.id === req.params.msgId);
  if (!m) return res.status(404).json({ message: "Not found" });
  const { emoji, user } = req.body;
  if (!m.reactions[emoji]) m.reactions[emoji] = [];
  const idx = m.reactions[emoji].indexOf(user);
  if (idx >= 0) { m.reactions[emoji].splice(idx, 1); if (m.reactions[emoji].length === 0) delete m.reactions[emoji]; }
  else { m.reactions[emoji].push(user); }
  res.json(m);
});

/* PUT toggle pin (channel admin only) */
router.put("/ch/:channelId/msg/:msgId/pin", (req, res) => {
  const m = chatMessages.find(x => x.id === req.params.msgId);
  if (!m) return res.status(404).json({ message: "Not found" });
  const user = (req.query._user as string) || (req.query.user as string) || "";
  const ch = channels.find(c => c.id === req.params.channelId);
  const isChannelAdmin = ch && (ch.createdBy === user || user === "admin" || user === "ceo");
  if (!isChannelAdmin && m.fromUser !== user) {
    return res.status(403).json({ message: "Only channel admin can pin messages" });
  }
  m.pinned = !m.pinned;
  res.json(m);
});

/* PUT mark channel as read */
router.put("/ch/:channelId/read", (req, res) => {
  const ch = channels.find(c => c.id === req.params.channelId);
  if (!ch) return res.status(404).json({ message: "Not found" });
  const user = (req.query.user as string) || (req.query._user as string) || "admin";
  ch.readBy[user] = new Date().toISOString();
  res.json({ ok: true });
});

export default router;
