"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/prototype-context";
import {
  AgentWorkspaceShell,
  type TabDefinition,
} from "@/components/shared/agent-workspace-shell";
import { MockChatPanel, PLANNER_CHAT_MESSAGES } from "@/components/chat/MockChatPanel";
import { OnePagerTab } from "@/components/planner/OnePagerTab";
import { WorkItemsTab } from "@/components/planner/WorkItemsTab";
import { LogsTab } from "@/components/coding/LogsTab";
import { ScorecardTab } from "@/components/coding/ScorecardTab";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { StatusBanner } from "@/components/shared/status-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText, ListTree, ScrollText, BarChart3, FolderOpen } from "lucide-react";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TAB_KEYS = ["one-pager", "work-items", "logs", "scorecard"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: TabDefinition[] = [
  { key: "one-pager", label: "One-Pager", icon: FileText },
  {
    key: "work-items",
    label: "Work Items",
    icon: ListTree,
    badge: (
      <span className="text-[10px] bg-muted px-1.5 rounded-full ml-0.5">9</span>
    ),
  },
  { key: "logs", label: "Logs", icon: ScrollText },
  { key: "scorecard", label: "Summary", icon: BarChart3 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProjectWorkspacePage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/project-planner/[id]");
  const [activeTab, setActiveTab] = useState<TabKey>("one-pager");

  // --- Loading ---
  if (state === "loading") {
    return <SkeletonContentPage />;
  }

  // --- Empty ---
  if (state === "empty") {
    return (
      <EmptyState
        icon={FolderOpen}
        title="Project not found"
        description="This project may have been deleted."
      />
    );
  }

  // --- Error ---
  if (state === "error") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load project</p>
            <p className="text-xs text-muted-foreground">
              Could not connect to the database. Try refreshing the page.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // --- Populated / Streaming ---
  return (
    <AgentWorkspaceShell
      backHref="/project-planner"
      title="Notification Service Redesign"
      subtitle={
        <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded text-[11px]">
          contoso / telemetry-platform
        </span>
      }
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as TabKey)}
      chatPanel={
        <MockChatPanel
          messages={PLANNER_CHAT_MESSAGES}
          emptyStateText="Describe your project and I'll plan it -- one-pager, work items, and ADO push."
          placeholder="Describe your project, ask for changes, or say 'push to ADO'..."
        />
      }
    >
      {activeTab === "one-pager" && <OnePagerTab />}
      {activeTab === "work-items" && <WorkItemsTab />}
      {activeTab === "logs" && <LogsTab />}
      {activeTab === "scorecard" && (
        <ScorecardTab
          status="active"
          duration="12m"
          toolCalls={18}
          buildTestRuns={0}
          filesModified={0}
          cost="$0.32"
        />
      )}
    </AgentWorkspaceShell>
  );
}
