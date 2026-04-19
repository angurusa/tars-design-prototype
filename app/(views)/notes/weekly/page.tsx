"use client";

import { useState } from "react";
import { usePrototype } from "@/lib/prototype-context";
import { NotesLayout } from "@/components/notes/notes-layout";
import { MarkdownRenderer } from "@/components/shared/markdown-renderer";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBanner } from "@/components/shared/status-banner";
import { SkeletonContentPage } from "@/components/shared/skeleton-content-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { mockWeeklyNotes } from "@/lib/mock-data";
import { FileText, Loader2 } from "lucide-react";

export default function WeeklyNotesPage() {
  const { getPageState } = usePrototype();
  const state = getPageState("/notes/weekly");
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Loading state
  if (state === "loading") {
    return (
      <div className="flex h-full">
        <div className="w-72 shrink-0 border-r p-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
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
      <EmptyState
        icon={FileText}
        title="No weekly notes yet"
        description="Generate a summary of this week."
        action={{ label: "Generate Now", onClick: () => {} }}
      />
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="p-6">
        <StatusBanner variant="error">
          <div>
            <p className="text-sm font-medium text-destructive">
              Failed to load weekly notes
            </p>
            <p className="text-xs text-muted-foreground">
              Could not fetch notes data. Check your connection and try again.
            </p>
          </div>
        </StatusBanner>
      </div>
    );
  }

  // populated + streaming
  const notes = mockWeeklyNotes;

  const items = notes.map((note) => ({
    dateKey: note.dateKey,
    displayLabel: note.displayLabel,
    status: note.status as "draft" | "approved" | "missing" | "generating",
  }));

  const selected = notes[selectedIndex];

  function renderContent() {
    if (!selected) return null;

    if (!selected.content) {
      return (
        <EmptyState
          icon={FileText}
          title={`No note for ${selected.displayLabel}`}
          description="This week has no generated note yet."
          action={{ label: "Generate Now", onClick: () => {} }}
        />
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">
            {selected.displayLabel}
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Regenerate
            </Button>
          </div>
        </div>

        {state === "streaming" && (
          <StatusBanner variant="info">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-info" />
              <p className="text-sm font-medium">Generating weekly note...</p>
            </div>
          </StatusBanner>
        )}

        <MarkdownRenderer content={selected.content} />

        {(selected.sources.length > 0 || selected.usedBy.length > 0) && (
          <div className="space-y-1 border-t pt-4 text-xs text-muted-foreground">
            {selected.sources.length > 0 && (
              <p>Sources: {selected.sources.join(", ")}</p>
            )}
            {selected.usedBy.length > 0 && (
              <p>Used by: {selected.usedBy.join(", ")}</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <NotesLayout
      items={items}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      selectedContent={renderContent()}
    />
  );
}
