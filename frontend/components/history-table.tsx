"use client"

import useSWR from "swr"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { History } from "lucide-react"

interface HistoryItem {
  url: string
  status: "healthy" | "unhealthy" | "timeout"
  status_code: number | null
  response_time_ms: number | null
  timestamp: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface HistoryTableProps {
  refreshKey: number
}

export function HistoryTable({ refreshKey }: HistoryTableProps) {
  const { data, error, isLoading } = useSWR<HistoryItem[]>(
    `https://webiste-status-monitor.onrender.com/history?refresh=${refreshKey}`,
    fetcher,
    {
      refreshInterval: 30000,
    }
  )

  const getStatusBadge = (status: string) => {
    const isHealthy = status === "healthy"
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          isHealthy ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Check History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6" />
            <span className="ml-2 text-muted-foreground">Loading history...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-muted-foreground">
            Failed to load history. Please refresh the page.
          </div>
        ) : !data || data.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No check history yet. Check a URL to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status Code</TableHead>
                  <TableHead>Response Time (ms)</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={`${item.url}-${item.timestamp}-${index}`}>
                    <TableCell className="max-w-xs truncate font-medium">
                      {item.url}
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{item.status_code ?? "N/A"}</TableCell>
                    <TableCell>
                      {item.response_time_ms != null ? item.response_time_ms.toFixed(1) : "N/A"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatTimestamp(item.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
