import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { computeHash } from "@/lib/audit"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params

  const events = await prisma.auditEvent.findMany({
    where: { agentId },
    orderBy: { timestamp: "asc" },
  })

  if (events.length === 0) {
    return NextResponse.json({ valid: true, message: "No events found" })
  }

  for (let i = 0; i < events.length; i++) {
    const event = events[i]
    const expected = computeHash(
      event.agentId,
      event.action,
      event.inputs,
      event.output,
      event.timestamp,
      event.prevHash
    )

    if (expected !== event.hash) {
      return NextResponse.json({
        valid: false,
        brokenAt: event.id,
        index: i,
        message: `Hash mismatch at event ${i + 1} (id: ${event.id})`,
      })
    }
  }

  return NextResponse.json({ valid: true, eventCount: events.length })
}
