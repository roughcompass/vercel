"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/agents", label: "Agents" },
  { href: "/control", label: "Control Plane" },
]

export default function Nav() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-gray-800 min-h-screen flex flex-col px-4 py-6">
      <div className="mb-8 px-2">
        <span className="text-sm font-semibold tracking-tight text-white">Agent Governance</span>
        <span className="block text-xs text-gray-500 mt-0.5">Control Layer</span>
      </div>
      <nav className="flex flex-col gap-0.5">
        {links.map(({ href, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`px-2 py-1.5 rounded text-sm transition-colors ${
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
