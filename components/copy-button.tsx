"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface CopyButtonProps {
  value: string
  label?: string
}

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!value || value === "PENDING" || value === "N/A") return
    
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success(`${label || "ინფორმაცია"} დაკოპირდა!`)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("კოპირება ვერ მოხერხდა")
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute inset-0 w-full h-full flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 cursor-pointer rounded-2xl"
      title="დააკლიკეთ დასაკოპირებლად"
    >
      <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 backdrop-blur-sm">
        {copied ? (
          <Check className="w-4 h-4 text-primary animate-bounce-short" />
        ) : (
          <Copy className="w-4 h-4 text-primary" />
        )}
      </div>
    </button>
  )
}
