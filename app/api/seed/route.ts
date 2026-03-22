import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { computeHash } from "@/lib/audit"
import { redirect } from "next/navigation"

export async function GET() {
  const existing = await prisma.agent.count()
  if (existing > 0) {
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
  }

  const agents = await prisma.agent.createManyAndReturn({
    data: [
      { name: "email-outreach-agent", owner: "growth-team", environment: "production", version: "2.1.0", status: "ACTIVE" },
      { name: "data-pipeline-agent", owner: "data-eng", environment: "production", version: "1.4.2", status: "ACTIVE" },
      { name: "support-triage-agent", owner: "cx-team", environment: "production", version: "3.0.1", status: "ACTIVE" },
      { name: "invoice-processor", owner: "finance", environment: "staging", version: "1.0.0", status: "SUSPENDED" },
      { name: "report-generator", owner: "data-eng", environment: "development", version: "0.9.0", status: "PENDING" },
    ],
  })

  const actions = [
    { action: "send_email", decision: "allow", reason: "Action permitted by policy" },
    { action: "query_database", decision: "allow", reason: "Action permitted by policy" },
    { action: "delete_records", decision: "deny", reason: "Action \"delete_records\" requires explicit approval" },
    { action: "send_bulk_email", decision: "deny", reason: "Action \"send_bulk_email\" is not in the allowed tools list" },
    { action: "file_ticket", decision: "allow", reason: "Action permitted by policy" },
    { action: "read_customer_data", decision: "allow", reason: "Action permitted by policy" },
    { action: "write_to_s3", decision: "deny", reason: "Action \"write_to_s3\" is not in the allowed tools list" },
    { action: "send_slack_message", decision: "allow", reason: "Action permitted by policy" },
    { action: "call_external_api", decision: "allow", reason: "No policy defined — action permitted by default" },
    { action: "kill", decision: "deny", reason: "Suspended by finance team: invoice amounts exceeded threshold" },
  ]

  for (const agent of agents) {
    const eventCount = Math.floor(Math.random() * 5) + 2
    let prevHash: string | null = null

    for (let i = 0; i < eventCount; i++) {
      const evt = actions[Math.floor(Math.random() * actions.length)]
      const timestamp = new Date(Date.now() - (eventCount - i) * 3600000 * Math.random() * 24)
      const inputs = { requestId: `req_${Math.random().toString(36).slice(2, 10)}` }
      const output = evt.decision === "allow" ? { status: "ok" } : {}
      const hash = computeHash(agent.id, evt.action, inputs, output, timestamp, prevHash)

      await prisma.auditEvent.create({
        data: {
          agentId: agent.id,
          action: evt.action,
          inputs,
          output,
          policyDecision: evt.decision,
          policyReason: evt.reason,
          timestamp,
          prevHash,
          hash,
        },
      })

      prevHash = hash
    }
  }

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"))
}
