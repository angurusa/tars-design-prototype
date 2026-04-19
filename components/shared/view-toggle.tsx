"use client";

import { List, LayoutGrid } from "lucide-react";

type View = "list" | "cards";

export function ViewToggle({ view, onChange }: { view: View; onChange: (v: View) => void }) {
  return (
    <div className="flex gap-0.5 rounded-md border p-0.5">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`rounded p-1 transition-colors ${view === "list" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="List view"
      >
        <List className="size-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={`rounded p-1 transition-colors ${view === "cards" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        title="Card view"
      >
        <LayoutGrid className="size-3.5" />
      </button>
    </div>
  );
}
