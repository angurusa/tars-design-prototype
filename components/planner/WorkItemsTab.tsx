"use client";

import { useState } from "react";
import { ChevronRight, ListTodo } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { CollapsibleText } from "@/components/shared/collapsible-text";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import type { WorkItem } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock work items — rich data matching the real WorkItem type
// ---------------------------------------------------------------------------
const MOCK_WORK_ITEMS: WorkItem[] = [
  // Feature 1: Core Notification Service
  {
    id: "wi-1", projectId: "proj-1", parentId: null,
    type: "Feature", title: "Core Notification Service",
    description: "Build the foundational notification service with **event bus integration** and routing logic.\n\n### Goals\n- Event-driven architecture using Kafka\n- Priority-based routing (P1 = immediate, P2 = batched)\n- Channel adapter pattern for extensibility",
    assignedTo: "andi@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 15",
    priority: 1, tags: "notification-service;backend;p0", dueDate: null, adoId: 4521, sortOrder: 1,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-1-1", projectId: "proj-1", parentId: "wi-1",
    type: "User Story", title: "Notification Event Schema & Kafka Topics",
    description: "Define the notification event schema (Avro) and set up Kafka topics for priority-based routing.\n\n**Acceptance Criteria:**\n- Schema registered in Schema Registry\n- Topics: `notifications.p1`, `notifications.p2`, `notifications.batch`\n- Dead-letter topic for failed deliveries",
    assignedTo: "andi@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 15",
    priority: 1, tags: "kafka;schema", dueDate: null, adoId: 4522, sortOrder: 1,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-1-1-1", projectId: "proj-1", parentId: "wi-1-1",
    type: "Task", title: "Define Avro schema for NotificationEvent",
    description: "Create the Avro schema with fields: `eventId`, `userId`, `channel`, `priority`, `payload`, `metadata`.",
    assignedTo: "andi@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 15",
    priority: 1, tags: "", dueDate: null, adoId: 4530, sortOrder: 1,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-1-1-2", projectId: "proj-1", parentId: "wi-1-1",
    type: "Task", title: "Provision Kafka topics and configure retention",
    description: "",
    assignedTo: "ben.k@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 15",
    priority: 2, tags: "infra", dueDate: null, adoId: 4531, sortOrder: 2,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-1-2", projectId: "proj-1", parentId: "wi-1",
    type: "User Story", title: "Router Service Implementation",
    description: "Implement the router service that reads user preferences and fans out to channel adapters.\n\nThe router should:\n1. Look up user notification preferences\n2. Apply quiet hours filtering\n3. Fan out to appropriate channel adapters",
    assignedTo: "andi@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 15",
    priority: 1, tags: "router;core", dueDate: null, adoId: 4523, sortOrder: 2,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-1-3", projectId: "proj-1", parentId: "wi-1",
    type: "Task", title: "Email Adapter (SendGrid)",
    description: "Implement the SendGrid email channel adapter with template support and retry logic.",
    assignedTo: "sarah.m@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 16",
    priority: 2, tags: "adapter;email", dueDate: null, adoId: 4524, sortOrder: 3,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },

  // Feature 2: User Preference Management
  {
    id: "wi-2", projectId: "proj-1", parentId: null,
    type: "Feature", title: "User Preference Management",
    description: "Allow users to configure notification preferences per channel and notification type. Includes quiet hours, batching preferences, and per-channel opt-out.",
    assignedTo: "priya.r@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 16",
    priority: 2, tags: "preferences;user-facing", dueDate: null, adoId: 4525, sortOrder: 2,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-2-1", projectId: "proj-1", parentId: "wi-2",
    type: "User Story", title: "Preference Data Model & API",
    description: "Create the preference store schema and REST API for CRUD operations.\n\n**Schema fields:** userId, channelType, notificationType, enabled, quietHoursStart, quietHoursEnd, batchWindow",
    assignedTo: "priya.r@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 16",
    priority: 2, tags: "api;database", dueDate: null, adoId: 4526, sortOrder: 1,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-2-2", projectId: "proj-1", parentId: "wi-2",
    type: "User Story", title: "Quiet Hours Support",
    description: "Implement quiet hours that suppress non-critical notifications during configured periods. P1 notifications always go through.",
    assignedTo: "priya.r@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 16",
    priority: 3, tags: "quiet-hours", dueDate: null, adoId: 4527, sortOrder: 2,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },

  // Feature 3: Additional Channel Adapters
  {
    id: "wi-3", projectId: "proj-1", parentId: null,
    type: "Feature", title: "Additional Channel Adapters",
    description: "Add Slack, Teams, and push notification channel adapters following the adapter pattern established in Sprint 15.",
    assignedTo: null, areaPath: "Platform\\Notifications", iteration: "Sprint 17",
    priority: 3, tags: "adapters;channels", dueDate: null, adoId: 4528, sortOrder: 3,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-3-1", projectId: "proj-1", parentId: "wi-3",
    type: "Task", title: "Slack Bot Adapter",
    description: "Implement Slack channel adapter using Bolt SDK. Support rich messages with Block Kit.",
    assignedTo: "ben.k@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 17",
    priority: 3, tags: "slack", dueDate: null, adoId: null, sortOrder: 1,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-3-2", projectId: "proj-1", parentId: "wi-3",
    type: "Task", title: "Teams Graph API Adapter",
    description: "Implement Teams channel adapter using Microsoft Graph API for chat messages and activity feed notifications.",
    assignedTo: "andi@contoso.com", areaPath: "Platform\\Notifications", iteration: "Sprint 17",
    priority: 3, tags: "teams;graph-api", dueDate: null, adoId: null, sortOrder: 2,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
  {
    id: "wi-3-3", projectId: "proj-1", parentId: "wi-3",
    type: "Bug", title: "Push notification delivery fails for iOS 18+ devices",
    description: "APNs v2 token-based auth returns 403 on devices running iOS 18. Likely related to the new privacy relay changes.",
    assignedTo: "sarah.m@contoso.com", areaPath: "Platform\\Notifications\\Mobile", iteration: "Sprint 17",
    priority: 1, tags: "bug;ios;push", dueDate: "2026-03-20", adoId: 4529, sortOrder: 3,
    createdAt: "2026-03-10T10:00:00Z", updatedAt: "2026-03-10T10:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------
const typeBadgeStyles: Record<string, string> = {
  Feature: "bg-purple-500/12 text-purple-400",
  "User Story": "bg-[var(--link)]/12 text-[var(--link)]",
  Task: "bg-[var(--log-success)]/10 text-[var(--log-success)]",
  Bug: "bg-[var(--log-error)]/10 text-[var(--log-error)]",
  Epic: "bg-orange-500/12 text-orange-400",
  Requirement: "bg-amber-500/12 text-amber-400",
};

const typeBorderStyles: Record<string, string> = {
  Feature: "border-l-purple-500",
  "User Story": "border-l-[var(--link)]",
  Task: "border-l-[var(--log-success)]",
  Bug: "border-l-[var(--log-error)]",
  Epic: "border-l-orange-500",
  Requirement: "border-l-amber-500",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function TagPills({ tags }: { tags: string }) {
  return (
    <>
      {tags
        .split(";")
        .filter(Boolean)
        .map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5"
          >
            {tag.trim()}
          </span>
        ))}
    </>
  );
}

type GroupedItem = {
  parent: WorkItem;
  children: { item: WorkItem; grandchildren: WorkItem[] }[];
};

function buildGrouped(items: WorkItem[]): GroupedItem[] {
  const byParent = new Map<string | null, WorkItem[]>();
  for (const item of items) {
    const key = item.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(item);
  }

  const topLevel = byParent.get(null) ?? [];
  return topLevel.map((parent) => {
    const children = byParent.get(parent.id) ?? [];
    return {
      parent,
      children: children.map((child) => ({
        item: child,
        grandchildren: byParent.get(child.id) ?? [],
      })),
    };
  });
}

// Mock ADO org for links
const ADO_ORG = "https://dev.azure.com/contoso";
const ADO_PROJECT = "engineering";

// ---------------------------------------------------------------------------
// Child row
// ---------------------------------------------------------------------------
function WorkItemChildRow({
  item,
  parentItem,
}: {
  item: WorkItem;
  parentItem?: WorkItem;
}) {
  const [expanded, setExpanded] = useState(false);

  const adoUrl =
    item.adoId ? `${ADO_ORG}/${ADO_PROJECT}/_workitems/edit/${item.adoId}` : null;

  const showAssigned = !parentItem || item.assignedTo !== parentItem.assignedTo;
  const showArea = !parentItem || item.areaPath !== parentItem.areaPath;
  const showSprint = !parentItem || item.iteration !== parentItem.iteration;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 py-2 px-3 text-sm hover:bg-muted/30 text-left rounded transition-colors"
      >
        <span className="w-px h-4 bg-border/50 shrink-0 mr-1" />
        <ChevronRight
          className={`size-3 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
        />
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${typeBadgeStyles[item.type] ?? "bg-muted text-muted-foreground"}`}
        >
          {item.type}
        </span>
        <span className="flex-1 truncate">{item.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">P{item.priority}</span>
        {adoUrl ? (
          <a
            href={adoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--link)] shrink-0 font-mono hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            #{item.adoId}
          </a>
        ) : item.adoId ? (
          <span className="text-xs text-[var(--link)] shrink-0 font-mono">#{item.adoId}</span>
        ) : null}
      </button>

      {expanded && (item.description || item.tags || (showAssigned && item.assignedTo) || (showArea && item.areaPath) || (showSprint && item.iteration)) && (
        <div className="border-l-2 border-border/50 ml-7 mb-1">
          {item.description && (
            <div className="px-3 pt-1.5 pb-1 text-foreground/80">
              <CollapsibleText>
                <MarkdownRenderer content={item.description} size="sm" />
              </CollapsibleText>
            </div>
          )}
          {(item.tags ||
            (showAssigned && item.assignedTo) ||
            (showArea && item.areaPath) ||
            (showSprint && item.iteration)) && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-1.5 text-[11px]">
              {item.tags && <TagPills tags={item.tags} />}
              {showAssigned && item.assignedTo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                  <span className="text-muted-foreground">Assigned</span>
                  <span className="text-foreground">{item.assignedTo.replace(/@.*/, "")}</span>
                </span>
              )}
              {showArea && item.areaPath && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                  <span className="text-muted-foreground">Area</span>
                  <span className="text-foreground">{item.areaPath}</span>
                </span>
              )}
              {showSprint && item.iteration && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                  <span className="text-muted-foreground">Sprint</span>
                  <span className="text-foreground">{item.iteration}</span>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parent card
// ---------------------------------------------------------------------------
function WorkItemCard({
  item,
  childItems,
}: {
  item: WorkItem;
  childItems: { item: WorkItem; grandchildren: WorkItem[] }[];
}) {
  const [childrenExpanded, setChildrenExpanded] = useState(true);

  const adoUrl =
    item.adoId ? `${ADO_ORG}/${ADO_PROJECT}/_workitems/edit/${item.adoId}` : null;

  return (
    <div
      className={`bg-card/50 rounded-lg border border-border/50 overflow-hidden border-l-2 ${typeBorderStyles[item.type] ?? "border-l-border"}`}
    >
      {/* Card header */}
      <button
        onClick={() => setChildrenExpanded(!childrenExpanded)}
        className="flex w-full items-center gap-2 py-2.5 px-3 text-sm hover:bg-muted/20 text-left transition-colors"
      >
        <ChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${childrenExpanded ? "rotate-90" : ""}`}
        />
        <span
          className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded ${typeBadgeStyles[item.type] ?? "bg-muted text-muted-foreground"}`}
        >
          {item.type}
        </span>
        <span className="flex-1 truncate font-medium">{item.title}</span>
        <span className="text-xs text-muted-foreground shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
          P{item.priority}
        </span>
        {!childrenExpanded && childItems.length > 0 && (
          <span className="text-[10px] text-muted-foreground shrink-0 bg-muted/50 px-1.5 py-0.5 rounded-full">
            {childItems.reduce((sum, c) => sum + 1 + c.grandchildren.length, 0)} items
          </span>
        )}
        {adoUrl ? (
          <a
            href={adoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--link)] shrink-0 font-mono hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            #{item.adoId}
          </a>
        ) : item.adoId ? (
          <span className="text-xs text-[var(--link)] shrink-0 font-mono">#{item.adoId}</span>
        ) : null}
      </button>

      {/* Metadata + description */}
      {(item.description || item.tags || item.assignedTo || item.areaPath || item.iteration) && (
        <div className="border-t border-border/30 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {item.tags && <TagPills tags={item.tags} />}
            {item.assignedTo && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                <span className="text-muted-foreground">Assigned</span>
                <span className="text-foreground">{item.assignedTo.replace(/@.*/, "")}</span>
              </span>
            )}
            {item.areaPath && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                <span className="text-muted-foreground">Area</span>
                <span className="text-foreground">{item.areaPath}</span>
              </span>
            )}
            {item.iteration && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/50 px-2 py-0.5">
                <span className="text-muted-foreground">Sprint</span>
                <span className="text-foreground">{item.iteration}</span>
              </span>
            )}
          </div>
          {item.description && (
            <div className="text-foreground/80 mt-2">
              <CollapsibleText fromColor="from-card">
                <MarkdownRenderer content={item.description} size="sm" />
              </CollapsibleText>
            </div>
          )}
        </div>
      )}

      {/* Children */}
      {childrenExpanded && childItems.length > 0 && (
        <div className="border-t border-border/30 py-1 px-2">
          {childItems.map(({ item: child, grandchildren }) => (
            <div key={child.id}>
              <WorkItemChildRow item={child} parentItem={item} />
              {grandchildren.length > 0 && (
                <div className="ml-8 border-l-2 border-border/50 pl-2 mb-1">
                  {grandchildren.map((gc) => (
                    <WorkItemChildRow key={gc.id} item={gc} parentItem={child} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab component
// ---------------------------------------------------------------------------
type WorkItemsTabProps = {
  hasItems?: boolean;
};

export function WorkItemsTab({ hasItems = true }: WorkItemsTabProps) {
  if (!hasItems) {
    return (
      <EmptyState
        icon={ListTodo}
        title="No work items yet"
        description="Ask the planner to generate them from the one-pager."
        className="h-full"
      />
    );
  }

  const groups = buildGrouped(MOCK_WORK_ITEMS);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
        {groups.map(({ parent, children }) => (
          <WorkItemCard key={parent.id} item={parent} childItems={children} />
        ))}
      </div>
    </div>
  );
}
