"use client";

import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MdCheckCircle, MdClose, MdErrorOutline, MdInfoOutline } from "react-icons/md";

interface SnackbarProps {
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number; // Duration in milliseconds
  onClose?: () => void;
}

const variantStyles = {
  success: {
    container: "bg-success-600 text-white",
    icon: <MdCheckCircle size={22} />,
  },
  error: {
    container: "bg-error-600 text-white",
    icon: <MdErrorOutline size={22} />,
  },
  info: {
    container: "bg-brand-600 text-white",
    icon: <MdInfoOutline size={22} />,
  },
};

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  variant = "info",
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    setVisible(true);

    const hideTimer = setTimeout(() => setVisible(false), duration);
    const closeTimer = setTimeout(() => onCloseRef.current?.(), duration + 200);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, message, variant]);

  return (
    <div
      role="status"
      aria-live={variant === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={clsx(
        "fixed bottom-6 left-1/2 z-[100000] flex w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 items-start gap-3 rounded-xl px-4 py-3 shadow-theme-lg ring-1 ring-black/10 transition-all duration-200",
        variantStyles[variant].container,
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      )}
    >
      <span className="mt-0.5 shrink-0">{variantStyles[variant].icon}</span>
      <span className="flex-1 text-sm font-medium leading-5">{message}</span>
      <button
        type="button"
        aria-label="Close notification"
        className="ml-1 shrink-0 rounded p-0.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        onClick={() => {
          setVisible(false);
          onCloseRef.current?.();
        }}
      >
        <MdClose size={20} />
      </button>
    </div>
  );
};

export default Snackbar;
