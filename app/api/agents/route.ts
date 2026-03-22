import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

const CreateAgentSchema = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  environment: z.enum(["production", "staging", "development"]).default("production"),
  version: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = CreateAgentSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { metadata, ...rest } = parsed.data
  const agent = await prisma.agent.create({
    data: {
      ...rest,
      ...(metadata !== undefined ? { metadata: metadata as object } : {}),
    },
  })
  return NextResponse.json(agent, { status: 201 })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const owner = searchParams.get("owner") ?? undefined
  const status = searchParams.get("status") ?? undefined

  const agents = await prisma.agent.findMany({
    where: {
      ...(owner ? { owner } : {}),
      ...(status ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" } : {}),
    },
    orderBy: { deployedAt: "desc" },
  })

  return NextResponse.json(agents)
}
