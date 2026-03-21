import { useEffect, useRef, useCallback } from "react";
import { db } from "../firebase";
import {
  ref, push, set, onValue, off,
  onDisconnect, serverTimestamp, remove,
} from "firebase/database";

const USER_ID = Math.random().toString(36).slice(2, 10);

const USER_COLORS = [
  "#00ffc8","#7b61ff","#ffa502","#fd79a8",
  "#74b9ff","#f9ca24","#a8e6cf","#e17055",
];
export const MY_COLOR = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

export function useSync({
  roomId, userName,
  onRemoteStroke,
  onLoadStrokes,
  onPresenceUpdate,
  onCursorUpdate,
  onRemoteClear,
  onLiveStrokesUpdate,  // NEW: (liveStrokes{}) => void
}) {
  const strokesRef     = useRef(ref(db, `boards/${roomId}/strokes`));
  const usersRef       = useRef(ref(db, `boards/${roomId}/users`));
  const cursorsRef     = useRef(ref(db, `boards/${roomId}/cursors`));
  const clearedRef     = useRef(ref(db, `boards/${roomId}/clearedAt`));
  const liveRef        = useRef(ref(db, `boards/${roomId}/live`));         // NEW
  const myUserRef      = useRef(ref(db, `boards/${roomId}/users/${USER_ID}`));
  const myCursorRef    = useRef(ref(db, `boards/${roomId}/cursors/${USER_ID}`));
  const myLiveRef      = useRef(ref(db, `boards/${roomId}/live/${USER_ID}`)); // NEW

  const knownIds       = useRef(new Set());
  const lastCleared    = useRef(null);
  const liveThrottle   = useRef(null);
  const cursorThrottle = useRef(null);

  // ── Presence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const userData = { name: userName, color: MY_COLOR, online: true, lastSeen: serverTimestamp() };
    set(myUserRef.current, userData);
    onDisconnect(myUserRef.current).update({ online: false, lastSeen: serverTimestamp() });
    onDisconnect(myCursorRef.current).remove();
    onDisconnect(myLiveRef.current).remove();  // clean up live stroke on disconnect
    return () => {
      set(myUserRef.current, { ...userData, online: false });
      remove(myCursorRef.current);
      remove(myLiveRef.current);
    };
  }, [roomId, userName]);

  // ── Listen: completed strokes ─────────────────────────────────────────────
  useEffect(() => {
    const sRef = strokesRef.current;
    let initialLoad = true;
    const handler = onValue(sRef, (snapshot) => {
      const data = snapshot.val();
      if (initialLoad) {
        initialLoad = false;
        if (data) {
          const loaded = Object.entries(data).map(([id, s]) => {
            knownIds.current.add(id);
            return { ...s, id };
          });
          onLoadStrokes(loaded);
        } else {
          onLoadStrokes([]);
        }
        return;
      }
      if (!data) return;
      Object.entries(data).forEach(([id, s]) => {
        if (!knownIds.current.has(id)) {
          knownIds.current.add(id);
          onRemoteStroke({ ...s, id });
        }
      });
    });
    return () => off(sRef, "value", handler);
  }, [roomId]);

  // ── Listen: live strokes (in-progress drawing from other users) ───────────
  useEffect(() => {
    const lRef = liveRef.current;
    const handler = onValue(lRef, (snap) => {
      const data = snap.val() || {};
      // Filter out our own live stroke
      const others = Object.fromEntries(
        Object.entries(data).filter(([id]) => id !== USER_ID)
      );
      if (onLiveStrokesUpdate) onLiveStrokesUpdate(others);
    });
    return () => off(lRef, "value", handler);
  }, [roomId]);

  // ── Listen: presence ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = onValue(usersRef.current, (snap) => onPresenceUpdate(snap.val() || {}));
    return () => off(usersRef.current, "value", handler);
  }, [roomId]);

  // ── Listen: cursors ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = onValue(cursorsRef.current, (snap) => {
      const data = snap.val() || {};
      onCursorUpdate(Object.fromEntries(Object.entries(data).filter(([id]) => id !== USER_ID)));
    });
    return () => off(cursorsRef.current, "value", handler);
  }, [roomId]);

  // ── Listen: board clears ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = onValue(clearedRef.current, (snap) => {
      const val = snap.val();
      if (val && val !== lastCleared.current) {
        lastCleared.current = val;
        if (val.__clearedBy !== USER_ID) {
          knownIds.current.clear();
          onRemoteClear();
        }
      }
    });
    return () => off(clearedRef.current, "value", handler);
  }, [roomId]);

  // ── Push completed stroke ─────────────────────────────────────────────────
  const pushStroke = useCallback((stroke) => {
    const newRef = push(strokesRef.current);
    knownIds.current.add(newRef.key);
    set(newRef, {
      tool:    stroke.tool,
      color:   stroke.color,
      size:    stroke.size,
      opacity: stroke.opacity ?? 1,
      points:  stroke.points,
      text:    stroke.text ?? null,
    });
    return newRef.key;
  }, []);

  // ── Broadcast live stroke points (throttled ~20fps) ───────────────────────
  const broadcastLive = useCallback((points, meta) => {
    if (liveThrottle.current) return;
    liveThrottle.current = setTimeout(() => { liveThrottle.current = null; }, 50);
    set(myLiveRef.current, {
      tool:   meta.tool,
      color:  meta.color,
      size:   meta.size,
      points: points,
    });
  }, []);

  // ── Clear my live stroke when done drawing ────────────────────────────────
  const clearLive = useCallback(() => {
    remove(myLiveRef.current);
  }, []);

  // ── Broadcast cursor ──────────────────────────────────────────────────────
  const broadcastCursor = useCallback((x, y) => {
    if (cursorThrottle.current) return;
    cursorThrottle.current = setTimeout(() => { cursorThrottle.current = null; }, 33);
    set(myCursorRef.current, { x, y, name: userName, color: MY_COLOR });
  }, [userName]);

  // ── Clear board ───────────────────────────────────────────────────────────
  const clearRemote = useCallback(async () => {
    await remove(strokesRef.current);
    await remove(liveRef.current);
    knownIds.current.clear();
    await set(clearedRef.current, { ts: Date.now(), __clearedBy: USER_ID });
  }, []);

  return { pushStroke, broadcastCursor, broadcastLive, clearLive, clearRemote, myUserId: USER_ID, myColor: MY_COLOR };
}