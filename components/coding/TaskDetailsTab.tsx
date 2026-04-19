"use client";

import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/shared/status-dot";
import { StepIndicator } from "@/components/shared/step-indicator";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { Progress } from "@/components/ui/progress";
import { GitBranch, Clock, AlertCircle } from "lucide-react";
import type { AgentStatus, PipelineStep, CodingAgentTask } from "@/lib/types";

// ---------------------------------------------------------------------------
// Status maps
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<string, AgentStatus> = {
  queued: "idle",
  "setting-up": "running",
  analyzing: "running",
  implementing: "running",
  testing: "running",
  "creating-pr": "running",
  "pr-submitted": "warning",
  blocked: "error",
  failed: "error",
  done: "success",
  abandoned: "idle",
};

const STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  "setting-up": "Setting Up",
  analyzing: "Analyzing",
  implementing: "Implementing",
  testing: "Testing",
  "creating-pr": "Creating PR",
  "pr-submitted": "PR Submitted",
  blocked: "Blocked",
  failed: "Failed",
  done: "Done",
  abandoned: "Abandoned",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function TaskDetailsTab({ task }: { task: CodingAgentTask }) {
  const agentStatus = STATUS_MAP[task.status] ?? "idle";
  const isActive = ["setting-up", "analyzing", "implementing", "testing", "creating-pr"].includes(
    task.status,
  );
  const progress = Math.round(
    (task.steps.filter((s: PipelineStep) => s.status === "done").length / task.steps.length) * 100,
  );

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto px-6 py-5 space-y-6">
        {/* Status header */}
        <div className="flex items-center gap-3">
          <StatusDot status={agentStatus} />
          <div className="min-w-0">
            <span className="text-sm font-semibold">
              {STATUS_LABELS[task.status] ?? task.status}
            </span>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {task.taskType ?? "code-change"}
          </Badge>
          <div className="flex-1" />
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {task.duration}
          </div>
        </div>

        {/* Step indicator */}
        <StepIndicator steps={task.steps} />

        {/* Progress bar (active only) */}
        {isActive && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Error banner */}
        {task.error && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 px-3 py-2">
            <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{task.error}</p>
          </div>
        )}

        {/* Task info */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">
              ADO Task #{task.adoTaskId}
            </h3>
          </div>
          <p className="text-sm font-medium text-foreground">{task.taskTitle}</p>
          {task.taskDescription && (
            <div className="text-muted-foreground">
              <MarkdownRenderer content={task.taskDescription} size="sm" />
            </div>
          )}
        </div>

        {/* Branch */}
        {task.branch && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitBranch className="size-3" />
            <span className="font-mono">{task.branch}</span>
          </div>
        )}
      </div>
    </div>
  );
}
