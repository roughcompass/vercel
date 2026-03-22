import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const PolicySchema = z.object({
  agentId: z.string().min(1),
  allowedTools: z.array(z.string()).default([]),
  rateLimit: z.number().positive().nullable().default(null),
  requiresApproval: z.array(z.string()).default([]),
  suspended: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = PolicySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { agentId, ...policy } = parsed.data

  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: agentId, value: policy }],
      }),
    }
  )

  if (!res.ok) {
    const error = await res.text()
    return NextResponse.json({ error: `Edge Config update failed: ${error}` }, { status: 500 })
  }

  return NextResponse.json({ agentId, ...policy })
}
