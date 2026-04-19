"use client";

import { ChevronDown } from "lucide-react";

export function SectionGroup({
  icon,
  label,
  count,
  colorClass,
  countBg,
  collapsed,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
  countBg: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="py-1">
      <button onClick={onToggle} className="flex items-center gap-2 w-full py-2 text-left group">
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${collapsed ? "-rotate-90" : ""}`}
        />
        <span className={colorClass}>{icon}</span>
        <span className={`text-sm font-semibold ${colorClass}`}>{label}</span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colorClass} ${countBg}`}
        >
          {count}
        </span>
      </button>
      {!collapsed && (
        <div className="ml-5" role="grid">
          {children}
        </div>
      )}
    </section>
  );
}
