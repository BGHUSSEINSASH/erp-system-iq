import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { get, post, put, del } from "../api";
import { generatePDFReport } from "../utils/pdf";

/* ───────── types ───────── */
type AttRecord = {
  id: string; employeeId?: string; employeeName: string; date: string;
  checkIn: string; checkOut: string; status: string;
  photo?: string; bgPhoto?: string;
  latitude?: number; longitude?: number; locationAddress?: string;
  checkOutLatitude?: number; checkOutLongitude?: number; checkOutLocationAddress?: string;
  lateMinutes?: number; exceptionReason?: string;
  exceptionApprovedBy?: string; exceptionStatus?: string; device?: string;
};

type Loc = { lat: number; lng: number; address: string };
type Tab = "checkin" | "records" | "exceptions" | "reports" | "manage";

const ADMIN_ROLES = ["admin", "ceo", "manager", "hr", "hr_manager", "hr_assistant"];
const WORK_START_MINUTES = 480; // 08:00

/* ───────── helpers ───────── */
function calcHours(ci: string, co: string): string {
  if (!ci || !co) return "—";
  const [h1, m1] = ci.split(":").map(Number);
  const [h2, m2] = co.split(":").map(Number);
  const d = (h2 * 60 + m2) - (h1 * 60 + m1);
  return d <= 0 ? "—" : `${Math.floor(d / 60)}س ${d % 60}د`;
}
function calcMins(ci: string, co: string): number {
  if (!ci || !co) return 0;
  const [h1, m1] = ci.split(":").map(Number);
  const [h2, m2] = co.split(":").map(Number);
  return Math.max(0, (h2 * 60 + m2) - (h1 * 60 + m1));
}

const SC: Record<string, string> = { present: "#10b981", absent: "#ef4444", late: "#f59e0b", leave: "#3b82f6", exception: "#a855f7" };
const SL: Record<string, string> = { present: "✅ حاضر", absent: "❌ غائب", late: "⏰ متأخر", leave: "🏖️ إجازة", exception: "⚠️ استثناء" };

function Badge({ s }: { s: string }) {
  const c = SC[s] || "#888";
  return <span className="badge" style={{ background: `${c}18`, color: c, borderRadius: 20, fontSize: 11, padding: "3px 12px", fontWeight: 600 }}>{SL[s] || s}</span>;
}

/* ═══════════ COMPONENT ═══════════ */
export default function BiometricAttendance() {
  const { name: userName, role } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(role || "");

  /* ── core state ── */
  const [items, setItems] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<Tab>("checkin");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  /* ── camera ── */
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStep, setCameraStep] = useState<"location" | "face" | "background" | "done">("location");
  const [cameraMode, setCameraMode] = useState<"checkin" | "checkout" | null>(null);
  const [facePhoto, setFacePhoto] = useState<string | null>(null);
  const [bgPhoto, setBgPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<Loc | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [confirmingAttendance, setConfirmingAttendance] = useState(false);

  /* ── filters ── */
  const [dateFrom, setDateFrom] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split("T")[0]; });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [searchName, setSearchName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  /* ── exception ── */
  const [excModal, setExcModal] = useState(false);
  const [excForm, setExcForm] = useState({ employeeName: "", reason: "", date: new Date().toISOString().split("T")[0] });

  /* ── late edit ── */
  const [editLateId, setEditLateId] = useState<string | null>(null);
  const [editLateVal, setEditLateVal] = useState(0);

  /* ── reports ── */
  const [reportPeriod, setReportPeriod] = useState<"week" | "month" | "all">("month");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /* ── data loading ── */
  const reload = useCallback(() => {
    setLoading(true);
    get<{ items: AttRecord[] }>("/attendance")
      .then(r => setItems(r.items || []))
      .catch(() => showMsg("❌ فشل تحميل البيانات", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { return () => { stopStream(); }; }, []);

  const showMsg = (text: string, type: "success" | "error") => { setMsg({ text, type }); setTimeout(() => setMsg(null), 5000); };

  const stopStream = () => { if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; } };

  /* ── computed data ── */
  const today = new Date().toISOString().split("T")[0];
  const todayItems = useMemo(() => items.filter(i => i.date === today), [items, today]);
  const myTodayRecord = useMemo(() => todayItems.find(i => i.employeeName === userName), [todayItems, userName]);
  const hasCheckedIn = !!myTodayRecord?.checkIn;
  const hasCheckedOut = !!myTodayRecord?.checkOut;

  const filtered = useMemo(() => items.filter(i => {
    if (i.date < dateFrom || i.date > dateTo) return false;
    if (searchName && !i.employeeName.toLowerCase().includes(searchName.toLowerCase())) return false;
    if (filterStatus !== "all" && i.status !== filterStatus) return false;
    return true;
  }), [items, dateFrom, dateTo, searchName, filterStatus]);

  const exceptions = useMemo(() => items.filter(i => i.exceptionReason), [items]);
  const empRecords = useMemo(() => selectedEmployee ? items.filter(i => i.employeeName === selectedEmployee) : [], [items, selectedEmployee]);

  const uniqueEmployees = useMemo(() => [...new Set(items.map(i => i.employeeName))], [items]);

  const present = todayItems.filter(i => i.status === "present").length;
  const absent = todayItems.filter(i => i.status === "absent").length;
  const late = todayItems.filter(i => i.status === "late").length;
  const totalLate = todayItems.reduce((s, i) => s + (i.lateMinutes || 0), 0);
  const totalWorkingMins = todayItems.reduce((s, i) => s + calcMins(i.checkIn, i.checkOut), 0);
  const avgWorkingMins = todayItems.length > 0 ? totalWorkingMins / todayItems.length : 0;
  const attendanceRate = todayItems.length > 0 ? Math.round(((present + late) / todayItems.length) * 100) : 0;

  // Report data for selected period
  const reportItems = useMemo(() => {
    const now = new Date();
    let from = "2000-01-01";
    if (reportPeriod === "week") { const d = new Date(); d.setDate(d.getDate() - 7); from = d.toISOString().split("T")[0]; }
    else if (reportPeriod === "month") { const d = new Date(); d.setMonth(d.getMonth() - 1); from = d.toISOString().split("T")[0]; }
    return items.filter(i => i.date >= from && i.date <= now.toISOString().split("T")[0]);
  }, [items, reportPeriod]);

  // Weekly trend (last 7 days)
  const weeklyTrend = useMemo(() => {
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const days: { date: string; short: string; present: number; late: number; absent: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayItems = items.filter(r => r.date === ds);
      days.push({
        date: ds, short: dayNames[d.getDay()],
        present: dayItems.filter(r => r.status === "present").length,
        late: dayItems.filter(r => r.status === "late").length,
        absent: dayItems.filter(r => r.status === "absent").length,
      });
    }
    return days;
  }, [items]);

  /* ═══════ GPS ═══════ */
  const fetchLocation = useCallback((): Promise<Loc> => {
    return new Promise((resolve, reject) => {
      setLocationLoading(true);
      if (!navigator.geolocation) { setLocationLoading(false); reject("No GPS"); return; }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude;
          let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          try {
            const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ar`);
            const d = await r.json();
            if (d.display_name) address = d.display_name.split(",").slice(0, 3).join(",");
          } catch { /* keep coords as address */ }
          const loc = { lat, lng, address };
          setLocation(loc);
          setLocationLoading(false);
          resolve(loc);
        },
        () => { setLocationLoading(false); reject("GPS Denied"); },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }, []);

  /* ═══════ Camera Flow ═══════ */
  const startCamera = useCallback(async (facing: "user" | "environment") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing === "environment" ? { ideal: "environment" } : "user", width: { ideal: 640 }, height: { ideal: 480 } } });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch {
      if (facing === "environment") {
        // fallback to front camera
        try {
          const s2 = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } });
          streamRef.current = s2;
          if (videoRef.current) { videoRef.current.srcObject = s2; videoRef.current.play(); }
        } catch { throw new Error("Camera denied"); }
      } else { throw new Error("Camera denied"); }
    }
  }, []);

  const startFlow = useCallback(async (mode: "checkin" | "checkout") => {
    setCameraMode(mode);
    setFacePhoto(null); setBgPhoto(null); setLocation(null);
    setCameraStep("location"); setCameraActive(true);
    try {
      await fetchLocation();
      setCameraStep("face");
      await startCamera("user");
    } catch (err) {
      const isGPS = String(err).includes("GPS") || String(err).includes("Denied");
      showMsg(isGPS ? "⚠️ فشل تحديد الموقع، يرجى السماح بالوصول / Location access required" : "❌ فشل تشغيل الكاميرا / Camera denied", "error");
      setCameraActive(false);
    }
  }, [fetchLocation, startCamera]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current, v = videoRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    if (cameraStep === "face") { ctx.translate(c.width, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.6);
    if (cameraStep === "face") {
      setFacePhoto(dataUrl);
      stopStream();
    } else if (cameraStep === "background") {
      setBgPhoto(dataUrl);
      stopStream();
      setCameraStep("done");
    }
  }, [cameraStep]);

  const openBackCamera = useCallback(async () => {
    setCameraStep("background");
    try { await startCamera("environment"); }
    catch { showMsg("❌ فشل تشغيل الكاميرا الخلفية", "error"); }
  }, [startCamera]);

  const confirmAttendance = useCallback(async () => {
    if (!facePhoto || !bgPhoto || !cameraMode || !location) return;
    setConfirmingAttendance(true);
    const now = new Date();
    const time = now.toLocaleTimeString("ar-IQ", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const date = now.toISOString().split("T")[0];
    let lateMin = 0;
    if (cameraMode === "checkin") {
      const [h, m] = time.split(":").map(Number);
      lateMin = Math.max(0, (h * 60 + m) - WORK_START_MINUTES);
    }
    try {
      if (cameraMode === "checkin") {
        await post("/attendance", {
          employeeName: userName, date, checkIn: time, checkOut: "",
          status: lateMin > 0 ? "late" : "present",
          photo: facePhoto, bgPhoto: bgPhoto,
          latitude: location.lat, longitude: location.lng, locationAddress: location.address,
          lateMinutes: lateMin, device: "Web Camera"
        });
        showMsg(`✅ تم تسجيل الحضور ${time}${lateMin > 0 ? ` (تأخير ${lateMin} دقيقة)` : ""}\n📍 ${location.address}`, "success");
      } else {
        const myRec = items.find(i => i.employeeName === userName && i.date === date);
        if (myRec) {
          await put(`/attendance/${myRec.id}`, { ...myRec, checkOut: time, checkOutLatitude: location.lat, checkOutLongitude: location.lng, checkOutLocationAddress: location.address });
        } else {
          await post("/attendance", {
            employeeName: userName, date, checkIn: "", checkOut: time, status: "present",
            photo: facePhoto, bgPhoto: bgPhoto,
            latitude: location.lat, longitude: location.lng, locationAddress: location.address,
            checkOutLatitude: location.lat, checkOutLongitude: location.lng, checkOutLocationAddress: location.address,
            lateMinutes: 0, device: "Web Camera"
          });
        }
        showMsg(`✅ تم تسجيل الانصراف ${time}\n📍 ${location.address}`, "success");
      }
      reload();
    } catch { showMsg("❌ حدث خطأ أثناء تسجيل الحضور", "error"); }
    finally {
      setConfirmingAttendance(false);
      setCameraActive(false); setCameraMode(null); setCameraStep("location");
      setFacePhoto(null); setBgPhoto(null);
    }
  }, [facePhoto, bgPhoto, cameraMode, userName, items, location, reload]);

  const cancelFlow = useCallback(() => {
    stopStream();
    setCameraActive(false); setCameraMode(null); setCameraStep("location");
    setFacePhoto(null); setBgPhoto(null); setLocation(null);
  }, []);

  /* ═══════ Exception ═══════ */
  const submitException = useCallback(async () => {
    if (!excForm.reason.trim()) { showMsg("⚠️ يرجى كتابة سبب الاستثناء", "error"); return; }
    try {
      await post("/attendance/exception", {
        employeeName: excForm.employeeName || userName,
        date: excForm.date,
        reason: excForm.reason,
        checkIn: "", checkOut: "", status: "exception"
      });
      showMsg("✅ تم تقديم طلب الاستثناء بنجاح", "success");
      setExcModal(false);
      setExcForm({ employeeName: "", reason: "", date: new Date().toISOString().split("T")[0] });
      reload();
    } catch { showMsg("❌ فشل تقديم الاستثناء", "error"); }
  }, [excForm, userName, reload]);

  const actOnException = useCallback(async (id: string, status: "approved" | "rejected") => {
    try {
      await put(`/attendance/exception/${id}`, { status, approvedBy: userName });
      reload();
      showMsg(status === "approved" ? "✅ تم قبول الاستثناء" : "❌ تم رفض الاستثناء", "success");
    } catch { showMsg("❌ فشل الإجراء", "error"); }
  }, [userName, reload]);

  const saveLate = useCallback(async (id: string) => {
    try { await put(`/attendance/late/${id}`, { lateMinutes: editLateVal }); setEditLateId(null); reload(); showMsg("✅ تم التحديث", "success"); }
    catch { showMsg("❌ فشل التحديث", "error"); }
  }, [editLateVal, reload]);

  const deleteRecord = useCallback(async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟ / Are you sure?")) return;
    try { await del(`/attendance/${id}`); reload(); showMsg("✅ تم الحذف", "success"); }
    catch { showMsg("❌ فشل الحذف", "error"); }
  }, [reload]);

  /* ═══════ Export ═══════ */
  const exportPDF = useCallback((data: AttRecord[], title: string) => {
    generatePDFReport({
      title, subtitle: `الفترة: ${dateFrom} إلى ${dateTo}`,
      columns: [
        { key: "employeeName", header: "الموظف / Employee" },
        { key: "date", header: "التاريخ / Date" },
        { key: "checkIn", header: "حضور / In" },
        { key: "checkOut", header: "انصراف / Out" },
        { key: "hours", header: "ساعات / Hours" },
        { key: "lateMinutes", header: "تأخير / Late" },
        { key: "status", header: "الحالة / Status" },
      ],
      data: data.map(r => ({
        employeeName: r.employeeName, date: r.date,
        checkIn: r.checkIn || "—", checkOut: r.checkOut || "—",
        hours: calcHours(r.checkIn, r.checkOut),
        lateMinutes: `${r.lateMinutes || 0} د`,
        status: r.status === "present" ? "حاضر" : r.status === "late" ? "متأخر" : r.status === "absent" ? "غائب" : r.status,
      })),
      stats: [
        { label: "إجمالي السجلات", value: data.length },
        { label: "حاضر", value: data.filter(r => r.status === "present").length },
        { label: "متأخر", value: data.filter(r => r.status === "late").length },
        { label: "غائب", value: data.filter(r => r.status === "absent").length },
        { label: "تأخير (د)", value: data.reduce((s, r) => s + (r.lateMinutes || 0), 0) },
      ],
    });
  }, [dateFrom, dateTo]);

  const exportCSV = useCallback((data: AttRecord[], filename: string) => {
    const headers = ["الموظف", "التاريخ", "حضور", "انصراف", "ساعات العمل", "تأخير (د)", "الحالة", "موقع الحضور", "موقع الانصراف", "استثناء"];
    const rows = data.map(r => [
      r.employeeName, r.date, r.checkIn || "", r.checkOut || "",
      calcHours(r.checkIn, r.checkOut), String(r.lateMinutes || 0),
      r.status, r.locationAddress || "", r.checkOutLocationAddress || "", r.exceptionReason || ""
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${filename}.csv`; a.click();
  }, []);

  /* ═══════ Chart helper ═══════ */
  const maxTrendCount = Math.max(1, ...weeklyTrend.map(d => d.present + d.late + d.absent));

  const renderWeeklyChart = (height: number) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height, paddingTop: 10 }}>
      {weeklyTrend.map((d, i) => {
        const total = d.present + d.late + d.absent;
        const maxH = height - 30;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-muted)" }}>{total}</div>
            <div style={{ width: "100%", maxWidth: 44, display: "flex", flexDirection: "column", gap: 1, justifyContent: "flex-end", height: maxH }}>
              {d.present > 0 && <div style={{ height: Math.max(4, (d.present / maxTrendCount) * maxH), background: "linear-gradient(180deg,#10b981,#059669)", borderRadius: "5px 5px 0 0", transition: "height .5s" }} />}
              {d.late > 0 && <div style={{ height: Math.max(4, (d.late / maxTrendCount) * maxH), background: "linear-gradient(180deg,#f59e0b,#d97706)", transition: "height .5s" }} />}
              {d.absent > 0 && <div style={{ height: Math.max(4, (d.absent / maxTrendCount) * maxH), background: "linear-gradient(180deg,#ef4444,#dc2626)", borderRadius: "0 0 5px 5px", transition: "height .5s" }} />}
            </div>
            <div style={{ fontSize: 10, color: "var(--ink-muted)", fontWeight: 600 }}>{d.short}</div>
            <div style={{ fontSize: 9, color: "var(--ink-muted)" }}>{d.date.slice(5)}</div>
          </div>
        );
      })}
    </div>
  );

  const renderChartLegend = () => (
    <div style={{ display: "flex", gap: 18, justifyContent: "center", marginTop: 12 }}>
      {[{ l: "حاضر", c: "#10b981" }, { l: "متأخر", c: "#f59e0b" }, { l: "غائب", c: "#ef4444" }].map((x, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 4, background: x.c }} /> {x.l}
        </div>
      ))}
    </div>
  );

  /* ═══════ Empty state ═══════ */
  const EmptyState = ({ icon, text }: { icon: string; text: string }) => (
    <div style={{ textAlign: "center", padding: "48px 20px", opacity: 0.5 }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{text}</div>
    </div>
  );

  /* ═══════ Loading skeleton ═══════ */
  if (loading && items.length === 0) {
    return (
      <div className="page animate-in">
        <div className="page-header"><h2>📷 نظام الحضور البيومتري / Biometric Attendance</h2></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 22 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ height: 90, background: "var(--bg-subtle)", borderRadius: 16, animation: "pulse 1.5s ease infinite" }} />
          ))}
        </div>
        <div className="card" style={{ height: 300, background: "var(--bg-subtle)", borderRadius: 16, animation: "pulse 1.5s ease infinite" }} />
      </div>
    );
  }

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="page animate-in">
      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            📷 نظام الحضور البيومتري
            <span style={{ fontSize: 13, fontWeight: 400, color: "var(--ink-muted)" }}>/ Biometric Attendance</span>
          </h2>
          <div style={{ fontSize: 12, color: "var(--ink-muted)", marginTop: 4 }}>
            {isAdmin && <span className="badge badge-approved" style={{ fontSize: 10, borderRadius: 20, marginLeft: 8 }}>🔐 إدارة</span>}
            <span>👤 {userName} • {items.length} سجل</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 14px" }}
            onClick={() => exportPDF(filtered, "تقرير الحضور / Attendance Report")}>📄 PDF</button>
          <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }}
            onClick={() => exportCSV(filtered, "attendance-export")}>📥 CSV</button>
        </div>
      </div>

      {/* ── Message ── */}
      {msg && (
        <div className="card animate-in" style={{
          marginBottom: 16, padding: "14px 20px", fontWeight: 600, fontSize: 13,
          background: msg.type === "success" ? "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.03))" : "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.03))",
          color: msg.type === "success" ? "#10b981" : "#ef4444",
          border: `1px solid ${msg.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          borderRadius: 14, whiteSpace: "pre-line"
        }}>{msg.text}</div>
      )}

      {/* ── Tabs ── */}
      <div className="report-tabs" style={{ flexWrap: "wrap", marginBottom: 22, gap: 6 }}>
        {([
          { id: "checkin" as Tab, label: "📷 تسجيل الحضور", show: true },
          { id: "records" as Tab, label: "📋 السجلات", show: true },
          { id: "exceptions" as Tab, label: `⚠️ الاستثناءات (${exceptions.filter(e => e.exceptionStatus === "pending").length})`, show: true },
          { id: "reports" as Tab, label: "📊 التقارير", show: true },
          { id: "manage" as Tab, label: "⚙️ الإدارة", show: isAdmin },
        ] as { id: Tab; label: string; show: boolean }[]).filter(t => t.show).map(t => (
          <button key={t.id} className={"report-tab " + (activeTab === t.id ? "active" : "")} onClick={() => setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ═══════ TAB: CHECK IN ═══════ */}
      {activeTab === "checkin" && (
        <div className="animate-in">
          {/* Clock & Camera Area */}
          <div className="card" style={{ textAlign: "center", marginBottom: 24, padding: "32px 24px", background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.03))", borderRadius: 20, border: "1px solid rgba(99,102,241,0.12)", position: "relative", overflow: "hidden" }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: -50, right: -50, width: 160, height: 160, background: "rgba(99,102,241,0.04)", borderRadius: "50%", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -30, left: -30, width: 100, height: 100, background: "rgba(139,92,246,0.03)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Clock */}
              <div style={{ fontSize: 54, fontWeight: 800, fontFamily: "'Courier New', monospace", color: "#6366f1", letterSpacing: 3, lineHeight: 1.1 }}>
                {currentTime.toLocaleTimeString("ar-IQ", { hour12: false })}
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-muted)", marginTop: 8 }}>
                {currentTime.toLocaleDateString("ar-IQ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>

              {/* Status badges */}
              <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
                {hasCheckedIn && (
                  <span className="badge badge-approved" style={{ borderRadius: 20, fontSize: 11, padding: "4px 14px" }}>
                    ✅ حضور: {myTodayRecord?.checkIn}
                  </span>
                )}
                {hasCheckedOut && (
                  <span className="badge" style={{ borderRadius: 20, fontSize: 11, padding: "4px 14px", background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                    📤 انصراف: {myTodayRecord?.checkOut}
                  </span>
                )}
              </div>

              {/* ── Camera Flow UI ── */}
              {cameraActive && (
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  {/* Progress steps */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {[
                      { id: "location", label: "📍 الموقع", done: !!location },
                      { id: "face", label: "📷 الوجه", done: !!facePhoto },
                      { id: "background", label: "📸 المكان", done: !!bgPhoto },
                    ].map((s) => (
                      <div key={s.id} style={{
                        padding: "6px 18px", borderRadius: 24, fontSize: 12, fontWeight: 600,
                        background: cameraStep === s.id ? "rgba(99,102,241,0.15)" : s.done ? "rgba(16,185,129,0.1)" : "rgba(0,0,0,0.03)",
                        color: cameraStep === s.id ? "#6366f1" : s.done ? "#10b981" : "#999",
                        border: `1.5px solid ${cameraStep === s.id ? "rgba(99,102,241,0.3)" : s.done ? "rgba(16,185,129,0.2)" : "transparent"}`,
                        display: "flex", alignItems: "center", gap: 5, transition: "all .2s"
                      }}>
                        {s.done ? "✅" : <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${cameraStep === s.id ? "#6366f1" : "#ccc"}`, display: "inline-block", background: cameraStep === s.id ? "#6366f1" : "transparent" }} />}
                        {s.label}
                      </div>
                    ))}
                  </div>

                  {/* Location loading */}
                  {cameraStep === "location" && (
                    <div style={{ padding: 24 }}>
                      {locationLoading ? (
                        <div style={{ color: "#6366f1", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                          <span className="spinner" style={{ width: 20, height: 20, border: "2.5px solid rgba(99,102,241,0.2)", borderTopColor: "#6366f1", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                          📍 جاري تحديد الموقع...
                        </div>
                      ) : <div style={{ color: "#ef4444", fontSize: 14 }}>❌ يجب السماح بالوصول للموقع</div>}
                    </div>
                  )}

                  {/* Camera viewfinder */}
                  {(cameraStep === "face" || cameraStep === "background") && (
                    <>
                      <div style={{ position: "relative", width: 380, maxWidth: "92vw", height: 285, borderRadius: 20, overflow: "hidden", border: "3px solid #6366f1", boxShadow: "0 10px 40px rgba(99,102,241,0.2)" }}>
                        {(cameraStep === "face" && !facePhoto) || (cameraStep === "background" && !bgPhoto) ? (
                          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: cameraStep === "face" ? "scaleX(-1)" : "none" }} />
                        ) : facePhoto && cameraStep === "face" ? (
                          <img src={facePhoto} alt="face" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                        <div style={{ position: "absolute", top: 10, right: 10, background: cameraStep === "face" ? "rgba(99,102,241,0.9)" : "rgba(245,158,11,0.9)", color: "#fff", padding: "5px 16px", borderRadius: 20, fontSize: 11, fontWeight: 700, backdropFilter: "blur(4px)" }}>
                          {cameraStep === "face" ? "📷 صورة الوجه" : "📸 صورة المكان"}
                        </div>
                        {cameraStep === "face" && !facePhoto && (
                          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 160, height: 200, border: "2px dashed rgba(99,102,241,0.35)", borderRadius: "50%", pointerEvents: "none" }} />
                        )}
                      </div>
                      {location && (
                        <div style={{ fontSize: 11, color: "#10b981", background: "rgba(16,185,129,0.06)", padding: "6px 16px", borderRadius: 10, border: "1px solid rgba(16,185,129,0.1)", maxWidth: 380 }}>
                          📍 {location.address}
                        </div>
                      )}
                    </>
                  )}

                  {/* Done preview - both photos */}
                  {cameraStep === "done" && facePhoto && bgPhoto && (
                    <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                      {[{ label: "📷 صورة الوجه", src: facePhoto, c: "#6366f1" }, { label: "📸 صورة المكان", src: bgPhoto, c: "#f59e0b" }].map((p, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 11, marginBottom: 6, color: "var(--ink-muted)", fontWeight: 600 }}>{p.label}</div>
                          <img src={p.src} alt="" style={{ width: 160, height: 120, objectFit: "cover", borderRadius: 14, border: `2.5px solid ${p.c}30`, boxShadow: `0 4px 16px ${p.c}15` }} />
                        </div>
                      ))}
                    </div>
                  )}

                  <canvas ref={canvasRef} style={{ display: "none" }} />

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                    {cameraStep === "face" && !facePhoto && (
                      <button className="btn btn-primary" onClick={captureFrame} style={{ padding: "10px 24px" }}>📸 التقاط صورة الوجه</button>
                    )}
                    {cameraStep === "face" && facePhoto && (
                      <>
                        <button className="btn" onClick={openBackCamera} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff" }}>📸 التالي: صورة المكان</button>
                        <button className="btn btn-secondary" onClick={() => { setFacePhoto(null); startFlow(cameraMode!); }}>🔄 إعادة</button>
                      </>
                    )}
                    {cameraStep === "background" && !bgPhoto && (
                      <button className="btn" onClick={captureFrame} style={{ padding: "10px 24px", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff" }}>📸 التقاط صورة المكان</button>
                    )}
                    {cameraStep === "done" && (
                      <>
                        <button className="btn" disabled={confirmingAttendance}
                          onClick={confirmAttendance}
                          style={{ padding: "12px 30px", fontSize: 14, background: cameraMode === "checkin" ? "linear-gradient(135deg,#10b981,#059669)" : "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", boxShadow: cameraMode === "checkin" ? "0 4px 20px rgba(16,185,129,0.3)" : "0 4px 20px rgba(239,68,68,0.3)" }}>
                          {confirmingAttendance ? "..." : cameraMode === "checkin" ? "✅ تأكيد الحضور" : "✅ تأكيد الانصراف"}
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setBgPhoto(null); openBackCamera(); }}>🔄 إعادة</button>
                      </>
                    )}
                    <button className="btn btn-secondary" onClick={cancelFlow}>✕ إلغاء</button>
                  </div>
                </div>
              )}

              {/* Main action buttons */}
              {!cameraActive && (
                <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
                  <button className="btn" disabled={hasCheckedIn}
                    style={{ fontSize: 15, padding: "14px 36px", background: hasCheckedIn ? "#ddd" : "linear-gradient(135deg,#10b981,#059669)", color: hasCheckedIn ? "#999" : "#fff", boxShadow: hasCheckedIn ? "none" : "0 6px 24px rgba(16,185,129,0.25)", borderRadius: 14, cursor: hasCheckedIn ? "not-allowed" : "pointer" }}
                    onClick={() => startFlow("checkin")}>
                    {hasCheckedIn ? "✅ تم تسجيل الحضور" : "📷 تسجيل حضور / Clock In"}
                  </button>
                  <button className="btn" disabled={!hasCheckedIn || hasCheckedOut}
                    style={{ fontSize: 15, padding: "14px 36px", background: !hasCheckedIn || hasCheckedOut ? "transparent" : "linear-gradient(135deg,#ef4444,#dc2626)", color: !hasCheckedIn || hasCheckedOut ? "#999" : "#fff", border: "1.5px solid", borderColor: !hasCheckedIn || hasCheckedOut ? "#ddd" : "rgba(239,68,68,0.3)", borderRadius: 14, cursor: !hasCheckedIn || hasCheckedOut ? "not-allowed" : "pointer" }}
                    onClick={() => startFlow("checkout")}>
                    {hasCheckedOut ? "📤 تم تسجيل الانصراف" : "📷 تسجيل انصراف / Clock Out"}
                  </button>
                  <button className="btn btn-secondary" style={{ fontSize: 13, padding: "14px 22px", borderRadius: 14 }} onClick={() => setExcModal(true)}>
                    ⚠️ طلب استثناء
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Today Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14, marginBottom: 22 }}>
            {[
              { l: "حاضر / Present", v: present, c: "#10b981", i: "✅" },
              { l: "غائب / Absent", v: absent, c: "#ef4444", i: "❌" },
              { l: "متأخر / Late", v: late, c: "#f59e0b", i: "⏰" },
              { l: "نسبة الحضور", v: `${attendanceRate}%`, c: "#6366f1", i: "📊" },
              { l: "تأخير (دقائق)", v: totalLate, c: "#f97316", i: "⏱️" },
              { l: "متوسط ساعات العمل", v: `${Math.floor(avgWorkingMins / 60)}:${String(Math.round(avgWorkingMins % 60)).padStart(2, "0")}`, c: "#8b5cf6", i: "🕐" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: "center", padding: "18px 14px", borderRadius: 16, background: `linear-gradient(135deg, ${s.c}08, ${s.c}03)`, border: `1px solid ${s.c}15` }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{s.i}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.c, lineHeight: 1.2 }}>{s.v}</div>
                <div style={{ fontSize: 10.5, color: "var(--ink-muted)", marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Weekly Trend Chart */}
          <div className="card" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>📈 اتجاه الحضور الأسبوعي / Weekly Trend</h3>
            {renderWeeklyChart(110)}
            {renderChartLegend()}
          </div>

          {/* Today Records Table */}
          <div className="card" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>📋 سجل اليوم / Today ({todayItems.length})</h3>
              <button className="btn btn-secondary" style={{ fontSize: 10, padding: "4px 12px" }} onClick={() => exportCSV(todayItems, "today-attendance")}>📥 تصدير</button>
            </div>
            {todayItems.length === 0 ? (
              <EmptyState icon="📋" text="لا توجد سجلات حضور لهذا اليوم" />
            ) : (
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>#</th><th>الموظف</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>تأخير</th><th>الموقع</th><th>الحالة</th></tr></thead>
                <tbody>{todayItems.map((r, i) => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelectedEmployee(r.employeeName)}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#6366f1" }}>{r.employeeName}</td>
                    <td>{r.checkIn || "—"}</td>
                    <td>{r.checkOut || "—"}</td>
                    <td style={{ color: "#6366f1", fontWeight: 600, fontSize: 12 }}>{calcHours(r.checkIn, r.checkOut)}</td>
                    <td style={{ color: (r.lateMinutes || 0) > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{r.lateMinutes || 0} د</td>
                    <td style={{ fontSize: 10, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.locationAddress || "—"}</td>
                    <td><Badge s={r.status} /></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB: RECORDS ═══════ */}
      {activeTab === "records" && (
        <div className="animate-in">
          {/* Filters bar */}
          <div className="card" style={{ padding: "14px 20px", marginBottom: 16, borderRadius: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: 12 }}>📅 من:</span>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 150, borderRadius: 10 }} />
              <span style={{ fontWeight: 700, fontSize: 12 }}>إلى:</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 150, borderRadius: 10 }} />
              <input type="text" placeholder="🔍 بحث بالاسم..." value={searchName} onChange={e => setSearchName(e.target.value)} className="form-select" style={{ padding: "7px 12px", fontSize: 12, width: 170, borderRadius: 10 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 130, borderRadius: 10 }}>
                <option value="all">كل الحالات</option>
                <option value="present">حاضر</option>
                <option value="late">متأخر</option>
                <option value="absent">غائب</option>
                <option value="leave">إجازة</option>
                <option value="exception">استثناء</option>
              </select>
              <span style={{ fontSize: 11, color: "var(--ink-muted)", marginRight: "auto" }}>({filtered.length} سجل)</span>
              <button className="btn btn-secondary" style={{ fontSize: 10, padding: "6px 12px" }} onClick={() => exportCSV(filtered, "attendance-records")}>📥 تصدير</button>
            </div>
          </div>

          {/* Records Table */}
          <div className="card" style={{ padding: 20, borderRadius: 16 }}>
            {filtered.length === 0 ? (
              <EmptyState icon="📋" text="لا توجد سجلات مطابقة للبحث" />
            ) : (
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>#</th><th>الموظف</th><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>تأخير</th><th>الموقع</th><th>الجهاز</th><th>الحالة</th></tr></thead>
                <tbody>{filtered.map((r, i) => (
                  <tr key={r.id} style={{ cursor: "pointer" }} onClick={() => setSelectedEmployee(r.employeeName)}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#6366f1" }}>{r.employeeName}</td>
                    <td>{r.date}</td>
                    <td>{r.checkIn || "—"}</td>
                    <td>{r.checkOut || "—"}</td>
                    <td style={{ color: "#6366f1", fontWeight: 600, fontSize: 12 }}>{calcHours(r.checkIn, r.checkOut)}</td>
                    <td style={{ color: (r.lateMinutes || 0) > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{r.lateMinutes || 0} د</td>
                    <td style={{ fontSize: 10, maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.locationAddress || "—"}</td>
                    <td style={{ fontSize: 11 }}>{r.device || "—"}</td>
                    <td><Badge s={r.status} /></td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB: EXCEPTIONS ═══════ */}
      {activeTab === "exceptions" && (
        <div className="animate-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>⚠️ الاستثناءات / Exceptions ({exceptions.length})</h3>
            <button className="btn btn-primary" style={{ padding: "8px 18px" }} onClick={() => setExcModal(true)}>+ طلب استثناء جديد</button>
          </div>

          {/* Exception Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { l: "⏳ معلق / Pending", v: exceptions.filter(e => e.exceptionStatus === "pending").length, c: "#f59e0b" },
              { l: "✅ مقبول / Approved", v: exceptions.filter(e => e.exceptionStatus === "approved").length, c: "#10b981" },
              { l: "❌ مرفوض / Rejected", v: exceptions.filter(e => e.exceptionStatus === "rejected").length, c: "#ef4444" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: "center", padding: "18px 14px", borderRadius: 16, background: `linear-gradient(135deg, ${s.c}08, ${s.c}03)`, border: `1px solid ${s.c}15` }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.c, marginBottom: 4 }}>{s.v}</div>
                <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Exceptions Table */}
          <div className="card" style={{ padding: 20, borderRadius: 16 }}>
            {exceptions.length === 0 ? (
              <EmptyState icon="⚠️" text="لا توجد طلبات استثناء" />
            ) : (
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>#</th><th>الموظف</th><th>التاريخ</th><th>السبب</th><th>الحالة</th><th>الموافق</th>{isAdmin && <th>إجراء</th>}</tr></thead>
                <tbody>{exceptions.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#6366f1", cursor: "pointer" }} onClick={() => setSelectedEmployee(r.employeeName)}>{r.employeeName}</td>
                    <td>{r.date}</td>
                    <td style={{ maxWidth: 220, fontSize: 12 }}>{r.exceptionReason}</td>
                    <td>
                      <span className={"badge " + (r.exceptionStatus === "approved" ? "badge-approved" : r.exceptionStatus === "rejected" ? "badge-rejected" : "badge-pending")} style={{ borderRadius: 20, fontSize: 11 }}>
                        {r.exceptionStatus === "approved" ? "✅ مقبول" : r.exceptionStatus === "rejected" ? "❌ مرفوض" : "⏳ معلق"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{r.exceptionApprovedBy || "—"}</td>
                    {isAdmin && (
                      <td>
                        {r.exceptionStatus === "pending" && (
                          <div style={{ display: "flex", gap: 4 }}>
                            <button className="btn btn-sm" style={{ padding: "4px 12px", fontSize: 10, background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 8 }} onClick={() => actOnException(r.id, "approved")}>✅ قبول</button>
                            <button className="btn btn-sm" style={{ padding: "4px 12px", fontSize: 10, background: "rgba(239,68,68,0.1)", color: "#ef4444", borderRadius: 8 }} onClick={() => actOnException(r.id, "rejected")}>❌ رفض</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB: REPORTS ═══════ */}
      {activeTab === "reports" && (
        <div className="animate-in">
          {/* Period selector + export */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            {([
              { id: "week" as const, label: "📅 أسبوع" },
              { id: "month" as const, label: "📅 شهر" },
              { id: "all" as const, label: "📊 الكل" },
            ]).map(p => (
              <button key={p.id} className={"report-tab " + (reportPeriod === p.id ? "active" : "")} style={{ padding: "7px 18px", borderRadius: 12 }}
                onClick={() => setReportPeriod(p.id)}>{p.label}</button>
            ))}
            <div style={{ marginRight: "auto", display: "flex", gap: 6 }}>
              <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={() => exportPDF(reportItems, "تقرير الحضور / Attendance Report")}>📄 PDF</button>
              <button className="btn btn-secondary" style={{ fontSize: 11, padding: "6px 14px" }} onClick={() => exportCSV(reportItems, `report-${reportPeriod}`)}>📥 CSV</button>
            </div>
          </div>

          {/* Report Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 22 }}>
            {[
              { l: "إجمالي السجلات", v: reportItems.length, c: "#6366f1", i: "📊" },
              { l: "عدد الموظفين", v: [...new Set(reportItems.map(i => i.employeeName))].length, c: "#10b981", i: "👥" },
              { l: "إجمالي التأخير (د)", v: reportItems.reduce((s, i) => s + (i.lateMinutes || 0), 0), c: "#f59e0b", i: "⏱️" },
              { l: "الاستثناءات", v: reportItems.filter(i => i.exceptionReason).length, c: "#a855f7", i: "⚠️" },
              { l: "ساعات العمل", v: `${Math.floor(reportItems.reduce((s, i) => s + calcMins(i.checkIn, i.checkOut), 0) / 60)}س`, c: "#3b82f6", i: "⏰" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "16px 14px", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, background: `linear-gradient(135deg, ${s.c}06, ${s.c}02)`, border: `1px solid ${s.c}12` }}>
                <div style={{ fontSize: 24, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.c}10`, borderRadius: 14 }}>{s.i}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly Trend Chart */}
          <div className="card" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>📈 اتجاه الحضور (آخر 7 أيام)</h3>
            {renderWeeklyChart(150)}
            {renderChartLegend()}
          </div>

          {/* Attendance Rate Donut (SVG) */}
          <div className="card" style={{ padding: 20, borderRadius: 16, marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15 }}>📊 توزيع الحالات / Status Distribution</h3>
            <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", alignItems: "center" }}>
              {(() => {
                const p = reportItems.filter(r => r.status === "present").length;
                const lt = reportItems.filter(r => r.status === "late").length;
                const ab = reportItems.filter(r => r.status === "absent").length;
                const ex = reportItems.filter(r => r.exceptionReason).length;
                const total = reportItems.length || 1;
                const data = [
                  { label: "حاضر", value: p, color: "#10b981", pct: Math.round((p / total) * 100) },
                  { label: "متأخر", value: lt, color: "#f59e0b", pct: Math.round((lt / total) * 100) },
                  { label: "غائب", value: ab, color: "#ef4444", pct: Math.round((ab / total) * 100) },
                  { label: "استثناء", value: ex, color: "#a855f7", pct: Math.round((ex / total) * 100) },
                ];
                let offset = 0;
                return (
                  <>
                    <svg width="180" height="180" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="var(--bg-subtle)" strokeWidth="3" />
                      {data.filter(d => d.value > 0).map((d, i) => {
                        const dash = (d.value / total) * 100;
                        const o = offset;
                        offset += dash;
                        return <circle key={i} cx="18" cy="18" r="15.91" fill="none" stroke={d.color} strokeWidth="3.5" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={-o + 25} strokeLinecap="round" style={{ transition: "stroke-dasharray .6s" }} />;
                      })}
                      <text x="18" y="17" textAnchor="middle" fontSize="7" fontWeight="800" fill="var(--ink)">{Math.round(((p + lt) / total) * 100)}%</text>
                      <text x="18" y="22" textAnchor="middle" fontSize="3" fill="var(--ink-muted)">حضور</text>
                    </svg>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {data.map((d, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                          <div style={{ width: 14, height: 14, borderRadius: 4, background: d.color, flexShrink: 0 }} />
                          <span style={{ minWidth: 50 }}>{d.label}</span>
                          <span style={{ fontWeight: 700, color: d.color }}>{d.value}</span>
                          <span style={{ color: "var(--ink-muted)", fontSize: 11 }}>({d.pct}%)</span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Employee Report Table */}
          <div className="card" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>📊 تقرير الموظفين / Employee Report</h3>
              <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>اضغط على أي موظف لعرض التفاصيل</span>
            </div>
            {uniqueEmployees.length === 0 ? (
              <EmptyState icon="👥" text="لا توجد بيانات موظفين" />
            ) : (
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>الموظف</th><th>حضور</th><th>تأخير</th><th>غياب</th><th>ساعات</th><th>تأخير (د)</th><th>استثناءات</th><th>نسبة الحضور</th></tr></thead>
                <tbody>{uniqueEmployees.map(name => {
                  const recs = reportItems.filter(i => i.employeeName === name);
                  if (recs.length === 0) return null;
                  const p = recs.filter(r => r.status === "present").length;
                  const lt = recs.filter(r => r.status === "late").length;
                  const ab = recs.filter(r => r.status === "absent").length;
                  const ex = recs.filter(r => r.exceptionReason).length;
                  const lateMn = recs.reduce((s, r) => s + (r.lateMinutes || 0), 0);
                  const workHrs = Math.floor(recs.reduce((s, r) => s + calcMins(r.checkIn, r.checkOut), 0) / 60);
                  const rate = recs.length > 0 ? Math.round(((p + lt) / recs.length) * 100) : 0;
                  return (
                    <tr key={name} style={{ cursor: "pointer" }} onClick={() => setSelectedEmployee(name)}>
                      <td style={{ fontWeight: 600, color: "#6366f1" }}>{name}</td>
                      <td style={{ color: "#10b981", fontWeight: 600 }}>{p}</td>
                      <td style={{ color: "#f59e0b", fontWeight: 600 }}>{lt}</td>
                      <td style={{ color: "#ef4444", fontWeight: 600 }}>{ab}</td>
                      <td style={{ color: "#6366f1", fontWeight: 600 }}>{workHrs}س</td>
                      <td style={{ color: "#f97316", fontWeight: 600 }}>{lateMn}</td>
                      <td style={{ color: "#a855f7" }}>{ex}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 80, height: 8, background: "var(--bg-subtle)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${rate}%`, height: "100%", background: rate >= 80 ? "linear-gradient(90deg,#10b981,#34d399)" : rate >= 50 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#ef4444,#f87171)", borderRadius: 4, transition: "width .5s" }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: rate >= 80 ? "#10b981" : rate >= 50 ? "#f59e0b" : "#ef4444", minWidth: 34 }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ TAB: MANAGE ═══════ */}
      {activeTab === "manage" && isAdmin && (
        <div className="animate-in">
          {/* Admin Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 14, marginBottom: 22 }}>
            {[
              { l: "إجمالي السجلات", v: items.length, c: "#6366f1", i: "👥" },
              { l: "تأخير اليوم (د)", v: totalLate, c: "#f59e0b", i: "⏱️" },
              { l: "استثناءات معلقة", v: exceptions.filter(e => e.exceptionStatus === "pending").length, c: "#a855f7", i: "⚠️" },
              { l: "نسبة حضور اليوم", v: `${attendanceRate}%`, c: "#10b981", i: "📊" },
            ].map((s, i) => (
              <div key={i} className="card" style={{ padding: "16px 14px", borderRadius: 16, display: "flex", alignItems: "center", gap: 14, background: `linear-gradient(135deg, ${s.c}06, ${s.c}02)`, border: `1px solid ${s.c}12` }}>
                <div style={{ fontSize: 24, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.c}10`, borderRadius: 14 }}>{s.i}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.c }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Manage Records */}
          <div className="card" style={{ padding: 20, borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <h3 style={{ margin: 0, fontSize: 15 }}>⚙️ إدارة السجلات / Manage Records</h3>
              <button className="btn btn-secondary" style={{ fontSize: 10, padding: "6px 12px" }} onClick={() => exportCSV(filtered, "manage-export")}>📥 تصدير</button>
            </div>

            {/* Filters */}
            <div style={{ marginBottom: 14, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 150, borderRadius: 10 }} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>إلى</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 150, borderRadius: 10 }} />
              <input type="text" placeholder="🔍 بحث..." value={searchName} onChange={e => setSearchName(e.target.value)} className="form-select" style={{ padding: "7px 12px", fontSize: 12, width: 150, borderRadius: 10 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select" style={{ padding: "7px 10px", fontSize: 12, width: 130, borderRadius: 10 }}>
                <option value="all">كل الحالات</option>
                <option value="present">حاضر</option>
                <option value="late">متأخر</option>
                <option value="absent">غائب</option>
                <option value="exception">استثناء</option>
              </select>
              <span style={{ fontSize: 11, color: "var(--ink-muted)", marginRight: "auto" }}>({filtered.length} سجل)</span>
            </div>

            {filtered.length === 0 ? (
              <EmptyState icon="⚙️" text="لا توجد سجلات مطابقة" />
            ) : (
              <div className="table-wrapper"><table className="data-table">
                <thead><tr><th>#</th><th>الموظف</th><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>تأخير</th><th>الموقع</th><th>الحالة</th><th>تعديل التأخير</th><th>حذف</th></tr></thead>
                <tbody>{filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td style={{ fontWeight: 600, color: "#6366f1", cursor: "pointer" }} onClick={() => setSelectedEmployee(r.employeeName)}>{r.employeeName}</td>
                    <td>{r.date}</td>
                    <td>{r.checkIn || "—"}</td>
                    <td>{r.checkOut || "—"}</td>
                    <td style={{ color: "#6366f1", fontSize: 11, fontWeight: 600 }}>{calcHours(r.checkIn, r.checkOut)}</td>
                    <td style={{ color: (r.lateMinutes || 0) > 0 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{r.lateMinutes || 0}</td>
                    <td style={{ fontSize: 10, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.locationAddress || "—"}</td>
                    <td><Badge s={r.status} /></td>
                    <td>
                      {editLateId === r.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <input type="number" value={editLateVal} onChange={e => setEditLateVal(Number(e.target.value))} className="form-select" style={{ width: 60, padding: "4px 6px", fontSize: 11, borderRadius: 8 }} min={0} />
                          <button className="btn btn-sm" style={{ padding: "4px 10px", fontSize: 10, background: "rgba(99,102,241,0.1)", color: "#6366f1", borderRadius: 8 }} onClick={() => saveLate(r.id)}>💾</button>
                          <button className="btn btn-sm" style={{ padding: "4px 8px", fontSize: 10, background: "rgba(0,0,0,0.04)", borderRadius: 8 }} onClick={() => setEditLateId(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="btn btn-sm" style={{ padding: "4px 12px", fontSize: 10, background: "rgba(99,102,241,0.06)", color: "#6366f1", borderRadius: 8 }} onClick={() => { setEditLateId(r.id); setEditLateVal(r.lateMinutes || 0); }}>✏️ تعديل</button>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-sm" style={{ padding: "4px 10px", fontSize: 10, background: "rgba(239,68,68,0.06)", color: "#ef4444", borderRadius: 8 }} onClick={() => deleteRecord(r.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}

      {/* ═══════ Employee Detail Modal ═══════ */}
      {selectedEmployee && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }} onClick={() => setSelectedEmployee(null)}>
          <div className="animate-in" style={{ background: "var(--card)", borderRadius: 22, padding: 0, width: 900, maxWidth: "96vw", maxHeight: "88vh", display: "flex", flexDirection: "column", border: "1px solid var(--border)", boxShadow: "0 25px 60px rgba(0,0,0,.15)", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
            {/* Sticky header */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, fontWeight: 700 }}>
                  {selectedEmployee.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{selectedEmployee}</h3>
                  <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>{empRecords.length} سجل حضور</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-primary" style={{ padding: "5px 12px", fontSize: 11 }} onClick={() => exportPDF(empRecords, `تقرير ${selectedEmployee}`)}>📄 PDF</button>
                <button className="btn btn-secondary" style={{ padding: "5px 12px", fontSize: 11 }} onClick={() => exportCSV(empRecords, `attendance-${selectedEmployee}`)}>📥 CSV</button>
                <button className="btn btn-secondary" style={{ padding: "5px 14px", fontSize: 16 }} onClick={() => setSelectedEmployee(null)}>✕</button>
              </div>
            </div>

            {/* Stats row - compact inline */}
            <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", background: "var(--bg-subtle)", flexShrink: 0 }}>
              {[
                { l: "حاضر", v: empRecords.filter(r => r.status === "present").length, c: "#10b981", i: "✅" },
                { l: "متأخر", v: empRecords.filter(r => r.status === "late").length, c: "#f59e0b", i: "⏰" },
                { l: "غائب", v: empRecords.filter(r => r.status === "absent").length, c: "#ef4444", i: "❌" },
                { l: "استثناء", v: empRecords.filter(r => r.exceptionReason).length, c: "#a855f7", i: "⚠️" },
                { l: "تأخير (د)", v: empRecords.reduce((s, r) => s + (r.lateMinutes || 0), 0), c: "#f97316", i: "⏱️" },
                { l: "ساعات العمل", v: `${Math.floor(empRecords.reduce((s, r) => s + calcMins(r.checkIn, r.checkOut), 0) / 60)}س`, c: "#6366f1", i: "📊" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 10, background: `${s.c}08`, border: `1px solid ${s.c}15`, fontSize: 12 }}>
                  <span>{s.i}</span>
                  <span style={{ fontWeight: 700, color: s.c }}>{s.v}</span>
                  <span style={{ color: "var(--ink-muted)", fontSize: 10 }}>{s.l}</span>
                </div>
              ))}
            </div>

            {/* Scrollable records table */}
            <div style={{ overflow: "auto", flex: 1, padding: "16px 24px" }}>
              {empRecords.length === 0 ? (
                <EmptyState icon="📋" text="لا توجد سجلات لهذا الموظف" />
              ) : (
                <div className="table-wrapper"><table className="data-table" style={{ fontSize: 12 }}>
                  <thead style={{ position: "sticky", top: 0, zIndex: 2 }}><tr><th>التاريخ</th><th>حضور</th><th>انصراف</th><th>ساعات</th><th>تأخير</th><th>الموقع</th><th>الحالة</th></tr></thead>
                  <tbody>{empRecords.sort((a, b) => b.date.localeCompare(a.date)).map(r => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.date}</td>
                      <td>{r.checkIn || "—"}</td>
                      <td>{r.checkOut || "—"}</td>
                      <td style={{ color: "#6366f1", fontWeight: 600 }}>{calcHours(r.checkIn, r.checkOut)}</td>
                      <td style={{ color: (r.lateMinutes || 0) > 0 ? "#f59e0b" : "#10b981" }}>{r.lateMinutes || 0} د</td>
                      <td style={{ fontSize: 10, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.locationAddress || "—"}</td>
                      <td><Badge s={r.status} /></td>
                    </tr>
                  ))}</tbody>
                </table></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Exception Request Modal ═══════ */}
      {excModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div className="animate-in" style={{ background: "var(--card)", borderRadius: 22, padding: 28, width: 460, maxWidth: "94vw", border: "1px solid var(--border)", boxShadow: "0 25px 60px rgba(0,0,0,.15)" }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ طلب استثناء / Exception Request
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {isAdmin && (
                <div>
                  <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                    الموظف / Employee
                  </label>
                  <select
                    value={excForm.employeeName}
                    onChange={e => setExcForm(f => ({ ...f, employeeName: e.target.value }))}
                    className="form-select"
                    style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 10 }}
                  >
                    <option value="">{userName} (أنا)</option>
                    {uniqueEmployees.filter(n => n !== userName).map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  التاريخ / Date
                </label>
                <input type="date" value={excForm.date} onChange={e => setExcForm(f => ({ ...f, date: e.target.value }))}
                  className="form-select" style={{ width: "100%", padding: "10px 12px", fontSize: 13, borderRadius: 10 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "var(--ink-muted)", display: "block", marginBottom: 6, fontWeight: 600 }}>
                  السبب / Reason *
                </label>
                <textarea value={excForm.reason} onChange={e => setExcForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                  placeholder="أدخل سبب الاستثناء..."
                  className="form-select" style={{ width: "100%", padding: "10px 12px", fontSize: 13, resize: "vertical", fontFamily: "var(--font)", borderRadius: 10 }} />
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
                <button className="btn btn-primary" onClick={submitException} disabled={!excForm.reason.trim()} style={{ padding: "9px 22px" }}>
                  ✅ إرسال الطلب
                </button>
                <button className="btn btn-secondary" onClick={() => setExcModal(false)} style={{ padding: "9px 22px" }}>
                  ✕ إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
