"use client";

import React, { createContext, useContext, useState } from "react";
import Snackbar from "@/components/ui/snackbar/Snackbar";

interface MessageContextProps {
  message: string | null;
  setMessage: (message: string | null) => void;
}

const MessageContext = createContext<MessageContextProps | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [message, setMessage] = useState<string | null>(null);

  return (
    <MessageContext.Provider value={{ message, setMessage }}>
      {message && (
        <Snackbar
          key={message}
          message={message}
          variant="success"
          duration={4000}
          onClose={() => setMessage(null)}
        />
      )}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = (): MessageContextProps => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
