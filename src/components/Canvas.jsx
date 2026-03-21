import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback } from "react";
import RemoteCursors from "./RemoteCursors";
import "./Canvas.css";

let strokeIdCounter = 0;

const Canvas = forwardRef(function Canvas({
  tool, color, strokeSize, strokes,
  onAddStroke, onDrawingChange,
  onBroadcastCursor,
  onBroadcastLive,
  onClearLive,
  remoteCursors,
  remoteLiveStrokes,
}, ref) {
  const canvasRef      = useRef(null);
  const overlayRef     = useRef(null);
  const isDrawingRef   = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStroke  = useRef(null);
  const startPoint     = useRef(null);
  const [cursor, setCursor] = useState("crosshair");
  const [textInput, setTextInput] = useState(null);
  const textValue      = useRef("");

  useImperativeHandle(ref, () => canvasRef.current);

  // ── BUG 1 FIX: Correct normalized position ────────────────────────────────
  // Always read from getBoundingClientRect on the overlay element,
  // divide by its CSS rendered size (clientWidth/Height) — NOT the pixel buffer size.
  // Clamp 0–1 so dragging outside canvas doesn't produce bad coords.
  const getPos = useCallback((e) => {
    const canvas = overlayRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect   = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height)),
    };
  }, []);

  const getDims = (canvas) => ({
    w: canvas.clientWidth  || canvas.offsetWidth,
    h: canvas.clientHeight || canvas.offsetHeight,
  });

  // ── Redraw main canvas ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { w, h } = getDims(canvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(ctx, w, h);
    strokes.forEach(s => drawStroke(ctx, s, w, h));
  }, [strokes]);

  // ── BUG 2 FIX: Render remote live strokes on overlay ─────────────────────
  // Only when we're NOT drawing locally (so we don't clobber our own preview)
  useEffect(() => {
    if (isDrawingRef.current) return;
    const canvas = overlayRef.current;
    if (!canvas) return;
    const { w, h } = getDims(canvas);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (remoteLiveStrokes) {
      Object.values(remoteLiveStrokes).forEach(s => {
        if (s && s.points && s.points.length > 0) {
          drawStroke(ctx, s, w, h);
        }
      });
    }
  }, [remoteLiveStrokes]);

  // ── Resize ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const canvas  = canvasRef.current;
      const overlay = overlayRef.current;
      if (!canvas || !overlay) return;
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.parentElement.clientWidth;
      const h   = canvas.parentElement.clientHeight;
      [canvas, overlay].forEach(c => {
        c.width        = w * dpr;
        c.height       = h * dpr;
        c.style.width  = w + "px";
        c.style.height = h + "px";
        c.getContext("2d").scale(dpr, dpr);
      });
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, w, h);
      drawGrid(ctx, w, h);
      strokes.forEach(s => drawStroke(ctx, s, w, h));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    setCursor(tool === "eraser" ? "cell" : tool === "text" ? "text" : "crosshair");
  }, [tool]);

  // ── Mouse/touch down ──────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (textInput) return;
    e.preventDefault();
    const pos = getPos(e);

    if (tool === "text") {
      const canvas = canvasRef.current;
      const rect   = canvas.getBoundingClientRect();
      const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      setTextInput({ x: px, y: py, nx: pos.x, ny: pos.y });
      textValue.current = "";
      return;
    }

    isDrawingRef.current = true;
    setIsDrawing(true);
    onDrawingChange(true);
    startPoint.current = pos;
    currentStroke.current = {
      id:     ++strokeIdCounter,
      tool,
      color:  tool === "eraser" ? "#eraser" : color,
      size:   strokeSize,
      points: [pos],
    };
    if (onBroadcastLive) {
      onBroadcastLive([pos], { tool, color: tool === "eraser" ? "#eraser" : color, size: strokeSize });
    }
  }, [tool, color, strokeSize, textInput, onDrawingChange, getPos, onBroadcastLive]);

  // ── Mouse/touch move ──────────────────────────────────────────────────────
  const onMouseMove = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (onBroadcastCursor) onBroadcastCursor(pos.x, pos.y);
    if (!isDrawingRef.current || !currentStroke.current) return;

    const canvas  = overlayRef.current;
    const { w, h } = getDims(canvas);
    const ctx     = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (tool === "pen" || tool === "eraser") {
      currentStroke.current.points.push(pos);
      drawStroke(ctx, currentStroke.current, w, h);
      if (onBroadcastLive) {
        onBroadcastLive(currentStroke.current.points, {
          tool, color: currentStroke.current.color, size: strokeSize,
        });
      }
    } else {
      const preview = { ...currentStroke.current, points: [startPoint.current, pos] };
      ctx.save(); ctx.setLineDash([6, 3]);
      drawStroke(ctx, preview, w, h);
      ctx.restore();
      if (onBroadcastLive) {
        onBroadcastLive([startPoint.current, pos], {
          tool, color: currentStroke.current.color, size: strokeSize,
        });
      }
    }
  }, [tool, strokeSize, getPos, onBroadcastCursor, onBroadcastLive]);

  // ── Mouse/touch up or leave ───────────────────────────────────────────────
  // KEY FIX: for mouseleave we do NOT recalculate position — we use whatever
  // the stroke already has. This prevents the "jumps to edge on release" bug.
  const finishStroke = useCallback((e) => {
    if (!isDrawingRef.current || !currentStroke.current) return;

    const overlay = overlayRef.current;
    const ctx     = overlay.getContext("2d");
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    if (tool !== "pen" && tool !== "eraser") {
      // For shapes: only use event position if it's a real mouseup (not mouseleave)
      if (e && e.type === "mouseup" && e.clientX !== undefined) {
        const pos = getPos(e);
        currentStroke.current.points = [startPoint.current, pos];
      } else if (currentStroke.current.points.length < 2) {
        // Cancelled — no valid endpoint
        isDrawingRef.current = false;
        setIsDrawing(false);
        onDrawingChange(false);
        currentStroke.current = null;
        if (onClearLive) onClearLive();
        return;
      }
      // else: points already set from last mousemove — use those
    }

    if (currentStroke.current.points.length > 0) {
      onAddStroke({ ...currentStroke.current });
    }
    if (onClearLive) onClearLive();

    isDrawingRef.current = false;
    setIsDrawing(false);
    onDrawingChange(false);
    currentStroke.current = null;
  }, [tool, getPos, onAddStroke, onDrawingChange, onClearLive]);

  const commitText = useCallback(() => {
    if (!textInput || !textValue.current.trim()) { setTextInput(null); return; }
    onAddStroke({
      id: ++strokeIdCounter, tool: "text", color, size: strokeSize,
      points: [{ x: textInput.nx, y: textInput.ny }],
      text: textValue.current,
    });
    setTextInput(null);
    textValue.current = "";
  }, [textInput, color, strokeSize, onAddStroke]);

  return (
    <div className="canvas-wrapper">
      <canvas ref={canvasRef} className="canvas-main" />
      {remoteCursors && Object.keys(remoteCursors).length > 0 && (
        <RemoteCursors cursors={remoteCursors} />
      )}
      <canvas
        ref={overlayRef}
        className="canvas-overlay"
        style={{ cursor }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={finishStroke}
        onMouseLeave={finishStroke}
        onTouchStart={onMouseDown}
        onTouchMove={onMouseMove}
        onTouchEnd={finishStroke}
      />
      {textInput && (
        <input
          className="text-input-overlay"
          style={{ left: textInput.x, top: textInput.y, color, fontSize: strokeSize * 4 + 8 }}
          autoFocus
          onChange={e => { textValue.current = e.target.value; }}
          onKeyDown={e => {
            if (e.key === "Enter") commitText();
            if (e.key === "Escape") setTextInput(null);
          }}
          onBlur={commitText}
          placeholder="Type here..."
        />
      )}
      <div className="canvas-hint">
        <span>🖱 Draw anywhere · Hover toolbar to expand</span>
      </div>
    </div>
  );
});

export default Canvas;

/* ─────────────── Drawing helpers ─────────────── */

function drawGrid(ctx, w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(0,255,200,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y <= h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
}

export function drawStroke(ctx, stroke, w, h) {
  if (!stroke || !stroke.points || !stroke.points.length) return;

  if (stroke.tool === "text") {
    ctx.save();
    ctx.fillStyle = stroke.color;
    ctx.font = `${stroke.size * 4 + 8}px 'Syne', sans-serif`;
    ctx.fillText(stroke.text || "", stroke.points[0].x * w, stroke.points[0].y * h);
    ctx.restore();
    return;
  }

  ctx.save();
  ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = stroke.size;

  if (stroke.color === "#eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.strokeStyle = stroke.color;
    if (stroke.tool === "pen") { ctx.shadowColor = stroke.color; ctx.shadowBlur = 2; }
  }

  if (stroke.tool === "pen" || stroke.tool === "eraser") {
    drawSmoothPath(ctx, stroke.points, w, h);
  } else if (stroke.tool === "line") {
    const [a, b] = [stroke.points[0], stroke.points[1] || stroke.points[0]];
    ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke();
  } else if (stroke.tool === "rect") {
    const [a, b] = [stroke.points[0], stroke.points[1] || stroke.points[0]];
    ctx.beginPath();
    ctx.roundRect(Math.min(a.x,b.x)*w, Math.min(a.y,b.y)*h, Math.abs(b.x-a.x)*w, Math.abs(b.y-a.y)*h, 4);
    ctx.stroke();
  } else if (stroke.tool === "circle") {
    const [a, b] = [stroke.points[0], stroke.points[1] || stroke.points[0]];
    ctx.beginPath();
    ctx.ellipse(((a.x+b.x)/2)*w, ((a.y+b.y)/2)*h, Math.abs(b.x-a.x)*w/2||1, Math.abs(b.y-a.y)*h/2||1, 0, 0, Math.PI*2);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSmoothPath(ctx, points, w, h) {
  if (points.length < 2) {
    ctx.beginPath(); ctx.arc(points[0].x*w, points[0].y*h, ctx.lineWidth/2, 0, Math.PI*2); ctx.fill();
    return;
  }
  ctx.beginPath(); ctx.moveTo(points[0].x*w, points[0].y*h);
  for (let i = 1; i < points.length - 1; i++) {
    const mx = ((points[i].x + points[i+1].x)/2)*w;
    const my = ((points[i].y + points[i+1].y)/2)*h;
    ctx.quadraticCurveTo(points[i].x*w, points[i].y*h, mx, my);
  }
  const l = points[points.length-1];
  ctx.lineTo(l.x*w, l.y*h); ctx.stroke();
}