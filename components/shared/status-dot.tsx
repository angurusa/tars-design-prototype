"use client";

import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/lib/types";

const statusConfig: Record<AgentStatus, { color: string; label: string }> = {
  idle: { color: "bg-muted-foreground", label: "Idle" },
  running: { color: "bg-info animate-pulse", label: "Running" },
  success: { color: "bg-success", label: "Success" },
  warning: { color: "bg-warning", label: "Awaiting approval" },
  error: { color: "bg-destructive", label: "Error" },
  approval: { color: "bg-warning", label: "Awaiting approval" },
};

export function StatusDot({
  status,
  size = "sm",
  className,
}: {
  status: AgentStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-block rounded-full transition-colors duration-300",
        size === "sm" ? "h-2.5 w-2.5" : "h-3.5 w-3.5",
        config.color,
        className
      )}
      aria-label={`Status: ${config.label}`}
      role="img"
    />
  );
}
