"use client";

import { Clock, GitPullRequest, Inbox, Zap } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionGroup } from "@/components/ado/SectionGroup";
import { WorkItemRow } from "@/components/ado/WorkItemRow";
import { PRRow } from "@/components/ado/PRRow";
import type { Task, PR } from "@/components/ado/types";

const sectionConfig: Record<
  string,
  { icon: React.ReactNode; colorClass: string; countBg: string }
> = {
  "active-work-active": {
    icon: <Zap className="h-4 w-4" />,
    colorClass: "text-success",
    countBg: "bg-success/10",
  },
  "active-work-review": {
    icon: <GitPullRequest className="h-4 w-4" />,
    colorClass: "text-info",
    countBg: "bg-info/10",
  },
  "active-work-proposed": {
    icon: <Clock className="h-4 w-4" />,
    colorClass: "text-muted-foreground",
    countBg: "bg-muted",
  },
};

export function ActiveWorkView({
  activeByState,
  activePRs,
  myActiveItems,
  collapsedSections,
  toggleSection,
  linkedPRCountMap,
  adoOrg,
  onSelectTask,
}: {
  activeByState: { key: string; label: string; items: Task[] }[];
  activePRs: PR[];
  myActiveItems: Task[];
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;
  linkedPRCountMap: Map<number, number>;
  adoOrg: string;
  onSelectTask: (task: Task) => void;
}) {
  if (myActiveItems.length === 0 && activePRs.length === 0) {
    return <EmptyState icon={Inbox} title="No active work items" />;
  }

  return (
    <div className="divide-y">
      {activeByState.map((group) => {
        const config = sectionConfig[group.key];
        return (
          <SectionGroup
            key={group.key}
            icon={config.icon}
            label={group.label}
            count={group.items.length}
            colorClass={config.colorClass}
            countBg={config.countBg}
            collapsed={collapsedSections.has(group.key)}
            onToggle={() => toggleSection(group.key)}
          >
            {group.items.map((task) => (
              <WorkItemRow
                key={task.id}
                task={task}
                adoOrg={adoOrg}
                showPriorityBorder
                linkedPRCount={linkedPRCountMap.get(task.id)}
                onClick={() => onSelectTask(task)}
              />
            ))}
          </SectionGroup>
        );
      })}

      {activePRs.length > 0 && (
        <SectionGroup
          icon={<GitPullRequest className="h-4 w-4" />}
          label="Active Pull Requests"
          count={activePRs.length}
          colorClass="text-info"
          countBg="bg-info/10"
          collapsed={collapsedSections.has("active-work-prs")}
          onToggle={() => toggleSection("active-work-prs")}
        >
          {activePRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} adoOrg={adoOrg} />
          ))}
        </SectionGroup>
      )}
    </div>
  );
}
