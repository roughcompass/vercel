import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import StatusBadge from "@/app/components/StatusBadge"
import { getPolicy } from "@/lib/policy"

export const dynamic = "force-dynamic"

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [agent, verifyRes] = await Promise.all([
    prisma.agent.findUnique({
      where: { id },
      include: { auditEvents: { orderBy: { timestamp: "asc" } } },
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/audit/verify/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .catch(() => null),
  ])

  if (!agent) notFound()

  const policy = await getPolicy(id)

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-2">
        <Link href="/agents" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Agents</Link>
      </div>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold">{agent.name}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{agent.id}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={agent.status} />
          <Link
            href={`/policies/${id}`}
            className="text-xs border border-gray-700 px-3 py-1.5 rounded hover:border-gray-500 text-gray-400 hover:text-white transition-colors"
          >
            Edit policy
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <InfoCard label="Owner" value={agent.owner} />
        <InfoCard label="Environment" value={agent.environment} mono />
        <InfoCard label="Version" value={`v${agent.version}`} mono />
        <InfoCard label="Deployed" value={new Date(agent.deployedAt).toLocaleString()} mono />
      </div>

      {policy && (
        <div className="mb-8 border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Policy</h2>
          </div>
          <div className="px-4 py-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Allowed Tools</p>
              <p className="font-mono text-xs text-gray-300">
                {policy.allowedTools.length > 0 ? policy.allowedTools.join(", ") : "all"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Rate Limit</p>
              <p className="font-mono text-xs text-gray-300">{policy.rateLimit ?? "none"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Requires Approval</p>
              <p className="font-mono text-xs text-gray-300">
                {policy.requiresApproval.length > 0 ? policy.requiresApproval.join(", ") : "none"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Audit Trail ({agent.auditEvents.length} events)
        </h2>
        {verifyRes && (
          <span className={`text-xs px-2 py-0.5 rounded font-mono border ${verifyRes.valid ? "border-green-800 text-green-400 bg-green-900/30" : "border-red-800 text-red-400 bg-red-900/30"}`}>
            {verifyRes.valid ? "chain intact" : `broken at event ${verifyRes.index + 1}`}
          </span>
        )}
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900">
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Action</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Decision</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Reason</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Hash</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {agent.auditEvents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-600 text-sm">No events recorded.</td>
              </tr>
            )}
            {agent.auditEvents.map((event) => (
              <tr key={event.id} className="hover:bg-gray-900/30 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-300">{event.action}</td>
                <td className="px-4 py-2.5"><StatusBadge status={event.policyDecision} /></td>
                <td className="px-4 py-2.5 text-xs text-gray-500 max-w-xs truncate">{event.policyReason ?? "—"}</td>
                <td className="px-4 py-2.5 font-mono text-xs text-gray-700 truncate max-w-[120px]" title={event.hash}>
                  {event.hash.slice(0, 12)}…
                </td>
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

function InfoCard({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border border-gray-800 rounded-lg px-4 py-3 bg-gray-900">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm text-gray-200 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  )
}
