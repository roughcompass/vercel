import { NextRequest, NextResponse } from "next/server"
import { getPolicy } from "@/lib/policy"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params
  const policy = await getPolicy(agentId)

  if (!policy) {
    return NextResponse.json({ error: "No policy found for this agent" }, { status: 404 })
  }

  return NextResponse.json({ agentId, ...policy })
}
