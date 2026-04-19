"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePrototype } from "@/lib/prototype-context";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBanner } from "@/components/shared/status-banner";
import { SkeletonCardList } from "@/components/shared/skeleton-card-list";
import { ViewToggle } from "@/components/shared/view-toggle";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FolderPlus, Search, CheckCircle2 } from "lucide-react";
import type { PipelineStep } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock project data
// ---------------------------------------------------------------------------
type MockProject = {
  id: string;
  name: string;
  brief: string;
  status: "draft" | "planning" | "active" | "completed";
  currentStep: "brief" | "one-pager" | "work-items";
  hasOnePager: boolean;
  workItemCount: number;
  adoSyncCount: number;
  adoOrg?: string;
  adoProject?: string;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
};

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "proj-001",
    name: "Notification Service Redesign",
    brief: "Multi-channel notification service supporting email, Slack, Teams, and push with user preference management.",
    status: "active",
    currentStep: "work-items",
    hasOnePager: true,
    workItemCount: 9,
    adoSyncCount: 5,
    adoOrg: "contoso",
    adoProject: "telemetry-platform",
    isRunning: false,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-10T14:30:00Z",
  },
  {
    id: "proj-002",
    name: "Telemetry Pipeline v3 Migration",
    brief: "Migrate from batch processing to real-time streaming with Kafka Streams and exactly-once semantics.",
    status: "planning",
    currentStep: "one-pager",
    hasOnePager: true,
    workItemCount: 0,
    adoSyncCount: 0,
    isRunning: true,
    createdAt: "2026-03-09T08:00:00Z",
    updatedAt: "2026-03-10T09:15:00Z",
  },
  {
    id: "proj-003",
    name: "Dashboard Accessibility Audit",
    brief: "Comprehensive accessibility audit and remediation for all dashboard components to meet WCAG 2.2 AA.",
    status: "draft",
    currentStep: "brief",
    hasOnePager: false,
    workItemCount: 0,
    adoSyncCount: 0,
    isRunning: false,
    createdAt: "2026-03-10T07:00:00Z",
    updatedAt: "2026-03-10T07:00:00Z",
  },
  {
    id: "proj-004",
    name: "API Rate Limiting & Throttling",
    brief: "Implement per-tenant rate limiting with Redis-backed token bucket algorithm and configurable policies.",
    status: "completed",
    currentStep: "work-items",
    hasOnePager: true,
    workItemCount: 6,
    adoSyncCount: 6,
    adoOrg: "contoso",
    adoProject: "telemetry-platform",
    isRunning: false,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-01T16:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSteps(project: MockProject): PipelineStep[] {
  return [
    { label: "Brief", status: project.hasOnePager ? "done" : "active" },
    { label: "One-Pager", status: project.hasOnePager ? "done" : "pending" },
    {
      label: "Work Items",
      status: project.workItemCount > 0 ? "done" : project.hasOnePager ? "active" : "pending",
    },
    {
      label: "ADO Sync",
      status: project.adoSyncCount > 0 ? "done" : project.workItemCount > 0 ? "active" : "pending",
    },
  ];
}

function statusIcon(project: MockProject) {
  if (project.isRunning) {
    return <span className="w-2 h-2 rounded-full bg-info animate-pulse shrink-0" />;
  }
  if (project.status === "completed") {
    return <CheckCircle2 className="h-4 w-4 text-success shrink-0" />;
  }
  return <span className="w-2 h-2 rounded-full bg-warning shrink-0" />;
}

function statusLabel(project: MockProject): string {
  if (project.isRunning) return "Running";
  if (project.status === "completed") return "";
  if (project.currentStep === "work-items") return "Work items ready";
  if (project.currentStep === "one-pager") return "One-pager ready";
  return "Draft";
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function ProjectPlannerPage() {
  const router = useRouter();
  const { getPageState } = usePrototype();
  const state = getPageState("/project-planner");

  const [filter, setFilter] = useState<"active" | "completed" | "all">("active");
  const [view, setView] = useState<"list" | "cards">("list");

  const projects = MOCK_PROJECTS;
  const activeCount = useMemo(
    () => projects.filter((p) => p.status !== "completed").length,
    [projects],
  );
  const completedCount = useMemo(
    () => projects.filter((p) => p.status === "completed").length,
    [projects],
  );
  const filtered = useMemo(
    () =>
      filter === "all"
        ? projects
        : filter === "active"
          ? projects.filter((p) => p.status !== "completed")
          : projects.filter((p) => p.status === "completed"),
    [projects, filter],
  );

  // --- Loading ---
  if (state === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader title="Project Planner" />
        <SkeletonCardList cards={4} />
      </div>
    );
  }

  // --- Empty ---
  if (state === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Planner"
          subtitle="0 projects"
          actions={
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              New Project
            </Button>
          }
        />
        <EmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first project to get started."
          action={{ label: "Create Project", onClick: () => {} }}
        />
      </div>
    );
  }

  // --- Error ---
  if (state === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Project Planner" />
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load projects</p>
            <p className="text-xs text-muted-foreground">
              Could not connect to the database. Check your connection settings.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // --- Populated / Streaming ---
  return (
    <div className="space-y-6">
      <PageHeader
        title="Project Planner"
        subtitle={`${projects.length} projects${activeCount > 0 ? ` \u00b7 ${activeCount} active` : ""}`}
        actions={
          <Button onClick={() => router.push("/project-planner/new")}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Project
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCount})</TabsTrigger>
            <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
          </TabsList>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <TabsContent value={filter} className="mt-4">
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title={`No ${filter} projects`} />
          ) : view === "list" ? (
            /* ---- List view ---- */
            <div className="space-y-2">
              {filtered.map((project) => {
                const label = statusLabel(project);
                return (
                  <Card
                    key={project.id}
                    className={`px-4 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors ${project.status === "completed" ? "opacity-70" : ""}`}
                    onClick={() => router.push(`/project-planner/${project.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(project)}
                      <span className="text-sm truncate flex-1">{project.name}</span>
                      {label && (
                        <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                      )}
                      {project.workItemCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          {project.workItemCount} items
                        </Badge>
                      )}
                      {project.adoSyncCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 bg-success/15 text-success border-transparent"
                        >
                          {project.adoSyncCount} in ADO
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* ---- Card view ---- */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {filtered.map((project) => {
                const adoLabel = [project.adoOrg, project.adoProject].filter(Boolean).join(" / ");

                return (
                  <Card
                    key={project.id}
                    className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${project.status === "completed" ? "opacity-70" : ""}`}
                    onClick={() => router.push(`/project-planner/${project.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold text-sm">{project.name}</div>
                        {adoLabel && (
                          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                            {adoLabel}
                          </div>
                        )}
                      </div>
                      {project.workItemCount > 0 && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                          {project.adoSyncCount > 0
                            ? `${project.adoSyncCount}/${project.workItemCount} in ADO`
                            : `${project.workItemCount} items`}
                        </Badge>
                      )}
                    </div>

                    {project.brief && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {project.brief}
                      </p>
                    )}

                    <div className="mt-3">
                      <StepIndicator steps={getSteps(project)} />
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span>
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      {project.updatedAt !== project.createdAt && (
                        <>
                          <span className="w-px h-3 bg-border" />
                          <span>
                            Updated{" "}
                            {new Date(project.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
