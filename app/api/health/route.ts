import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const url =
      process.env.TURSO_DB_URL ||
      process.env.TURSO_DATABASE_URL ||
      process.env.LIBSQL_URL ||
      process.env.DATABASE_URL ||
      "";
    const usingLibsql = url.startsWith("libsql:");
    const usingPostgres = url.startsWith("postgres://") || url.startsWith("postgresql://");
    const res = NextResponse.json({
      ok: true,
      db: usingLibsql ? "libsql" : usingPostgres ? "postgres" : url.startsWith("file:") ? "sqlite" : "unknown",
      host: (() => {
        try {
          if (usingLibsql) return new URL(url).host;
          if (usingPostgres) return new URL(url).host;
          if (url.startsWith("file:")) return "file";
        } catch {}
        return null;
      })(),
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error: any) {
    const res = NextResponse.json(
      { ok: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
