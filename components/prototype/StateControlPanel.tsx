"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  MessageSquare,
  Palette,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePrototype,
  PAGE_STATES,
  PROTOTYPE_ROUTES,
  type PageState,
  type TarsAgentMode,
} from "@/lib/prototype-context";

const TARS_MODES: TarsAgentMode[] = ["closed", "minimized", "open"];

export function StateControlPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const {
    globalPageState,
    pageOverrides,
    tarsAgentMode,
    getPageState,
    setGlobalPageState,
    setPageOverride,
    setTarsAgentMode,
  } = usePrototype();

  // Find current route label
  const normalizedRoute = PROTOTYPE_ROUTES.find(
    (r) =>
      r.route === pathname ||
      (r.route === "/task/[id]" && /^\/task\/[^/]+$/.test(pathname)) ||
      (r.route === "/project-planner/[id]" &&
        /^\/project-planner\/[^/]+$/.test(pathname) &&
        pathname !== "/project-planner"),
  );
  const currentRoute = normalizedRoute?.route ?? pathname;
  const currentLabel = normalizedRoute?.label ?? pathname;
  const currentState = getPageState();

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-xs font-medium">{currentState}</span>
        <ChevronUp className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-72 rounded-xl border bg-popover text-popover-foreground shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold">Design Controls</span>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-3">
        {/* Current page */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Current Page
          </label>
          <p className="text-xs font-medium mt-0.5">{currentLabel}</p>
        </div>

        {/* Page state selector */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Page State
          </label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PAGE_STATES.map((s) => (
              <button
                key={s}
                onClick={() => setPageOverride(currentRoute, s)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  currentState === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Global state */}
        <div>
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Apply to All Pages
          </label>
          <div className="flex flex-wrap gap-1 mt-1">
            {PAGE_STATES.map((s) => (
              <button
                key={s}
                onClick={() => setGlobalPageState(s)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  globalPageState === s && Object.keys(pageOverrides).length === 0
                    ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                    : "bg-muted/50 text-muted-foreground/60 hover:bg-accent/50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Theme
          </label>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-[11px] font-medium hover:bg-accent transition-colors"
          >
            {theme === "dark" ? (
              <Moon className="h-3 w-3" />
            ) : (
              <Sun className="h-3 w-3" />
            )}
            {theme === "dark" ? "Dark" : "Light"}
          </button>
        </div>

        {/* TARS Agent mode */}
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            TARS Agent
          </label>
          <div className="flex gap-1">
            {TARS_MODES.map((m) => (
              <button
                key={m}
                onClick={() => setTarsAgentMode(m)}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  tarsAgentMode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 pt-1 border-t">
          <button
            onClick={() => toast.success("Sample toast notification")}
            className="flex-1 rounded-md bg-muted px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Toast
          </button>
          <button
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
              );
            }}
            className="flex-1 rounded-md bg-muted px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent transition-colors"
          >
            Cmd+K
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-quick-note"))}
            className="flex-1 rounded-md bg-muted px-2 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-accent transition-colors flex items-center justify-center gap-1"
          >
            <MessageSquare className="h-3 w-3" />
            Note
          </button>
        </div>
      </div>
    </div>
  );
}
