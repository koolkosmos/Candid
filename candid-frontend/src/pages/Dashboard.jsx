import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Visibility pill ────────────────────────────────────────────
function VisBadge({ pub }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600,
      background: pub ? "linear-gradient(135deg, #00c6ff, #0072ff)" : "rgba(0,0,0,0.08)",
      color: pub ? "white" : "#666",
    }}>
      {pub ? "🌐 Public" : "🔒 Private"}
    </span>
  );
}

// ─── Upload preview card ────────────────────────────────────────
function PreviewCard({ file, visibility, onToggle, onRemove }) {
  const url = URL.createObjectURL(file);
  const isPublic = visibility === "public";

  return (
    <div style={{
      position: "relative", borderRadius: 16, overflow: "hidden",
      aspectRatio: "1/1", background: "#f5f5f5",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

      {/* Remove */}
      <button
        onClick={onRemove}
        style={{
          position: "absolute", top: 6, right: 6,
          width: 24, height: 24, borderRadius: "50%",
          background: "rgba(255,255,255,0.95)", border: "none",
          color: "#333", fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1, boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        }}
      >✕</button>

      {/* Visibility toggle at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: "linear-gradient(transparent, rgba(0,0,0,0.5))",
        padding: "20px 8px 8px",
        display: "flex", justifyContent: "center",
      }}>
        <button
          onClick={onToggle}
          style={{
            padding: "5px 12px", borderRadius: 99, border: "none",
            fontSize: 11, fontWeight: 600, cursor: "pointer",
            background: isPublic ? "linear-gradient(135deg, #00c6ff, #0072ff)" : "rgba(255,255,255,0.9)",
            color: isPublic ? "white" : "#666",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            transition: "all 0.18s",
          }}
        >
          {isPublic ? "🌐 Public" : "🔒 Private"}
        </button>
      </div>
    </div>
  );
}

// ─── Match photo card ───────────────────────────────────────────
function PhotoCard({ img, onToggleVisibility, currentUserName }) {
  const [hovered, setHovered] = useState(false);
  const [toggling, setToggling] = useState(false);
  const isPublic = img.visibility === "public";
  const canToggle = img.username === currentUserName;


  const handleToggle = async () => {
    if (toggling || !canToggle) return;
    setToggling(true);
    await onToggleVisibility(img.id, isPublic);
    setToggling(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 20, overflow: "hidden",
        aspectRatio: "1/1", background: "#f5f5f5",
        boxShadow: hovered ? "0 16px 48px rgba(0,0,0,0.15)" : "0 4px 16px rgba(0,0,0,0.08)",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
      }}
    >
      <img
        src={img.image_url}
        alt=""
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          filter: hovered ? "brightness(0.7)" : "brightness(1)",
          transition: "filter 0.25s", display: "block",
        }}
      />

      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <VisBadge pub={isPublic} />
      </div>

      {img.distance != null && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "linear-gradient(135deg, #833ab4, #fd1d1d)",
          borderRadius: 8, padding: "4px 10px",
          fontSize: 11, color: "white", fontWeight: 600,
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}>
          {Math.round((1 - img.distance) * 100)}% match
        </div>
      )}

      {img.username && (
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(255,255,255,0.95)",
          borderRadius: 8, padding: "4px 10px",
          fontSize: 11, color: "#333", fontWeight: 600,
        }}>
          👤 {img.username}
        </div>
      )}

      {canToggle && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "flex-end", padding: 12,
          opacity: hovered ? 1 : 0, transition: "opacity 0.25s",
          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.4))",
        }}>
          <button
            onClick={handleToggle}
            disabled={toggling}
            style={{
              width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
              background: isPublic ? "white" : "linear-gradient(135deg, #00c6ff, #0072ff)",
              color: isPublic ? "#333" : "white", fontWeight: 600, fontSize: 13,
              cursor: toggling ? "not-allowed" : "pointer",
              opacity: toggling ? 0.6 : 1,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {toggling ? "Updating…" : isPublic ? "🔒 Make Private" : "🌐 Make Public"}
          </button>
        </div>
      )}

      {!canToggle && isPublic && hovered && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "flex-end", padding: 12,
          opacity: hovered ? 1 : 0, transition: "opacity 0.25s",
          background: "linear-gradient(transparent 50%, rgba(0,0,0,0.4))",
        }}>
          <div style={{
            width: "100%", padding: "10px 0", borderRadius: 12, border: "none",
            background: "white", color: "#666", fontWeight: 500, fontSize: 12,
            textAlign: "center",
          }}>
            Shared by {img.username}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────
export default function Dashboard({ eventId }) {
  const { user, authFetch, logout } = useAuth();

  const [files, setFiles] = useState([]);
  const [visibilities, setVisibilities] = useState([]);
  const [selfie, setSelfie] = useState(null);
  const [matches, setMatches] = useState([]);
  const [publicPhotos, setPublicPhotos] = useState([]);
  const [myPhotos, setMyPhotos] = useState([]);
  const [eventInfo, setEventInfo] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [finding, setFinding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const selfieRef = useRef(null);

  const fetchContributors = async () => {
    try {
      const res = await authFetch(`${API}/contributors/${eventId}`);
      const data = await res.json();
      setContributors((data.contributors || []).sort((a, b) => b.uploads - a.uploads));
    } catch (e) { console.error(e); }
  };

  const fetchPublicPhotos = async () => {
    try {
      const res = await authFetch(`${API}/public-photos/${eventId}`);
      const data = await res.json();
      setPublicPhotos(data.photos || []);
    } catch (e) { console.error(e); }
  };

  const fetchMyPhotos = async () => {
    try {
      const res = await authFetch(`${API}/my-photos/${eventId}`);
      const data = await res.json();
      setMyPhotos(data.photos || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await authFetch(`${API}/event-info/${eventId}`);
        const data = await res.json();
        setEventInfo(data);
      } catch (e) { console.error(e); }
    };
    fetchInfo();
    fetchContributors();
    fetchPublicPhotos();
    fetchMyPhotos();
  }, [eventId]);

  const addFiles = (newFiles) => {
    const imgs = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...imgs]);
    setVisibilities(prev => [...prev, ...imgs.map(() => "private")]);
  };

  const removeFile = (i) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setVisibilities(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleVis = (i) => {
    setVisibilities(prev => prev.map((v, idx) => idx === i ? (v === "private" ? "public" : "private") : v));
  };

  const handleUpload = async () => {
    if (!files.length) { alert("Select photos first"); return; }
    setUploading(true);

    const formData = new FormData();
    files.forEach(f => formData.append("files", f));
    formData.append("visibilities", JSON.stringify(visibilities));

    try {
      await authFetch(`${API}/upload-album/${eventId}`, { method: "POST", body: formData });
      setFiles([]);
      setVisibilities([]);
      fetchContributors();
      fetchMyPhotos();
      fetchPublicPhotos();
      alert("Uploaded! 🎉");
    } catch (e) { console.error(e); alert("Upload failed"); }

    setUploading(false);
  };

  const handleFind = async () => {
    if (!selfie) { alert("Upload a selfie"); return; }
    setFinding(true);
    const formData = new FormData();
    formData.append("file", selfie);
    try {
      const res = await authFetch(`${API}/match/${eventId}`, { method: "POST", body: formData });
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (e) { console.error(e); alert("Search failed"); }
    setFinding(false);
  };

  const handleToggleVisibility = async (imageId, currentlyPublic) => {
    const endpoint = currentlyPublic ? "make-private" : "make-public";
    const formData = new FormData();
    formData.append("image_id", imageId);
    try {
      const res = await authFetch(`${API}/${endpoint}/${eventId}`, { method: "POST", body: formData });
      if (res.ok) {
        setMatches(prev => prev.map(m =>
          m.id === imageId ? { ...m, visibility: currentlyPublic ? "private" : "public" } : m
        ));
        setMyPhotos(prev => prev.map(m =>
          m.id === imageId ? { ...m, visibility: currentlyPublic ? "private" : "public" } : m
        ));
        fetchPublicPhotos();
        fetchMyPhotos();
      }
    } catch (e) { console.error(e); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(eventId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)", fontFamily: "'Inter', -apple-system, sans-serif", color: "#1a1a1a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(131, 58, 180,.5);} 70%{box-shadow:0 0 0 8px rgba(131, 58, 180,0);} 100%{box-shadow:0 0 0 0 rgba(131, 58, 180,0);} }

        .top-bar {
          display:flex; align-items:center; justify-content:space-between;
          padding:16px 28px; border-bottom:1px solid rgba(0,0,0,0.06);
          background:white; box-shadow: 0 2px 12px rgba(0,0,0,0.04);
          position:sticky; top:0; z-index:10;
        }

        .section-card {
          background:white; border:1px solid rgba(0,0,0,0.06);
          border-radius:20px; padding:20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
        }

        .text-input {
          width:100%; padding:12px 16px;
          background:#f5f5f5; border:2px solid transparent;
          border-radius:14px; color:#1a1a1a; font-size:14px;
          outline:none; transition:all 0.2s;
        }
        .text-input:focus { border-color:#833ab4; background:white; }
        .text-input::placeholder { color:#aaa; }

        .btn-primary {
          width:100%; padding:14px;
          background:linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
          color:white; border:none; border-radius:14px; font-size:14px; font-weight:600;
          cursor:pointer;
          transition:transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 16px rgba(131, 58, 180, 0.3);
        }
        .btn-primary:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(131, 58, 180, 0.4); }
        .btn-primary:disabled { opacity:0.5; cursor:not-allowed; }

        .btn-secondary {
          width:100%; padding:14px;
          background:white; color:#333;
          border:1.5px solid rgba(0,0,0,0.1); border-radius:14px;
          font-size:14px; font-weight:600; cursor:pointer;
          transition:all 0.2s;
        }
        .btn-secondary:hover:not(:disabled) { background:#f8f8f8; transform:translateY(-2px); }
        .btn-secondary:disabled { opacity:0.5; cursor:not-allowed; }

        .drop-zone {
          border:2px dashed rgba(0,0,0,0.1); border-radius:16px;
          padding:24px 16px; text-align:center; cursor:pointer;
          background:#fafafa; transition:all 0.2s;
        }
        .drop-zone:hover, .drop-zone.drag {
          border-color:#833ab4;
          background:linear-gradient(135deg, rgba(131,58,180,0.05), rgba(253,29,29,0.05));
        }

        .selfie-zone {
          border:2px dashed rgba(0,0,0,0.1); border-radius:16px;
          padding:20px; text-align:center; cursor:pointer;
          transition:all 0.2s;
        }
        .selfie-zone:hover {
          border-color:#00c6ff;
          background:linear-gradient(135deg, rgba(0,198,255,0.05), rgba(0,114,255,0.05));
        }

        .preview-grid {
          display:grid; grid-template-columns:repeat(auto-fill, minmax(100px,1fr)); gap:10px;
          margin-top:12px;
        }

        .photo-grid {
          display:grid; grid-template-columns:repeat(auto-fill, minmax(160px,1fr)); gap:16px;
        }

        .contributor-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:10px 14px; border-radius:12px;
          background:#f8f9fa; border:1px solid rgba(0,0,0,0.04);
          transition:all 0.18s;
        }
        .contributor-row:hover { background:#f0f0f0; transform: translateX(4px); }

        .spinner {
          width:14px; height:14px; border:2px solid rgba(255,255,255,0.3);
          border-top-color:white; border-radius:50%;
          animation:spin 0.7s linear infinite; display:inline-block;
          margin-right:7px; vertical-align:middle;
        }

        .live-dot {
          width:8px; height:8px; background:linear-gradient(135deg, #00c6ff, #0072ff); border-radius:50%;
          display:inline-block; margin-right:7px;
          animation:pulse 2s ease-out infinite;
        }

        .label {
          font-size:11px; font-weight:700; letterSpacing:2px;
          text-transform:uppercase; color:#999; margin-bottom:10px;
        }
      `}</style>

      {/* TOP BAR */}
      <div className="top-bar">
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{
            fontSize:13, fontWeight:800, letterSpacing:"2px",
            background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>✨ CANDID</span>
          <span style={{ color:"#ddd" }}u003e·</span>
          <span style={{ fontSize:13, color:"#666", display:"flex", alignItems:"center", gap: 6 }}>
            <span className="live-dot" />Live Event
          </span>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{
            fontFamily:"monospace", fontWeight:700, fontSize:20, color:"#1a1a1a",
            letterSpacing:4, background:"linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{eventId}</span>
          <button onClick={copyCode} style={{
            padding:"6px 14px", borderRadius:10,
            background:copied ? "linear-gradient(135deg, #00c6ff, #0072ff)" : "#f5f5f5",
            border:"none",
            color:copied ? "white" : "#666",
            fontSize:12, fontWeight:600, cursor:"pointer",
            transition:"all 0.2s",
          }}>{copied ? "✓ Copied!" : "📋 Copy"}</button>

          {/* User chip */}
          <div style={{ display:"flex", alignItems:"center", gap:8, paddingLeft:12, borderLeft:"1px solid #eee" }}>
            {user?.picture && <img src={user.picture} alt="" style={{ width:30, height:30, borderRadius:"50%", border: "2px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }} />}
            <span style={{ fontSize:13, color:"#666", fontWeight: 500 }}>{user?.name}</span>
            <button onClick={logout} style={{
              background:"#f5f5f5", border:"none",
              color:"#999", borderRadius:8, padding:"4px 10px",
              fontSize:11, cursor:"pointer", fontWeight: 500,
            }}>Log out</button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 65px)" }}>

        {/* LEFT SIDEBAR */}
        <div style={{
          width:320, flexShrink:0,
          borderRight:"1px solid rgba(0,0,0,0.06)",
          padding:"24px 20px", display:"flex", flexDirection:"column", gap:20, overflowY:"auto",
          background: "white",
        }}>

          {/* Event info */}
          <div>
            <div className="label">Event</div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:"-0.3px", lineHeight:1.2, color:"#1a1a1a" }}>
              {eventInfo?.name || `Event ${eventId}`}
            </div>
            {eventInfo?.location && (
              <div style={{ fontSize:13, color:"#888", marginTop:4 }}>📍 {eventInfo.location}</div>
            )}
          </div>

          <div style={{ height:1, background:"#f0f0f0" }} />

          {/* Upload section */}
          <div className="section-card">
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, color:"#333" }}>📤 Upload Photos</div>

            {/* Username locked */}
            <div style={{
              display:"flex", alignItems:"center", gap:10, marginBottom:14,
              background:"#f8f9fa", border:"1px solid rgba(0,0,0,0.06)",
              borderRadius:12, padding:"10px 14px",
            }}>
              {user?.picture && <img src={user.picture} alt="" style={{ width:24, height:24, borderRadius:"50%" }} />}
              <span style={{ fontSize:13, color:"#333", fontWeight: 500 }}>{user?.name}</span>
              <span style={{ marginLeft:"auto", fontSize:11, color:"#999", fontWeight: 500 }}>locked</span>
            </div>

            {/* Drop zone */}
            <div
              className={`drop-zone${dragging ? " drag" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
            }
              <div style={{ fontSize:28, marginBottom:6 }}>📸</div>
              <div style={{ color:"#666", fontSize:14 }}>
                {files.length > 0 ? `${files.length} photo${files.length > 1 ? "s" : ""} selected` : "Drop photos or tap to browse"}
              </div>
              <input ref={fileRef} type="file" multiple accept="image/*" style={{ display:"none" }}
                onChange={(e) => addFiles(e.target.files)} />
            </div>

            {/* Preview grid */}
            {files.length > 0 &, (
              >
                <div style={{ fontSize:11, color:"#999", marginTop:14, marginBottom:6, fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase" }}>
                  Preview — tap to toggle
                </div>
                <div className="preview-grid">
                  {files.map((f, i) => (
                    <PreviewCard
                      key={i}
                      file={f}
                      visibility={visibilities[i]}
                      onToggle={() => toggleVis(i)}
                      onRemove={() => removeFile(i)}
                    />
                  ))}
                </div>

                {/* Quick set all */}
                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  <button
                    onClick={() => setVisibilities(files.map(() => "private"))}
                    style={{
                      flex:1, padding:"8px 0", borderRadius:10, border:"none",
                      background:"#f5f5f5", color:"#666",
                      fontSize:12, fontWeight:600, cursor:"pointer",
                    }}
                  >All Private</button>
                  <button
                    onClick={() => setVisibilities(files.map(() => "public"))}
                    style={{
                      flex:1, padding:"8px 0", borderRadius:10, border:"none",
                      background:"linear-gradient(135deg, #00c6ff, #0072ff)", color:"white",
                      fontSize:12, fontWeight:600, cursor:"pointer",
                    }}
                  >All Public</button>
                </div>
              </)
            }

            <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ marginTop:16 }}>
              {uploading ? ><span className="spinner" />Uploading…</button> : "🚀 Upload Photos"}
            </button>
          </div>

          {/* Find section */}
          <div className="section-card">
            <div style={{ fontSize:14, fontWeight:600, marginBottom:14, color:"#333" }}>🔍 Find Your Photos</div>

            <label className="selfie-zone" style={{ display:"block" }}>
              <input ref={selfieRef} type="file" accept="image/*" style={{ display:"none" }}
                onChange={(e) => setSelfie(e.target.files[0])} />
              {selfie
                ? <div style={{ fontSize:14, color:"#00c6ff", fontWeight: 600 }}>✓ {selfie.name}</div>
                : ><div style={{ fontSize:26, marginBottom:4 }}>🤳</div>
                   <div style={{ fontSize:13, color:"#888" }}>Upload your selfie</div>}
              }
            </label>

            <button className="btn-secondary" onClick={handleFind} disabled={finding} style={{ marginTop:14 }}>
              {finding ? ><span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#333' }} />Searching…</button> : "✨ Find Me"}
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ flex:1, padding:"28px 28px", overflowY:"auto" }}>

          {/* Public Gallery Section */}
          {publicPhotos.length > 0 && (
            <div style={{ marginBottom: 40, animation:"fadeUp 0.4s ease both" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:24 }}>
                <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", background: "linear-gradient(135deg, #833ab4, #fd1d1d)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🌐 Public Gallery</h2>
                <span style={{
                  fontSize:12, color:"#666",
                  background:"#f5f5f5", padding:"4px 12px", borderRadius:99, fontWeight: 600,
                }}>{publicPhotos.length} photos</span>
              </div>
              <div className="photo-grid">
                {publicPhotos.map((img, i) => (
                  <div key={img.id || i} style={{ animation:`fadeUp 0.35s ${i * 0.03}s ease both` }}>
                    <PhotoCard img={img} onToggleVisibility={handleToggleVisibility} currentUserName={user?.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Uploads Section */}
          {myPhotos.length > 0 && (
            <div style={{ marginBottom: 40, animation:"fadeUp 0.4s ease both" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:24 }}>
                <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", color:"#1a1a1a" }}>📁 My Uploads</h2>
                <span style={{
                  fontSize:12, color:"#666",
                  background:"#f5f5f5", padding:"4px 12px", borderRadius:99, fontWeight: 600,
                }}>{myPhotos.length} photos</span>
              </div>
              <div className="photo-grid">
                {myPhotos.map((img, i) => (
                  <div key={img.id || i} style={{ animation:`fadeUp 0.35s ${i * 0.03}s ease both` }}>
                    <PhotoCard img={img} onToggleVisibility={handleToggleVisibility} currentUserName={user?.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Photos (Matches) Section */}
          {matches.length > 0 && (
            <div style={{ marginBottom: 40, animation:"fadeUp 0.4s ease both" }}>
              <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:24 }}>
                <h2 style={{ fontSize:26, fontWeight:700, letterSpacing:"-0.5px", background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>✨ Your Photos</h2>
                <span style={{
                  fontSize:12, color:"white",
                  background: "linear-gradient(135deg, #833ab4, #fd1d1d)", padding:"4px 12px", borderRadius:99, fontWeight: 600,
                }}>{matches.length} found</span>
              </div>
              <div className="photo-grid">
                {matches.map((img, i) => (
                  <div key={img.id || i} style={{ animation:`fadeUp 0.35s ${i * 0.03}s ease both` }}>
                    <PhotoCard img={img} onToggleVisibility={handleToggleVisibility} currentUserName={user?.name} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {publicPhotos.length === 0 && myPhotos.length === 0 && matches.length === 0 ? (
            <div style={{
              height:"100%", display:"flex", flexDirection: "column",
              alignItems:"center", justifyContent:"center",
              color:"#aaa", textAlign:"center", paddingBottom:80,
            }}>
              <div style={{ fontSize:60, marginBottom:16 }}>📷</div>
              <div style={{ fontSize:20, fontWeight:600, marginBottom:8, color:"#666" }}>Your photos appear here</div>
              <div style={{ fontSize:14, fontWeight:400, maxWidth:300, color:"#999" }}>
                Upload a selfie and hit "Find Me" to discover all photos you're in
              </div>
            </div>
          ) : null}
        </div>

        {/* RIGHT SIDEBAR — CONTRIBUTORS */}
        <div style={{
          width:240, flexShrink:0,
          borderLeft:"1px solid rgba(0,0,0,0.06)",
          padding:"24px 16px", overflowY:"auto", background:"white",
        }}>
          <div className="label">Top Contributors</div>

          {contributors.length === 0
            ? <div style={{ color:"#bbb", fontSize:13, textAlign:"center", marginTop:28 }}>No uploads yet</div>
            : (
              <div style={{ display:"flex", flexDirection: "column", gap:8 }}>
                {contributors.map((c, i) => (
                  <div key={i} className="contributor-row" style={{ animation:`fadeUp 0.4s ${i*0.05}s ease both` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, position: "relative" }}>
                      <div style={{
                        width:30, height:30, borderRadius:"50%",
                        background: i === 0
                          ? "linear-gradient(135deg, #fcb045, #fd1d1d)"
                          : `linear-gradient(135deg, hsl(${(i*73+190)%360}, 60%, 50%), hsl(${(i*73+190)%360}, 70%, 40%))`,
                        display:"flex", alignItems:"center", justifyContent:"center",
                        fontSize:12, fontWeight:700, color:"white", flexShrink:0,
                      }}>{c.name[0]?.toUpperCase()}</div>
                      {i === 0 && (
                        <span style={{ position: "absolute", top:-8, left:-8, fontSize:16 }}>👑</span>
                      )}
                      <span style={{ fontSize:13, fontWeight:600, color:"#333" }}>
                        {c.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize:12, fontWeight:700,
                      background:"linear-gradient(135deg, #833ab4, #fd1d1d)",
                      WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    }}>{c.uploads}</span>
                  </div>
                ))}

                <div style={{
                  marginTop:18, paddingTop:14,
                  borderTop:"1px solid #f0f0f0",
                  display:"flex", justifyContent:"space-between",
                  color:"#999", fontSize:12, fontWeight: 600,
                }}>
                  <span>Total</span>
                  <span style={{ color:"#833ab4" }}>{contributors.reduce((s,c)=> s+c.uploads,0)}</span>
                </div>
              </div>
            )
          }
        </div>

      </div>
    </div>
  );
}
