"use client";

import { AlertCircle, CheckCircle2, Clock, Zap } from "lucide-react";
import { SectionGroup } from "@/components/ado/SectionGroup";
import { WorkItemRow } from "@/components/ado/WorkItemRow";
import { PRRow } from "@/components/ado/PRRow";
import type { Task, PR } from "@/components/ado/types";

export function AttentionView({
  blockedItems,
  highPriorityActive,
  staleDraftPRs,
  staleItems,
  hasAttentionItems,
  activeCount,
  openPRsCount,
  syncTimeAgo,
  collapsedSections,
  toggleSection,
  linkedPRCountMap,
  adoOrg,
  onSelectTask,
}: {
  blockedItems: Task[];
  highPriorityActive: Task[];
  staleDraftPRs: PR[];
  staleItems: Task[];
  hasAttentionItems: boolean;
  activeCount: number;
  openPRsCount: number;
  syncTimeAgo: string | null;
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;
  linkedPRCountMap: Map<number, number>;
  adoOrg: string;
  onSelectTask: (task: Task) => void;
}) {
  if (!hasAttentionItems) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
        <p className="font-medium">All clear</p>
        <p className="text-sm mt-1">Nothing needs your attention right now.</p>
        <div className="inline-flex items-center gap-4 mt-4 rounded-lg border bg-card px-5 py-3 text-sm">
          <div className="text-center">
            <div className="text-lg font-bold tracking-tight text-warning">{activeCount}</div>
            <div className="text-xs text-muted-foreground">active items</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-lg font-bold tracking-tight text-info">{openPRsCount}</div>
            <div className="text-xs text-muted-foreground">open PRs</div>
          </div>
          {syncTimeAgo && (
            <>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold tracking-tight text-success">{syncTimeAgo}</div>
                <div className="text-xs text-muted-foreground">last sync</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {blockedItems.length > 0 && (
        <SectionGroup
          icon={<AlertCircle className="h-4 w-4" />}
          label="Blocked"
          count={blockedItems.length}
          colorClass="text-destructive"
          countBg="bg-destructive/10"
          collapsed={collapsedSections.has("blocked")}
          onToggle={() => toggleSection("blocked")}
        >
          {blockedItems.map((task) => (
            <WorkItemRow
              key={task.id}
              task={task}
              adoOrg={adoOrg}
              linkedPRCount={linkedPRCountMap.get(task.id)}
              onClick={() => onSelectTask(task)}
            />
          ))}
        </SectionGroup>
      )}

      {highPriorityActive.length > 0 && (
        <SectionGroup
          icon={<Zap className="h-4 w-4" />}
          label="High Priority Active"
          count={highPriorityActive.length}
          colorClass="text-warning"
          countBg="bg-warning/10"
          collapsed={collapsedSections.has("high-priority")}
          onToggle={() => toggleSection("high-priority")}
        >
          {highPriorityActive.map((task) => (
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
      )}

      {staleDraftPRs.length > 0 && (
        <SectionGroup
          icon={<Clock className="h-4 w-4" />}
          label="Stale Draft PRs"
          count={staleDraftPRs.length}
          colorClass="text-warning"
          countBg="bg-warning/10"
          collapsed={collapsedSections.has("stale-prs")}
          onToggle={() => toggleSection("stale-prs")}
        >
          {staleDraftPRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} adoOrg={adoOrg} compact />
          ))}
        </SectionGroup>
      )}

      {staleItems.length > 0 && (
        <SectionGroup
          icon={<Clock className="h-4 w-4" />}
          label="Stale Items"
          count={staleItems.length}
          colorClass="text-muted-foreground"
          countBg="bg-muted"
          collapsed={collapsedSections.has("stale-items")}
          onToggle={() => toggleSection("stale-items")}
        >
          {staleItems.map((task) => (
            <WorkItemRow
              key={task.id}
              task={task}
              adoOrg={adoOrg}
              linkedPRCount={linkedPRCountMap.get(task.id)}
              onClick={() => onSelectTask(task)}
            />
          ))}
        </SectionGroup>
      )}
    </div>
  );
}
