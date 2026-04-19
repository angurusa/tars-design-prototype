"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { CodingAgentTask } from "@/lib/types";
import type { Task, PR, SyncStatus, ViewType } from "@/components/ado/types";
import { DONE_STATES, ACTIVE_STATES } from "@/components/ado/types";

export function useAdoData() {
  // Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [prs, setPrs] = useState<PR[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [codingAgents, setCodingAgents] = useState<CodingAgentTask[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [authStatus, setAuthStatus] = useState<{
    npm: { status: string; remainingMinutes: number | null };
    az: { status: string; remainingMinutes: number | null };
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters (All Items + PRs views)
  const [stateFilters, setStateFilters] = useState<Set<string>>(new Set());
  const [projectFilters, setProjectFilters] = useState<Set<string>>(new Set());
  const [typeFilters, setTypeFilters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Timer for relative time
  const [_now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const adoOrg = process.env.NEXT_PUBLIC_ADO_ORG || "https://dev.azure.com/yammer";

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/ado/tasks");
      const json = await res.json();
      setTasks(json);
    } catch {
      /* keep existing */
    }
  }, []);

  const fetchPrs = useCallback(async () => {
    try {
      const res = await fetch("/api/ado/prs");
      const json = await res.json();
      setPrs(json);
    } catch {
      /* keep existing */
    }
  }, []);

  const fetchSyncStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/ado/sync-status");
      const json = await res.json();
      setSyncStatus(json);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchCodingAgents = useCallback(async () => {
    try {
      const res = await fetch("/api/coding-agents");
      const json = await res.json();
      setCodingAgents(json);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchAuthStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/status");
      const json = await res.json();
      // Pick worst npm status across orgs (az is shared across all orgs)
      const orgs = Object.values(json) as NonNullable<typeof authStatus>[];
      if (orgs.length > 0) {
        const rank = (s: string) =>
          s === "expired" ? 0 : s === "missing" ? 1 : s === "expiring" ? 2 : 3;
        const worst = orgs.reduce((a, b) => (rank(a.npm.status) < rank(b.npm.status) ? a : b));
        setAuthStatus(worst);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const handleRefreshToken = async (type: "npm" | "az") => {
    setRefreshing(true);
    try {
      await fetch(`/api/auth/refresh?type=${type}`, { method: "POST" });
      await fetchAuthStatus();
    } catch {
      /* ignore */
    }
    setRefreshing(false);
  };

  useEffect(() => {
    Promise.all([fetchTasks(), fetchPrs(), fetchSyncStatus(), fetchCodingAgents()]).finally(() =>
      setLoading(false),
    );
    // Lazy load auth status — don't block page render
    fetchAuthStatus();
    // Poll auth status every 15 min — triggers auto-refresh if tokens are expiring
    const authPoll = setInterval(fetchAuthStatus, 15 * 60 * 1000);
    return () => clearInterval(authPoll);
  }, [fetchTasks, fetchPrs, fetchSyncStatus, fetchCodingAgents, fetchAuthStatus]);

  const handleSync = async () => {
    setSyncing(true);
    const beforeSync = syncStatus?.lastSyncMs;
    try {
      await fetch("/api/agents/ADOSyncAgent/trigger", { method: "POST" });
      for (let i = 0; i < 24; i++) {
        await new Promise((r) => setTimeout(r, 5_000));
        const res = await fetch("/api/ado/sync-status");
        const updated = await res.json();
        if (updated.lastSyncMs && updated.lastSyncMs !== beforeSync) {
          setSyncStatus(updated);
          await Promise.all([fetchTasks(), fetchPrs()]);
          setSyncing(false);
          setNow(Date.now());
          return;
        }
      }
      await Promise.all([fetchTasks(), fetchPrs(), fetchSyncStatus()]);
    } catch {
      /* ignore */
    }
    setSyncing(false);
  };

  // ---------------------------------------------------------------------------
  // Computed Data
  // ---------------------------------------------------------------------------

  const blockedCount = useMemo(() => tasks.filter((t) => t.state === "Blocked").length, [tasks]);
  const activeCount = useMemo(
    () => tasks.filter((t) => ACTIVE_STATES.has(t.state)).length,
    [tasks],
  );
  const openPRsCount = useMemo(() => prs.filter((p) => p.status === "active").length, [prs]);
  const doneCount = useMemo(() => tasks.filter((t) => DONE_STATES.has(t.state)).length, [tasks]);

  // Needs Attention groups
  const blockedItems = useMemo(() => tasks.filter((t) => t.state === "Blocked"), [tasks]);
  const highPriorityActive = useMemo(
    () => tasks.filter((t) => t.state === "Active" && t.priority <= 2),
    [tasks],
  );
  const staleDraftPRs = useMemo(() => prs.filter((p) => p.isDraft && p.ageDays > 7), [prs]);
  const staleItems = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.ageDays >= 14 &&
          !DONE_STATES.has(t.state) &&
          t.state !== "Blocked" &&
          !(t.state === "Active" && t.priority <= 2),
      ),
    [tasks],
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

  // Collapsible sections (persisted to localStorage)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("tars:ado:collapsed-sections");
      if (stored) setCollapsedSections(new Set(JSON.parse(stored)));
    } catch {
      /* ignore */
    }
  }, []);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      try {
        localStorage.setItem("tars:ado:collapsed-sections", JSON.stringify([...next]));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  // My Active Work
  const myActiveItems = useMemo(
    () =>
      tasks
        .filter((t) => ACTIVE_STATES.has(t.state))
        .sort((a, b) => (a.priority || 4) - (b.priority || 4)),
    [tasks],
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
  const allProjects = useMemo(
    () => [...new Set(tasks.map((t) => t.project).filter(Boolean))],
    [tasks],
  );
  const allTypes = useMemo(() => [...new Set(tasks.map((t) => t.type).filter(Boolean))], [tasks]);

  // State counts for filter chips
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

  // Filtered items (All Items view)
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

  // Filtered PRs
  const filteredPRs = useMemo(() => {
    if (!search) return prs;
    return prs.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        String(p.id).includes(search) ||
        p.branch.toLowerCase().includes(search.toLowerCase()),
    );
  }, [prs, search]);

  // PRs grouped by repo → state (Draft / Submitted)
  const prsByRepoAndState = useMemo(() => {
    const repoMap = new Map<string, { submitted: PR[]; draft: PR[] }>();
    for (const pr of filteredPRs) {
      const group = repoMap.get(pr.repo) ?? { submitted: [], draft: [] };
      if (pr.isDraft) group.draft.push(pr);
      else group.submitted.push(pr);
      repoMap.set(pr.repo, group);
    }
    // Sort repos: repos with submitted PRs first, then alphabetical
    return [...repoMap.entries()].sort(([a, ag], [b, bg]) => {
      const aHasSub = ag.submitted.length > 0 ? 0 : 1;
      const bHasSub = bg.submitted.length > 0 ? 0 : 1;
      if (aHasSub !== bHasSub) return aHasSub - bHasSub;
      return a.localeCompare(b);
    });
  }, [filteredPRs]);

  // Sync time display
  const syncTimeAgo = useMemo(() => {
    if (!syncStatus?.lastSyncMs) return null;
    const syncDate = new Date(syncStatus.lastSyncMs);
    return syncDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
  }, [syncStatus]);

  // Helpers
  const toggleFilter = (current: Set<string>, setter: (s: Set<string>) => void, value: string) => {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  };

  return {
    // Raw data
    tasks,
    prs,
    loading,
    syncStatus,
    codingAgents,
    syncing,
    authStatus,
    refreshing,
    adoOrg,

    // Actions
    handleSync,
    handleRefreshToken,

    // Filters
    stateFilters,
    setStateFilters,
    projectFilters,
    setProjectFilters,
    typeFilters,
    setTypeFilters,
    search,
    setSearch,
    toggleFilter,

    // Collapsible sections
    collapsedSections,
    toggleSection,

    // Computed counts
    blockedCount,
    activeCount,
    openPRsCount,
    doneCount,
    attentionCount,

    // Attention groups
    blockedItems,
    highPriorityActive,
    staleDraftPRs,
    staleItems,
    hasAttentionItems,

    // Active work
    myActiveItems,
    activePRs,
    activeByState,

    // Filter options
    allStates,
    allProjects,
    allTypes,
    stateCounts,
    typeCounts,

    // Filtered data
    filteredTasks,
    filteredPRs,
    prsByRepoAndState,

    // Cross-references
    linkedPRCountMap,

    // Display
    syncTimeAgo,
  };
}
