'use client';

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export default function CancelTeamButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function cancel() {
    if (!confirm("ნამდვილად გსურთ თქვენი გუნდის გაუქმება?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/team', { method: 'DELETE' });
      if (res.ok) {
        showToast("გუნდი გაუქმებულია", "success");
        router.refresh();
      } else {
        const error = await res.json();
        showToast(error.message || "შეცდომა", "error");
      }
    } catch (e) {
      showToast("კავშირის შეცდომა", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={cancel}
      disabled={loading}
      className="px-4 py-2 bg-red-900/40 text-red-400 border border-red-900/50 rounded hover:bg-red-900/60 transition disabled:opacity-50"
    >
      {loading ? "მუშავდება..." : "გუნდის გაუქმება"}
    </button>
  );
}
