import React, { createContext, useContext, useState } from "react";
import Alert from "@/components/ui/alert/Alert";

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
          <div className="m-4">
              <Alert
                  message={message}
                  variant="info"
                  title="Message"
                  onClose={() => setMessage(null)}
              />
          </div>
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
