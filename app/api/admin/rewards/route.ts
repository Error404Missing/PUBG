import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'FOUNDER') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const rewards = await prisma.caseReward.findMany({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(rewards);
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'FOUNDER') {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, action } = await req.json();

        if (action === 'APPROVE') {
            const reward = await prisma.caseReward.findUnique({
                where: { id },
                include: { userId: true } // Won't work because relation missing, use userId field
            });

            // Fixed fetching reward
            const targetReward = await prisma.caseReward.findUnique({ where: { id } });
            if (!targetReward) return NextResponse.json({ message: "Not found" }, { status: 404 });

            const user = await prisma.user.findUnique({
                where: { id: targetReward.userId },
                include: { team: true }
            });
            if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

            // Calculate VIP days
            const days = parseInt(targetReward.type.split('_')[1]);
            let newUntil = user.vipUntil ? new Date(user.vipUntil) : new Date();
            if (newUntil < new Date()) newUntil = new Date();
            newUntil.setDate(newUntil.getDate() + days);

            // Update User
            await prisma.user.update({
                where: { id: user.id },
                data: { vipUntil: newUntil }
            });

            // Update Team if exists
            if (user.team) {
                await prisma.team.update({
                    where: { id: user.team.id },
                    data: { isVip: true }
                });
            }

            // Mark Reward as Approved
            await prisma.caseReward.update({
                where: { id },
                data: { status: 'APPROVED' }
            });

            // Log
            await prisma.auditLog.create({
                data: {
                    action: 'APPROVE_REWARD',
                    userId: session.user.id,
                    username: session.user.username || 'Admin',
                    details: `Approved ${targetReward.type} for ${targetReward.username}`
                }
            });

        } else if (action === 'REJECT') {
            const targetReward = await prisma.caseReward.findUnique({ where: { id } });
            if (!targetReward) return NextResponse.json({ message: "Not found" }, { status: 404 });

            await prisma.caseReward.update({
                where: { id },
                data: { status: 'REJECTED' }
            });

            // Log
            await prisma.auditLog.create({
                data: {
                    action: 'REJECT_REWARD',
                    userId: session.user.id,
                    username: session.user.username || 'Admin',
                    details: `Rejected reward for ${targetReward.username}`
                }
            });
        }

        return NextResponse.json({ message: "Success" });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
