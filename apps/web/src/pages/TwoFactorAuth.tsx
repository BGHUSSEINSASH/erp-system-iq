import { useState } from "react";
import { useI18n } from "../i18n";

export default function TwoFactorAuth() {
  const { t } = useI18n();
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState<"setup" | "verify" | "done">("setup");
  const [code, setCode] = useState("");
  const [backupCodes] = useState(["A1B2-C3D4", "E5F6-G7H8", "I9J0-K1L2", "M3N4-O5P6", "Q7R8-S9T0", "U1V2-W3X4"]);

  const fakeQR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iNzAiIHk9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxNDAiIHk9IjIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiLz48cmVjdCB4PSIyMCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjcwIiB5PSI3MCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTYwIiB5PSI3MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMjAiIHk9IjE0MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIi8+PHJlY3QgeD0iNzAiIHk9IjE2MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTQwIiB5PSIxNDAiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIvPjwvc3ZnPg==";

  const handleVerify = () => {
    if (code.length === 6) { setEnabled(true); setStep("done"); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>🔐 المصادقة الثنائية / Two-Factor Authentication</h2>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Status Card */}
        <div style={{
          background: enabled ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))" : "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))",
          borderRadius: 16, padding: 24, border: `1px solid ${enabled ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, textAlign: "center", marginBottom: 24,
        }}>
          <div style={{ fontSize: 48 }}>{enabled ? "🛡️" : "⚠️"}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8, color: enabled ? "#22c55e" : "#ef4444" }}>
            {enabled ? "المصادقة الثنائية مفعلة / 2FA Enabled" : "المصادقة الثنائية غير مفعلة / 2FA Disabled"}
          </div>
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            {enabled ? "حسابك محمي بطبقة أمان إضافية" : "فعّل المصادقة الثنائية لحماية حسابك بشكل أفضل"}
          </div>
        </div>

        {!enabled && step === "setup" && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>📱 إعداد المصادقة الثنائية / Setup 2FA</h3>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>الخطوة 1: قم بتثبيت تطبيق المصادقة / Step 1: Install Authenticator App</div>
              <div style={{ opacity: 0.7, fontSize: 14 }}>
                قم بتثبيت Google Authenticator أو Microsoft Authenticator على هاتفك المحمول
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <span style={{ padding: "6px 14px", background: "rgba(59,130,246,0.1)", borderRadius: 8, fontSize: 13 }}>📱 Google Authenticator</span>
                <span style={{ padding: "6px 14px", background: "rgba(99,102,241,0.1)", borderRadius: 8, fontSize: 13 }}>📱 Microsoft Authenticator</span>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>الخطوة 2: امسح رمز QR / Step 2: Scan QR Code</div>
              <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
                <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
                  <img src={fakeQR} alt="QR Code" style={{ width: 200, height: 200 }} />
                </div>
              </div>
              <div style={{ textAlign: "center", fontSize: 13, opacity: 0.6 }}>
                أو أدخل المفتاح يدوياً: <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>JBSWY3DPEHPK3PXP</code>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => setStep("verify")}>
              التالي / Next →
            </button>
          </div>
        )}

        {!enabled && step === "verify" && (
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)" }}>
            <h3 style={{ marginBottom: 16 }}>🔢 أدخل رمز التحقق / Enter Verification Code</h3>
            <div style={{ opacity: 0.7, marginBottom: 16 }}>
              أدخل الرمز المكون من 6 أرقام من تطبيق المصادقة / Enter the 6-digit code from your authenticator app
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 24 }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <input
                  key={i}
                  type="text"
                  maxLength={1}
                  style={{
                    width: 50, height: 60, textAlign: "center", fontSize: 24, fontWeight: 700,
                    background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.15)",
                    borderRadius: 12, color: "inherit",
                  }}
                  value={code[i] || ""}
                  onChange={e => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      const newCode = code.split("");
                      newCode[i] = val;
                      setCode(newCode.join(""));
                      if (val && i < 5) (e.target.nextElementSibling as HTMLInputElement)?.focus();
                    }
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStep("setup")}>← رجوع / Back</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleVerify} disabled={code.length < 6}>تأكيد / Verify ✓</button>
            </div>
          </div>
        )}

        {enabled && (
          <>
            {/* Backup Codes */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12 }}>🔑 رموز الاسترداد / Backup Codes</h3>
              <div style={{ opacity: 0.7, fontSize: 14, marginBottom: 12 }}>
                احتفظ بهذه الرموز في مكان آمن. يمكنك استخدامها لتسجيل الدخول إذا فقدت هاتفك.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {backupCodes.map((c, i) => (
                  <div key={i} style={{ padding: "8px 12px", background: "rgba(255,255,255,0.05)", borderRadius: 8, fontFamily: "monospace", textAlign: "center", fontSize: 14 }}>
                    {c}
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" style={{ width: "100%", marginTop: 12 }} onClick={() => navigator.clipboard.writeText(backupCodes.join("\n"))}>
                📋 نسخ الرموز / Copy Codes
              </button>
            </div>

            {/* Security Methods */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 14, padding: 24, border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
              <h3 style={{ marginBottom: 12 }}>🔒 طرق الأمان / Security Methods</h3>
              {[
                { name: "تطبيق المصادقة / Authenticator App", icon: "📱", active: true },
                { name: "رسالة SMS / SMS Message", icon: "💬", active: false },
                { name: "مفتاح أمان / Security Key (FIDO2)", icon: "🔑", active: false },
                { name: "بريد إلكتروني / Email", icon: "📧", active: false },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{m.icon}</span>
                    <span>{m.name}</span>
                  </div>
                  <span className="badge" style={{ background: m.active ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.05)", color: m.active ? "#22c55e" : "inherit" }}>
                    {m.active ? "✅ مفعل" : "غير مفعل"}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" style={{ width: "100%", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }} onClick={() => { setEnabled(false); setStep("setup"); setCode(""); }}>
              ⚠️ إلغاء تفعيل المصادقة الثنائية / Disable 2FA
            </button>
          </>
        )}
      </div>
    </div>
  );
}
