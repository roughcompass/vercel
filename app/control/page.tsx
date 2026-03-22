import { prisma } from "@/lib/prisma"
import { get } from "@vercel/edge-config"
import type { PendingAction } from "../api/control/queue/route"
import Link from "next/link"
import StatusBadge from "../components/StatusBadge"
import KillButton from "./KillButton"
import ApproveButton from "./ApproveButton"

export const dynamic = "force-dynamic"

export default async function ControlPlane() {
  const [agents, queue] = await Promise.all([
    prisma.agent.findMany({ orderBy: { deployedAt: "desc" } }),
    get<PendingAction[]>("approval_queue").then((q) => q ?? []).catch(() => []),
  ])

  const active = agents.filter((a) => a.status === "ACTIVE")
  const suspended = agents.filter((a) => a.status === "SUSPENDED")

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Control Plane</h1>
        <p className="text-sm text-gray-500 mt-1">Kill switches, approvals, and rate limits. No engineering required.</p>
      </div>

      {queue.length > 0 && (
        <div className="mb-8 border border-yellow-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-yellow-900/20 border-b border-yellow-800 flex items-center justify-between">
            <h2 className="text-xs font-medium text-yellow-400 uppercase tracking-wider">
              Pending Approvals ({queue.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-800">
            {queue.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white font-mono">{item.action}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Agent <Link href={`/agents/${item.agentId}`} className="hover:text-white">{item.agentId.slice(0, 8)}…</Link>
                    {" "}· requested by {item.requestedBy}
                    {" "}· {new Date(item.requestedAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{item.reason}</p>
                </div>
                <ApproveButton agentId={item.agentId} actionId={item.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8 border border-gray-800 rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
          <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Active Agents ({active.length})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/50">
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">Owner</th>
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">Environment</th>
              <th className="text-left px-4 py-2 text-xs text-gray-600 font-medium">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {active.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-600 text-sm">No active agents.</td></tr>
            )}
            {active.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-900/30 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/agents/${agent.id}`} className="hover:text-white text-gray-300 transition-colors">{agent.name}</Link>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{agent.owner}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{agent.environment}</td>
                <td className="px-4 py-3"><StatusBadge status={agent.status} /></td>
                <td className="px-4 py-3 text-right">
                  <KillButton agentId={agent.id} agentName={agent.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {suspended.length > 0 && (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-800">
            <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Suspended Agents ({suspended.length})
            </h2>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-800">
              {suspended.map((agent) => (
                <tr key={agent.id} className="opacity-60">
                  <td className="px-4 py-3">
                    <Link href={`/agents/${agent.id}`} className="text-gray-400 hover:text-white transition-colors">{agent.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{agent.owner}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{agent.environment}</td>
                  <td className="px-4 py-3"><StatusBadge status={agent.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/policies/${agent.id}`} className="text-xs text-gray-600 hover:text-white border border-gray-800 hover:border-gray-600 px-3 py-1 rounded transition-colors">
                      Edit policy
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
