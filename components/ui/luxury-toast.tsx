"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type: ToastType
  duration?: number
  onClose: () => void
}

export function LuxuryToast({ message, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  }

  const colors = {
    success: "border-emerald-500/20 bg-emerald-500/5",
    error: "border-rose-500/20 bg-rose-500/5",
    info: "border-blue-500/20 bg-blue-500/5"
  }

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      <div className={`glass p-1 rounded-2xl border ${colors[type]} shadow-2xl min-w-[300px]`}>
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {icons[type]}
              <div className="absolute inset-0 blur-lg opacity-50">{icons[type]}</div>
            </div>
            <p className="text-sm font-bold text-white italic tracking-tight">{message}</p>
          </div>
          <button onClick={handleClose} className="text-white/20 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-linear ${type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`}
            style={{ animation: `shrink ${duration}ms linear forwards` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}
