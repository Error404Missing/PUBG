import { prisma } from "@/lib/prisma";
import { createSupabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password } = registerSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email or username already exists" },
        { status: 400 }
      );
    }

    // Create the user in Supabase Auth (server-side).
    try {
      const supa = createSupabaseAdmin();
      const { error: supaError } = await supa.auth.admin.createUser({
        email,
        password,
        user_metadata: { username },
        email_confirm: true,
      });

      if (supaError) {
        return NextResponse.json({ message: 'Failed to create Supabase user', details: supaError.message }, { status: 500 });
      }
    } catch (err: any) {
      return NextResponse.json({ message: 'Failed to create Supabase user', details: err?.message }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "GUEST",
      },
    });

    // If it's the first user, make them FOUNDER (optional, but good for bootstrapping)
    const userCount = await prisma.user.count();
    if (userCount === 1) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "FOUNDER" },
      });
    }

    return NextResponse.json(
      { message: "User created successfully", user: { id: user.id, username: user.username, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    const message = error?.message || "Internal server error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
