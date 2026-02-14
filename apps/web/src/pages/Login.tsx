import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusField, setFocusField] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-3d">
      {/* Animated background particles */}
      <div className="login-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
        <div className="particle p4"></div>
        <div className="particle p5"></div>
        <div className="particle p6"></div>
        <div className="particle p7"></div>
        <div className="particle p8"></div>
      </div>

      {/* 3D Grid Floor */}
      <div className="login-grid-floor"></div>

      {/* Floating 3D cubes */}
      <div className="float-cube cube1">
        <div className="cube-face front"></div>
        <div className="cube-face back"></div>
        <div className="cube-face right"></div>
        <div className="cube-face left"></div>
        <div className="cube-face top"></div>
        <div className="cube-face bottom"></div>
      </div>
      <div className="float-cube cube2">
        <div className="cube-face front"></div>
        <div className="cube-face back"></div>
        <div className="cube-face right"></div>
        <div className="cube-face left"></div>
        <div className="cube-face top"></div>
        <div className="cube-face bottom"></div>
      </div>
      <div className="float-cube cube3">
        <div className="cube-face front"></div>
        <div className="cube-face back"></div>
        <div className="cube-face right"></div>
        <div className="cube-face left"></div>
        <div className="cube-face top"></div>
        <div className="cube-face bottom"></div>
      </div>

      {/* Glowing orbs */}
      <div className="login-orb orb1"></div>
      <div className="login-orb orb2"></div>
      <div className="login-orb orb3"></div>

      {/* Main login card */}
      <div className={"login-card-3d " + (mounted ? "mounted" : "")}>
        <div className="login-card-glass">
          {/* Holographic logo */}
          <div className="login-holo-logo">
            <div className="holo-ring ring1"></div>
            <div className="holo-ring ring2"></div>
            <div className="holo-ring ring3"></div>
            <div className="holo-core">ERP</div>
          </div>

          <h2 className="login-title-3d">تسجيل الدخول</h2>
          <p className="login-subtitle-3d">نظام إدارة المؤسسة المتكامل</p>
          <div className="login-subtitle-en">Enterprise Resource Planning</div>

          {error && <div className="login-error-3d">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form-3d">
            <div className={"login-field-3d " + (focusField === "user" ? "focused" : "") + (username ? " has-value" : "")}>
              <div className="field-icon-3d">👤</div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocusField("user")}
                onBlur={() => setFocusField("")}
                required
                autoFocus
                placeholder="اسم المستخدم / Username"
              />
              <div className="field-glow"></div>
            </div>

            <div className={"login-field-3d " + (focusField === "pass" ? "focused" : "") + (password ? " has-value" : "")}>
              <div className="field-icon-3d">🔒</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusField("pass")}
                onBlur={() => setFocusField("")}
                required
                placeholder="كلمة المرور / Password"
              />
              <div className="field-glow"></div>
            </div>

            <button type="submit" className={"login-btn-3d " + (loading ? "loading" : "")} disabled={loading}>
              <span className="btn-text">{loading ? "جاري الدخول..." : "◈ دخول / Login"}</span>
              <div className="btn-shine"></div>
              {loading && <div className="btn-loader"></div>}
            </button>
          </form>

          <div className="login-accounts-3d">
            <div className="accounts-title">حسابات تجريبية / Demo Accounts</div>
            <div className="accounts-grid">
              <button type="button" className="account-chip" onClick={() => { setUsername("admin"); setPassword("admin"); }}>
                <span className="chip-icon">◈</span>admin
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("ceo"); setPassword("ceo"); }}>
                <span className="chip-icon">★</span>ceo
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("manager"); setPassword("manager"); }}>
                <span className="chip-icon">◉</span>manager
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("hr_manager"); setPassword("hr_manager"); }}>
                <span className="chip-icon">◆</span>hr_manager
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("hr"); setPassword("hr"); }}>
                <span className="chip-icon">◇</span>hr
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("finance_manager"); setPassword("finance_manager"); }}>
                <span className="chip-icon">◆</span>finance_mgr
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("finance"); setPassword("finance"); }}>
                <span className="chip-icon">◇</span>finance
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("sales_manager"); setPassword("sales_manager"); }}>
                <span className="chip-icon">◆</span>sales_mgr
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("sales"); setPassword("sales"); }}>
                <span className="chip-icon">◇</span>sales
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("it_manager"); setPassword("it_manager"); }}>
                <span className="chip-icon">◆</span>it_manager
              </button>
              <button type="button" className="account-chip" onClick={() => { setUsername("it"); setPassword("it"); }}>
                <span className="chip-icon">◇</span>it
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
