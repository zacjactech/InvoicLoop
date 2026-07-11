"use client";

import { formatDate } from "@/lib/utils";

interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  createdAt: string;
  user: { name: string };
}

interface ActivityFeedProps {
  logs: ActivityLog[];
}

const actionIcons: Record<string, React.ReactNode> = {
  CREATE: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  UPDATE: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  ),
  DELETE: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
};

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const icon = actionIcons[log.action];
        return (
          <div
            key={log.id}
            className="glass flex items-start gap-4 rounded-2xl p-4"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-elevated)] text-slate-500 dark:text-slate-400 dark:text-slate-500">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {log.details}
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                by {log.user.name}
              </p>
            </div>
            <span className="text-xs text-slate-400 shrink-0 dark:text-slate-500">
              {formatDate(log.createdAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}