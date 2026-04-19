"use client";

import { useState, useMemo } from "react";
import { usePrototype } from "@/lib/prototype-context";
import {
  mockAdoTasks,
  mockPullRequests,
  mockCodingAgents,
} from "@/lib/mock-data";
import type { AdoTask, PullRequest as PRType } from "@/lib/types";
import type { Task, PR, ViewType } from "@/components/ado/types";
import { stateBadgeVariant, agentStatusMap, DONE_STATES, ACTIVE_STATES } from "@/components/ado/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { StatusDot } from "@/components/shared/status-dot";
import { StepIndicator } from "@/components/shared/step-indicator";
import { SkeletonTable } from "@/components/shared/skeleton-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBanner } from "@/components/shared/status-banner";
import { PageHeader } from "@/components/shared/page-header";
import { SummaryCards } from "@/components/ado/SummaryCards";
import { AttentionView } from "@/components/ado/AttentionView";
import { ActiveWorkView } from "@/components/ado/ActiveWorkView";
import { BacklogView } from "@/components/ado/BacklogView";
import { PrsView } from "@/components/ado/PrsView";
import { ReviewerAvatar } from "@/components/ado/ReviewerAvatar";

import {
  Copy,
  ExternalLink,
  GitBranch,
  GitPullRequest,
  RefreshCw,
  Inbox,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Convert mock data to component-expected types
// ---------------------------------------------------------------------------

function toTask(ado: AdoTask): Task {
  return {
    ...ado,
    ageDays: Math.floor(Math.random() * 14) + 1,
    syncedAt: new Date().toISOString(),
  };
}

function toPR(pr: PRType): PR {
  const ageDays = Math.floor(
    (Date.now() - new Date(pr.createdAt).getTime()) / 86_400_000
  );
  return {
    id: pr.id,
    title: pr.title,
    repo: pr.repo,
    status: pr.status,
    isDraft: pr.isDraft,
    branch: pr.branch,
    createdAt: pr.createdAt,
    reviewers: pr.reviewers.map((r) => ({
      name: r.name,
      initials: r.initials,
    })),
    ageDays,
    isStale: ageDays > 7,
    isAgentPR: pr.isAgentPR,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function AdoDashboardPage() {
  const { getPageState } = usePrototype();
  const pageState = getPageState("/ado");

  const [activeView, setActiveView] = useState<ViewType>("attention");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [copied, setCopied] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [budgetUsd, setBudgetUsd] = useState(5.0);

  // Collapsible sections
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filters
  const [stateFilters, setStateFilters] = useState<Set<string>>(new Set());
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const adoOrg = "https://dev.azure.com/contoso";

  // Convert mock data
  const tasks = useMemo(() => mockAdoTasks.map(toTask), []);
  const prs = useMemo(() => mockPullRequests.map(toPR), []);

  // Computed counts
  const blockedCount = useMemo(() => tasks.filter((t) => t.state === "Blocked").length, [tasks]);
  const activeCount = useMemo(() => tasks.filter((t) => ACTIVE_STATES.has(t.state)).length, [tasks]);
  const openPRsCount = useMemo(() => prs.filter((p) => p.status === "active").length, [prs]);
  const doneCount = useMemo(() => tasks.filter((t) => DONE_STATES.has(t.state)).length, [tasks]);

  // Attention groups
  const blockedItems = useMemo(() => tasks.filter((t) => t.state === "Blocked"), [tasks]);
  const highPriorityActive = useMemo(
    () => tasks.filter((t) => t.state === "Active" && t.priority <= 2),
    [tasks]
  );
  const staleDraftPRs = useMemo(() => prs.filter((p) => p.isDraft && p.ageDays > 7), [prs]);
  const staleItems = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.ageDays >= 14 &&
          !DONE_STATES.has(t.state) &&
          t.state !== "Blocked" &&
          !(t.state === "Active" && t.priority <= 2)
      ),
    [tasks]
  );
  const hasAttentionItems =
    blockedItems.length > 0 ||
    highPriorityActive.length > 0 ||
    staleDraftPRs.length > 0 ||
    staleItems.length > 0;
  const attentionCount =
    blockedItems.length + highPriorityActive.length + staleDraftPRs.length + staleItems.length;

  // Cross-reference: linked PR count per task
  const linkedPRCountMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const task of tasks) {
      const count = prs.filter((pr) => pr.branch.includes(String(task.id))).length;
      if (count > 0) map.set(task.id, count);
    }
    return map;
  }, [tasks, prs]);

  // My Active Work
  const myActiveItems = useMemo(
    () =>
      tasks
        .filter((t) => ACTIVE_STATES.has(t.state))
        .sort((a, b) => (a.priority || 4) - (b.priority || 4)),
    [tasks]
  );
  const activePRs = useMemo(() => prs.filter((p) => p.status === "active" && !p.isDraft), [prs]);

  const activeByState = useMemo(() => {
    const groups: { key: string; label: string; items: Task[] }[] = [
      { key: "active-work-active", label: "Active", items: [] },
      { key: "active-work-review", label: "In Review", items: [] },
      { key: "active-work-proposed", label: "Proposed", items: [] },
    ];
    for (const task of myActiveItems) {
      if (task.state === "Active") groups[0].items.push(task);
      else if (task.state === "In Review") groups[1].items.push(task);
      else groups[2].items.push(task);
    }
    return groups.filter((g) => g.items.length > 0);
  }, [myActiveItems]);

  // Filter options
  const allStates = useMemo(() => [...new Set(tasks.map((t) => t.state).filter(Boolean))], [tasks]);
  const allProjects = useMemo(() => [...new Set(tasks.map((t) => t.project).filter(Boolean))], [tasks]);
  const allTypes = useMemo(() => [...new Set(tasks.map((t) => t.type).filter(Boolean))], [tasks]);
  const stateCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tasks) m[t.state] = (m[t.state] || 0) + 1;
    return m;
  }, [tasks]);
  const typeCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const t of tasks) m[t.type] = (m[t.type] || 0) + 1;
    return m;
  }, [tasks]);

  // Filtered items
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (stateFilters.size > 0 && !stateFilters.has(t.state)) return false;
      if (projectFilters.size > 0 && !projectFilters.has(t.project)) return false;
      if (typeFilters.size > 0 && !typeFilters.has(t.type)) return false;
      if (
        search &&
        !t.title.toLowerCase().includes(search.toLowerCase()) &&
        !String(t.id).includes(search)
      )
        return false;
      return true;
    });
  }, [tasks, stateFilters, projectFilters, typeFilters, search]);

  const filteredPRs = useMemo(() => {
    if (!search) return prs;
    return prs.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search) ||
        p.branch.toLowerCase().includes(search.toLowerCase())
    );
  }, [prs, search]);

  const prsByRepoAndState = useMemo(() => {
    const repoMap = new Map<string, { submitted: PR[]; draft: PR[] }>();
    for (const pr of filteredPRs) {
      const group = repoMap.get(pr.repo) ?? { submitted: [], draft: [] };
      if (pr.isDraft) group.draft.push(pr);
      else group.submitted.push(pr);
      repoMap.set(pr.repo, group);
    }
    return [...repoMap.entries()].sort(([a, ag], [b, bg]) => {
      const aHasSub = ag.submitted.length > 0 ? 0 : 1;
      const bHasSub = bg.submitted.length > 0 ? 0 : 1;
      if (aHasSub !== bHasSub) return aHasSub - bHasSub;
      return a.localeCompare(b);
    });
  }, [filteredPRs]);

  const toggleFilter = (current: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  // Cross-reference: related PRs / agents for selected task
  const relatedPRs = useMemo(() => {
    if (!selectedTask) return [];
    return prs.filter((pr) => pr.branch.includes(String(selectedTask.id)));
  }, [selectedTask, prs]);

  const agentsForTask = useMemo(() => {
    if (!selectedTask) return [];
    return mockCodingAgents
      .filter((a) => a.adoTaskId === selectedTask.id)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [selectedTask]);

  const { activeAgent, pastAgents } = useMemo(
    () => ({
      activeAgent: agentsForTask.find(
        (a) => !["done", "failed", "abandoned"].includes(a.status)
      ),
      pastAgents: agentsForTask.filter((a) =>
        ["done", "failed", "abandoned"].includes(a.status)
      ),
    }),
    [agentsForTask]
  );

  const handleSummaryCardClick = (type: string) => {
    setStateFilters(new Set());
    setProjectFilters(new Set());
    setTypeFilters(new Set());
    setSearch("");
    switch (type) {
      case "blocked":
        setActiveView("all");
        setStateFilters(new Set(["Blocked"]));
        break;
      case "active":
        setActiveView("active");
        break;
      case "prs":
        setActiveView("prs");
        break;
      case "done":
        setActiveView("all");
        setStateFilters(new Set(["Closed", "Resolved", "Completed"]));
        break;
    }
  };

  const handleCopyLink = (task: Task) => {
    const url = `${task.org || adoOrg}/${task.project}/_workitems/edit/${task.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------------------------------------------------------------------------
  // State rendering
  // ---------------------------------------------------------------------------

  if (pageState === "loading") {
    return <SkeletonTable rows={8} />;
  }

  if (pageState === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Work Items" />
        <EmptyState
          icon={Inbox}
          title="No work items synced"
          description='Click "Sync Now" to pull work items from Azure DevOps.'
          action={{ label: "Sync Now", onClick: () => {} }}
        />
      </div>
    );
  }

  if (pageState === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Work Items" />
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">Failed to load work items</p>
            <p className="text-sm text-muted-foreground">
              Could not connect to Azure DevOps. Check your ADO_ORGS configuration and AZ CLI login.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated / streaming
  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Items"
        subtitle={`${tasks.length} work items \u00b7 last synced at 8:32 AM`}
        actions={
          <div className="flex items-center gap-2">
            {/* Auth status badges */}
            <div className="flex items-center rounded-md border border-border/50 px-2 py-1 text-[11px] gap-2.5">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-medium">NPM</span>
                <span className="text-muted-foreground">3h 42m</span>
              </span>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                <span className="font-medium">AZ</span>
                <span className="text-muted-foreground">1d 5h</span>
              </span>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="mr-1 h-3.5 w-3.5" />
              Sync Now
            </Button>
          </div>
        }
      />

      {/* Summary Cards */}
      <SummaryCards
        blockedCount={blockedCount}
        activeCount={activeCount}
        prsCount={openPRsCount}
        doneCount={doneCount}
        onCardClick={handleSummaryCardClick}
      />

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as ViewType)}>
        <TabsList>
          <TabsTrigger value="attention">
            Needs Attention
            {attentionCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1.5 text-[10px] px-1.5 py-0 h-4 min-w-4 justify-center"
              >
                {attentionCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active">My Active Work ({myActiveItems.length})</TabsTrigger>
          <TabsTrigger value="all">All Items ({tasks.length})</TabsTrigger>
          <TabsTrigger value="prs">Pull Requests ({prs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="attention" className="mt-4 space-y-1">
          <AttentionView
            blockedItems={blockedItems}
            highPriorityActive={highPriorityActive}
            staleDraftPRs={staleDraftPRs}
            staleItems={staleItems}
            hasAttentionItems={hasAttentionItems}
            activeCount={activeCount}
            openPRsCount={openPRsCount}
            syncTimeAgo="8:32 AM"
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            linkedPRCountMap={linkedPRCountMap}
            adoOrg={adoOrg}
            onSelectTask={setSelectedTask}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-4 space-y-1">
          <ActiveWorkView
            activeByState={activeByState}
            activePRs={activePRs}
            myActiveItems={myActiveItems}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            linkedPRCountMap={linkedPRCountMap}
            adoOrg={adoOrg}
            onSelectTask={setSelectedTask}
          />
        </TabsContent>

        <TabsContent value="all" className="mt-4 space-y-4">
          <BacklogView
            allStates={allStates}
            allProjects={allProjects}
            allTypes={allTypes}
            stateCounts={stateCounts}
            typeCounts={typeCounts}
            stateFilters={stateFilters}
            projectFilters={projectFilters}
            typeFilters={typeFilters}
            search={search}
            filteredTasks={filteredTasks}
            tasks={tasks}
            linkedPRCountMap={linkedPRCountMap}
            adoOrg={adoOrg}
            onSelectTask={setSelectedTask}
            toggleFilter={toggleFilter}
            setStateFilters={setStateFilters}
            setProjectFilters={setProjectFilters}
            setTypeFilters={setTypeFilters}
            setSearch={setSearch}
          />
        </TabsContent>

        <TabsContent value="prs" className="mt-4 space-y-4">
          <PrsView
            search={search}
            filteredPRs={filteredPRs}
            prsByRepoAndState={prsByRepoAndState}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            adoOrg={adoOrg}
            setSearch={setSearch}
          />
        </TabsContent>
      </Tabs>

      {/* Task Detail Sheet */}
      <Sheet
        open={!!selectedTask}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTask(null);
            setDescExpanded(false);
          }
        }}
      >
        <SheetContent
          side="right"
          className="overflow-y-auto overflow-x-hidden w-full sm:max-w-xl lg:max-w-2xl flex flex-col"
        >
          {selectedTask && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={stateBadgeVariant[selectedTask.state] ?? "outline"}>
                    {selectedTask.state}
                  </Badge>
                  <PriorityBadge priority={(selectedTask.priority || 4) as 1 | 2 | 3 | 4} />
                </div>
                <SheetTitle className="text-left">{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  <span className="font-mono">#{selectedTask.id}</span> &middot;{" "}
                  {selectedTask.project} &middot; {selectedTask.type}
                  {selectedTask.ageDays > 0 && <> &middot; {selectedTask.ageDays}d old</>}
                </SheetDescription>
              </SheetHeader>

              <div className="px-4 space-y-6 flex-1 min-w-0">
                {/* Metadata */}
                <div className="rounded-lg border divide-y text-xs min-w-0">
                  {[
                    { label: "Sprint", value: selectedTask.sprint },
                    { label: "Assigned To", value: selectedTask.assignedTo },
                    selectedTask.areaPath
                      ? { label: "Area", value: selectedTask.areaPath.replaceAll("\\", " / ") }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <div key={item!.label} className="flex gap-4 px-3 py-2">
                        <span className="text-muted-foreground w-24 shrink-0">{item!.label}</span>
                        <span className="font-medium break-words min-w-0">
                          {item!.value || "\u2014"}
                        </span>
                      </div>
                    ))}
                </div>
                {selectedTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Description (expandable) */}
                {selectedTask.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Description</h4>
                    <div className={`relative ${!descExpanded ? "max-h-20 overflow-hidden" : ""}`}>
                      <MarkdownRenderer content={selectedTask.description} />
                      {!descExpanded && (
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent" />
                      )}
                    </div>
                    <button
                      onClick={() => setDescExpanded(!descExpanded)}
                      className="text-xs text-primary mt-1 hover:underline"
                    >
                      {descExpanded ? "Show less" : "Show more"}
                    </button>
                  </div>
                )}

                {/* Related PRs */}
                {relatedPRs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Related Pull Requests</h4>
                    <div className="space-y-2">
                      {relatedPRs.map((pr) => (
                        <div key={pr.id} className="rounded-lg border p-2 text-sm space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <GitPullRequest className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{pr.title}</span>
                              {pr.isDraft && (
                                <Badge variant="outline" className="text-[10px]">
                                  Draft
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {pr.reviewers.map((r, i) => (
                                <ReviewerAvatar key={i} reviewer={r} />
                              ))}
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono min-w-0">
                            <GitBranch className="h-3 w-3 shrink-0" />
                            <span className="truncate font-mono">{pr.branch}</span>
                            <span className="shrink-0">&rarr;</span>
                            <span className="truncate">main</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Agents section */}
                {(activeAgent || pastAgents.length > 0) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Agents</h4>

                    {activeAgent && (
                      <div className="rounded-lg border p-3 space-y-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Badge variant="outline" className="text-[10px]">
                              Coding
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <StatusDot status={agentStatusMap[activeAgent.status] ?? "idle"} />
                            <span className="capitalize">
                              {activeAgent.status.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                        <StepIndicator steps={activeAgent.steps} />
                        <div className="flex items-center gap-3">
                          <Progress value={activeAgent.progress} className="flex-1" />
                          <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                            {activeAgent.progress}%
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {activeAgent.duration}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground min-w-0">
                          {activeAgent.branch && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <GitBranch className="h-3 w-3 shrink-0" />
                              <span className="font-mono truncate">{activeAgent.branch}</span>
                            </div>
                          )}
                          {activeAgent.prNumber && (
                            <div className="flex items-center gap-1.5">
                              <GitPullRequest className="h-3 w-3 shrink-0" />
                              <span>PR #{activeAgent.prNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {pastAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <StatusDot status={agentStatusMap[agent.status] ?? "idle"} />
                        <Badge variant="outline" className="text-[10px]">
                          Coding
                        </Badge>
                        <span className="capitalize text-muted-foreground">
                          {agent.status.replace("-", " ")}
                        </span>
                        <span className="flex-1" />
                        <span className="text-muted-foreground tabular-nums">{agent.duration}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sticky bottom actions */}
              <div className="sticky bottom-0 border-t bg-background px-4 py-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  Open in ADO
                </Button>
                {activeAgent ? (
                  <Button size="sm" variant="outline">
                    View Agent
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-muted-foreground">
                      Budget $
                      <input
                        type="number"
                        min={0.5}
                        step={0.5}
                        value={budgetUsd}
                        onChange={(e) => setBudgetUsd(parseFloat(e.target.value) || 2.0)}
                        className="w-16 rounded border bg-background px-1.5 py-0.5 text-xs tabular-nums"
                      />
                    </label>
                    <Button size="sm">Work on this</Button>
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={() => handleCopyLink(selectedTask)}>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
