"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trophy, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

type Result = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
}

export default function AdminResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  })

  useEffect(() => {
    checkAuth()
    fetchResults()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      router.push("/")
    }
  }

  const fetchResults = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("results").select("*").order("created_at", { ascending: false })
    setResults((data as Result[]) || [])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `results/${fileName}`

    const { error: uploadError } = await supabase.storage.from("results").upload(filePath, file)

    if (uploadError) {
      alert("სურათის ატვირთვა ვერ მოხერხდა")
      setIsUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("results").getPublicUrl(filePath)

    setFormData({ ...formData, imageUrl: publicUrl })
    setIsUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { error } = await supabase.from("results").insert({
      title: formData.title,
      description: formData.description || null,
      image_url: formData.imageUrl || null,
    })

    if (!error) {
      setIsAdding(false)
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
      })
      fetchResults()
    }
  }

  const deleteResult = async (id: string, imageUrl: string | null) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ შედეგის წაშლა?")) return

    const supabase = createClient()

    // If there's an image, delete it from storage first
    if (imageUrl && imageUrl.includes("results/")) {
      const filePath = imageUrl.split("results/")[1]
      await supabase.storage.from("results").remove([`results/${filePath}`])
    }

    const { error } = await supabase.from("results").delete().eq("id", id)

    if (!error) {
      fetchResults()
    }
  }
  // </CHANGE>

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <Trophy className="w-10 h-10" />
              შედეგების მართვა
            </h1>
            <p className="text-gray-400">დაამატე ტურნირის შედეგები და ფოტოები</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            ახალი შედეგი
          </Button>
        </div>

        {isAdding && (
          <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-blue-400">ახალი შედეგის დამატება</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-200">სათაური</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">აღწერა</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">სურათის URL (ან ატვირთეთ)</Label>
                  <Input
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-gray-900/50 border-blue-500/30 text-white mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-gray-900/50 border-blue-500/30 text-white"
                      disabled={isUploading}
                    />
                    {isUploading && <span className="text-sm text-gray-400">იტვირთება...</span>}
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2 relative w-full h-48">
                      <Image
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover rounded-md"
                        onError={() => setFormData({ ...formData, imageUrl: "" })}
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    დამატება
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    variant="outline"
                    className="border-gray-500/50"
                  >
                    გაუქმება
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {results.map((result) => (
            <Card key={result.id} className="bg-black/50 border-blue-500/20 backdrop-blur-sm overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-blue-400">{result.title}</CardTitle>
                    {result.description && <p className="text-gray-400 mt-2">{result.description}</p>}
                  </div>
                  <Button
                    onClick={() => deleteResult(result.id, result.image_url)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              {result.image_url && (
                <CardContent>
                  <div className="relative w-full h-96 rounded-lg overflow-hidden">
                    <Image
                      src={result.image_url || "/placeholder.svg"}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
          {results.length === 0 && (
            <Card className="bg-black/50 border-blue-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">შედეგები ჯერ არ არის დამატებული</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
