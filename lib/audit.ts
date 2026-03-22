import crypto from "crypto"

export function computeHash(
  agentId: string,
  action: string,
  inputs: unknown,
  output: unknown,
  timestamp: Date,
  prevHash: string | null
): string {
  const payload = JSON.stringify({ agentId, action, inputs, output, timestamp, prevHash })
  return crypto.createHash("sha256").update(payload).digest("hex")
}
