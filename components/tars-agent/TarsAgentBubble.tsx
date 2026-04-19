"use client";

import { useCallback, useEffect } from "react";
import { Sparkles, Minus, X, Send, Mic } from "lucide-react";
import { usePrototype, type TarsAgentMode } from "@/lib/prototype-context";

// Panel dimensions (matching real TARS)
const PANEL_W = 480;
const PANEL_H = 700;
const MINI_W = 250;
const MINI_H = 48;

// Static mock messages for the chat view
const MOCK_MESSAGES = [
  { role: "user" as const, content: "What did I work on yesterday?" },
  {
    role: "assistant" as const,
    content:
      "Based on your ADO activity and git commits, here's what you worked on yesterday:\n\n1. **PR #487 — Telemetry pipeline refactor** — addressed review comments from Ben, pushed 3 commits\n2. **Bug #9012 — Timezone display** — investigated the root cause, identified the offset calculation issue in `DateFormatter.tsx`\n3. **Sprint planning** — attended sprint 15 planning, picked up 2 new tasks\n\nWould you like me to draft a standup from this?",
  },
  { role: "user" as const, content: "Yes, draft a standup" },
  {
    role: "assistant" as const,
    content:
      "Done! I've generated a standup draft. You can review it on the [Standup page](/standup). It covers the telemetry PR, timezone bug investigation, and sprint planning.",
  },
];

function MockChatView({
  onMinimize,
  onClose,
}: {
  onMinimize: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">TARS Agent</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {MOCK_MESSAGES.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {msg.content.split("\n").map((line, j) => (
                <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t px-3 py-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm text-muted-foreground">
            Ask TARS anything...
          </div>
          <button className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Mic className="h-4 w-4" />
          </button>
          <button className="rounded-lg bg-primary p-2 text-primary-foreground hover:opacity-90 transition-opacity">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MockMiniBar({
  onExpand,
  onClose,
}: {
  onExpand: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="flex items-center justify-between h-full px-3 cursor-pointer"
      onClick={onExpand}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-medium">TARS Agent</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="rounded-md p-1 hover:bg-primary-foreground/10 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

export function TarsAgentBubble() {
  const { tarsAgentMode, setTarsAgentMode } = usePrototype();

  const handleOpen = useCallback(() => setTarsAgentMode("minimized"), [setTarsAgentMode]);
  const handleExpand = useCallback(() => setTarsAgentMode("open"), [setTarsAgentMode]);
  const handleMinimize = useCallback(() => setTarsAgentMode("minimized"), [setTarsAgentMode]);
  const handleClose = useCallback(() => setTarsAgentMode("closed"), [setTarsAgentMode]);

  // Keyboard shortcut: Cmd+J to cycle modes
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        const cycle: Record<TarsAgentMode, TarsAgentMode> = {
          closed: "minimized",
          minimized: "open",
          open: "closed",
        };
        setTarsAgentMode(cycle[tarsAgentMode]);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tarsAgentMode, setTarsAgentMode]);

  const isClosed = tarsAgentMode === "closed";
  const isOpen = tarsAgentMode === "open";
  const isMinimized = tarsAgentMode === "minimized";

  return (
    <>
      {/* Backdrop overlay — only in full panel mode */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={handleMinimize}
        />
      )}

      {/* Animated container */}
      {!isClosed && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-2xl overflow-hidden origin-bottom-right transition-shadow duration-300 ${
            isMinimized
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border border-primary/30"
              : "bg-background border border-border/50 shadow-xl"
          }`}
          style={{
            width: isOpen ? PANEL_W : MINI_W,
            height: isOpen ? PANEL_H : MINI_H,
            transition: [
              "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              "height 300ms cubic-bezier(0.4, 0, 0.2, 1)",
            ].join(", "),
          }}
        >
          {/* Full chat view */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transition: "opacity 200ms ease",
              transitionDelay: isOpen ? "100ms" : "0ms",
            }}
          >
            <MockChatView onMinimize={handleMinimize} onClose={handleClose} />
          </div>

          {/* Mini bar */}
          <div
            className="absolute inset-0"
            style={{
              opacity: isMinimized ? 1 : 0,
              pointerEvents: isMinimized ? "auto" : "none",
              transition: "opacity 200ms ease",
              transitionDelay: isMinimized ? "100ms" : "0ms",
            }}
          >
            <MockMiniBar onExpand={handleExpand} onClose={handleClose} />
          </div>
        </div>
      )}

      {/* Floating bubble button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={!isClosed}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center size-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-105 active:scale-95 disabled:pointer-events-none"
        style={{
          opacity: isClosed ? 1 : 0,
          transform: isClosed ? "scale(1)" : "scale(0.5)",
          transition: "opacity 200ms ease, transform 200ms ease",
        }}
        title="TARS Agent (⌘J)"
      >
        <Sparkles className="size-5" />
      </button>
    </>
  );
}
