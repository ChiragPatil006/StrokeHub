# SyncBoard — Real-time Collaborative Whiteboard

A cloud-based collaborative whiteboard built with React + Firebase Realtime Database.
Built for a Cloud Computing course project.

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the dev server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

---

## ✅ Features

| Feature | Status |
|---|---|
| Freehand pen (smooth quadratic curves) | ✅ |
| Eraser tool | ✅ |
| Line, Rectangle, Circle shapes | ✅ |
| Text placement tool | ✅ |
| 12 preset colors + custom color picker | ✅ |
| 5 stroke sizes + opacity slider | ✅ |
| Undo / Redo (local) | ✅ |
| Export canvas as PNG | ✅ |
| Room ID system (create or join) | ✅ |
| **Real-time stroke sync** (Firebase) | ✅ |
| **Live user presence** (who's online) | ✅ |
| **Live cursor positions** of other users | ✅ |
| **Persistent board** (strokes saved forever) | ✅ |
| Synchronized board clear | ✅ |
| Keyboard shortcuts (P/E/L/R/C/T, Ctrl+Z/Y) | ✅ |

---

## 🔥 Firebase Data Structure

```
boards/
  {roomId}/
    strokes/
      {strokeId}: { tool, color, size, opacity, points[], text? }
    users/
      {userId}: { name, color, online, lastSeen }
    cursors/
      {userId}: { x, y, name, color }
    clearedAt: { ts, __clearedBy }
```

---

## 📦 Build for production

```bash
npm run build
```

Then deploy the `dist/` folder to Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting     # point public dir to "dist", SPA: yes
firebase deploy
```

---

