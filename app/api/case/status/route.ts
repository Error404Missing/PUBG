import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session?.user) return NextResponse.json({});

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!user) return NextResponse.json({});

    let cooldownStr = null;
    if (user.lastCaseOpen) {
        const nextOpen = new Date(user.lastCaseOpen);
        nextOpen.setDate(nextOpen.getDate() + 14);
        if (nextOpen > new Date()) {
            cooldownStr = nextOpen.toLocaleString('ka-GE');
        }
    }

    const pending = await prisma.caseReward.findFirst({
        where: { userId: user.id, status: 'PENDING' }
    });

    return NextResponse.json({
        cooldown: cooldownStr,
        pending: !!pending
    });
}
