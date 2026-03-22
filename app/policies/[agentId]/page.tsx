import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { getPolicy } from "@/lib/policy"
import PolicyForm from "./PolicyForm"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function PolicyPage({ params }: { params: Promise<{ agentId: string }> }) {
  const { agentId } = await params

  const agent = await prisma.agent.findUnique({ where: { id: agentId } })
  if (!agent) notFound()

  const policy = await getPolicy(agentId)

  return (
    <div className="px-8 py-8 max-w-xl">
      <div className="mb-2">
        <Link href={`/agents/${agentId}`} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
          ← {agent.name}
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Policy Editor</h1>
        <p className="text-sm text-gray-500 mt-1">
          Define what {agent.name} is allowed to do. Enforced at the infrastructure level.
        </p>
      </div>
      <PolicyForm agentId={agentId} initial={policy} />
    </div>
  )
}
