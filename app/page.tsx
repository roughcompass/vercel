import { prisma } from "@/lib/prisma"
import Link from "next/link"
import StatusBadge from "./components/StatusBadge"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const [agents, recentEvents] = await Promise.all([
    prisma.agent.findMany(),
    prisma.auditEvent.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
      include: { agent: { select: { name: true } } },
    }),
  ])

  const active = agents.filter((a) => a.status === "ACTIVE").length
  const suspended = agents.filter((a) => a.status === "SUSPENDED").length
  const denied = recentEvents.filter((e) => e.policyDecision === "deny").length

  const stats = [
    { label: "Total Agents", value: agents.length },
    { label: "Active", value: active },
    { label: "Suspended", value: suspended },
    { label: "Recent Denials", value: denied },
  ]

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">System-wide view of deployed agents and recent activity.</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-gray-800 rounded-lg px-5 py-4 bg-gray-900">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-3xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Recent Audit Events</h2>
        <Link href="/agents" className="text-xs text-gray-500 hover:text-white transition-colors">
          View all agents →
        </Link>
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900">
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Agent</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Action</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Decision</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Reason</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {recentEvents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-600 text-sm">
                  No audit events yet.{" "}
                  <Link href="/api/seed" className="text-gray-500 underline hover:text-white">
                    Load demo data
                  </Link>
                </td>
              </tr>
            )}
            {recentEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/agents/${event.agentId}`} className="hover:text-white text-gray-300 transition-colors">
                    {event.agent.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-300">{event.action}</td>
                <td className="px-4 py-2.5"><StatusBadge status={event.policyDecision} /></td>
                <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs truncate">{event.policyReason ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs text-gray-600 font-mono whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
