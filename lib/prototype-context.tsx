"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type PageState = "loading" | "empty" | "error" | "populated" | "streaming";

export type TarsAgentMode = "closed" | "minimized" | "open";

type PrototypeState = {
  globalPageState: PageState;
  pageOverrides: Record<string, PageState>;
  tarsAgentMode: TarsAgentMode;
};

type PrototypeContextValue = PrototypeState & {
  /** Get the effective state for the current page route */
  getPageState: (route?: string) => PageState;
  setGlobalPageState: (state: PageState) => void;
  setPageOverride: (route: string, state: PageState) => void;
  clearPageOverride: (route: string) => void;
  setTarsAgentMode: (mode: TarsAgentMode) => void;
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);

export function PrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PrototypeState>({
    globalPageState: "populated",
    pageOverrides: {},
    tarsAgentMode: "closed",
  });

  const pathname = usePathname();

  const getPageState = useCallback(
    (route?: string) => {
      const r = route ?? pathname;
      // Normalize route for matching (e.g., /task/demo-1 → /task/[id])
      const normalized = normalizeRoute(r);
      return state.pageOverrides[normalized] ?? state.globalPageState;
    },
    [pathname, state.pageOverrides, state.globalPageState],
  );

  const setGlobalPageState = useCallback((pageState: PageState) => {
    setState((prev) => ({ ...prev, globalPageState: pageState, pageOverrides: {} }));
  }, []);

  const setPageOverride = useCallback((route: string, pageState: PageState) => {
    setState((prev) => ({
      ...prev,
      pageOverrides: { ...prev.pageOverrides, [route]: pageState },
    }));
  }, []);

  const clearPageOverride = useCallback((route: string) => {
    setState((prev) => {
      const { [route]: _, ...rest } = prev.pageOverrides;
      return { ...prev, pageOverrides: rest };
    });
  }, []);

  const setTarsAgentMode = useCallback((mode: TarsAgentMode) => {
    setState((prev) => ({ ...prev, tarsAgentMode: mode }));
  }, []);

  return (
    <PrototypeContext.Provider
      value={{
        ...state,
        getPageState,
        setGlobalPageState,
        setPageOverride,
        clearPageOverride,
        setTarsAgentMode,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const ctx = useContext(PrototypeContext);
  if (!ctx) throw new Error("usePrototype must be inside PrototypeProvider");
  return ctx;
}

/** Map dynamic routes to their template form for consistent override keys */
function normalizeRoute(route: string): string {
  // /task/abc-123 → /task/[id]
  if (/^\/task\/[^/]+$/.test(route)) return "/task/[id]";
  // /project-planner/abc-123 → /project-planner/[id]
  if (/^\/project-planner\/[^/]+$/.test(route)) return "/project-planner/[id]";
  return route;
}

/** All prototype routes for the control panel */
export const PROTOTYPE_ROUTES = [
  { route: "/", label: "Dashboard" },
  { route: "/briefing", label: "Briefing" },
  { route: "/standup", label: "Standup" },
  { route: "/ado", label: "Work Items (ADO)" },
  { route: "/coding-agents", label: "Coding Agents" },
  { route: "/project-planner", label: "Project Planner" },
  { route: "/project-planner/[id]", label: "Project Workspace" },
  { route: "/task/[id]", label: "Task Workspace" },
  { route: "/notes/daily", label: "Notes (Daily)" },
  { route: "/notes/weekly", label: "Notes (Weekly)" },
  { route: "/notes/monthly", label: "Notes (Monthly)" },
  { route: "/one-on-one", label: "1:1 Notes" },
  { route: "/engage", label: "Engage Posts" },
  { route: "/agents", label: "Agents" },
] as const;

export const PAGE_STATES: PageState[] = ["loading", "empty", "error", "populated", "streaming"];
