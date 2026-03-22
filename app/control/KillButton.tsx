"use client"

import { useState } from "react"

export default function KillButton({ agentId, agentName }: { agentId: string; agentName: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleKill() {
    const reason = prompt(`Reason for suspending "${agentName}":`)
    if (!reason) return

    setLoading(true)
    await fetch(`/api/control/kill/${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason, triggeredBy: "control-plane" }),
    })
    setLoading(false)
    setDone(true)
    window.location.reload()
  }

  return (
    <button
      onClick={handleKill}
      disabled={loading || done}
      className="text-xs text-red-600 border border-red-200 px-3 py-1 rounded hover:bg-red-50 disabled:opacity-40 transition-colors"
    >
      {loading ? "Suspending..." : "Suspend"}
    </button>
  )
}
