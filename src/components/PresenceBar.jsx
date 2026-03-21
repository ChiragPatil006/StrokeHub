import "./PresenceBar.css";

export default function PresenceBar({ users, myUserId, myColor, myName }) {
  const online = Object.entries(users).filter(([, u]) => u.online);
  const count  = online.length;

  return (
    <div className="presence-bar">
      <div className="presence-label">
        <span className="presence-dot-ring" />
        <span className="presence-count">{count}</span>
        <span className="presence-text">online</span>
      </div>

      <div className="presence-avatars">
        {online.map(([uid, user]) => {
          const isMe = uid === myUserId;
          return (
            <div
              key={uid}
              className={`presence-avatar ${isMe ? "me" : ""}`}
              style={{ "--ucolor": user.color || myColor }}
              title={isMe ? `${user.name} (you)` : user.name}
            >
              <span>{(user.name || "?")[0].toUpperCase()}</span>
              {isMe && <div className="me-badge">you</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
