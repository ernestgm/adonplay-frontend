import React, { useState, useRef } from "react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const show = (e: React.MouseEvent | React.FocusEvent) => {
    const evt = 'clientX' in e ? e : (e as any).nativeEvent;
    setCoords({ x: evt.clientX, y: evt.clientY });
    timeout.current = setTimeout(() => setVisible(true), 100);
  };
  const move = (e: React.MouseEvent) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };
  const hide = () => {
    if (timeout.current) clearTimeout(timeout.current);
    setVisible(false);
  };

  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={show}
      onMouseMove={move}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      tabIndex={0}
    >
      {children}
      {visible && (
        <span
          style={{
            position: "fixed",
            top: coords.y,
            left: coords.x + 16,
            background: "#222",
            color: "#fff",
            padding: "4px 10px",
            borderRadius: 4,
            fontSize: 12,
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
};

export default Tooltip;
