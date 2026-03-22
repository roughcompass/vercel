import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getPolicy } from "@/lib/policy"

const RateLimitSchema = z.object({
  rateLimit: z.number().positive(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const body = await req.json()
  const parsed = RateLimitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await getPolicy(agentId)
  const updated = { ...(existing ?? { allowedTools: [], requiresApproval: [], suspended: false }), rateLimit: parsed.data.rateLimit }

  const res = await fetch(
    `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: agentId, value: updated }],
      }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to update rate limit" }, { status: 500 })
  }

  return NextResponse.json({ agentId, rateLimit: parsed.data.rateLimit })
}
