"use client";

import { GitBranch } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

// ---------------------------------------------------------------------------
// Mock diff data
// ---------------------------------------------------------------------------
const MOCK_FILES = [
  { path: "src/reports/weekly-aggregation.ts", additions: 24, deletions: 8 },
  { path: "src/reports/utils/timezone.ts", additions: 45, deletions: 0 },
  { path: "src/reports/__tests__/weekly-aggregation.test.ts", additions: 87, deletions: 12 },
];

const MOCK_DIFF = `diff --git a/src/reports/weekly-aggregation.ts b/src/reports/weekly-aggregation.ts
index 3a4f2b1..8c9d3e2 100644
--- a/src/reports/weekly-aggregation.ts
+++ b/src/reports/weekly-aggregation.ts
@@ -12,8 +12,14 @@ import { db } from '../db';
-function getWeekBoundary(): { start: Date; end: Date } {
-  const now = new Date();
-  const dayOfWeek = now.getDay();
-  const start = new Date(now);
-  start.setDate(now.getDate() - dayOfWeek);
+function getWeekBoundary(timezone: string): { start: Date; end: Date } {
+  const formatter = new Intl.DateTimeFormat('en-US', {
+    timeZone: timezone,
+    year: 'numeric',
+    month: '2-digit',
+    day: '2-digit',
+  });
+  const parts = formatter.formatToParts(new Date());
+  const now = new Date(
+    \`\${parts.find(p => p.type === 'year')!.value}-\${parts.find(p => p.type === 'month')!.value}-\${parts.find(p => p.type === 'day')!.value}\`
+  );
+  const dayOfWeek = now.getUTCDay();
+  const start = new Date(now);
+  start.setUTCDate(now.getUTCDate() - dayOfWeek);
@@ -28,7 +34,7 @@ export async function aggregateWeeklyReport(userId: string) {
-  const { start, end } = getWeekBoundary();
+  const userTimezone = await getUserTimezone(userId);
+  const { start, end } = getWeekBoundary(userTimezone);
   const events = await db.telemetryEvents.findMany({
     where: {
       userId,`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type CodeChangesTabProps = {
  hasDiff?: boolean;
};

export function CodeChangesTab({ hasDiff = true }: CodeChangesTabProps) {
  if (!hasDiff) {
    return (
      <EmptyState
        icon={GitBranch}
        title="No changes yet"
        description="Changes will appear once the agent starts working."
        className="h-full"
      />
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* File summary */}
      <div className="border-b px-4 py-2 space-y-1">
        <p className="text-xs text-muted-foreground font-medium">
          {MOCK_FILES.length} files changed
        </p>
        {MOCK_FILES.map((f) => (
          <div key={f.path} className="flex items-center gap-2 text-xs">
            <span className="font-mono text-foreground/80 truncate flex-1">{f.path}</span>
            {f.additions > 0 && (
              <span className="text-[var(--diff-added)] shrink-0">+{f.additions}</span>
            )}
            {f.deletions > 0 && (
              <span className="text-[var(--diff-removed)] shrink-0">-{f.deletions}</span>
            )}
          </div>
        ))}
      </div>

      {/* Diff output */}
      <div className="flex-1 overflow-auto">
        <pre className="px-4 py-3 text-xs font-mono whitespace-pre overflow-x-auto leading-relaxed">
          {MOCK_DIFF.split("\n").map((line, i) => {
            let color = "text-foreground/70";
            if (line.startsWith("+") && !line.startsWith("+++"))
              color = "text-[var(--diff-added)]";
            else if (line.startsWith("-") && !line.startsWith("---"))
              color = "text-[var(--diff-removed)]";
            else if (line.startsWith("@@")) color = "text-[var(--link)]";
            else if (line.startsWith("diff ")) color = "text-foreground font-semibold";

            return (
              <div key={i} className={color}>
                {line}
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
