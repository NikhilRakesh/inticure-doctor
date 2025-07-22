import React, { createContext, useState, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-center pt-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`rounded-full px-4 py-2 pr-10 shadow-lg relative overflow-hidden mb-2 pointer-events-auto ${
                toast.type === "success"
                  ? "bg-[#d6779e] text-white"
                  : toast.type === "error"
                  ? "bg-[#6D498F] text-gray-100"
                  : "bg-white text-[#592668] border border-[#d6779e]"
              }`}
            >
              <div className="flex items-center justify-center">
                <div className="flex gap-2 items-center">
                  <img src="/inticure icon.png" className="w-6 h-6" alt="" />
                  <p className="text-sm font-medium">{toast.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
