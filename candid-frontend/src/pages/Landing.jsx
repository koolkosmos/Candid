import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Landing() {
  const { user, logout } = useAuth();
  const [code, setCode] = useState("");


  const handleGoogleLogin = () => {
    window.location.href = `${API}/auth/google`;
  };

  const handleEnter = () => {
    if (!code || code.length !== 6) return;
    window.location.href = `/event/${code}`;
  };

  // ── Not logged in ────────────────────────────────────────────
  if (!user) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        overflow: "hidden", position: "relative",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          .orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5; animation: drift 14s ease-in-out infinite alternate; }
          @keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px,-30px) scale(1.08); } }
          @keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
          @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
          .f1 { animation: fadeUp 0.6s ease both; }
          .f2 { animation: fadeUp 0.6s 0.12s ease both; }
          .f3 { animation: fadeUp 0.6s 0.22s ease both; }
          .f4 { animation: fadeUp 0.6s 0.32s ease both; }
          .google-btn {
            width: 100%; display: flex; align-items: center; justify-content: center; gap: 12px;
            padding: 15px; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
            color: white; border: none; border-radius: 16px;
            font-size: 15px; font-weight: 600; cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 20px rgba(131, 58, 180, 0.35);
          }
          .google-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 12px 32px rgba(131, 58, 180, 0.45); }
          .tag-line {
            background: linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045, #ffdc80);
            background-size: 300% auto;
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: shimmer 3s ease infinite;
          }
        `}</style>

        {/* Floating orbs - Instagram colors */}
        <div className="orb" style={{ width: 600, height: 600, background: "linear-gradient(135deg, #833ab4, #fd1d1d)", top: -150, left: -150, animationDelay: "0s" }} />
        <div className="orb" style={{ width: 450, height: 450, background: "linear-gradient(135deg, #fcb045, #ffdc80)", bottom: -100, right: -100, animationDelay: "-5s" }} />
        <div className="orb" style={{ width: 350, height: 350, background: "linear-gradient(135deg, #00c6ff, #0072ff)", top: "40%", right: "15%", animationDelay: "-3s" }} />

        <div className="f1" style={{ marginBottom: 52, textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            fontSize: 14, fontWeight: 700, letterSpacing: "3px",
            background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 16, textTransform: "uppercase"
          }}>
            ✨ Candid
          </div>
          <h1 className="f2" style={{
            fontSize: "clamp(48px,7vw,80px)", fontWeight: 800, color: "#1a1a1a",
            lineHeight: 1.05, letterSpacing: "-2px",
            textShadow: "0 2px 20px rgba(0,0,0,0.08)",
          }}>
            Find Your <span className="tag-line" style={{ fontStyle: "italic" }}>Candid</span> Moments
          </h1>
          <p className="f3" style={{
            marginTop: 16, color: "#666", fontSize: 18, fontWeight: 400,
            maxWidth: 400, marginInline: "auto"
          }}>
            Discover photos you're in. Magic face matching at any event.
          </p>
        </div>

        <div className="f4" style={{
          background: "white", border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          display: "flex", flexDirection: "column", gap: 16,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ textAlign: "center", color: "#888", fontSize: 14, fontWeight: 500 }}>
            Sign in to join the fun
          </div>
          <button className="google-btn" onClick={handleGoogleLogin}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          <div style={{ textAlign: "center", color: "#aaa", fontSize: 12 }}>
            Your Google account stays private
          </div>
        </div>

        <p style={{ marginTop: 40, color: "#999", fontSize: 13, fontWeight: 500, animation: "fadeUp 0.6s 0.5s ease both", animationFillMode: "both", position: "relative", zIndex: 1 }}>
          🎭 Private by default · AI-powered · Works everywhere
        </p>
      </div>
    );
  }

  // ── Logged in ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden", position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .orb { position: absolute; border-radius: 50%; filter: blur(90px); opacity: 0.5; animation: drift 14s ease-in-out infinite alternate; }
        @keyframes drift { 0% { transform: translate(0,0) scale(1); } 100% { transform: translate(40px,-30px) scale(1.08); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .g1 { animation: fadeUp 0.5s ease both; }
        .g2 { animation: fadeUp 0.5s 0.1s ease both; }
        .g3 { animation: fadeUp 0.5s 0.2s ease both; }
        .join-btn {
          width: 100%; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white; border: none; padding: 15px; border-radius: 16px;
          font-size: 16px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(131, 58, 180, 0.35);
        }
        .join-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 32px rgba(131, 58, 180, 0.45); }
        .host-btn {
          width: 100%; background: "white"; color: "#333";
          border: 1.5px solid rgba(0,0,0,0.1); padding: 15px; border-radius: 16px;
          font-size: 16px; font-weight: 600; cursor: pointer;
          transition: all 0.2s;
        }
        .host-btn:hover { background: "#f8f8f8"; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .code-input {
          width: 100%; text-align: center; font-size: 32px; fontWeight: 700;
          letter-spacing: 12px; padding: 18px;
          background: "#f5f5f5"; border: 2px solid transparent;
          border-radius: 16px; color: "#1a1a1a"; outline: none;
          transition: all 0.2s;
          font-family: 'Inter', sans-serif; caret-color: #833ab4;
        }
        .code-input:focus { border-color: #833ab4; background: "white"; box-shadow: 0 0 0 4px rgba(131, 58, 180, 0.1); }
        .code-input::placeholder { color: "#ccc"; letterSpacing: 10px; }
        .divider { display: flex; align-items: center; gap: 12px; color: "#bbb"; font-size: 12px; letter-spacing: 2px; }
        .divider::before,.divider::after { content: ''; flex: 1; height: 1px; background: "#e0e0e0"; }
        .tag-line {
          background: linear-gradient(90deg, #833ab4, #fd1d1d, #fcb045, #ffdc80);
          background-size: 300% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s ease infinite;
        }
        .logout-btn {
          background: "white"; border: 1px solid rgba(0,0,0,0.1);
          color: "#666"; border-radius: 10px; padding: 6px 12px;
          fontSize: 12px; cursor: pointer; transition: all 0.2s;
        }
        .logout-btn:hover { background: "#f5f5f5"; color: "#333"; }
      `}</style>

      <div className="orb" style={{ width: 600, height: 600, background: "linear-gradient(135deg, #833ab4, #fd1d1d)", top: -150, left: -150, animationDelay: "0s" }} />
      <div className="orb" style={{ width: 450, height: 450, background: "linear-gradient(135deg, #fcb045, #ffdc80)", bottom: -100, right: -100, animationDelay: "-5s" }} />
      <div className="orb" style={{ width: 350, height: 350, background: "linear-gradient(135deg, #00c6ff, #0072ff)", top: "40%", right: "15%", animationDelay: "-3s" }} />

      {/* User chip */}
      <div style={{ position: "absolute", top: 24, right: 28, display: "flex", alignItems: "center", gap: 10, zIndex: 10 }}>
        {user.picture && (
          <img src={user.picture} alt={user.name} style={{ width: 36, height: 36, borderRadius: "50%", border: "2px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
        )}
        <span style={{ color: "#666", fontSize: 14, fontWeight: 500 }}>>{user.name}</span>
        <button className="logout-btn" onClick={logout}>Log out</button>
      </div>

      <div className="g1" style={{ marginBottom: 48, textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: "3px",
          background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          marginBottom: 14, textTransform: "uppercase"
        }}>
          ✨ Candid
        </div>
        <h1 className="g2" style={{
          fontSize: "clamp(42px,6vw,68px)", fontWeight: 800, color: "#1a1a1a",
          lineHeight: 1.08, letterSpacing: "-1.5px",
        }}>
          Find Your <span className="tag-line" style={{ fontStyle: "italic" }}>Candid</span> Moments
        </h1>
      </div>

      <div className="g3" style={{
        background: "white", border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 28, padding: "40px 36px", width: "100%", maxWidth: 400,
        boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        display: "flex", flexDirection: "column", gap: 14,
        position: "relative", zIndex: 1,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "2px", color: "#999", marginBottom: 10, textTransform: "uppercase" }}>
            Enter Event Code
          </div>
          <input
            className="code-input"
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          />
        </div>
        <button className="join-btn" onClick={handleEnter}>Let's Go! 🚀</button>
        <div className="divider">OR</div>
        <button className="host-btn" onClick={() => window.location.href = "/host"}>🎉 Host New Event</button>
      </div>

      <p style={{ marginTop: 36, color: "#999", fontSize: 14, fontWeight: 500, position: "relative", zIndex: 1 }}>
        🎭 Private by default · Works everywhere
      </p>
    </div>
  );
}
