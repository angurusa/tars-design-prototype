import type { AgentStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Task = {
  id: number;
  type: string;
  priority: number;
  title: string;
  state: string;
  sprint: string;
  points: number;
  org: string;
  project: string;
  description: string;
  acceptanceCriteria: string[];
  assignedTo: string;
  tags: string[];
  areaPath: string;
  agentStatus?: string;
  syncedAt?: string;
  ageDays: number;
};

export type PR = {
  id: number;
  title: string;
  repo: string;
  status: string;
  isDraft: boolean;
  branch: string;
  targetBranch?: string;
  project?: string;
  org?: string;
  createdAt: string;
  reviewers: { name: string; vote?: number; initials?: string }[];
  ageDays: number;
  isStale: boolean;
  isAgentPR?: boolean;
};

export type SyncStatus = {
  lastSyncMs: number | null;
  totalItems: number;
  fresh: boolean;
};

export type ViewType = "attention" | "active" | "all" | "prs";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const stateBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  New: "outline",
  Active: "default",
  "In Review": "secondary",
  Proposed: "outline",
  Blocked: "destructive",
  Closed: "secondary",
  Resolved: "secondary",
  Completed: "secondary",
};

export const agentStatusMap: Record<string, AgentStatus> = {
  queued: "idle",
  "setting-up": "running",
  analyzing: "running",
  implementing: "running",
  testing: "running",
  "creating-pr": "running",
  "pr-submitted": "warning",
  blocked: "error",
  done: "success",
  failed: "error",
  abandoned: "idle",
};

export const DONE_STATES = new Set(["Closed", "Resolved", "Completed"]);
export const ACTIVE_STATES = new Set(["Active", "In Review", "Proposed"]);

export const WORK_ITEM_COLUMNS = [
  { label: "ID", className: "w-[72px] shrink-0" },
  { label: "Type", className: "shrink-0 w-[60px]" },
  { label: "Title", className: "flex-1 min-w-0" },
  { label: "State", className: "shrink-0 w-[80px]" },
  { label: "Project", className: "shrink-0 w-[100px] text-right hidden sm:inline" },
  { label: "Priority", className: "shrink-0" },
  { label: "Age", className: "shrink-0" },
];
