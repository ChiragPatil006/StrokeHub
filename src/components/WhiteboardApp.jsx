import { useState, useRef, useCallback } from "react";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import TopBar from "./TopBar";
import PresenceBar from "./PresenceBar";
import { useSync, MY_COLOR } from "../hooks/useSync";
import "./WhiteboardApp.css";

export default function WhiteboardApp({ session, onLeave }) {
  const [tool, setTool]             = useState("pen");
  const [color, setColor]           = useState("#00ffc8");
  const [strokeSize, setStrokeSize] = useState(4);
  const [strokes, setStrokes]       = useState([]);
  const [redoStack, setRedoStack]   = useState([]);
  const [users, setUsers]               = useState({});
  const [cursors, setCursors]           = useState({});
  const [remoteLiveStrokes, setRemoteLiveStrokes] = useState({});
  const [syncStatus, setSyncStatus]     = useState("connecting");
  const [isDrawing, setIsDrawing]   = useState(false);
  const canvasRef                   = useRef(null);

  const { pushStroke, broadcastCursor, broadcastLive, clearLive, clearRemote, myUserId, myColor } = useSync({
    roomId:   session.roomId,
    userName: session.name,
    onLoadStrokes: useCallback((loaded) => {
      setStrokes(loaded);
      setSyncStatus("live");
    }, []),
    onRemoteStroke:        useCallback((s) => setStrokes(p => [...p, s]), []),
    onPresenceUpdate:      useCallback((u) => setUsers(u), []),
    onCursorUpdate:        useCallback((c) => setCursors(c), []),
    onRemoteClear:         useCallback(() => { setStrokes([]); setRedoStack([]); }, []),
    onLiveStrokesUpdate:   useCallback((ls) => setRemoteLiveStrokes(ls), []),
  });

  const addStroke = useCallback((stroke) => {
    setStrokes(prev => [...prev, stroke]);
    setRedoStack([]);
    pushStroke(stroke);
  }, [pushStroke]);

  const undo = useCallback(() => {
    setStrokes(prev => {
      if (!prev.length) return prev;
      setRedoStack(r => [...r, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    setRedoStack(prev => {
      if (!prev.length) return prev;
      setStrokes(s => [...s, prev[prev.length - 1]]);
      return prev.slice(0, -1);
    });
  }, []);

  const clearBoard = useCallback(async () => {
    setStrokes([]);
    setRedoStack([]);
    await clearRemote();
  }, [clearRemote]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const temp = document.createElement("canvas");
    temp.width = canvas.width; temp.height = canvas.height;
    const tc = temp.getContext("2d");
    tc.fillStyle = "#090c10"; tc.fillRect(0, 0, temp.width, temp.height);
    tc.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.download = `strokehub-${session.roomId}.png`;
    link.href = temp.toDataURL("image/png");
    link.click();
  }, [session.roomId]);

  return (
    <div className="wb-root">
      <TopBar
        session={session}
        myColor={myColor}
        onLeave={onLeave}
        onUndo={undo}
        onRedo={redo}
        onClear={clearBoard}
        onDownload={downloadCanvas}
        canUndo={strokes.length > 0}
        canRedo={redoStack.length > 0}
        isDrawing={isDrawing}
        syncStatus={syncStatus}
        presenceSlot={
          <PresenceBar users={users} myUserId={myUserId} myColor={myColor} myName={session.name} />
        }
      />
      <div className="wb-body">
        <Toolbar
          tool={tool} color={color} strokeSize={strokeSize}
          onToolChange={setTool} onColorChange={setColor} onSizeChange={setStrokeSize}
        />
        <Canvas
          ref={canvasRef}
          tool={tool} color={color} strokeSize={strokeSize}
          strokes={strokes}
          onAddStroke={addStroke}
          onDrawingChange={setIsDrawing}
          onBroadcastCursor={broadcastCursor}
          onBroadcastLive={broadcastLive}
          onClearLive={clearLive}
          remoteCursors={cursors}
          remoteLiveStrokes={remoteLiveStrokes}
        />
      </div>
      {syncStatus === "connecting" && (
        <div className="sync-toast"><span className="sync-spinner" /> Connecting to room...</div>
      )}
    </div>
  );
}