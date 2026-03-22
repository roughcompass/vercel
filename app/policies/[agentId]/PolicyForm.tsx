"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Policy } from "@/lib/policy"

export default function PolicyForm({ agentId, initial }: { agentId: string; initial: Policy | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allowedTools, setAllowedTools] = useState(initial?.allowedTools.join(", ") ?? "")
  const [requiresApproval, setRequiresApproval] = useState(initial?.requiresApproval.join(", ") ?? "")
  const [rateLimit, setRateLimit] = useState<string>(initial?.rateLimit?.toString() ?? "")
  const [suspended, setSuspended] = useState(initial?.suspended ?? false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSaved(false)

    const body = {
      agentId,
      allowedTools: allowedTools.split(",").map((t) => t.trim()).filter(Boolean),
      requiresApproval: requiresApproval.split(",").map((t) => t.trim()).filter(Boolean),
      rateLimit: rateLimit ? parseInt(rateLimit) : null,
      suspended,
    }

    const res = await fetch("/api/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(JSON.stringify(data.error))
    } else {
      setSaved(true)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Allowed Tools
          <span className="text-gray-600 ml-1">(comma-separated, leave blank to allow all)</span>
        </label>
        <input
          value={allowedTools}
          onChange={(e) => setAllowedTools(e.target.value)}
          placeholder="send_email, query_database, file_tickets"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Requires Approval
          <span className="text-gray-600 ml-1">(comma-separated actions that need explicit sign-off)</span>
        </label>
        <input
          value={requiresApproval}
          onChange={(e) => setRequiresApproval(e.target.value)}
          placeholder="delete_records, send_bulk_email"
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-400 mb-1.5">
          Rate Limit
          <span className="text-gray-600 ml-1">(max actions per minute, leave blank for none)</span>
        </label>
        <input
          type="number"
          value={rateLimit}
          onChange={(e) => setRateLimit(e.target.value)}
          placeholder="60"
          min={1}
          className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      <div className="flex items-center justify-between border border-gray-800 rounded-lg px-4 py-3 bg-gray-900">
        <div>
          <p className="text-sm text-gray-300">Suspend agent</p>
          <p className="text-xs text-gray-600 mt-0.5">Immediately block all actions from this agent</p>
        </div>
        <button
          type="button"
          onClick={() => setSuspended(!suspended)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${suspended ? "bg-red-600" : "bg-gray-700"}`}
        >
          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${suspended ? "translate-x-4.5" : "translate-x-0.5"}`} />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>
      )}

      {saved && (
        <p className="text-xs text-green-400 bg-green-900/20 border border-green-800 rounded px-3 py-2">Policy saved.</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Save policy"}
      </button>
    </form>
  )
}
