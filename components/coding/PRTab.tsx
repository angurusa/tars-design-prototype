"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, GitPullRequest } from "lucide-react";

type PRTabProps = {
  hasPR?: boolean;
  prId?: number;
  prUrl?: string;
  branch?: string;
  isDraft?: boolean;
};

export function PRTab({
  hasPR = true,
  prId = 488,
  prUrl = "https://dev.azure.com/contoso/telemetry-platform/_git/telemetry-platform/pullrequest/488",
  branch = "agent/fix-timezone-offset-9012",
  isDraft = true,
}: PRTabProps) {
  if (!hasPR) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <GitPullRequest className="mb-2 size-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">
          No pull request yet. One will be created after verification passes.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      <div className="max-w-2xl mx-auto px-6 py-5 space-y-4">
        <div className="flex items-center gap-3">
          <GitPullRequest className="size-5 text-blue-400" />
          <span className="text-lg font-semibold">PR #{prId}</span>
          {isDraft && (
            <Badge variant="secondary" className="bg-warning/15 text-warning border-transparent">
              Draft
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground font-mono">{branch}</p>

        <Button variant="outline" size="sm" onClick={() => window.open(prUrl, "_blank")}>
          <ExternalLink className="mr-1.5 size-3.5" />
          Open in ADO
        </Button>

        <div className="rounded-md border border-border/50 bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            This PR was created by TARS Coding Agent and requires human review before merge.
          </p>
        </div>
      </div>
    </div>
  );
}
