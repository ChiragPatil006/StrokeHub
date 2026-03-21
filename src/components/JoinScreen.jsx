import { useState } from "react";
import "./JoinScreen.css";

function generateRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState("create"); // 'create' | 'join'
  const [error, setError] = useState("");
  const [entering, setEntering] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) { setError("Enter your display name"); return; }
    if (mode === "join" && roomId.trim().length < 4) { setError("Enter a valid Room ID"); return; }
    setEntering(true);
    const finalRoomId = mode === "create" ? generateRoomId() : roomId.trim().toUpperCase();
    setTimeout(() => onJoin({ name: name.trim(), roomId: finalRoomId }), 600);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="join-root">
      <div className="join-bg">
        <div className="grid-lines" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="scan-line" />
      </div>

      <div className={`join-card ${entering ? "entering" : ""}`}>
        <div className="join-header">
          <div className="logo-mark">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect x="2" y="2" width="14" height="14" rx="3" fill="var(--accent)" opacity="0.9"/>
              <rect x="20" y="2" width="14" height="14" rx="3" fill="var(--accent2)" opacity="0.7"/>
              <rect x="2" y="20" width="14" height="14" rx="3" fill="var(--accent2)" opacity="0.5"/>
              <rect x="20" y="20" width="14" height="14" rx="3" fill="var(--accent)" opacity="0.4"/>
            </svg>
          </div>
          <div>
            <h1 className="join-title">SYNCBOARD</h1>
            <p className="join-subtitle">Real-time collaborative canvas</p>
          </div>
        </div>

        <div className="mode-toggle">
          <button className={`mode-btn ${mode === "create" ? "active" : ""}`} onClick={() => setMode("create")}>
            <span className="mode-icon">✦</span> Create Room
          </button>
          <button className={`mode-btn ${mode === "join" ? "active" : ""}`} onClick={() => setMode("join")}>
            <span className="mode-icon">⌘</span> Join Room
          </button>
        </div>

        <div className="join-fields">
          <div className="field-group">
            <label className="field-label">DISPLAY NAME</label>
            <input
              className="field-input"
              placeholder="Enter your name..."
              value={name}
              onChange={e => { setName(e.target.value); setError(""); }}
              onKeyDown={handleKey}
              maxLength={24}
              autoFocus
            />
          </div>

          {mode === "join" && (
            <div className="field-group">
              <label className="field-label">ROOM CODE</label>
              <input
                className="field-input mono"
                placeholder="e.g. XK9P2Q"
                value={roomId}
                onChange={e => { setRoomId(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={handleKey}
                maxLength={8}
              />
            </div>
          )}

          {error && <p className="join-error">⚠ {error}</p>}
        </div>

        <button className={`join-btn ${entering ? "loading" : ""}`} onClick={handleSubmit} disabled={entering}>
          {entering ? (
            <span className="btn-loading"><span/><span/><span/></span>
          ) : (
            <>
              <span>{mode === "create" ? "Create & Enter" : "Join Board"}</span>
              <span className="btn-arrow">→</span>
            </>
          )}
        </button>

        <div className="join-footer">
          <span className="badge">☁ Cloud-Synced</span>
          <span className="badge">⚡ Real-time</span>
          <span className="badge">∞ Free</span>
        </div>
      </div>
    </div>
  );
}
