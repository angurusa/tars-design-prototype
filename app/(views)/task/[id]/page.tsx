"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/prototype-context";
import {
  AgentWorkspaceShell,
  type TabDefinition,
} from "@/components/shared/agent-workspace-shell";
import { MockChatPanel, CODING_CHAT_MESSAGES } from "@/components/chat/MockChatPanel";
import { TaskDetailsTab } from "@/components/coding/TaskDetailsTab";
import { CodeChangesTab } from "@/components/coding/CodeChangesTab";
import { PRTab } from "@/components/coding/PRTab";
import { LogsTab } from "@/components/coding/LogsTab";
import { ScorecardTab } from "@/components/coding/ScorecardTab";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { StatusBanner } from "@/components/shared/status-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { mockCodingAgents } from "@/lib/mock-data";
import {
  ClipboardList,
  FileCode,
  GitPullRequest,
  ScrollText,
  BarChart3,
  FileQuestion,
  Pause,
  XCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------
const TAB_KEYS = ["task", "changes", "pr", "logs", "scorecard"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const TABS: TabDefinition[] = [
  { key: "task", label: "Task", icon: ClipboardList },
  { key: "changes", label: "Changes", icon: FileCode },
  { key: "pr", label: "PR", icon: GitPullRequest },
  { key: "logs", label: "Logs", icon: ScrollText },
  { key: "scorecard", label: "Summary", icon: BarChart3 },
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function TaskWorkspacePage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/task/[id]");
  const [activeTab, setActiveTab] = useState<TabKey>("task");

  // Use the first mock coding agent (Bug #9012 - timezone offset)
  const task = mockCodingAgents[0];

  // --- Loading ---
  if (state === "loading") {
    return <SkeletonContentPage />;
  }

  // --- Empty ---
  if (state === "empty") {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Task not found"
        description="This task may have been deleted or abandoned."
      />
    );
  }

  // --- Error ---
  if (state === "error") {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load task</p>
            <p className="text-xs text-muted-foreground">
              Could not fetch task details. The agent may still be initializing.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // --- Populated / Streaming ---
  const isActive = !["done", "failed", "abandoned"].includes(task.status);

  return (
    <AgentWorkspaceShell
      backHref="/coding-agents"
      title={
        <>
          <span className="font-mono">#{task.adoTaskId}</span> {task.taskTitle}
        </>
      }
      subtitle={
        <>
          <span className="font-mono">{task.tool}</span> &middot; {task.status}
          {task.metrics?.costUsd != null && (
            <>
              {" "}
              &middot;{" "}
              <span className="tabular-nums">${task.metrics.costUsd.toFixed(2)}</span>
            </>
          )}
        </>
      }
      headerActions={
        isActive ? (
          <>
            <Button variant="ghost" size="sm" className="text-xs">
              <Pause className="size-3.5 mr-1" />
              Interrupt
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive text-xs">
              <XCircle className="size-3.5 mr-1" />
              Abandon
            </Button>
          </>
        ) : undefined
      }
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as TabKey)}
      chatPanel={
        <MockChatPanel
          messages={CODING_CHAT_MESSAGES}
          emptyStateIcon="bot"
          emptyStateText="The agent is working autonomously. Send a message to interact or provide guidance."
          placeholder="Send a message to the coding agent..."
        />
      }
    >
      {activeTab === "task" && <TaskDetailsTab task={task} />}
      {activeTab === "changes" && <CodeChangesTab />}
      {activeTab === "pr" && (
        <PRTab
          hasPR={!!task.prNumber}
          prId={task.prNumber}
          prUrl={task.prUrl}
          branch={task.branch}
        />
      )}
      {activeTab === "logs" && <LogsTab />}
      {activeTab === "scorecard" && (
        <ScorecardTab
          status={task.status}
          duration={task.duration}
          toolCalls={42}
          buildTestRuns={6}
          filesModified={3}
          cost="$0.84"
        />
      )}
    </AgentWorkspaceShell>
  );
}
