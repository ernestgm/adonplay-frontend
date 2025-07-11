import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { MdClose } from "react-icons/md";

interface SnackbarProps {
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number; // Duration in milliseconds
  onClose?: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, variant = "info", duration = 3000, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={clsx(
        "fixed z-40 bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg transition-opacity flex items-center justify-between",
        {
          "bg-green-500 text-white": variant === "success",
          "bg-red-500 text-white": variant === "error",
          "bg-blue-500 text-white": variant === "info",
          "opacity-0": !visible,
          "opacity-100": visible,
        }
      )}
    >
      <span>{message}</span>
      <button
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        <MdClose size={20} />
      </button>
    </div>
  );
};

export default Snackbar;
