"use client";

import { Inbox, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { FilterChip } from "@/components/ado/FilterChip";
import { WorkItemRow } from "@/components/ado/WorkItemRow";
import type { Task } from "@/components/ado/types";
import { WORK_ITEM_COLUMNS } from "@/components/ado/types";

function ColumnHeaderRow({ columns }: { columns: { label: string; className: string }[] }) {
  return (
    <div
      role="row"
      className="flex items-center gap-2.5 py-1 px-1 sticky top-0 bg-background z-10 border-b border-border/50"
    >
      {columns.map((col, i) => (
        <span
          key={i}
          role="columnheader"
          className={`text-xs text-muted-foreground font-medium ${col.className}`}
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}

export function BacklogView({
  allStates,
  allProjects,
  allTypes,
  stateCounts,
  typeCounts,
  stateFilters,
  projectFilters,
  typeFilters,
  search,
  filteredTasks,
  tasks,
  linkedPRCountMap,
  adoOrg,
  onSelectTask,
  toggleFilter,
  setStateFilters,
  setProjectFilters,
  setTypeFilters,
  setSearch,
}: {
  allStates: string[];
  allProjects: string[];
  allTypes: string[];
  stateCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  stateFilters: Set<string>;
  projectFilters: Set<string>;
  typeFilters: Set<string>;
  search: string;
  filteredTasks: Task[];
  tasks: Task[];
  linkedPRCountMap: Map<number, number>;
  adoOrg: string;
  onSelectTask: (task: Task) => void;
  toggleFilter: (current: Set<string>, setter: (s: Set<string>) => void, value: string) => void;
  setStateFilters: (s: Set<string>) => void;
  setProjectFilters: (s: Set<string>) => void;
  setTypeFilters: (s: Set<string>) => void;
  setSearch: (s: string) => void;
}) {
  return (
    <>
      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {allStates.map((s) => (
          <FilterChip
            key={s}
            label={s}
            count={stateCounts[s]}
            active={stateFilters.has(s)}
            onClick={() => toggleFilter(stateFilters, setStateFilters, s)}
          />
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        {allProjects.map((p) => (
          <FilterChip
            key={p}
            label={p}
            active={projectFilters.has(p)}
            onClick={() => toggleFilter(projectFilters, setProjectFilters, p)}
          />
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        {allTypes.map((t) => (
          <FilterChip
            key={t}
            label={t}
            count={typeCounts[t]}
            active={typeFilters.has(t)}
            onClick={() => toggleFilter(typeFilters, setTypeFilters, t)}
          />
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 pl-7 w-48 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={tasks.length === 0 ? Inbox : Search}
          title="No work items found"
          description={tasks.length === 0 ? 'Click "Sync Now" to pull from ADO.' : undefined}
        />
      ) : (
        <div role="grid">
          <ColumnHeaderRow columns={WORK_ITEM_COLUMNS} />
          {filteredTasks.map((task) => (
            <WorkItemRow
              key={task.id}
              task={task}
              adoOrg={adoOrg}
              showState
              showPriorityBorder
              linkedPRCount={linkedPRCountMap.get(task.id)}
              onClick={() => onSelectTask(task)}
            />
          ))}
        </div>
      )}
    </>
  );
}
