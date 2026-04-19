"use client";

import { useState, useMemo } from "react";
import { usePrototype } from "@/lib/prototype-context";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBanner } from "@/components/shared/status-banner";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { mockPeople, mockOneOnOneSessions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
} from "lucide-react";

const relationshipLabel: Record<string, string> = {
  manager: "Manager",
  peer: "Peer",
  "skip-level": "Skip-level",
};

export default function OneOnOnePage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/one-on-one");

  const [selectedPersonIndex, setSelectedPersonIndex] = useState(0);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<
    number | null
  >(0);
  const [postMeetingOpen, setPostMeetingOpen] = useState(false);

  const people = mockPeople;

  const selectedPerson = people[selectedPersonIndex];

  const sessionsForPerson = useMemo(
    () =>
      mockOneOnOneSessions.filter((s) => s.person === selectedPerson?.name),
    [selectedPerson],
  );

  const selectedSession =
    selectedSessionIndex !== null
      ? sessionsForPerson[selectedSessionIndex]
      : null;

  function handlePersonSelect(index: number) {
    setSelectedPersonIndex(index);
    setSelectedSessionIndex(0);
    setPostMeetingOpen(false);
  }

  function handleSessionSelect(index: number) {
    setSelectedSessionIndex(index);
    setPostMeetingOpen(false);
  }

  // Loading state: skeleton in both panels
  if (state === "loading") {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-height)-5rem)] -m-6">
        <div className="w-64 shrink-0 border-r p-4 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <SkeletonContentPage />
        </div>
      </div>
    );
  }

  // Empty state
  if (state === "empty") {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-height)-5rem)] -m-6">
        <div className="w-64 shrink-0 border-r p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            People
          </h3>
          <p className="text-sm text-muted-foreground">No people added yet.</p>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <EmptyState
            icon={Users}
            title="No 1:1 sessions yet"
            description="Sessions are generated before your scheduled 1:1 meetings."
          />
        </div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="flex h-[calc(100vh-var(--topbar-height)-5rem)] -m-6">
        <div className="w-64 shrink-0 border-r p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            People
          </h3>
        </div>
        <div className="flex-1 p-6">
          <StatusBanner variant="error">
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to load 1:1 sessions
              </p>
              <p className="text-xs text-muted-foreground">
                Could not fetch session data. Check your connection and try
                again.
              </p>
            </div>
          </StatusBanner>
        </div>
      </div>
    );
  }

  // populated + streaming (streaming renders same as populated for now)
  return (
    <div className="flex h-[calc(100vh-var(--topbar-height)-5rem)] -m-6">
      {/* Left panel */}
      <div className="w-64 shrink-0 border-r overflow-y-auto p-4 space-y-6">
        {/* People section */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            People
          </h3>
          <div className="flex flex-col gap-0.5">
            {people.map((person, i) => (
              <button
                key={person.name}
                onClick={() => handlePersonSelect(i)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors w-full cursor-pointer",
                  "hover:bg-accent/50",
                  selectedPersonIndex === i && "bg-accent",
                )}
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-[10px]">
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-sm">{person.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {person.relationship
                      ? relationshipLabel[person.relationship]
                      : ""}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sessions for selected person */}
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Sessions
          </h3>
          <div className="flex flex-col gap-0.5">
            {sessionsForPerson.map((session, i) => (
              <button
                key={session.id}
                onClick={() => handleSessionSelect(i)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors w-full cursor-pointer",
                  "hover:bg-accent/50",
                  selectedSessionIndex === i && "bg-accent",
                )}
              >
                <span className="flex-1 truncate">{session.date}</span>
                {session.status === "approved" && (
                  <Check className="h-3.5 w-3.5 text-success shrink-0" />
                )}
              </button>
            ))}
            {sessionsForPerson.length === 0 && (
              <EmptyState
                icon={Users}
                title="No sessions yet"
                className="py-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSession ? (
          <div className="max-w-3xl space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                  1:1 with {selectedSession.person}
                </h1>
                {selectedPerson && (
                  <Badge variant="outline" className="text-[10px]">
                    {selectedPerson?.relationship
                      ? relationshipLabel[selectedPerson.relationship]
                      : ""}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedSession.date} &middot; Period:{" "}
                {selectedSession.dateRange.start} to{" "}
                {selectedSession.dateRange.end}
              </p>
            </div>

            {/* Status + approve */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  selectedSession.status === "approved"
                    ? "default"
                    : "secondary"
                }
              >
                {selectedSession.status === "approved" ? "Approved" : "Draft"}
              </Badge>
              {selectedSession.status === "draft" && (
                <>
                  <Button size="sm">Approve</Button>
                  <Button size="sm" variant="outline">
                    Regenerate
                  </Button>
                </>
              )}
            </div>

            {/* Content */}
            <MarkdownRenderer content={selectedSession.content} />

            {/* Carry forward */}
            {selectedSession.carryForward.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <h2 className="text-base font-semibold">Carried Forward</h2>
                <ul className="space-y-1.5">
                  {selectedSession.carryForward.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 h-3.5 w-3.5 rounded border-border"
                        readOnly
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Post-meeting section */}
            <div className="border-t pt-4">
              <button
                onClick={() => setPostMeetingOpen(!postMeetingOpen)}
                className="flex items-center gap-1 text-base font-semibold hover:text-foreground/80 transition-colors cursor-pointer"
              >
                {postMeetingOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                Post-Meeting Notes
              </button>

              {postMeetingOpen && (
                <div className="mt-4 space-y-3 pl-5">
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Meeting Notes
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Feedback Received
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add My Action Items
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Manager&apos;s Action Items
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="Select a session to view"
            className="h-full"
          />
        )}
      </div>
    </div>
  );
}
