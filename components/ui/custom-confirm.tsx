"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle, Info, Zap } from "lucide-react"

interface CustomConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
}

export function CustomConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "დადასტურება",
  cancelText = "გაუქმება",
  variant = "danger"
}: CustomConfirmProps) {
  const Icon = variant === "danger" ? AlertTriangle : variant === "warning" ? Zap : Info
  const iconColor = variant === "danger" ? "text-rose-500" : variant === "warning" ? "text-amber-500" : "text-blue-500"
  const glowShadow = variant === "danger" ? "shadow-rose-500/20" : variant === "warning" ? "shadow-amber-500/20" : "shadow-blue-500/20"

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className={`border-${variant === 'danger' ? 'rose' : variant === 'warning' ? 'amber' : 'blue'}-500/20`}>
        <AlertDialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className={`w-12 h-12 rounded-2xl glass border border-white/5 flex items-center justify-center shrink-0 ${glowShadow} shadow-lg animate-pulse`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : ''}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
