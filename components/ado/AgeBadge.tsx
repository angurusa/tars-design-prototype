"use client";

import { Badge } from "@/components/ui/badge";

export function AgeBadge({ days }: { days: number }) {
  if (!days || days < 7) return null;
  const className =
    days > 30
      ? "bg-destructive/15 text-destructive border-transparent"
      : days > 14
        ? "bg-warning/15 text-warning border-transparent"
        : "bg-muted text-muted-foreground border-transparent";
  return (
    <Badge variant="outline" className={`text-xs px-1.5 ${className}`}>
      {days}d
    </Badge>
  );
}
