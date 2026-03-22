export default function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-900/50 text-green-400 border-green-800",
    SUSPENDED: "bg-red-900/50 text-red-400 border-red-800",
    PENDING: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
    allow: "bg-green-900/50 text-green-400 border-green-800",
    deny: "bg-red-900/50 text-red-400 border-red-800",
  }

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono border ${styles[status] ?? "bg-gray-800 text-gray-400 border-gray-700"}`}>
      {status}
    </span>
  )
}
