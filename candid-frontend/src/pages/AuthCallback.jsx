import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback() {
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      login(token);
      window.location.href = "/";
    } else {
      window.location.href = "/?error=auth_failed";
    }
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      color: "white",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 40, height: 40,
          border: "3px solid rgba(255,255,255,0.1)",
          borderTopColor: "#ff4d6d",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px",
        }} />
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
          Signing you in…
        </div>
      </div>
    </div>
  );
}
