"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TimelineItem = {
  dateKey: string;
  displayLabel: string;
  status: "draft" | "approved" | "discarded" | "missing" | "generating";
};

export function TimelineList({
  items,
  selectedIndex,
  onSelect,
}: {
  items: TimelineItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="overflow-y-auto flex flex-col gap-0.5">
      {items.map((item, i) => (
        <Button
          key={item.dateKey}
          variant="ghost"
          onClick={() => onSelect(i)}
          className={cn(
            "justify-start h-auto px-3 py-2 w-full text-sm font-medium",
            selectedIndex === i && "bg-accent",
          )}
        >
          {item.displayLabel}
        </Button>
      ))}
    </div>
  );
}
