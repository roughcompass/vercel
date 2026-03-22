import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { get } from "@vercel/edge-config"
import { prisma } from "@/lib/prisma"
import { computeHash } from "@/lib/audit"
import type { PendingAction } from "../../queue/route"

const ApproveSchema = z.object({
  actionId: z.string().min(1),
  approvedBy: z.string().min(1),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const body = await req.json()
  const parsed = ApproveSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const queue = await get<PendingAction[]>("approval_queue") ?? []
  const pending = queue.find((item) => item.id === parsed.data.actionId && item.agentId === agentId)

  if (!pending) {
    return NextResponse.json({ error: "Pending action not found" }, { status: 404 })
  }

  const last = await prisma.auditEvent.findFirst({
    where: { agentId },
    orderBy: { timestamp: "desc" },
    select: { hash: true },
  })

  const timestamp = new Date()
  const inputs = { approvedBy: parsed.data.approvedBy, originalAction: pending.action }
  const prevHash = last?.hash ?? null
  const hash = computeHash(agentId, "approve", inputs, {}, timestamp, prevHash)

  await prisma.auditEvent.create({
    data: {
      agentId,
      action: "approve",
      inputs,
      output: {},
      policyDecision: "allow",
      policyReason: `Approved by ${parsed.data.approvedBy}`,
      timestamp,
      prevHash,
      hash,
    },
  })

  const updatedQueue = queue.filter((item) => item.id !== parsed.data.actionId)

  await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: "approval_queue", value: updatedQueue }],
      }),
    }
  )

  return NextResponse.json({ approved: true, actionId: parsed.data.actionId })
}
