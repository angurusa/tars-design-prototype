"use client";

import { useState } from "react";
import {
  ScrollText,
  ChevronRight,
  ChevronDown,
  Terminal,
  FileEdit,
  Search,
  Wrench,
  Brain,
  MessageSquare,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Mock transcript
// ---------------------------------------------------------------------------
type MockToolCall = {
  kind: "tool_call";
  id: string;
  toolName: string;
  label: string;
  result?: string;
};

type MockTextEntry = {
  kind: "text" | "thinking";
  id: string;
  content: string;
};

type TranscriptItem = MockToolCall | MockTextEntry;

const MOCK_TRANSCRIPT: TranscriptItem[] = [
  { kind: "thinking", id: "t-1", content: "Let me analyze the codebase to understand how weekly report aggregation works and where the timezone issue might be." },
  { kind: "tool_call", id: "tc-1", toolName: "Bash", label: "git checkout -b agent/fix-timezone-offset-9012", result: "Switched to a new branch 'agent/fix-timezone-offset-9012'" },
  { kind: "tool_call", id: "tc-2", toolName: "Grep", label: '"aggregation" in src/reports/' },
  { kind: "tool_call", id: "tc-3", toolName: "Read", label: "src/reports/weekly-aggregation.ts" },
  { kind: "thinking", id: "t-2", content: "Found the issue. The getWeekBoundary() function uses server time instead of the user's configured timezone. I need to update it to accept a timezone parameter." },
  { kind: "tool_call", id: "tc-4", toolName: "Edit", label: "src/reports/weekly-aggregation.ts" },
  { kind: "tool_call", id: "tc-5", toolName: "Write", label: "src/reports/utils/timezone.ts" },
  { kind: "text", id: "tx-1", content: "I've fixed the timezone boundary calculation. The function now uses Intl.DateTimeFormat to properly handle user timezones. Now running the test suite." },
  { kind: "tool_call", id: "tc-6", toolName: "Bash", label: "bun run test -- --filter weekly-aggregation", result: "Tests: 12 passed, 0 failed" },
  { kind: "tool_call", id: "tc-7", toolName: "Edit", label: "src/reports/__tests__/weekly-aggregation.test.ts" },
  { kind: "tool_call", id: "tc-8", toolName: "Bash", label: "bun run test -- --filter weekly-aggregation", result: "Tests: 18 passed, 0 failed" },
  { kind: "tool_call", id: "tc-9", toolName: "Bash", label: "bun run lint", result: "No lint errors found" },
];

// ---------------------------------------------------------------------------
// Icon maps
// ---------------------------------------------------------------------------
const TOOL_ICONS: Record<string, typeof Wrench> = {
  Bash: Terminal,
  Edit: FileEdit,
  Read: Search,
  Write: FileEdit,
  Grep: Search,
};

// ---------------------------------------------------------------------------
// Tool call card
// ---------------------------------------------------------------------------
function ToolCallCard({ item }: { item: MockToolCall }) {
  const [resultOpen, setResultOpen] = useState(false);
  const Icon = TOOL_ICONS[item.toolName] ?? Wrench;

  return (
    <div className="rounded-md border border-border/40 bg-card/30 text-xs">
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px]">
        <Icon className="size-3 shrink-0 text-muted-foreground/60" />
        <span className="flex-1 min-w-0 text-left font-mono truncate leading-none text-foreground/80">
          {item.label}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground/35">
          {item.toolName}
        </span>
        <span className="shrink-0 text-[10px] font-medium text-[var(--log-success)]/70">done</span>
        {item.result && (
          <button
            onClick={() => setResultOpen((v) => !v)}
            className="shrink-0 flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground"
          >
            {resultOpen ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
            out
          </button>
        )}
      </div>
      {resultOpen && item.result && (
        <div className="border-t border-border/25 px-3 py-2 text-[11px] text-muted-foreground max-h-56 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-mono leading-relaxed">{item.result}</pre>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Thinking entry
// ---------------------------------------------------------------------------
function ThinkingEntry({ item }: { item: MockTextEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-start gap-1.5 py-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 shrink-0 text-muted-foreground/35 hover:text-muted-foreground/60 py-0.5"
      >
        {open ? <ChevronDown className="size-2.5" /> : <ChevronRight className="size-2.5" />}
        <Brain className="size-3" />
        <span className="text-[10px] italic">thinking</span>
      </button>
      {open && (
        <p className="flex-1 text-[11px] italic text-muted-foreground/45 leading-relaxed pt-0.5">
          {item.content}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Text entry
// ---------------------------------------------------------------------------
function TextEntry({ item }: { item: MockTextEntry }) {
  return (
    <div className="flex items-start gap-1.5 py-0.5 text-xs">
      <MessageSquare className="size-3 shrink-0 text-muted-foreground/25 mt-0.5" />
      <p className="flex-1 text-muted-foreground/75 leading-relaxed">{item.content}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogsTab
// ---------------------------------------------------------------------------
type LogsTabProps = {
  hasLogs?: boolean;
};

export function LogsTab({ hasLogs = true }: LogsTabProps) {
  const toolCallCount = MOCK_TRANSCRIPT.filter((t) => t.kind === "tool_call").length;

  if (!hasLogs) {
    return (
      <EmptyState
        icon={Terminal}
        title="No tool calls yet"
        description="Logs appear as the agent works."
        className="h-full"
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-border/20 bg-background/90 px-3 py-1 backdrop-blur-sm text-[10px] text-muted-foreground/45">
        <ScrollText className="size-3" />
        <span>
          {toolCallCount} tool call{toolCallCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="px-3 py-2 space-y-1">
        {MOCK_TRANSCRIPT.map((item) => {
          if (item.kind === "tool_call") return <ToolCallCard key={item.id} item={item} />;
          if (item.kind === "thinking") return <ThinkingEntry key={item.id} item={item} />;
          return <TextEntry key={item.id} item={item} />;
        })}
      </div>
    </div>
  );
}
