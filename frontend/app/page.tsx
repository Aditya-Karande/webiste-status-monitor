"use client"

import { useState } from "react"
import { StatusChecker } from "@/components/status-checker"
import { HistoryTable } from "@/components/history-table"
import { Activity } from "lucide-react"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCheckComplete = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Website Status Monitor</h1>
              <p className="text-muted-foreground">
                Check website availability and response times
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-8">
          <StatusChecker onCheckComplete={handleCheckComplete} />
          <HistoryTable refreshKey={refreshKey} />
        </div>

        <footer className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          &copy; 2026 Website Status Monitor
        </footer>
      </div>
    </main>
  )
}
