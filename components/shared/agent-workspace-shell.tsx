"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TabDefinition = {
  key: string;
  label: string;
  icon: LucideIcon;
  badge?: React.ReactNode;
};

export type AgentWorkspaceShellProps = {
  /** Route for the back button */
  backHref: string;
  /** Primary title — ReactNode to allow formatting */
  title: React.ReactNode;
  /** Optional secondary line under title */
  subtitle?: React.ReactNode;
  /** Action buttons rendered at the right of the header */
  headerActions?: React.ReactNode;
  /** Tab definitions */
  tabs: TabDefinition[];
  /** Currently active tab key */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabKey: string) => void;
  /** Chat panel slot (left pane) */
  chatPanel: React.ReactNode;
  /** Tab content (right pane body) */
  children: React.ReactNode;
  /** Chat pane width in pixels (default: 420) */
  chatWidth?: number;
};

// ---------------------------------------------------------------------------
// Tab bar (underline style)
// ---------------------------------------------------------------------------
function WorkspaceTabBar({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: TabDefinition[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}) {
  return (
    <div className="flex border-b shrink-0">
      {tabs.map(({ key, label, icon: TabIcon, badge }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors",
            activeTab === key
              ? "border-foreground text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground/80",
          )}
        >
          <TabIcon className="size-3.5" />
          {label}
          {badge}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function WorkspaceHeader({
  backHref,
  title,
  subtitle,
  headerActions,
}: {
  backHref: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerActions?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={() => router.push(backHref)}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-sm truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </div>
      {headerActions}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------
export function AgentWorkspaceShell({
  backHref,
  title,
  subtitle,
  headerActions,
  tabs,
  activeTab,
  onTabChange,
  chatPanel,
  children,
  chatWidth = 420,
}: AgentWorkspaceShellProps) {
  return (
    <div className="-mx-6 -my-4 lg:-mx-8 flex flex-col h-[calc(100vh-var(--topbar-height))]">
      <WorkspaceHeader
        backHref={backHref}
        title={title}
        subtitle={subtitle}
        headerActions={headerActions}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <div
          className="min-w-[280px] shrink-0 border-r flex flex-col overflow-hidden"
          style={{ width: chatWidth }}
        >
          {chatPanel}
        </div>

        {/* Right: Tabs */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <WorkspaceTabBar tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
          <div key={activeTab} className="flex-1 overflow-hidden animate-fade-in-up">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
