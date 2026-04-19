"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export function TokenBudgetBar({
  used,
  budget,
  costEstimate,
}: {
  used: number;
  budget: number;
  costEstimate: number;
}) {
  const pct = budget > 0 ? (used / budget) * 100 : 0;

  const indicatorClassName =
    pct > 80
      ? "[&_[data-slot=progress-indicator]]:bg-destructive"
      : pct >= 50
        ? "[&_[data-slot=progress-indicator]]:bg-warning"
        : "";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-mono">
          {used.toLocaleString()} / {budget.toLocaleString()}
        </span>
        <span className="text-muted-foreground font-mono">
          ${costEstimate} est.
        </span>
      </div>
      <Progress
        value={pct}
        className={cn(indicatorClassName)}
      />
    </div>
  );
}
