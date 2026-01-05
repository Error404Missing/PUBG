"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

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

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none w-full max-w-sm">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 100, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8, x: 50 }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl
                ${toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : ""}
                ${toast.type === "error" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : ""}
                ${toast.type === "info" ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : ""}
                ${toast.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : ""}
              `}>
                                <div className="flex-shrink-0">
                                    {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
                                    {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
                                    {toast.type === "info" && <Info className="w-5 h-5" />}
                                    {toast.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                                </div>
                                <p className="flex-grow text-sm font-bold tracking-tight">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="flex-shrink-0 hover:bg-white/10 p-1 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
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
