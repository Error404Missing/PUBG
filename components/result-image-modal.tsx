"use client"

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Download, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function ResultImageModal({ imageUrl, title, winner }: { imageUrl: string, title?: string, winner?: string }) {
  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `result-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
       console.error("Download failed", error)
       window.open(imageUrl, '_blank')
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="relative aspect-video rounded-3xl overflow-hidden glass border border-white/10 group-hover:border-primary/30 transition-colors cursor-pointer">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={title || "Result"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
             <Expand className="w-5 h-5 text-white" />
          </div>

          <div className="absolute bottom-6 right-6 px-4 py-2 rounded-xl glass border border-white/20 backdrop-blur-xl">
             <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Winner</div>
             <div className="text-lg font-black text-secondary italic tracking-tighter">{winner || "CHAMPION"}</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-black/90 border-white/10 p-2 shadow-2xl overflow-hidden [&>button]:text-white">
        <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black/50">
           <Image
             src={imageUrl || "/placeholder.svg"}
             alt={title || "Result"}
             fill
             className="object-contain"
           />
        </div>
        <div className="flex justify-between items-center p-4">
           <div>
              {title && <h3 className="text-xl font-black text-white italic">{title}</h3>}
           </div>
           <Button onClick={handleDownload} variant="premium" className="gap-2 rounded-xl text-xs font-black uppercase italic">
             <Download className="w-4 h-4" /> სურათის გადმოწერა
           </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
