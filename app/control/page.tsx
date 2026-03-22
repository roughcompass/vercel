import { prisma } from "@/lib/prisma"
import { get } from "@vercel/edge-config"
import type { PendingAction } from "../api/control/queue/route"
import KillButton from "./KillButton"

export const dynamic = "force-dynamic"

export default async function ControlPlane() {
  const [agents, queue] = await Promise.all([
    prisma.agent.findMany({ orderBy: { deployedAt: "desc" } }),
    get<PendingAction[]>("approval_queue").then((q) => q ?? []),
  ])

  const active = agents.filter((a) => a.status === "ACTIVE")
  const suspended = agents.filter((a) => a.status === "SUSPENDED")

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <h1 className="text-2xl font-semibold tracking-tight">Control Plane</h1>

      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Active Agents ({active.length})
        </h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {active.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No active agents.</p>
          )}
          {active.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between px-4 py-3 bg-white">
              <div>
                <p className="text-sm font-medium">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.owner} · {agent.environment} · v{agent.version}</p>
              </div>
              <KillButton agentId={agent.id} agentName={agent.name} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Suspended Agents ({suspended.length})
        </h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {suspended.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No suspended agents.</p>
          )}
          {suspended.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-500">{agent.name}</p>
                <p className="text-xs text-gray-400">{agent.owner} · {agent.environment} · v{agent.version}</p>
              </div>
              <span className="text-xs text-gray-400 font-medium">SUSPENDED</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
          Pending Approvals ({queue.length})
        </h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {queue.length === 0 && (
            <p className="px-4 py-3 text-sm text-gray-400">No actions pending approval.</p>
          )}
          {queue.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-white">
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-gray-500">
                  Agent {item.agentId} · requested by {item.requestedBy} · {new Date(item.requestedAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.reason}</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">PENDING</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
