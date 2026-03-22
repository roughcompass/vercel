"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewAgentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const form = new FormData(e.currentTarget)
    const body = {
      name: form.get("name"),
      owner: form.get("owner"),
      environment: form.get("environment"),
      version: form.get("version"),
    }

    const res = await fetch("/api/agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(JSON.stringify(data.error))
      setLoading(false)
      return
    }

    const agent = await res.json()
    router.push(`/agents/${agent.id}`)
  }

  return (
    <div className="px-8 py-8 max-w-lg">
      <div className="mb-8">
        <h1 className="text-xl font-semibold">Register Agent</h1>
        <p className="text-sm text-gray-500 mt-1">Add an agent to the registry.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label="Name" name="name" placeholder="email-outreach-agent" required />
        <Field label="Owner" name="owner" placeholder="team-name or email" required />
        <div>
          <label className="block text-xs text-gray-400 mb-1.5">Environment</label>
          <select
            name="environment"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500"
          >
            <option value="production">production</option>
            <option value="staging">staging</option>
            <option value="development">development</option>
          </select>
        </div>
        <Field label="Version" name="version" placeholder="1.0.0" required />

        {error && (
          <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {loading ? "Registering..." : "Register"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white text-sm px-4 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
      />
    </div>
  )
}
