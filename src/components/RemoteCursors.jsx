import "./RemoteCursors.css";

export default function RemoteCursors({ cursors }) {
  return (
    <div className="remote-cursors-layer" style={{ pointerEvents: "none" }}>
      {Object.entries(cursors).map(([uid, c]) => (
        <div
          key={uid}
          className="remote-cursor"
          style={{
            left: `${c.x * 100}%`,
            top:  `${c.y * 100}%`,
            "--ccolor": c.color || "#7b61ff",
          }}
        >
          {/* SVG Cursor Arrow */}
          <svg
            className="cursor-svg"
            width="20" height="22"
            viewBox="0 0 20 22"
            fill="none"
          >
            <path
              d="M2 2L18 10L10 12L7 20L2 2Z"
              fill={c.color || "#7b61ff"}
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <div className="cursor-label">{c.name || "guest"}</div>
        </div>
      ))}
    </div>
  );
}
