"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { Settings, Save, Loader2, Clock } from "lucide-react"

interface Setting {
  id: string
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").order("key")

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const setting of settings) {
        const { error } = await supabase.from("site_settings").update({ value: setting.value }).eq("id", setting.id)

        if (error) throw error
      }
      alert("პარამეტრები წარმატებით შეინახა!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("შეცდომა პარამეტრების შენახვისას")
    } finally {
      setSaving(false)
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  const roomSettings = settings.filter((s) => ["room_id", "room_password", "start_time", "map"].includes(s.key))
  const otherSettings = settings.filter((s) => !["room_id", "room_password", "start_time", "map"].includes(s.key))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-blue-400" />
        <h1 className="text-4xl font-bold text-white">საიტის პარამეტრები</h1>
      </div>

      <Card className="glass-effect border-purple-500/20 mb-6">
        <CardHeader>
          <CardTitle className="text-purple-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Room ინფორმაცია (გლობალური)
          </CardTitle>
          <CardDescription>ეს ინფორმაცია გამოჩნდება ყველა დადასტურებული გუნდის მენეჯერთან</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roomSettings.map((setting) => (
            <div key={setting.id} className="space-y-2">
              <Label htmlFor={setting.key} className="text-gray-300">
                {setting.description}
              </Label>
              {setting.key === "start_time" ? (
                <Input
                  id={setting.key}
                  type="datetime-local"
                  value={setting.value ? new Date(setting.value).toISOString().slice(0, 16) : ""}
                  onChange={(e) =>
                    updateSetting(setting.key, e.target.value ? new Date(e.target.value).toISOString() : "")
                  }
                  className="bg-gray-900 border-purple-500/30 text-white"
                />
              ) : (
                <Input
                  id={setting.key}
                  value={setting.value}
                  onChange={(e) => updateSetting(setting.key, e.target.value)}
                  className="bg-gray-900 border-purple-500/30 text-white"
                  placeholder={
                    setting.key === "room_id"
                      ? "12345678"
                      : setting.key === "room_password"
                        ? "პაროლი"
                        : setting.key === "map"
                          ? "მაგ: Erangel, Miramar, Sanhok..."
                          : ""
                  }
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-effect border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">ბმულებისა და კონტაქტების მართვა</CardTitle>
          <CardDescription>შეცვალეთ საიტის სოციალური ქსელების ბმულები და საკონტაქტო ინფორმაცია</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {otherSettings.map((setting) => (
            <div key={setting.id} className="space-y-2">
              <Label htmlFor={setting.key} className="text-gray-300">
                {setting.description}
              </Label>
              <Input
                id={setting.key}
                value={setting.value}
                onChange={(e) => updateSetting(setting.key, e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 mt-6">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                შენახვა...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                ყველა პარამეტრის შენახვა
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
