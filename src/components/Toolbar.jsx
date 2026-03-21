import { useState } from "react";
import "./Toolbar.css";

const TOOLS = [
  { id: "pen",    label: "Pen",    shortcut: "P", icon: PenIcon },
  { id: "eraser", label: "Eraser", shortcut: "E", icon: EraserIcon },
  { id: "line",   label: "Line",   shortcut: "L", icon: LineIcon },
  { id: "rect",   label: "Rect",   shortcut: "R", icon: RectIcon },
  { id: "circle", label: "Circle", shortcut: "C", icon: CircleIcon },
  { id: "text",   label: "Text",   shortcut: "T", icon: TextIcon },
];

const COLORS = [
  "#00ffc8", "#7b61ff", "#ff4757", "#ffa502",
  "#ffffff", "#a8e6cf", "#fd79a8", "#74b9ff",
  "#f9ca24", "#6c5ce7", "#00b894", "#e17055",
];

const SIZES = [2, 4, 7, 12, 20];

export default function Toolbar({ tool, color, strokeSize, onToolChange, onColorChange, onSizeChange }) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState(color);

  const handleCustomColor = (e) => {
    setCustomColor(e.target.value);
    onColorChange(e.target.value);
  };

  return (
    <div className="toolbar">
      {/* Tools section */}
      <div className="tb-section">
        <span className="tb-section-label">TOOLS</span>
        <div className="tb-tools">
          {TOOLS.map(({ id, label, shortcut, icon: Icon }) => (
            <button
              key={id}
              className={`tool-btn ${tool === id ? "active" : ""}`}
              onClick={() => onToolChange(id)}
              title={`${label} (${shortcut})`}
            >
              <Icon />
              <span className="tool-label">{label}</span>
              <span className="tool-shortcut">{shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tb-sep" />

      {/* Size section */}
      <div className="tb-section">
        <span className="tb-section-label">SIZE</span>
        <div className="size-options">
          {SIZES.map(s => (
            <button
              key={s}
              className={`size-btn ${strokeSize === s ? "active" : ""}`}
              onClick={() => onSizeChange(s)}
              title={`${s}px`}
            >
              <div className="size-dot" style={{ width: Math.min(s + 4, 20), height: Math.min(s + 4, 20) }} />
            </button>
          ))}
        </div>
        <div className="size-display">
          <span>{strokeSize}px</span>
        </div>
      </div>

      <div className="tb-sep" />

      {/* Color section */}
      <div className="tb-section">
        <span className="tb-section-label">COLOR</span>
        <div className="color-grid">
          {COLORS.map(c => (
            <button
              key={c}
              className={`color-swatch ${color === c ? "active" : ""}`}
              style={{ background: c }}
              onClick={() => onColorChange(c)}
              title={c}
            />
          ))}
        </div>

        {/* Custom color */}
        <div className="custom-color-row">
          <div className="custom-color-preview" style={{ background: customColor }} />
          <label className="custom-color-btn" title="Custom color">
            <input type="color" value={customColor} onChange={handleCustomColor} />
            <span>Custom</span>
          </label>
        </div>

        {/* Active color display */}
        <div className="active-color-display">
          <div className="active-swatch" style={{ background: color }} />
          <span className="active-hex">{color.toUpperCase()}</span>
        </div>
      </div>

      <div className="tb-sep" />

      {/* Opacity / opacity hint */}
      <div className="tb-section">
        <span className="tb-section-label">OPACITY</span>
        <input
          type="range" min="10" max="100" defaultValue="100"
          className="opacity-slider"
          title="Opacity"
        />
      </div>
    </div>
  );
}

/* ── Icons ── */
function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
      <path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
    </svg>
  );
}
function EraserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20H7L3 16l10-10 7 7-3.5 3.5"/><path d="M6.0001 11L13 18"/>
    </svg>
  );
}
function LineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="4" y1="20" x2="20" y2="4"/>
    </svg>
  );
}
function RectIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
    </svg>
  );
}
function CircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9"/>
    </svg>
  );
}
function TextIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  );
}
