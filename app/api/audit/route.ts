import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { computeHash } from "@/lib/audit"

const AppendEventSchema = z.object({
  agentId: z.string().min(1),
  action: z.string().min(1),
  inputs: z.unknown().optional(),
  output: z.unknown().optional(),
  policyDecision: z.enum(["allow", "deny"]),
  policyReason: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = AppendEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { agentId, action, inputs, output, policyDecision, policyReason } = parsed.data

  const last = await prisma.auditEvent.findFirst({
    where: { agentId },
    orderBy: { timestamp: "desc" },
    select: { hash: true },
  })

  const timestamp = new Date()
  const prevHash = last?.hash ?? null
  const hash = computeHash(agentId, action, inputs, output, timestamp, prevHash)

  const event = await prisma.auditEvent.create({
    data: {
      agentId,
      action,
      inputs: inputs ?? {},
      output: output ?? {},
      policyDecision,
      policyReason,
      timestamp,
      prevHash,
      hash,
    },
  })

  return NextResponse.json(event, { status: 201 })
}
