"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const priorityConfig: Record<1 | 2 | 3 | 4, { label: string; className: string }> = {
  1: { label: "HIGH", className: "bg-destructive/15 text-destructive border-transparent" },
  2: { label: "MED", className: "bg-warning/15 text-warning border-transparent" },
  3: { label: "LOW", className: "bg-info/15 text-info border-transparent" },
  4: { label: "LOW", className: "bg-muted text-muted-foreground border-transparent" },
};

export function PriorityBadge({ priority }: { priority: 1 | 2 | 3 | 4 }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={cn("text-xs font-semibold px-2 py-0.5", config.className)}>
      {config.label}
    </Badge>
  );
}
