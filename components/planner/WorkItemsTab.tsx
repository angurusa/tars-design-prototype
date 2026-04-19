"use client";

import { useState } from "react";
import { ChevronRight, ListTodo } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock work items
// ---------------------------------------------------------------------------
type MockWorkItem = {
  id: string;
  type: "Feature" | "User Story" | "Task";
  title: string;
  priority: 1 | 2 | 3 | 4;
  description?: string;
  children?: MockWorkItem[];
};

const MOCK_WORK_ITEMS: MockWorkItem[] = [
  {
    id: "wi-1",
    type: "Feature",
    title: "Core Notification Service",
    priority: 1,
    description: "Build the foundational notification service with event bus integration and routing logic.",
    children: [
      {
        id: "wi-1-1",
        type: "User Story",
        title: "Notification Event Schema & Kafka Topics",
        priority: 1,
        description: "Define the notification event schema and set up Kafka topics for priority-based routing.",
      },
      {
        id: "wi-1-2",
        type: "User Story",
        title: "Router Service Implementation",
        priority: 1,
        description: "Implement the router service that reads user preferences and fans out to channel adapters.",
      },
      {
        id: "wi-1-3",
        type: "Task",
        title: "Email Adapter (SendGrid)",
        priority: 2,
        description: "Implement the SendGrid email channel adapter with template support.",
      },
    ],
  },
  {
    id: "wi-2",
    type: "Feature",
    title: "User Preference Management",
    priority: 2,
    description: "Allow users to configure notification preferences per channel and notification type.",
    children: [
      {
        id: "wi-2-1",
        type: "User Story",
        title: "Preference Data Model & API",
        priority: 2,
        description: "Create the preference store schema and REST API for CRUD operations.",
      },
      {
        id: "wi-2-2",
        type: "User Story",
        title: "Quiet Hours Support",
        priority: 3,
        description: "Implement quiet hours that suppress non-critical notifications during configured periods.",
      },
    ],
  },
  {
    id: "wi-3",
    type: "Feature",
    title: "Additional Channel Adapters",
    priority: 3,
    description: "Add Slack, Teams, and push notification channel adapters.",
    children: [
      {
        id: "wi-3-1",
        type: "Task",
        title: "Slack Bot Adapter",
        priority: 3,
      },
      {
        id: "wi-3-2",
        type: "Task",
        title: "Teams Graph API Adapter",
        priority: 3,
      },
      {
        id: "wi-3-3",
        type: "Task",
        title: "Push Notification Adapter (FCM/APNs)",
        priority: 3,
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Style maps
// ---------------------------------------------------------------------------
const typeBadgeStyles: Record<string, string> = {
  Feature: "bg-purple-500/12 text-purple-400",
  "User Story": "bg-[var(--link)]/12 text-[var(--link)]",
  Task: "bg-[var(--log-success)]/10 text-[var(--log-success)]",
};

const typeBorderStyles: Record<string, string> = {
  Feature: "border-l-purple-500",
  "User Story": "border-l-[var(--link)]",
  Task: "border-l-[var(--log-success)]",
};

// ---------------------------------------------------------------------------
// Child row
// ---------------------------------------------------------------------------
function WorkItemChildRow({ item }: { item: MockWorkItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 py-2 px-3 text-sm hover:bg-muted/30 text-left rounded transition-colors"
      >
        <span className="w-px h-4 bg-border/50 shrink-0 mr-1" />
        <ChevronRight
          className={cn(
            "size-3 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded",
            typeBadgeStyles[item.type] ?? "bg-muted text-muted-foreground",
          )}
        >
          {item.type}
        </span>
        <span className="flex-1 truncate">{item.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">P{item.priority}</span>
      </button>

      {expanded && item.description && (
        <div className="border-l-2 border-border/50 ml-7 mb-1">
          <div className="px-3 pt-1.5 pb-1 text-xs text-muted-foreground leading-relaxed">
            {item.description}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Parent card
// ---------------------------------------------------------------------------
function WorkItemCard({ item }: { item: MockWorkItem }) {
  const [childrenExpanded, setChildrenExpanded] = useState(true);
  const children = item.children ?? [];

  return (
    <div
      className={cn(
        "bg-card/50 rounded-lg border border-border/50 overflow-hidden border-l-2",
        typeBorderStyles[item.type] ?? "border-l-border",
      )}
    >
      {/* Card header */}
      <button
        onClick={() => setChildrenExpanded(!childrenExpanded)}
        className="flex w-full items-center gap-2 py-2.5 px-3 text-sm hover:bg-muted/20 text-left transition-colors"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground transition-transform",
            childrenExpanded && "rotate-90",
          )}
        />
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded",
            typeBadgeStyles[item.type] ?? "bg-muted text-muted-foreground",
          )}
        >
          {item.type}
        </span>
        <span className="flex-1 truncate font-medium">{item.title}</span>
        <span className="text-xs text-muted-foreground shrink-0 bg-muted/50 px-1.5 py-0.5 rounded">
          P{item.priority}
        </span>
        {!childrenExpanded && children.length > 0 && (
          <span className="text-[10px] text-muted-foreground shrink-0 bg-muted/50 px-1.5 py-0.5 rounded-full">
            {children.length} items
          </span>
        )}
      </button>

      {/* Description */}
      {item.description && (
        <div className="border-t border-border/30 px-4 py-2">
          <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
        </div>
      )}

      {/* Children */}
      {childrenExpanded && children.length > 0 && (
        <div className="border-t border-border/30 py-1 px-2">
          {children.map((child) => (
            <WorkItemChildRow key={child.id} item={child} />
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

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2">
        {MOCK_WORK_ITEMS.map((item) => (
          <WorkItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
