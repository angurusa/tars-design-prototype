"use client";

// ---------------------------------------------------------------------------
// Scorecard / Summary tab — simplified for prototype
// ---------------------------------------------------------------------------
function MetricRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | undefined;
  unit?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">
        {value !== undefined && value !== null ? `${value}${unit ?? ""}` : "\u2014"}
      </span>
    </div>
  );
}

type ScorecardTabProps = {
  status?: string;
  duration?: string;
  toolCalls?: number;
  buildTestRuns?: number;
  filesModified?: number;
  cost?: string;
};

export function ScorecardTab({
  status = "testing",
  duration = "3h 45m",
  toolCalls = 42,
  buildTestRuns = 6,
  filesModified = 3,
  cost = "$0.84",
}: ScorecardTabProps) {
  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-md mx-auto px-6 py-5">
        <div className="space-y-0 pt-1">
          <MetricRow label="Status" value={status} />
          <MetricRow label="Duration" value={duration} />
          <MetricRow label="Tool calls" value={toolCalls} />
          <MetricRow label="Build/test runs" value={buildTestRuns} />
          <MetricRow label="Files modified" value={filesModified} />
          <MetricRow label="Cost" value={cost} />
        </div>

        {status === "done" && (
          <div className="mt-4 rounded-md bg-success/10 px-3 py-2 text-xs text-success">
            Task completed successfully
          </div>
        )}
        {status === "failed" && (
          <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
            Task failed -- check logs for details
          </div>
        )}
      </div>
    </div>
  );
}
