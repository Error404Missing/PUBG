import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { team: true }
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // Check cooldown (2 weeks)
    if (user.lastCaseOpen) {
        const twoWeeksAgro = new Date();
        twoWeeksAgro.setDate(twoWeeksAgro.getDate() - 14);
        if (user.lastCaseOpen > twoWeeksAgro) {
            return NextResponse.json({ message: "Cooldown active" }, { status: 403 });
        }
    }

    // Check if has pending reward
    const pending = await prisma.caseReward.findFirst({
        where: { userId: user.id, status: 'PENDING' }
    });
    if (pending) return NextResponse.json({ message: "Pending reward exists" }, { status: 403 });

    // Random reward
    const rand = Math.random();
    let type = 'NOTHING';
    if (rand < 0.05) type = 'VIP_30';
    else if (rand < 0.15) type = 'VIP_7';
    else if (rand < 0.35) type = 'VIP_3';

    // Create Reward Record
    let rewardId = 'NOTHING_ID';
    if (type !== 'NOTHING') {
        const reward = await prisma.caseReward.create({
            data: {
                userId: user.id,
                username: user.username,
                type: type,
                status: 'PENDING'
            }
        });
        rewardId = reward.id;
    }

    // Update Last Open Time
    await prisma.user.update({
        where: { id: user.id },
        data: { lastCaseOpen: new Date() }
    });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            action: 'CASE_OPEN',
            userId: user.id,
            username: user.username,
            details: `Opened case. Reward: ${type}`
        }
    });

    return NextResponse.json({ type, rewardId });
}
