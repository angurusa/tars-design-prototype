"use client";

import { useState, useMemo } from "react";
import { usePrototype } from "@/lib/prototype-context";
import {
  mockAgentRegistry,
  mockApprovalQueue,
} from "@/lib/mock-data";
import type { AgentStatus, ApprovalQueueItem, DepStatusEntry } from "@/lib/types";
import { DEP_LABELS } from "@/lib/types";
import { formatAgentName, DEFAULT_AGENT_TAGS, AGENT_DISPLAY_NAMES } from "@/lib/constants";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusDot } from "@/components/shared/status-dot";
import { ApprovalCard } from "@/components/shared/approval-card";
import { LiveAgentPanel } from "@/components/shared/live-agent-panel";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonDashboard } from "@/components/shared/skeleton-dashboard";
import { StatusBanner } from "@/components/shared/status-banner";
import { CreateAgentDialog } from "@/components/agents/create-agent-dialog";

import {
  CheckCircle,
  ExternalLink,
  Info,
  Loader2,
  Play,
  Sparkles,
  Settings,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AgentEntry = {
  id: string;
  name: string;
  type: string;
  tags: string[];
  source: "built-in" | "custom";
  triggerType: string;
  schedule: string | null;
  status: string;
  enabled: boolean;
  lastRunAt: string | null;
  consecutiveFailures: number;
};

type QueueDepth = Record<string, number>;

const NO_RUN_AGENTS = new Set([
  "CodingAgentDispatcher",
  "ProjectPlannerAgent",
  "QuickNoteProcessorAgent",
  "ValuesEvolutionAgent",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSchedule(schedule: string | null): string {
  if (!schedule || schedule === "--") return "On demand";

  const DAY_LABELS: Record<string, string> = {
    "*": "Daily",
    "1-5": "Weekdays",
    "1": "Mondays",
    "5": "Fridays",
    "1,4": "Mon & Thu",
  };

  const parts = schedule.trim().split(/\s+/);
  if (parts.length !== 5) return schedule;

  const [minute, hour, , , dayOfWeek] = parts;

  if (minute.startsWith("*/")) {
    const mins = parseInt(minute.slice(2), 10);
    return `Every ${mins} min`;
  }
  if (minute === "0" && hour === "*") return "Every hour";

  const days = DAY_LABELS[dayOfWeek] ?? dayOfWeek;
  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const time = `${h12}:${m.toString().padStart(2, "0")} ${period}`;

  return `${days}, ${time}`;
}

function mapStatus(s: string): AgentStatus {
  const map: Record<string, AgentStatus> = {
    idle: "idle",
    running: "running",
    error: "error",
    "waiting-approval": "approval",
    success: "success",
    approval: "approval",
  };
  return map[s] ?? "idle";
}

// ---------------------------------------------------------------------------
// Mock agent entries (derived from mockAgentRegistry)
// ---------------------------------------------------------------------------

const SCHEDULE_MAP: Record<string, string> = {
  "briefing-agent": "30 6 * * 1-5",
  "standup-agent": "35 6 * * 1-5",
  "daily-note-agent": "0 21 * * 1-5",
  "weekly-note-agent": "0 18 * * 5",
  "engage-agent": "0 7 * * 1-5",
  "1on1-prep-agent": "0 6 * * 1",
  "monthly-note-agent": "0 6 1 * *",
  "coding-agent-orchestrator": "--",
};

const NAME_MAP: Record<string, string> = {
  "briefing-agent": "DailyBriefingAgent",
  "standup-agent": "StandupAgent",
  "daily-note-agent": "DailyNotesAgent",
  "weekly-note-agent": "WeeklyNotesAgent",
  "monthly-note-agent": "MonthlyNotesAgent",
  "engage-agent": "EngagePostDraftAgent",
  "1on1-prep-agent": "OneOnOneAgent",
  "coding-agent-orchestrator": "CodingAgentDispatcher",
};

function registryToAgentEntry(r: (typeof mockAgentRegistry)[number], index: number): AgentEntry {
  const mappedName = NAME_MAP[r.name] ?? r.name;
  const tags = DEFAULT_AGENT_TAGS[mappedName] ?? [];
  return {
    id: `agent-${index}`,
    name: mappedName,
    type: "scheduled",
    tags,
    source: "built-in",
    triggerType: r.queue === "on-demand" ? "on-demand" : "scheduled",
    schedule: SCHEDULE_MAP[r.name] ?? null,
    status: r.status === "success" ? "idle" : r.status,
    enabled: r.enabled,
    lastRunAt: r.lastRun,
    consecutiveFailures: r.consecutiveFailures,
  };
}

// Add extra built-in agents not in mock registry
const EXTRA_AGENTS: AgentEntry[] = [
  {
    id: "agent-extra-1",
    name: "ADOSyncAgent",
    type: "scheduled",
    tags: ["system"],
    source: "built-in",
    triggerType: "scheduled",
    schedule: "*/15 * * * *",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-10T08:15:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "agent-extra-2",
    name: "KnowledgeIndexerAgent",
    type: "scheduled",
    tags: ["system"],
    source: "built-in",
    triggerType: "scheduled",
    schedule: "*/30 * * * *",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-10T08:00:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "agent-extra-3",
    name: "HealthCheckAgent",
    type: "scheduled",
    tags: ["system"],
    source: "built-in",
    triggerType: "scheduled",
    schedule: "0 * * * *",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-10T08:00:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "agent-extra-4",
    name: "ProjectPlannerAgent",
    type: "on-demand",
    tags: ["work"],
    source: "built-in",
    triggerType: "on-demand",
    schedule: null,
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-08T14:00:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "agent-extra-5",
    name: "QuickNoteProcessorAgent",
    type: "scheduled",
    tags: ["system"],
    source: "built-in",
    triggerType: "scheduled",
    schedule: "*/5 * * * *",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-10T08:30:00Z",
    consecutiveFailures: 0,
  },
  {
    id: "agent-extra-6",
    name: "ValuesEvolutionAgent",
    type: "scheduled",
    tags: ["system"],
    source: "built-in",
    triggerType: "scheduled",
    schedule: "0 0 * * 0",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-09T00:00:00Z",
    consecutiveFailures: 0,
  },
];

// Mock custom agents
const CUSTOM_AGENTS: AgentEntry[] = [
  {
    id: "custom-1",
    name: "PR Age Alert",
    type: "scheduled",
    tags: ["monitoring"],
    source: "custom",
    triggerType: "scheduled",
    schedule: "0 9 * * 1-5",
    status: "idle",
    enabled: true,
    lastRunAt: "2026-03-10T09:00:00Z",
    consecutiveFailures: 0,
  },
];

// Mock queue depths
const mockQueueDepth: QueueDepth = {
  pipeline: 0,
  coding: 1,
  indexer: 0,
  sync: 0,
};

// Mock dependencies
const mockDeps: DepStatusEntry[] = [
  { name: "workiq", status: "healthy", message: "Connected", fixCommand: null, checkedAt: "2026-03-10T08:30:00Z" },
  { name: "npm-token", status: "healthy", message: "Valid, expires in 3h 42m", fixCommand: null, checkedAt: "2026-03-10T08:30:00Z" },
  { name: "az-login", status: "healthy", message: "Authenticated", fixCommand: null, checkedAt: "2026-03-10T08:30:00Z" },
  { name: "redis", status: "healthy", message: "Connected, 0 pending", fixCommand: null, checkedAt: "2026-03-10T08:30:00Z" },
  { name: "postgres", status: "healthy", message: "Connected, 23 tables", fixCommand: null, checkedAt: "2026-03-10T08:30:00Z" },
];

// ---------------------------------------------------------------------------
// Dependencies Health Card
// ---------------------------------------------------------------------------

const ALL_DEP_NAMES = Object.keys(DEP_LABELS);

function DependenciesCard({ deps }: { deps: DepStatusEntry[] }) {
  const [expandedDep, setExpandedDep] = useState<string | null>(null);
  const depMap = new Map(deps.map((d) => [d.name, d]));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Dependencies</h2>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <CheckCircle className="h-3 w-3" />
            Check Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ALL_DEP_NAMES.map((name) => {
            const dep = depMap.get(name);
            const status = dep?.status ?? "unknown";
            const dotColor =
              status === "healthy"
                ? "bg-success"
                : status === "degraded"
                  ? "bg-warning"
                  : status === "down"
                    ? "bg-destructive"
                    : "bg-muted-foreground/30";
            const isExpanded = expandedDep === name;
            const hasProblem = status === "down" || status === "degraded";

            return (
              <div key={name}>
                <button
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 w-full text-left transition-colors ${
                    hasProblem
                      ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setExpandedDep(isExpanded ? null : name)}
                >
                  <span className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${dotColor}`} />
                  <span className="text-sm truncate">{DEP_LABELS[name] ?? name}</span>
                </button>
                {isExpanded && dep && (
                  <div className="mt-1 rounded-md border bg-muted/30 px-3 py-2 text-xs space-y-1">
                    <p className="text-foreground/70">{dep.message}</p>
                    {dep.fixCommand && (
                      <code className="block bg-muted px-2 py-1 rounded text-[11px]">
                        {dep.fixCommand}
                      </code>
                    )}
                    {dep.checkedAt && (
                      <p className="text-muted-foreground/50">
                        Checked:{" "}
                        {new Date(dep.checkedAt).toLocaleString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AgentsPage() {
  const { getPageState } = usePrototype();
  const pageState = getPageState("/agents");

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ApprovalQueueItem | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("all");

  // Show live panel with mock data
  const [showLivePanel, setShowLivePanel] = useState(false);

  // Build agent list from mock registry + extras
  const allAgents = useMemo(() => {
    const fromRegistry = mockAgentRegistry.map(registryToAgentEntry);
    return [...fromRegistry, ...EXTRA_AGENTS, ...CUSTOM_AGENTS];
  }, []);

  const builtInAgents = useMemo(() => allAgents.filter((a) => a.source !== "custom"), [allAgents]);
  const customAgents = useMemo(() => allAgents.filter((a) => a.source === "custom"), [allAgents]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    builtInAgents.forEach((a) => (a.tags ?? []).forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [builtInAgents]);

  const filteredAgents = useMemo(
    () =>
      builtInAgents
        .filter((a) => !activeTag || (a.tags ?? []).includes(activeTag))
        .sort((a, b) => formatAgentName(a.name).localeCompare(formatAgentName(b.name))),
    [builtInAgents, activeTag]
  );

  const approvalQueue = mockApprovalQueue;

  const agentFilterOptions = useMemo(() => {
    const unique = Array.from(
      new Set(approvalQueue.map((item) => item.agentName).filter(Boolean))
    ) as string[];
    return unique
      .map((name) => ({ value: name, label: formatAgentName(name) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [approvalQueue]);

  const filteredQueue = useMemo(
    () =>
      selectedAgent === "all"
        ? approvalQueue
        : approvalQueue.filter((item) => item.agentName === selectedAgent),
    [approvalQueue, selectedAgent]
  );

  const queueDepth = mockQueueDepth;
  const depthEntries = Object.entries(queueDepth);

  // ---------------------------------------------------------------------------
  // State rendering
  // ---------------------------------------------------------------------------

  if (pageState === "loading") {
    return <SkeletonDashboard />;
  }

  if (pageState === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Agents" />
        <EmptyState
          icon={Settings}
          title="No agents configured"
          description="Agents are not loaded. Check the agent platform configuration."
        />
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Agents" />
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load agents</p>
            <p className="text-sm text-muted-foreground">
              Could not connect to the agent platform. Check that Redis and the agent service are running.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated / streaming
  return (
    <div className="space-y-6">
      <PageHeader title="Agents" />

      {/* Queue Status */}
      {depthEntries.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {depthEntries.map(([name, count]) => {
            const meta: Record<string, { label: string; tip: string }> = {
              pipeline: {
                label: "Agents",
                tip: "Scheduled agents (briefing, standup, notes) waiting to run or currently running",
              },
              coding: {
                label: "Coding",
                tip: "Coding agent tasks working on ADO items in isolated git worktrees",
              },
              indexer: {
                label: "Indexer",
                tip: "Knowledge indexing jobs that embed records for semantic search",
              },
              sync: {
                label: "Sync",
                tip: "ADO sync jobs that refresh work items and pull requests from Azure DevOps",
              },
            };
            const { label, tip } = meta[name] ?? { label: name, tip: "" };
            return (
              <div
                key={name}
                className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-colors duration-300 ${
                  count > 0 ? "border-warning/30 bg-warning/5" : ""
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <Tooltip>
                    <TooltipTrigger className="cursor-help">
                      <Info className="h-3.5 w-3.5 text-muted-foreground/50" />
                    </TooltipTrigger>
                    <TooltipContent>{tip}</TooltipContent>
                  </Tooltip>
                </div>
                <span
                  className={`text-lg font-semibold tabular-nums ${count > 0 ? "text-warning" : "text-muted-foreground/50"}`}
                >
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Dependencies Health */}
      <DependenciesCard deps={mockDeps} />

      {/* Built-in Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Built-in Agents
              <Badge variant="secondary" className="ml-2 text-xs">
                {filteredAgents.length}
              </Badge>
            </h2>
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge
                className="cursor-pointer"
                variant={activeTag === null ? "default" : "outline"}
                onClick={() => setActiveTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  className="cursor-pointer"
                  variant={activeTag === tag ? "default" : "outline"}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Header row */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <span>Agent</span>
            <span className="w-36">Schedule</span>
            <span className="w-44">Last Run</span>
            <span className="w-20">Failures</span>
            <span className="w-12 text-center">Active</span>
            <span className="w-16 text-center">Actions</span>
          </div>
          <div className="grid gap-2">
            {filteredAgents.map((agent) => (
              <div
                key={agent.name}
                className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 sm:gap-4 rounded-lg border p-3 transition-all duration-300 ${
                  agent.status === "running"
                    ? "border-primary/30 bg-primary/5"
                    : "hover:border-border/80 hover:bg-muted/30"
                }`}
              >
                {/* Name + status + tags */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={agent.status === "running" ? "animate-pulse" : ""}>
                    <StatusDot status={mapStatus(agent.status)} />
                  </div>
                  <span className="font-medium text-sm truncate">
                    {formatAgentName(agent.name)}
                  </span>
                  {(agent.tags ?? []).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] shrink-0">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Schedule */}
                <span className="w-36 text-sm text-muted-foreground">
                  <span className="sm:hidden text-xs uppercase tracking-wider mr-2">Schedule:</span>
                  {formatSchedule(agent.schedule)}
                </span>

                {/* Last Run */}
                <span className="w-44 text-sm text-muted-foreground">
                  <span className="sm:hidden text-xs uppercase tracking-wider mr-2">Last Run:</span>
                  {agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleString() : "Never"}
                </span>

                {/* Failures */}
                <span className="w-20">
                  <span className="sm:hidden text-xs text-muted-foreground uppercase tracking-wider mr-2">
                    Failures:
                  </span>
                  {agent.consecutiveFailures > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      {agent.consecutiveFailures}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">0</span>
                  )}
                </span>

                {/* Toggle */}
                <div className="w-12 flex justify-center">
                  <Switch checked={agent.enabled} onCheckedChange={() => {}} />
                </div>

                {/* Actions */}
                <div className="w-16 flex justify-center gap-1">
                  {agent.name === "CodingAgentDispatcher" && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button variant="outline" size="icon-sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <TooltipContent>View Coding Agents</TooltipContent>
                    </Tooltip>
                  )}
                  {agent.name === "ProjectPlannerAgent" && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button variant="outline" size="icon-sm">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        }
                      />
                      <TooltipContent>View Project Planner</TooltipContent>
                    </Tooltip>
                  )}
                  {!NO_RUN_AGENTS.has(agent.name) && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="transition-transform hover:scale-110 active:scale-95"
                            onClick={() => setShowLivePanel(true)}
                            disabled={agent.status === "running"}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <TooltipContent>Run {formatAgentName(agent.name)} now</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Custom Agents
              <Badge variant="secondary" className="ml-2 text-xs">
                {customAgents.length}
              </Badge>
            </h2>
            <CreateAgentDialog onCreated={() => {}} />
          </div>
        </CardHeader>
        <CardContent>
          {customAgents.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No custom agents yet"
              description="Describe what you want an agent to do \u2014 TARS will draft the configuration for you."
            />
          ) : (
            <>
              <div className="hidden sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 px-3 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <span>Agent</span>
                <span className="w-36">Schedule</span>
                <span className="w-44">Last Run</span>
                <span className="w-20">Failures</span>
                <span className="w-12 text-center">Active</span>
                <span className="w-16 text-center">Actions</span>
              </div>
              <div className="grid gap-2">
                {customAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-3 sm:gap-4 rounded-lg border p-3 transition-all duration-300 ${
                      agent.status === "running"
                        ? "border-primary/30 bg-primary/5"
                        : "border-violet-500/20 hover:border-violet-500/40 hover:bg-muted/30"
                    }`}
                  >
                    {/* Name + tags */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={agent.status === "running" ? "animate-pulse" : ""}>
                        <StatusDot status={mapStatus(agent.status)} />
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-sm">{agent.name}</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {(agent.tags ?? []).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule */}
                    <span className="w-36 text-sm text-muted-foreground">
                      {formatSchedule(agent.schedule)}
                    </span>

                    {/* Last Run */}
                    <span className="w-44 text-sm text-muted-foreground">
                      {agent.lastRunAt ? new Date(agent.lastRunAt).toLocaleString() : "Never"}
                    </span>

                    {/* Failures */}
                    <span className="w-20">
                      {agent.consecutiveFailures > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {agent.consecutiveFailures}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">0</span>
                      )}
                    </span>

                    {/* Toggle */}
                    <div className="w-12 flex justify-center">
                      <Switch checked={agent.enabled} onCheckedChange={() => {}} />
                    </div>

                    {/* Actions */}
                    <div className="w-16 flex justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon-sm"
                              className="transition-transform hover:scale-110 active:scale-95"
                              onClick={() => setShowLivePanel(true)}
                              disabled={agent.status === "running"}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <TooltipContent>Run now</TooltipContent>
                      </Tooltip>
                      <CreateAgentDialog editAgentId={agent.id} onCreated={() => {}} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Live Agent Output */}
      {showLivePanel && (
        <LiveAgentPanel
          agentName="Daily Briefing"
          steps={[
            { label: "Collecting data sources", status: "done" },
            { label: "Analyzing work items", status: "done" },
            { label: "Generating briefing", status: "active" },
            { label: "Saving draft", status: "pending" },
          ]}
          isStreaming={true}
          error={null}
          startedAt={Date.now() - 45000}
          onClose={() => setShowLivePanel(false)}
        />
      )}

      {/* Recent Outputs */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold tracking-tight">
            Recent Outputs
            {approvalQueue.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {approvalQueue.length}
              </Badge>
            )}
          </h2>
          {agentFilterOptions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                className={`cursor-pointer transition-colors ${
                  selectedAgent === "all"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                variant={selectedAgent === "all" ? "default" : "outline"}
                onClick={() => setSelectedAgent("all")}
              >
                All
              </Badge>
              {agentFilterOptions.map(({ value, label }) => (
                <Badge
                  key={value}
                  className={`cursor-pointer transition-colors ${
                    selectedAgent === value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  variant={selectedAgent === value ? "default" : "outline"}
                  onClick={() => setSelectedAgent(value)}
                >
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredQueue.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              title="No recent outputs"
              description="Agent outputs will appear here after they run."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredQueue.map((item) => (
                <ApprovalCard
                  key={item.id}
                  item={item}
                  displayName={formatAgentName(item.agentName)}
                  onPreview={() => setPreviewItem(item)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Sheet */}
      <Sheet open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <SheetContent className="!max-w-2xl w-full overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-lg tracking-tight">
              {formatAgentName(previewItem?.agentName)}
            </SheetTitle>
            <span className="text-xs text-muted-foreground">
              {previewItem?.timestamp
                ? new Date(previewItem.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </span>
          </SheetHeader>
          <div className="px-4 py-6 flex-1 overflow-y-auto">
            <MarkdownRenderer content={previewItem?.content ?? previewItem?.preview ?? ""} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
