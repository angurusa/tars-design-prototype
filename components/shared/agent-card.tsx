"use client";

import type { CodingAgentTask, AgentStatus } from "@/lib/types";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusDot } from "@/components/shared/status-dot";
import { StepIndicator } from "@/components/shared/step-indicator";
import { GitBranch, ExternalLink } from "lucide-react";

// Map CodingAgentStatus to AgentStatus for StatusDot
const statusMap: Record<string, AgentStatus> = {
  queued: "idle",
  "setting-up": "running",
  analyzing: "running",
  implementing: "running",
  testing: "running",
  "creating-pr": "running",
  "pr-submitted": "warning",
  blocked: "error",
  done: "success",
  failed: "error",
  abandoned: "idle",
};

const ACTIVE_STATUSES = new Set([
  "queued", "setting-up", "analyzing", "implementing", "testing", "creating-pr",
]);

interface AgentCardProps {
  agent: CodingAgentTask;
}

export function AgentCard({ agent }: AgentCardProps) {
  const agentStatus = statusMap[agent.status] ?? "idle";
  const isActive = ACTIVE_STATUSES.has(agent.status);

  return (
    <Card variant="interactive">
      <CardHeader>
        {/* Header row */}
        <div className="flex items-center gap-2">
          <StatusDot status={agentStatus} />
          <span className="font-mono text-xs text-muted-foreground">
            #{agent.adoTaskId}
          </span>
          <span className="text-sm font-medium truncate">
            {agent.taskTitle}
          </span>
        </div>
        {/* Subheader */}
        <div className="text-xs text-muted-foreground">
          {agent.org} &middot; {agent.tool}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Step indicator */}
        <StepIndicator steps={agent.steps} />

        {/* Running state: progress bar */}
        {isActive && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{agent.progress}%</span>
              <span>{agent.duration}</span>
            </div>
            <Progress value={agent.progress} />
          </div>
        )}

        {/* PR submitted state */}
        {agent.status === "pr-submitted" && agent.prNumber && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">PR #{agent.prNumber}</span>
            <span className="text-muted-foreground">(Draft)</span>
          </div>
        )}

        {/* Branch name */}
        {agent.branch && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <GitBranch className="size-3" />
            <span className="font-mono truncate">{agent.branch}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2">
        {/* Running state buttons */}
        {isActive && (
          <Button variant="outline" size="sm">
            View Workspace
          </Button>
        )}

        {/* PR submitted state buttons */}
        {agent.status === "pr-submitted" && agent.prUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              window.open(agent.prUrl, "_blank");
            }}
          >
            <ExternalLink data-icon="inline-start" />
            Open PR
          </Button>
        )}

        {/* Done state buttons */}
        {agent.status === "done" && (
          <Button variant="outline" size="sm">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
