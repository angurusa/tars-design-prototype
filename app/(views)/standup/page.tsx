"use client";

import { usePrototype } from "@/lib/prototype-context";
import { PageHeader } from "@/components/shared/page-header";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { StatusBanner } from "@/components/shared/status-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { StepIndicator } from "@/components/shared/step-indicator";
import { mockStandup } from "@/lib/mock-data";
import { formatDisplayDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Check } from "lucide-react";
import type { PipelineStep } from "@/lib/types";

function formatStandupContent(standup: typeof mockStandup): string {
  let md = "## Yesterday\n\n";
  for (const item of standup.yesterday) {
    md += `- ${item}\n`;
  }
  md += "\n## Today\n\n";
  for (const item of standup.today) {
    md += `- ${item}\n`;
  }
  if (standup.blockers.length > 0) {
    md += "\n## Blockers\n\n";
    for (const item of standup.blockers) {
      md += `- ${item}\n`;
    }
  }
  return md;
}

const streamingSteps: { label: string; status: "done" | "active" }[] = [
  { label: "Fetching daily notes", status: "done" },
  { label: "Analyzing ADO activity", status: "done" },
  { label: "Checking git commits", status: "active" },
];

export default function StandupPage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/standup");
  const today = formatDisplayDate();

  if (state === "loading") {
    return (
      <div className="space-y-6">
        <PageHeader title="Standup" subtitle={today} />
        <div className="max-w-2xl mx-auto">
          <SkeletonContentPage />
        </div>
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="space-y-6">
        <PageHeader title="Standup" subtitle={today} />
        <EmptyState
          icon={FileText}
          title="No standup yet today"
          description="The agent runs at 8:45am, or you can generate one now."
          action={{ label: "Generate Now", onClick: () => {} }}
        />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="space-y-6">
        <PageHeader title="Standup" subtitle={today} />
        <div className="max-w-2xl mx-auto">
          <StatusBanner variant="error">
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to generate standup
              </p>
              <p className="text-xs text-muted-foreground">
                The standup agent encountered an error. Check agent logs for
                details.
              </p>
            </div>
          </StatusBanner>
        </div>
      </div>
    );
  }

  // populated + streaming
  const generatedTime = new Date(mockStandup.generatedAt).toLocaleTimeString(
    "en-US",
    { hour: "numeric", minute: "2-digit", hour12: true },
  );

  const standupMarkdown = formatStandupContent(mockStandup);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Standup"
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
            <div className="space-y-2">
              {streamingSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {step.status === "active" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-info shrink-0" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-info shrink-0" />
                  )}
                  <span
                    className={
                      step.status === "active"
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </StatusBanner>
        )}

        <MarkdownRenderer content={standupMarkdown} />
      </div>
    </div>
  );
}
