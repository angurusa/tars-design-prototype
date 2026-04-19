"use client";

import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { AgeBadge } from "@/components/ado/AgeBadge";
import { ReviewerAvatar } from "@/components/ado/ReviewerAvatar";
import type { PR } from "@/components/ado/types";

export function PRRow({ pr, adoOrg, compact }: { pr: PR; adoOrg: string; compact?: boolean }) {
  const url = `${pr.org || adoOrg}/${pr.project || ""}/_git/${pr.repo}/pullrequest/${pr.id}`;
  const openPR = () => window.open(url, "_blank");
  return (
    <div
      role="row"
      tabIndex={0}
      className="flex items-center gap-2.5 py-1.5 px-1 cursor-pointer rounded-sm hover:bg-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={openPR}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPR();
        }
      }}
    >
      <span role="gridcell" className="text-xs text-muted-foreground font-mono w-[72px] shrink-0">
        PR #{pr.id}
      </span>
      <span role="gridcell" className="text-sm font-medium truncate flex-1 min-w-0">
        {pr.title}
      </span>
      {pr.isDraft && (
        <span role="gridcell" className="shrink-0">
          <Badge variant="outline" className="text-[10px] px-1.5">
            Draft
          </Badge>
        </span>
      )}
      {pr.isStale && (
        <span role="gridcell" className="shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 border-transparent ${
              pr.ageDays > 30 ? "bg-destructive/15 text-destructive" : "bg-warning/15 text-warning"
            }`}
          >
            Stale
          </Badge>
        </span>
      )}
      {!compact && (
        <span
          role="gridcell"
          className="text-xs text-muted-foreground shrink-0 hidden sm:inline w-[120px] truncate text-right"
        >
          {pr.repo}
        </span>
      )}
      {!compact && (
        <span role="gridcell" className="shrink-0">
          <span className="flex items-center gap-1">
            {pr.reviewers.map((r, i) => (
              <ReviewerAvatar key={i} reviewer={r} />
            ))}
            {pr.reviewers.length === 0 && (
              <span className="text-xs text-muted-foreground">&mdash;</span>
            )}
          </span>
        </span>
      )}
      <span role="gridcell" className="shrink-0">
        <AgeBadge days={pr.ageDays} />
      </span>
      {!compact && (
        <span role="gridcell" className="shrink-0">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      )}
    </div>
  );
}
