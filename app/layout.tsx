import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Nav from "./components/Nav"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Agent Governance",
  description: "Registry, policy enforcement, and audit trail for AI agents.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-gray-950 text-gray-100`}>
      <body className="min-h-full flex">
        <Nav />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
