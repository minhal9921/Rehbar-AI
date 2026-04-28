import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed bottom-8 right-8 z-[99999] flex flex-col items-end"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ width: "400px", height: isHovered ? `${toasts.length * 80}px` : "80px" }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => {
            const total = toasts.length;
            const position = total - 1 - index; // 0 is newest
            
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ 
                  opacity: index < total - 4 && !isHovered ? 0 : 1,
                  bottom: isHovered ? position * 76 : position * 10, // ~80% overlap (10px peek)
                  scale: isHovered ? 1 : 1 - position * 0.05,
                  zIndex: index,
                  filter: !isHovered && position > 0 ? "blur(0.5px)" : "none"
                }}
                exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
                className="absolute right-0 flex items-start gap-3 px-6 py-4 bg-[#1F1F1E] text-white rounded-xl shadow-2xl border border-white/5 w-full max-w-md cursor-pointer transition-shadow duration-300"
                style={{ 
                  boxShadow: isHovered ? "0 10px 30px rgba(0,0,0,0.2)" : `0 -${position * 2}px 20px rgba(0,0,0,0.3)`
                }}
              >
                <div className="shrink-0 mt-[2px]">
                  {toast.type === "success" && <CheckCircle2 className="text-green-400" size={20} />}
                  {toast.type === "error" && <AlertCircle className="text-red-400" size={20} />}
                  {toast.type === "info" && <Info className="text-blue-400" size={20} />}
                </div>
                <p className="flex-1 text-[14px] font-medium font-sans leading-relaxed">{toast.message}</p>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="ml-2 mt-[2px] text-white/40 hover:text-white transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
