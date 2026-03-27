import { useState, useRef, useCallback } from "react";

export function useStdinPanel() {
  const [stdin, setStdin] = useState("");
  const [stdinCollapsed, setStdinCollapsed] = useState(false);

  const [stdinHeightPct, setStdinHeightPct] = useState(0.35);

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !rightPanelRef.current) return;
      const rect = rightPanelRef.current.getBoundingClientRect();
      const pct = (e.clientY - rect.top) / rect.height;
      setStdinHeightPct(Math.min(0.7, Math.max(0.15, pct)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, []);

  return {
    stdin,
    setStdin,
    stdinCollapsed,
    setStdinCollapsed,
    stdinHeightPct,
    rightPanelRef,
    onDragStart,
  };
}