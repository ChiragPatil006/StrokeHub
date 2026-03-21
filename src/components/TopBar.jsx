import { useState } from "react";
import "./TopBar.css";

export default function TopBar({ session, myColor, onLeave, onUndo, onRedo, onClear, onDownload, canUndo, canRedo, isDrawing, syncStatus, presenceSlot }) {
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(session.roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    if (showClearConfirm) {
      onClear();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  return (
    <div className="topbar">
      {/* Left: Logo */}
      <div className="topbar-left">
        <div className="tb-logo">
          <svg width="22" height="22" viewBox="0 0 36 36" fill="none">
            <rect x="2" y="2" width="14" height="14" rx="3" fill="var(--accent)" opacity="0.9"/>
            <rect x="20" y="2" width="14" height="14" rx="3" fill="var(--accent2)" opacity="0.7"/>
            <rect x="2" y="20" width="14" height="14" rx="3" fill="var(--accent2)" opacity="0.5"/>
            <rect x="20" y="20" width="14" height="14" rx="3" fill="var(--accent)" opacity="0.4"/>
          </svg>
          <span className="tb-logo-text">SYNCBOARD</span>
        </div>
        <div className="tb-divider" />
        <div className="room-chip" onClick={copyRoomId} title="Click to copy">
          <span className="room-label">ROOM</span>
          <span className="room-id">{session.roomId}</span>
          <span className="copy-icon">{copied ? "✓" : "⎘"}</span>
        </div>
        <div className={`live-dot ${isDrawing ? "active" : ""}`}>
          <span className="dot" />
          <span className="live-label">{isDrawing ? "drawing" : "live"}</span>
        </div>
      </div>

      {/* Center: History controls */}
      <div className="topbar-center">
        <button className="tb-btn" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <UndoIcon /> <span>Undo</span>
        </button>
        <button className="tb-btn" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
          <RedoIcon /> <span>Redo</span>
        </button>
        <div className="tb-divider" />
        <button className={`tb-btn danger ${showClearConfirm ? "confirm" : ""}`} onClick={handleClear} title="Clear board">
          <TrashIcon />
          <span>{showClearConfirm ? "Confirm?" : "Clear"}</span>
        </button>
      </div>

      {/* Right: User & actions */}
      <div className="topbar-right">
        {presenceSlot}
        <div className={`sync-badge ${syncStatus}`}>
          <span className="sync-dot" />
          <span>{syncStatus === "connecting" ? "connecting" : "synced"}</span>
        </div>
        <button className="tb-btn accent" onClick={onDownload} title="Download as PNG">
          <DownloadIcon /> <span>Export</span>
        </button>
        <div className="user-chip">
          <div className="user-avatar">{session.name[0].toUpperCase()}</div>
          <span className="user-name">{session.name}</span>
        </div>
        <button className="tb-btn leave" onClick={onLeave} title="Leave board">
          <LeaveIcon />
        </button>
      </div>
    </div>
  );
}

const UndoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M3 7v6h6"/><path d="M3 13C5 7.5 9.5 5 15 5c4.5 0 8 3 8 7s-3.5 7-8 7H9"/>
  </svg>
);
const RedoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 7v6h-6"/><path d="M21 13C19 7.5 14.5 5 9 5c-4.5 0-8 3-8 7s3.5 7 8 7h6"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const LeaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
