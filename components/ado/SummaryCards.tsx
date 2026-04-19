"use client";

import { AlertCircle, CheckCircle2, GitPullRequest, Zap } from "lucide-react";

export function SummaryCards({
  blockedCount,
  activeCount,
  prsCount,
  doneCount,
  onCardClick,
}: {
  blockedCount: number;
  activeCount: number;
  prsCount: number;
  doneCount: number;
  onCardClick: (type: string) => void;
}) {
  const cards = [
    {
      key: "blocked",
      label: "Blocked",
      count: blockedCount,
      icon: <AlertCircle className="h-4 w-4" />,
      className: "text-destructive",
      bg: "bg-destructive/10",
    },
    {
      key: "active",
      label: "Active",
      count: activeCount,
      icon: <Zap className="h-4 w-4" />,
      className: "text-warning",
      bg: "bg-warning/10",
    },
    {
      key: "prs",
      label: "PRs Open",
      count: prsCount,
      icon: <GitPullRequest className="h-4 w-4" />,
      className: "text-info",
      bg: "bg-info/10",
    },
    {
      key: "done",
      label: "Done",
      count: doneCount,
      icon: <CheckCircle2 className="h-4 w-4" />,
      className: "text-success",
      bg: "bg-success/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((c) => (
        <button
          key={c.key}
          onClick={() => onCardClick(c.key)}
          className={`${c.bg} rounded-lg p-3 text-left transition-all hover:ring-2 hover:ring-ring/20`}
        >
          <div className={`flex items-center gap-2 ${c.className}`}>
            {c.icon}
            <span className="text-2xl font-bold tracking-tight">{c.count}</span>
          </div>
          <div className={`text-xs mt-0.5 ${c.className} opacity-80`}>{c.label}</div>
        </button>
      ))}
    </div>
  );
}
