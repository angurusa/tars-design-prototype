"use client";

import { GitPullRequest, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionGroup } from "@/components/ado/SectionGroup";
import { PRRow } from "@/components/ado/PRRow";
import type { PR } from "@/components/ado/types";

export function PrsView({
  search,
  filteredPRs,
  prsByRepoAndState,
  collapsedSections,
  toggleSection,
  adoOrg,
  setSearch,
}: {
  search: string;
  filteredPRs: PR[];
  prsByRepoAndState: [string, { submitted: PR[]; draft: PR[] }][];
  collapsedSections: Set<string>;
  toggleSection: (key: string) => void;
  adoOrg: string;
  setSearch: (s: string) => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search PRs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 w-48 text-xs"
          />
        </div>
      </div>

      {filteredPRs.length === 0 ? (
        <EmptyState icon={GitPullRequest} title="No pull requests found" />
      ) : (
        <div className="divide-y">
          {prsByRepoAndState.map(([repo, groups]) => {
            const sectionKey = `prs-${repo}`;
            const totalCount = groups.submitted.length + groups.draft.length;
            return (
              <SectionGroup
                key={repo}
                icon={<GitPullRequest className="h-4 w-4" />}
                label={repo}
                count={totalCount}
                colorClass="text-info"
                countBg="bg-info/10"
                collapsed={collapsedSections.has(sectionKey)}
                onToggle={() => toggleSection(sectionKey)}
              >
                <div className="space-y-1">
                  {groups.submitted.length > 0 && (
                    <div>
                      {groups.submitted.length > 0 && groups.draft.length > 0 && (
                        <div className="text-[10px] font-medium text-success uppercase tracking-wider px-1 pt-1 pb-0.5">
                          Submitted
                        </div>
                      )}
                      <div role="grid">
                        {groups.submitted.map((pr) => (
                          <PRRow key={pr.id} pr={pr} adoOrg={adoOrg} />
                        ))}
                      </div>
                    </div>
                  )}
                  {groups.draft.length > 0 && (
                    <div>
                      {groups.submitted.length > 0 && groups.draft.length > 0 && (
                        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 pt-1 pb-0.5">
                          Draft
                        </div>
                      )}
                      <div role="grid">
                        {groups.draft.map((pr) => (
                          <PRRow key={pr.id} pr={pr} adoOrg={adoOrg} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </SectionGroup>
            );
          })}
        </div>
      )}
    </>
  );
}
