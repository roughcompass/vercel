import { prisma } from "@/lib/prisma"
import Link from "next/link"
import StatusBadge from "../components/StatusBadge"

export const dynamic = "force-dynamic"

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; env?: string }>
}) {
  const { status, env } = await searchParams

  const agents = await prisma.agent.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "SUSPENDED" | "PENDING" } : {}),
      ...(env ? { environment: env } : {}),
    },
    orderBy: { deployedAt: "desc" },
    include: {
      _count: { select: { auditEvents: true } },
    },
  })

  const environments = ["production", "staging", "development"]
  const statuses = ["ACTIVE", "SUSPENDED", "PENDING"]

  return (
    <div className="px-8 py-8 max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Agents</h1>
          <p className="text-sm text-gray-500 mt-1">{agents.length} agent{agents.length !== 1 ? "s" : ""} registered</p>
        </div>
        <Link
          href="/agents/new"
          className="text-sm bg-white text-black px-3 py-1.5 rounded hover:bg-gray-200 transition-colors font-medium"
        >
          Register agent
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        <FilterLink label="All statuses" href="/agents" active={!status} />
        {statuses.map((s) => (
          <FilterLink
            key={s}
            label={s}
            href={`/agents?status=${s}${env ? `&env=${env}` : ""}`}
            active={status === s}
          />
        ))}
        <span className="w-px bg-gray-800 mx-1" />
        <FilterLink label="All envs" href={`/agents${status ? `?status=${status}` : ""}`} active={!env} />
        {environments.map((e) => (
          <FilterLink
            key={e}
            label={e}
            href={`/agents?env=${e}${status ? `&status=${status}` : ""}`}
            active={env === e}
          />
        ))}
      </div>

      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900">
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Name</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Owner</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Environment</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Version</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Status</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Events</th>
              <th className="text-left px-4 py-2.5 text-xs text-gray-500 font-medium">Deployed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {agents.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-600 text-sm">
                  No agents found.{" "}
                  <Link href="/agents/new" className="text-gray-500 underline hover:text-white">Register one</Link>
                  {" "}or{" "}
                  <Link href="/api/seed" className="text-gray-500 underline hover:text-white">load demo data</Link>.
                </td>
              </tr>
            )}
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-2.5">
                  <Link href={`/agents/${agent.id}`} className="text-white hover:underline font-medium">
                    {agent.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-gray-400">{agent.owner}</td>
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">{agent.environment}</td>
                <td className="px-4 py-2.5 text-gray-400 font-mono text-xs">v{agent.version}</td>
                <td className="px-4 py-2.5"><StatusBadge status={agent.status} /></td>
                <td className="px-4 py-2.5 text-gray-500 text-xs tabular-nums">{agent._count.auditEvents}</td>
                <td className="px-4 py-2.5 text-gray-600 text-xs font-mono whitespace-nowrap">
                  {new Date(agent.deployedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs px-2.5 py-1 rounded border transition-colors ${
        active
          ? "border-gray-600 bg-gray-800 text-white"
          : "border-gray-800 text-gray-500 hover:text-white hover:border-gray-600"
      }`}
    >
      {label}
    </Link>
  )
}
