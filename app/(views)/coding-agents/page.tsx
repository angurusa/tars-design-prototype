"use client";

import { useState, useMemo } from "react";
import { usePrototype } from "@/lib/prototype-context";
import { mockCodingAgents } from "@/lib/mock-data";
import type { CodingAgentTask } from "@/lib/types";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentCard } from "@/components/shared/agent-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ViewToggle } from "@/components/shared/view-toggle";
import { SkeletonDashboard } from "@/components/shared/skeleton-dashboard";
import { StatusBanner } from "@/components/shared/status-banner";
import { PageHeader } from "@/components/shared/page-header";

import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Bot,
  Activity,
  Clock,
  DollarSign,
  TrendingUp,
  CalendarDays,
  Percent,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types & Helpers
// ---------------------------------------------------------------------------

type CodingAgentStats = {
  totalRuns: number;
  successRate: number;
  avgCostUsd: number | null;
  totalCostUsd: number | null;
  avgDurationMs: number | null;
  runsThisWeek: number;
};

function formatMs(ms: number | null): string {
  if (ms == null) return "\u2014";
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

function formatCost(usd: number | null): string {
  if (usd == null) return "\u2014";
  return `$${usd.toFixed(2)}`;
}

// Mock stats
const mockStats: CodingAgentStats = {
  totalRuns: 12,
  successRate: 83,
  avgCostUsd: 1.42,
  totalCostUsd: 17.04,
  avgDurationMs: 7_200_000,
  runsThisWeek: 4,
};

// ---------------------------------------------------------------------------
// Stats Row
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-semibold leading-tight tracking-tight tabular-nums font-mono">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsRow({ stats }: { stats: CodingAgentStats | null }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard icon={Activity} label="Total Runs" value={stats ? String(stats.totalRuns) : "\u2014"} />
      <StatCard icon={Percent} label="Success Rate" value={stats ? `${stats.successRate}%` : "\u2014"} />
      <StatCard icon={DollarSign} label="Avg Cost" value={stats ? formatCost(stats.avgCostUsd) : "\u2014"} />
      <StatCard icon={TrendingUp} label="Total Cost" value={stats ? formatCost(stats.totalCostUsd) : "\u2014"} />
      <StatCard icon={Clock} label="Avg Duration" value={stats ? formatMs(stats.avgDurationMs) : "\u2014"} />
      <StatCard icon={CalendarDays} label="This Week" value={stats ? String(stats.runsThisWeek) : "\u2014"} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CodingAgentsPage() {
  const { getPageState } = usePrototype();
  const pageState = getPageState("/coding-agents");

  const [view, setView] = useState<"list" | "cards">("list");

  const agents = mockCodingAgents;

  const activeAgents = useMemo(
    () => agents.filter((a) => !["done", "failed", "abandoned"].includes(a.status)),
    [agents]
  );
  const completedAgents = useMemo(
    () => agents.filter((a) => a.status === "done"),
    [agents]
  );
  const failedAgents = useMemo(
    () => agents.filter((a) => a.status === "failed" || a.status === "abandoned"),
    [agents]
  );

  // ---------------------------------------------------------------------------
  // State rendering
  // ---------------------------------------------------------------------------

  if (pageState === "loading") {
    return <SkeletonDashboard />;
  }

  if (pageState === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Coding Agents" />
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description='Go to Work Items and click "Work on this" to start one.'
          action={{ label: "Go to Work Items", onClick: () => {} }}
        />
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Coding Agents" />
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load coding agents</p>
            <p className="text-sm text-muted-foreground">
              Could not connect to the agent platform. Check that the agent service is running.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated / streaming

  const agentRow = (agent: CodingAgentTask, icon: React.ReactNode, badge: React.ReactNode) => (
    <Card key={agent.id} variant="interactive" className="px-4 py-2.5">
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-mono text-xs text-muted-foreground">#{agent.adoTaskId}</span>
        <span className="text-sm truncate flex-1">{agent.taskTitle}</span>
        {badge}
      </div>
    </Card>
  );

  const completedRow = (agent: CodingAgentTask) =>
    agentRow(
      agent,
      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />,
      agent.prNumber ? (
        <Badge variant="secondary" className="bg-success/15 text-success border-transparent">
          PR #{agent.prNumber}
        </Badge>
      ) : null
    );

  const failedRow = (agent: CodingAgentTask) =>
    agentRow(
      agent,
      agent.status === "failed" ? (
        <XCircle className="h-4 w-4 text-destructive shrink-0" />
      ) : (
        <AlertCircle className="h-4 w-4 text-muted-foreground shrink-0" />
      ),
      <Badge variant="secondary" className="text-xs">
        {agent.status}
      </Badge>
    );

  const agentGrid = (items: CodingAgentTask[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {items.map((agent) => (
        <div key={agent.id} className="cursor-pointer">
          <AgentCard agent={agent} />
        </div>
      ))}
    </div>
  );

  const activeEmptyState = (
    <EmptyState
      icon={Bot}
      title="No active agents"
      description='Go to Work Items and click "Work on this" to start one.'
      action={{ label: "Go to Work Items", onClick: () => {} }}
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coding Agents"
        actions={
          <Badge variant="secondary">
            {activeAgents.length} Active &middot; {completedAgents.length} Done
          </Badge>
        }
      />

      <StatsRow stats={mockStats} />

      <Tabs defaultValue="active">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active ({activeAgents.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedAgents.length})</TabsTrigger>
            {failedAgents.length > 0 && (
              <TabsTrigger value="failed">Failed ({failedAgents.length})</TabsTrigger>
            )}
            <TabsTrigger value="all">All ({agents.length})</TabsTrigger>
          </TabsList>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <TabsContent value="all" className="mt-4 space-y-6">
          {agents.length === 0 ? (
            <EmptyState
              icon={Bot}
              title="No agents yet"
              description='Go to Work Items and click "Work on this" to start one.'
              action={{ label: "Go to Work Items", onClick: () => {} }}
            />
          ) : view === "cards" ? (
            agentGrid(agents)
          ) : (
            <>
              {activeAgents.length > 0 && agentGrid(activeAgents)}
              {completedAgents.length > 0 && (
                <div className="space-y-2">
                  {activeAgents.length > 0 && (
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                      Completed
                    </h3>
                  )}
                  {completedAgents.map(completedRow)}
                </div>
              )}
              {failedAgents.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground">
                    Failed / Abandoned
                  </h3>
                  {failedAgents.map(failedRow)}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {activeAgents.length === 0 ? activeEmptyState : agentGrid(activeAgents)}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 space-y-2">
          {completedAgents.length === 0 ? (
            <EmptyState icon={CheckCircle2} title="No completed agents" />
          ) : view === "cards" ? (
            agentGrid(completedAgents)
          ) : (
            completedAgents.map(completedRow)
          )}
        </TabsContent>

        <TabsContent value="failed" className="mt-4 space-y-2">
          {failedAgents.length === 0 ? (
            <EmptyState icon={XCircle} title="No failed agents" />
          ) : view === "cards" ? (
            agentGrid(failedAgents)
          ) : (
            failedAgents.map(failedRow)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
