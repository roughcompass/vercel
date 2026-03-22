import { get, createClient } from "@vercel/edge-config"

export type Policy = {
  allowedTools: string[]
  rateLimit: number | null
  requiresApproval: string[]
  suspended: boolean
}

export type PolicyDecision = {
  allow: boolean
  reason: string
}

export async function getPolicy(agentId: string): Promise<Policy | null> {
  try {
    const policy = await get<Policy>(agentId)
    return policy ?? null
  } catch {
    return null
  }
}

export async function enforcePolicy(
  agentId: string,
  action: string
): Promise<PolicyDecision> {
  const policy = await getPolicy(agentId)

  if (!policy) {
    return { allow: true, reason: "No policy defined — action permitted by default" }
  }

  if (policy.suspended) {
    return { allow: false, reason: "Agent is suspended" }
  }

  if (policy.allowedTools.length > 0 && !policy.allowedTools.includes(action)) {
    return { allow: false, reason: `Action "${action}" is not in the allowed tools list` }
  }

  if (policy.requiresApproval.includes(action)) {
    return { allow: false, reason: `Action "${action}" requires explicit approval` }
  }

  return { allow: true, reason: "Action permitted by policy" }
}
