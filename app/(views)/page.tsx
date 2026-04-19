"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/prototype-context";
import { StatusBanner } from "@/components/shared/status-banner";
import { SkeletonDashboard } from "@/components/shared/skeleton-dashboard";
import { EmptyState } from "@/components/shared/empty-state";
import { AgentCard } from "@/components/shared/agent-card";
import {
  mockBriefing,
  mockCodingAgents,
  mockQuickNotes,
  mockAgentRegistry,
  mockFocusItems,
} from "@/lib/mock-data";
import { formatDisplayDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  CircleDot,
  Code2,
  FileText,
  LayoutDashboard,
  Loader2,
  NotebookPen,
  RefreshCw,
  Zap,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatAgentName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace("Agent", "")
    .trim();
}

// ---------------------------------------------------------------------------
// Skeleton helper
// ---------------------------------------------------------------------------

function InlineSkeleton({ lines = 3 }: { lines?: number }) {
  const widths = ["w-[85%]", "w-[70%]", "w-[55%]", "w-[40%]", "w-[65%]"];
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded bg-muted animate-pulse ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const USER_NAME = "Andi";

export default function DashboardPage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/");

  // Loading state
  if (state === "loading") {
    return <SkeletonDashboard />;
  }

  // Empty state
  if (state === "empty") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {getGreeting()}, {USER_NAME}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDisplayDate()}
          </p>
        </div>
        <EmptyState
          icon={LayoutDashboard}
          title="Nothing here yet"
          description="Run your first briefing to populate the dashboard with focus items and activity."
          action={{ label: "Generate Briefing", onClick: () => {} }}
        />
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {getGreeting()}, {USER_NAME}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDisplayDate()}
          </p>
        </div>
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">
              Failed to load dashboard data
            </p>
            <p className="text-xs text-muted-foreground">
              Could not connect to the backend services. Ensure Docker
              containers are running.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated + streaming
  const actionItems = mockBriefing.actionItems;
  const topItems = actionItems.slice(0, 5);

  const activeCoding = mockCodingAgents.filter(
    (t) => !["done", "failed", "abandoned"].includes(t.status),
  );
  const recentDone = mockCodingAgents
    .filter((t) => ["done", "pr-submitted"].includes(t.status))
    .slice(0, 3);

  const activeNotes = mockQuickNotes.filter((n) => n.status !== "resolved");
  const resolvedNotes = mockQuickNotes.filter((n) => n.status === "resolved");

  const recentAgents = mockAgentRegistry
    .filter((a) => a.lastRun)
    .sort(
      (a, b) =>
        new Date(b.lastRun!).getTime() - new Date(a.lastRun!).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Header + Quick Actions */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {getGreeting()}, {USER_NAME}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDisplayDate()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <FileText className="h-3 w-3" />
            Briefing
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <Zap className="h-3 w-3" />
            Standup
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
            <RefreshCw className="h-3 w-3" />
            Sync ADO
          </Button>
        </div>
      </div>

      {/* Attention banner */}
      {state === "streaming" && (
        <StatusBanner variant="info">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-info" />
            <div>
              <p className="text-sm font-medium">
                Agents are running...
              </p>
              <p className="text-xs text-muted-foreground">
                Briefing and standup agents are generating content.
              </p>
            </div>
          </div>
        </StatusBanner>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left: Today's Focus (3/5 width) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Action Items */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Today&apos;s Focus
              </h2>
              <span className="text-[11px] text-muted-foreground/50">
                {relativeTime(mockBriefing.generatedAt)}
              </span>
            </div>
            <ol className="space-y-2">
              {topItems.map((item, i) => {
                const p = item.priority;
                return (
                  <li
                    key={item.id}
                    className="flex gap-2.5 text-[13px] leading-relaxed"
                  >
                    <span
                      className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium mt-0.5 ${
                        p <= 1
                          ? "bg-destructive/10 text-destructive"
                          : p === 2
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-foreground/80">{item.text}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Coding Tasks */}
          {(activeCoding.length > 0 || recentDone.length > 0) && (
            <div className="rounded-lg border p-4">
              <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                Coding Tasks
                {activeCoding.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {activeCoding.length} active
                  </Badge>
                )}
              </h2>
              <div className="space-y-1">
                {activeCoding.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/task/${task.id}`}
                  >
                    <CircleDot className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="flex-1 truncate">
                      {task.adoTaskId ? `#${task.adoTaskId} ` : ""}
                      {task.taskTitle}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 shrink-0"
                    >
                      {task.status}
                    </Badge>
                  </div>
                ))}
                {recentDone.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/task/${task.id}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/50 shrink-0" />
                    <span className="flex-1 truncate">
                      {task.adoTaskId ? `#${task.adoTaskId} ` : ""}
                      {task.taskTitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: In Motion (2/5 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Notes */}
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-muted-foreground" />
                Quick Notes
                {activeNotes.length > 0 && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {activeNotes.length}
                  </Badge>
                )}
              </h2>
            </div>

            <div className="space-y-0.5">
              {activeNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 w-full rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <Circle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                  <span className="flex-1 text-[13px] text-foreground/70 line-clamp-2">
                    {note.content}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
                    {relativeTime(note.timestamp)}
                  </span>
                </div>
              ))}
              {resolvedNotes.length > 0 && activeNotes.length > 0 && (
                <div className="border-t my-1.5" />
              )}
              {resolvedNotes.map((note) => (
                <div
                  key={note.id}
                  className="flex items-start gap-2 w-full rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-success" />
                  <span className="flex-1 text-[13px] text-muted-foreground/40 line-through line-clamp-2">
                    {note.content}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5">
                    {relativeTime(note.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Agent Activity */}
          <div className="rounded-lg border p-4">
            <h2 className="text-sm font-medium flex items-center gap-2 mb-3">
              <Bot className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </h2>
            <div className="space-y-2">
              {recentAgents.map((agent) => (
                <div
                  key={agent.name}
                  className="flex items-center gap-2 text-[13px]"
                >
                  <span className="flex-1 truncate text-foreground/70">
                    {formatAgentName(agent.name)}
                  </span>
                  {agent.status === "running" && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary shrink-0" />
                  )}
                  {agent.consecutiveFailures > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[10px] px-1 py-0 h-4"
                    >
                      fail
                    </Badge>
                  )}
                  <span
                    className={`text-[11px] shrink-0 tabular-nums ${
                      agent.status === "running"
                        ? "text-primary"
                        : agent.consecutiveFailures > 0
                          ? "text-red-400"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {agent.status === "running"
                      ? "running"
                      : relativeTime(agent.lastRun)}
                  </span>
                </div>
              ))}
              <div className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-1 cursor-pointer">
                All agents
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
