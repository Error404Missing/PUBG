'use client';

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

export default function DeleteResultButton({ resultId }: { resultId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    if (!confirm("ნამდვილად გსურთ შედეგის წაშლა?")) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.message || "შედეგის წაშლა ვერ მოხერხდა", "error");
      } else {
        showToast("შედეგი წაშლილია", "success");
        router.refresh();
      }
    } catch (e) {
      showToast("კავშირის შეცდომა", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-400 underline disabled:opacity-50"
    >
      {loading ? "წაიშლება..." : "წაშლა"}
    </button>
  );
}
