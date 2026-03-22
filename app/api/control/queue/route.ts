import { NextResponse } from "next/server"
import { get } from "@vercel/edge-config"

export type PendingAction = {
  id: string
  agentId: string
  action: string
  requestedBy: string
  requestedAt: string
  reason: string
}

export async function GET() {
  const queue = await get<PendingAction[]>("approval_queue")
  return NextResponse.json(queue ?? [])
}
