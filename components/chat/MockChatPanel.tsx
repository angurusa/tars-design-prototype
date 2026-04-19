"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { ArrowUp, Sparkles, Bot, Wrench, Terminal, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type MockMessage = {
  id: string;
  role: "user" | "assistant";
  kind: "text" | "thinking" | "tool_use";
  content: string;
  toolName?: string;
  toolLabel?: string;
};

type MockChatPanelProps = {
  messages: MockMessage[];
  emptyStateText?: string;
  emptyStateIcon?: "sparkles" | "bot";
  placeholder?: string;
};

// ---------------------------------------------------------------------------
// Tool icon resolver
// ---------------------------------------------------------------------------
const TOOL_ICONS: Record<string, typeof Wrench> = {
  Bash: Terminal,
  Edit: FileEdit,
};

// ---------------------------------------------------------------------------
// Message components
// ---------------------------------------------------------------------------
function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end px-5 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="max-w-[80%] min-w-0 rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-sm leading-relaxed text-foreground">
        {content}
      </div>
    </div>
  );
}

function AssistantText({ content }: { content: string }) {
  return (
    <div className="px-5 py-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div className="flex items-center gap-2 px-5 py-2 animate-in fade-in duration-200">
      <div className="flex gap-[3px]">
        <span className="size-[5px] rounded-full bg-foreground/20 animate-bounce [animation-delay:0ms]" />
        <span className="size-[5px] rounded-full bg-foreground/20 animate-bounce [animation-delay:150ms]" />
        <span className="size-[5px] rounded-full bg-foreground/20 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground/40 italic">Thinking...</span>
    </div>
  );
}

function ToolUseBubble({
  toolName,
  toolLabel,
}: {
  toolName: string;
  toolLabel?: string;
}) {
  const Icon = TOOL_ICONS[toolName] ?? Wrench;
  return (
    <div className="px-5 py-0.5 animate-in fade-in duration-150">
      <div className="rounded-md border border-border/40 bg-card/30 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[28px]">
          <Icon className="size-3 shrink-0 text-muted-foreground/60" />
          <span className="flex-1 min-w-0 font-mono truncate leading-none text-foreground/80">
            {toolLabel ?? toolName}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted-foreground/35">
            {toolName}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-[var(--log-success)]/70">
            done
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Composer (non-functional)
// ---------------------------------------------------------------------------
function MockComposer({ placeholder }: { placeholder: string }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      e.target.style.height = "auto";
      e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
    },
    [],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // no-op
    }
  }, []);

  return (
    <div className="px-3 pb-3 pt-1">
      <div
        className={cn(
          "relative flex flex-col rounded-2xl border outline-none",
          "bg-background/80 backdrop-blur-xl",
          "shadow-lg shadow-black/5",
          "transition-all duration-150",
          "border-border/40 focus-within:border-primary/30 focus-within:shadow-xl focus-within:shadow-black/8",
        )}
      >
        <div className="flex items-end gap-1 px-2 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[36px] max-h-40 flex-1 resize-none bg-transparent py-1 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/40"
            rows={1}
          />
          <button
            type="button"
            disabled={!input.trim()}
            title="Send"
            className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
export function MockChatPanel({
  messages,
  emptyStateText = "Send a message to get started.",
  emptyStateIcon = "sparkles",
  placeholder = "Send a message...",
}: MockChatPanelProps) {
  const EmptyIcon = emptyStateIcon === "bot" ? Bot : Sparkles;

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-8 pt-28 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <EmptyIcon className="size-6 text-primary/60" />
            </div>
            <p className="text-sm text-muted-foreground/70 max-w-[240px] leading-relaxed">
              {emptyStateText}
            </p>
          </div>
        ) : (
          <div className="py-3">
            {messages.map((msg) => {
              if (msg.kind === "thinking") {
                return <ThinkingBubble key={msg.id} />;
              }
              if (msg.kind === "tool_use") {
                return (
                  <ToolUseBubble
                    key={msg.id}
                    toolName={msg.toolName ?? "Tool"}
                    toolLabel={msg.toolLabel}
                  />
                );
              }
              if (msg.role === "user") {
                return <UserBubble key={msg.id} content={msg.content} />;
              }
              return <AssistantText key={msg.id} content={msg.content} />;
            })}
          </div>
        )}
      </div>

      {/* Composer */}
      <MockComposer placeholder={placeholder} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preset message sets for reuse
// ---------------------------------------------------------------------------
export const PLANNER_CHAT_MESSAGES: MockMessage[] = [
  {
    id: "pm-1",
    role: "user",
    kind: "text",
    content:
      "Plan a notification service redesign. It should support email, Slack, Teams, and push notifications with user preference management.",
  },
  {
    id: "pm-2",
    role: "assistant",
    kind: "text",
    content:
      "I'll create a one-pager for the notification service redesign. Let me analyze the requirements and draft the architecture proposal.",
  },
  {
    id: "pm-3",
    role: "assistant",
    kind: "tool_use",
    content: "",
    toolName: "Edit",
    toolLabel: "Writing one-pager document...",
  },
  {
    id: "pm-4",
    role: "assistant",
    kind: "text",
    content:
      "I've drafted the one-pager. It covers the multi-channel delivery architecture, user preference data model, and a phased rollout plan. The One-Pager tab now shows the full document. Want me to break it down into work items?",
  },
];

export const CODING_CHAT_MESSAGES: MockMessage[] = [
  {
    id: "cm-1",
    role: "assistant",
    kind: "text",
    content:
      "Starting work on Bug #9012: Timezone Offset in Weekly Report Aggregation. Let me analyze the codebase first.",
  },
  {
    id: "cm-2",
    role: "assistant",
    kind: "tool_use",
    content: "",
    toolName: "Bash",
    toolLabel: "git checkout -b agent/fix-timezone-offset-9012",
  },
  {
    id: "cm-3",
    role: "assistant",
    kind: "tool_use",
    content: "",
    toolName: "Bash",
    toolLabel: 'grep -r "aggregation" src/reports/',
  },
  {
    id: "cm-4",
    role: "assistant",
    kind: "tool_use",
    content: "",
    toolName: "Edit",
    toolLabel: "src/reports/weekly-aggregation.ts",
  },
  {
    id: "cm-5",
    role: "assistant",
    kind: "text",
    content:
      "I found the issue. The `getWeekBoundary()` function uses `new Date()` which returns server time (UTC) instead of the user's configured timezone. I've updated it to accept a timezone parameter and use `Intl.DateTimeFormat` for proper boundary calculation. Running tests now.",
  },
  {
    id: "cm-6",
    role: "assistant",
    kind: "tool_use",
    content: "",
    toolName: "Bash",
    toolLabel: "bun run test -- --filter weekly-aggregation",
  },
];
