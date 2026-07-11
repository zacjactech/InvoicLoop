"use client";

import { useEffect, useState } from "react";
import { ActivityFeed } from "@/components/features/activity-feed";
import { EmptyState } from "@/components/ui/empty-state";

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
  user: { name: string };
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Security Audit Logs
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">
          Track all system modifications
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Invoice and customer actions will appear here as your workspace fills with data."
          icon={
            <svg
              className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      ) : (
        <ActivityFeed logs={logs} />
      )}
    </div>
  );
}