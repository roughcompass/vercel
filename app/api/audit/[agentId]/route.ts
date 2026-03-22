import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params

  const events = await prisma.auditEvent.findMany({
    where: { agentId },
    orderBy: { timestamp: "asc" },
  })

  return NextResponse.json(events)
}
