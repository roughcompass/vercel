import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { computeHash } from "@/lib/audit"

const KillSchema = z.object({
  reason: z.string().min(1),
  triggeredBy: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const body = await req.json()
  const parsed = KillSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const agent = await prisma.agent.update({
    where: { id: agentId },
    data: { status: "SUSPENDED" },
  })

  const last = await prisma.auditEvent.findFirst({
    where: { agentId },
    orderBy: { timestamp: "desc" },
    select: { hash: true },
  })

  const timestamp = new Date()
  const inputs = { triggeredBy: parsed.data.triggeredBy }
  const prevHash = last?.hash ?? null
  const hash = computeHash(agentId, "kill", inputs, {}, timestamp, prevHash)

  await prisma.auditEvent.create({
    data: {
      agentId,
      action: "kill",
      inputs,
      output: {},
      policyDecision: "deny",
      policyReason: parsed.data.reason,
      timestamp,
      prevHash,
      hash,
    },
  })

  return NextResponse.json(agent)
}
