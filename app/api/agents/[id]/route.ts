import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const UpdateAgentSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  version: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      auditEvents: {
        orderBy: { timestamp: "asc" },
        select: { id: true, action: true, policyDecision: true, timestamp: true },
      },
    },
  })

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json(agent)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = UpdateAgentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { metadata, ...rest } = parsed.data
  const agent = await prisma.agent.update({
    where: { id },
    data: {
      ...rest,
      ...(metadata !== undefined ? { metadata: metadata as object } : {}),
    },
  })

  return NextResponse.json(agent)
}
