import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function HostEvent() {
  const { authFetch } = useAuth();
  const [eventName, setEventName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!eventName) { alert("Enter event name"); return; }
    setLoading(true);
    try {
      const res = await authFetch(`${API}/create-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: eventName, location }),
      });
      const data = await res.json();
      console.log("Response:", data);
      if (!data.event_id) { alert("Failed: " + JSON.stringify(data)); return; }
      window.location.href = `/event/${data.event_id}`;
    } catch (err) {
      console.error(err);
      alert("Failed to create event");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', -apple-system, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .host-card { animation: fadeUp 0.6s ease both; }


        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.5;
        }

        .text-input {
          width: 100%;
          padding: 14px 18px;
          background: #f5f5f5;
          border: 2px solid transparent;
          border-radius: 14px;
          color: #1a1a1a;
          font-size: 15px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: all 0.2s;
        }

        .text-input:focus {
          border-color: #833ab4;
          background: white;
        }

        .text-input::placeholder { color: #aaa; }

        .create-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(131, 58, 180, 0.35);
        }

        .create-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(131, 58, 180, 0.45);
        }

        .create-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .back-btn {
          background: white;
          border: 1px solid rgba(0,0,0,0.1);
          color: #666;
          font-size: 13px;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: all 0.2s;
          padding: 10px 16px;
          border-radius: 12px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .back-btn:hover { background: #f8f8f8; color: #333; }

        .label {
          font-size: 11px;
          font-weight: 700;
          letterSpacing: 2px;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 8px;
        }
      `}</style>

      <div className="orb" style={{ width: 600, height: 600, background: "linear-gradient(135deg, #833ab4, #fd1d1d)", top: -150, right: -150 }} />
      <div className="orb" style={{ width: 400, height: 400, background: "linear-gradient(135deg, #fcb045, #ffdc80)", bottom: -100, left: -100 }} />
      <div className="orb" style={{ width: 350, height: 350, background: "linear-gradient(135deg, #00c6ff, #0072ff)", top: "40%", right: "10%" }} />

      <div style={{ width: "100%", maxWidth: 440, padding: "0 20px", position: "relative", zIndex: 1 }}>
        <button className="back-btn" onClick={() => window.location.href = "/"}>
          ← Back
        </button>

        <div className="host-card" style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 28,
          padding: "44px 40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: "3px",
              background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              marginBottom: 10, textTransform: "uppercase"
            }}>
              ✨ New Event
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.5px", lineHeight: 1.15 }}>
              Set the stage. 🎉
            </h1>
            <p style={{ color: "#666", fontSize: 15, marginTop: 10, fontWeight: 400 }}>
              Create your event and share the code with guests.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <div className="label">Event Name</div>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. Jill's Wedding"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div>
              <div className="label">Location <span style={{ opacity: 0.5, fontSize: 10 }}>(optional)</span></div>
              <input
                className="text-input"
                type="text"
                placeholder="e.g. The Grand Ballroom, Mumbai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              className="create-btn"
              onClick={handleCreate}
              disabled={loading}
            >
              {loading ? "Creating..." : "🚀 Launch Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
