// =============================================================================
// TARS Mission Control - TypeScript Types
// =============================================================================

// Agent status enum
export type AgentStatus = "idle" | "running" | "success" | "warning" | "error" | "approval";

// Pipeline step for step indicators
export type PipelineStep = {
  label: string;
  status: "done" | "active" | "pending" | "failed";
};

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

export type ActionItem = {
  id: string;
  text: string;
  priority: 1 | 2 | 3 | 4;
  source: string;
  owner?: string;
};

export type BriefingRecord = {
  id: string;
  date: string;
  status: "draft" | "approved" | "discarded";
  content: string;
  generatedAt: string;
  actionItems: ActionItem[];
  sourcesAvailable: { workiq: boolean; ado: boolean; manual: boolean };
};

// ---------------------------------------------------------------------------
// Standup
// ---------------------------------------------------------------------------

export type StandupRecord = {
  id: string;
  date: string;
  status: "draft" | "approved" | "discarded";
  yesterday: string[];
  today: string[];
  blockers: string[];
  generatedAt: string;
};

// ---------------------------------------------------------------------------
// Notes (daily, weekly, monthly share similar shape)
// ---------------------------------------------------------------------------

export type NoteRecord = {
  id: string;
  type: "daily-note" | "weekly-note" | "monthly-note";
  dateKey: string;
  displayLabel: string;
  status: "draft" | "approved" | "discarded" | "missing" | "generating";
  content: string;
  sources: string[];
  usedBy: string[];
};

// ---------------------------------------------------------------------------
// ADO
// ---------------------------------------------------------------------------

export type AdoTask = {
  id: number;
  type: "Task" | "Bug" | "User Story" | "Epic";
  priority: 1 | 2 | 3 | 4;
  title: string;
  state: "New" | "Active" | "In Review" | "Blocked" | "Closed" | "Resolved";
  sprint: string;
  points: number;
  org: string;
  project: string;
  description: string;
  acceptanceCriteria: string[];
  assignedTo: string;
  tags: string[];
  areaPath: string;
  agentStatus?: CodingAgentStatus;
};

export type CodingAgentStatus =
  | "queued"
  | "setting-up"
  | "analyzing"
  | "implementing"
  | "testing"
  | "creating-pr"
  | "pr-submitted"
  | "blocked"
  | "failed"
  | "done"
  | "abandoned";

export type CodingTaskType =
  | "code-change"
  | "investigation"
  | "needs-context"
  | "not-automatable"
  | "ambiguous";

export type PullRequest = {
  id: number;
  title: string;
  repo: string;
  status: "active" | "completed" | "abandoned";
  reviewers: Person[];
  isDraft: boolean;
  isAgentPR: boolean;
  linesAdded: number;
  linesRemoved: number;
  branch: string;
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Coding Agents
// ---------------------------------------------------------------------------

export type CodingAgentTask = {
  id: string;
  adoTaskId: number;
  taskTitle: string;
  taskDescription?: string;
  org: string;
  tool: "claude-code" | "agency-cli";
  status: CodingAgentStatus;
  taskType: CodingTaskType;
  branch?: string;
  progress: number;
  prNumber?: number;
  prUrl?: string;
  worktreePath?: string;
  repoPath?: string;
  claudeSessionId?: string;
  error?: string;
  metrics?: CodingAgentMetrics;
  steps: PipelineStep[];
  startedAt: string;
  completedAt?: string;
  duration: string;
};

export type CodingAgentMetrics = {
  stepsCount?: number;
  numTurns?: number;
  verificationCycles?: number;
  filesModified?: number;
  costUsd?: number;
  durationMs?: number;
};

// ---------------------------------------------------------------------------
// People & 1:1
// ---------------------------------------------------------------------------

export type Person = {
  name: string;
  initials: string;
  relationship?: "manager" | "peer" | "skip-level";
  hasUpcoming1on1: boolean;
};

export type OneOnOneSession = {
  id: string;
  person: string;
  date: string;
  dateRange: { start: string; end: string };
  status: "draft" | "approved";
  content: string;
  carryForward: string[];
};

// ---------------------------------------------------------------------------
// Engage
// ---------------------------------------------------------------------------

export type EngagePost = {
  id: string;
  status: "draft" | "improved" | "approved" | "published" | "discarded";
  sourceType: string;
  date: string;
  content: string;
  topics: string[];
  valuesAlignment: number;
  rating?: number;
  reactions?: number;
  publishedAt?: string;
};

export type PlannedWorkItem = {
  id: string;
  title: string;
  description: string;
  areaPath: string;
  iteration: string;
  priority: 1 | 2 | 3 | 4;
  dueDate: string;
};

export type PlannedStoryWithTasks = {
  story: PlannedWorkItem;
  tasks: PlannedWorkItem[];
};

// ---------------------------------------------------------------------------
// Project Planner
// ---------------------------------------------------------------------------

export type ProjectLink = {
  label: string;
  url: string;
};

export type Project = {
  id: string;
  name: string;
  brief: string;
  onePager: string | null;
  adoOrg: string | null;
  adoProject: string | null;
  links: ProjectLink[];
  status: "draft" | "planning" | "active" | "completed";
  currentStep: "brief" | "one-pager" | "work-items";
  claudeSessionId: string | null;
  createdAt: string;
  updatedAt: string;
  workItemCount?: number;
  adoSyncCount?: number;
  activeSessionId?: string | null;
};

export type WorkItem = {
  id: string;
  projectId: string;
  parentId: string | null;
  type: "Epic" | "Feature" | "Requirement" | "User Story" | "Task" | "Bug";
  title: string;
  description: string;
  assignedTo: string | null;
  areaPath: string | null;
  iteration: string | null;
  priority: 1 | 2 | 3 | 4;
  tags: string;
  dueDate: string | null;
  adoId: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type AgentSessionStatus = "running" | "paused" | "completed" | "failed";

export type AgentSession = {
  id: string;
  projectId: string;
  agentName: string;
  status: AgentSessionStatus;
  currentStep: string | null;
  startedAt: string;
  completedAt: string | null;
  error: string | null;
};

export type AgentEvent =
  | { type: "thinking"; message: string }
  | { type: "step"; label: string }
  | { type: "token"; text: string }
  | { type: "progress"; current: number; estimated: number }
  | { type: "item_created"; item: WorkItem }
  | { type: "ado_created"; itemId: string; adoId: number }
  | { type: "ado_failed"; itemId: string; error: string }
  | { type: "complete" }
  | { type: "error"; message: string };

// ---------------------------------------------------------------------------
// Agent Registry
// ---------------------------------------------------------------------------

export type AgentRegistryEntry = {
  name: string;
  status: AgentStatus;
  lastRun: string | null;
  nextRun: string;
  enabled: boolean;
  queue: string;
  consecutiveFailures: number;
};

// ---------------------------------------------------------------------------
// Approval Queue
// ---------------------------------------------------------------------------

export type ApprovalQueueItem = {
  id: string;
  agentName: string;
  type: string;
  preview: string;
  timestamp: string;
  content?: string;
};

// ---------------------------------------------------------------------------
// System Health
// ---------------------------------------------------------------------------

export type SystemHealth = {
  tokenSpend7d: number[];
  successRate: number;
  totalFailures: number;
  adoCacheFresh: boolean;
  adoCacheAge: string;
  dlqCount: number;
  embeddingBacklog: number;
};

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export type CalendarEvent = {
  time: string;
  title: string;
  duration: string;
  isFocusBlock: boolean;
};

// ---------------------------------------------------------------------------
// Quick Note
// ---------------------------------------------------------------------------

export type QuickNoteCategory =
  | "todo"
  | "decision"
  | "question"
  | "idea"
  | "reminder"
  | "discussion-topic"
  | "observation";

export type QuickNoteContext = {
  pageType: string;
  route: string;
  label: string;
};

export type QuickNote = {
  id: string;
  content: string;
  timestamp: string;
  status: "approved" | "resolved" | "archived";
  category?: QuickNoteCategory;
  context?: QuickNoteContext;
  consumedBy?: string[];
  processing?: boolean;
};

// ---------------------------------------------------------------------------
// Token Budget
// ---------------------------------------------------------------------------

export type TokenBudget = {
  used: number;
  budget: number;
  costEstimate: number;
};

// ---------------------------------------------------------------------------
// Dependency Health
// ---------------------------------------------------------------------------

export type DepStatusEntry = {
  name: string;
  status: "healthy" | "degraded" | "down";
  message: string | null;
  fixCommand: string | null;
  checkedAt: string;
};

export const DEP_LABELS: Record<string, string> = {
  workiq: "WorkIQ",
  "npm-token": "NPM Token",
  "az-login": "AZ Login",
  redis: "Redis",
  postgres: "PostgreSQL",
};
