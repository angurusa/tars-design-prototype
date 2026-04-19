"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimelineList } from "@/components/shared/timeline-list";

type NotesLayoutItem = {
  dateKey: string;
  displayLabel: string;
  status: "draft" | "approved" | "discarded" | "missing" | "generating";
};

export function NotesLayout({
  items,
  selectedContent,
  selectedIndex,
  onSelect,
}: {
  items: NotesLayoutItem[];
  selectedContent: React.ReactNode;
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  const [showContent, setShowContent] = useState(false);

  function handleSelect(index: number) {
    onSelect(index);
    setShowContent(true);
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div
        className={`w-72 shrink-0 border-r overflow-y-auto p-4 ${
          showContent ? "hidden md:block" : "block"
        }`}
      >
        <TimelineList items={items} selectedIndex={selectedIndex} onSelect={handleSelect} />
      </div>

      {/* Right panel */}
      <div className={`flex-1 overflow-y-auto p-6 ${showContent ? "block" : "hidden md:block"}`}>
        {/* Back button for mobile */}
        <div className="mb-4 md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setShowContent(false)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
        </div>

        {selectedContent ?? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a note to view
          </div>
        )}
      </div>
    </div>
  );
}
