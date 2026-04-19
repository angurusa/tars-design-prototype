"use client";

import { cn } from "@/lib/utils";
import type { PipelineStep } from "@/lib/types";

const stepCircleStyles: Record<PipelineStep["status"], string> = {
  done: "bg-success border-success",
  active: "bg-info border-info animate-pulse",
  pending: "bg-transparent border-muted-foreground/40",
  failed: "bg-destructive border-destructive",
};

export function StepIndicator({ steps }: { steps: PipelineStep[] }) {
  return (
    <div className="flex items-start w-full">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start flex-1 last:flex-none">
          {/* Step circle + label */}
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-4 w-4 rounded-full border-2 shrink-0",
                stepCircleStyles[step.status]
              )}
              aria-label={`${step.label}: ${step.status}`}
            />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {step.label}
            </span>
          </div>

          {/* Connector line (not after last step) */}
          {i < steps.length - 1 && (
            <div
              className={cn(
                "h-0.5 flex-1 mt-[7px] mx-1",
                step.status === "done" ? "bg-success" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
