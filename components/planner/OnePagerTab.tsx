"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { StepIndicator } from "@/components/shared/step-indicator";
import { Button } from "@/components/ui/button";
import { FileText, Printer } from "lucide-react";
import type { PipelineStep } from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock one-pager content
// ---------------------------------------------------------------------------
const MOCK_ONE_PAGER = `# Notification Service Redesign

## Problem Statement

The current notification system is a monolithic email sender tightly coupled to the telemetry pipeline. It cannot support multi-channel delivery (Slack, Teams, push) or user preference management. As the platform grows, we need a scalable, extensible notification service.

## Proposed Solution

Build a new notification service with a pluggable channel architecture, centralized preference store, and event-driven delivery pipeline.

### Architecture

- **Event Bus**: Kafka topics for notification events, one per priority level
- **Router Service**: Reads user preferences, fans out to appropriate channel adapters
- **Channel Adapters**: Email (SendGrid), Slack (Bot API), Teams (Graph API), Push (FCM/APNs)
- **Preference Store**: PostgreSQL table with per-user, per-notification-type channel preferences
- **DLQ**: Failed deliveries retry 3x with exponential backoff, then move to dead letter queue

### Data Model

| Table | Key Columns |
|-------|------------|
| notification_preferences | user_id, notification_type, channels[], quiet_hours |
| notification_log | id, user_id, channel, status, sent_at, delivered_at |
| notification_templates | type, channel, template_body, variables[] |

## Phased Rollout

1. **Phase 1 (Sprint 15)**: Core service skeleton, email adapter, preference API
2. **Phase 2 (Sprint 16)**: Slack + Teams adapters, quiet hours support
3. **Phase 3 (Sprint 17)**: Push notifications, analytics dashboard, self-service preferences UI

## Success Metrics

- Delivery latency P95 < 500ms for email, < 200ms for push
- User preference opt-in rate > 60% within first month
- Zero unsubscribe-related support tickets

## Open Questions

- Should we support notification batching/digests? (leaning yes for email)
- Do we need approval for Slack bot installation in customer workspaces?
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getPlannerSteps(hasOnePager: boolean, hasWorkItems: boolean, hasSync: boolean): PipelineStep[] {
  return [
    { label: "Brief", status: hasOnePager ? "done" : "active" },
    { label: "One-Pager", status: hasOnePager ? "done" : "pending" },
    { label: "Work Items", status: hasWorkItems ? "done" : hasOnePager ? "active" : "pending" },
    { label: "ADO Sync", status: hasSync ? "done" : hasWorkItems ? "active" : "pending" },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
type OnePagerTabProps = {
  hasOnePager?: boolean;
  hasWorkItems?: boolean;
  hasSync?: boolean;
};

export function OnePagerTab({
  hasOnePager = true,
  hasWorkItems = true,
  hasSync = false,
}: OnePagerTabProps) {
  const steps = getPlannerSteps(hasOnePager, hasWorkItems, hasSync);

  if (!hasOnePager) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 pt-5 pb-3 max-w-2xl mx-auto w-full">
          <StepIndicator steps={steps} />
        </div>
        <EmptyState
          icon={FileText}
          title="No one-pager yet"
          description="Ask the planner to generate one."
          className="flex-1"
        />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto overflow-x-hidden h-full">
      <div className="max-w-2xl mx-auto px-6 py-5">
        <div className="mb-5">
          <StepIndicator steps={steps} />
        </div>

        <div className="flex justify-end mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Export PDF
          </Button>
        </div>

        <MarkdownRenderer content={MOCK_ONE_PAGER} />

        <p className="mt-6 text-[11px] text-muted-foreground/60">
          Last updated: Mar 10, 2026 via chat
        </p>
      </div>
    </div>
  );
}
