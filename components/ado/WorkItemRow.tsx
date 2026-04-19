"use client";

import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { GitBranch } from "lucide-react";
import { AgeBadge } from "@/components/ado/AgeBadge";
import type { Task } from "@/components/ado/types";
import { stateBadgeVariant } from "@/components/ado/types";

export function WorkItemRow({
  task,
  adoOrg: _adoOrg,
  showState,
  showPriorityBorder,
  linkedPRCount,
  onClick,
}: {
  task: Task;
  adoOrg: string;
  showState?: boolean;
  showPriorityBorder?: boolean;
  linkedPRCount?: number;
  onClick: () => void;
}) {
  const borderCls = showPriorityBorder
    ? task.priority === 1
      ? "border-l-[3px] border-l-destructive pl-2.5"
      : task.priority === 2
        ? "border-l-[3px] border-l-warning pl-2.5"
        : "border-l-[3px] border-l-transparent pl-2.5"
    : "";
  const isMuted = showState && (task.state === "New" || task.state === "Proposed");
  return (
    <div
      role="row"
      tabIndex={0}
      className={`flex items-center gap-2.5 py-1.5 px-1 cursor-pointer rounded-sm hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${borderCls} ${isMuted ? "opacity-70" : ""}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <span role="gridcell" className="text-xs text-muted-foreground font-mono w-[72px] shrink-0">
        #{task.id}
      </span>
      <span role="gridcell" className="shrink-0">
        <Badge variant="outline" className="text-[10px] px-1.5">
          {task.type}
        </Badge>
      </span>
      <span role="gridcell" className="text-sm font-medium truncate flex-1 min-w-0">
        {task.title}
      </span>
      {showState && (
        <span role="gridcell" className="shrink-0 w-[80px]">
          <Badge variant={stateBadgeVariant[task.state] ?? "outline"}>{task.state}</Badge>
        </span>
      )}
      <span
        role="gridcell"
        className="text-xs text-muted-foreground shrink-0 hidden sm:inline w-[100px] truncate text-right"
      >
        {task.project}
      </span>
      <span role="gridcell" className="shrink-0">
        <PriorityBadge priority={(task.priority || 4) as 1 | 2 | 3 | 4} />
      </span>
      <span role="gridcell" className="shrink-0">
        <AgeBadge days={task.ageDays} />
      </span>
      {(linkedPRCount ?? 0) > 0 && (
        <span role="gridcell" className="shrink-0">
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 bg-info/15 text-info border-transparent"
          >
            <GitBranch className="h-2.5 w-2.5 mr-0.5" />
            {linkedPRCount}
          </Badge>
        </span>
      )}
    </div>
  );
}
