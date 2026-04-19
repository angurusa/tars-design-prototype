"use client";

import { usePrototype } from "@/lib/prototype-context";
import { PageHeader } from "@/components/shared/page-header";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { StatusBanner } from "@/components/shared/status-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { mockBriefing } from "@/lib/mock-data";
import { formatDisplayDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

export default function BriefingPage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/briefing");
  const today = formatDisplayDate();

  if (state === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Briefing" subtitle={today} />
        <div className="max-w-2xl mx-auto">
          <SkeletonContentPage />
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Briefing" subtitle={today} />
        <EmptyState
          icon={FileText}
          title="No briefing yet today"
          description="The agent runs at 7:30am, or you can generate one now."
          action={{ label: "Generate Now", onClick: () => {} }}
        />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Daily Briefing" subtitle={today} />
        <div className="max-w-2xl mx-auto">
          <StatusBanner variant="error">
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to generate briefing
              </p>
              <p className="text-xs text-muted-foreground">
                The briefing agent encountered an error. Check agent logs for
                details.
              </p>
            </div>
          </StatusBanner>
        </div>
      </div>
    );
  }

  // populated + streaming
  const generatedTime = new Date(mockBriefing.generatedAt).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true },
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Briefing"
        subtitle={`${today} · Generated ${generatedTime}`}
        actions={
          <Button variant="outline" size="sm">
            Regenerate
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {state === "streaming" && (
          <StatusBanner variant="info">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-info" />
              <div>
                <p className="text-sm font-medium">Generating briefing...</p>
                <p className="text-xs text-muted-foreground">
                  Pulling M365 data and ADO context. This takes 1-2 minutes.
                </p>
              </div>
            </div>
          </StatusBanner>
        )}

        <MarkdownRenderer content={mockBriefing.content} />
      </div>
    </div>
  );
}
