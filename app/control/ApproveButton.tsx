"use client"

import { useState } from "react"

export default function ApproveButton({ agentId, actionId }: { agentId: string; actionId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)
    await fetch(`/api/control/approve/${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionId, approvedBy: "control-plane" }),
    })
    window.location.reload()
  }

  return (
    <button
      onClick={handleApprove}
      disabled={loading}
      className="text-xs bg-green-900/40 text-green-400 border border-green-800 px-3 py-1 rounded hover:bg-green-900/70 disabled:opacity-40 transition-colors"
    >
      {loading ? "Approving..." : "Approve"}
    </button>
  )
}
