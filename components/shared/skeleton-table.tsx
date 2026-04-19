import { Skeleton } from "@/components/ui/skeleton";

const CELL_WIDTHS = ["w-32", "w-24", "w-40", "w-20", "w-28", "w-36"];

export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-6">
      {/* Title area */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center gap-4 px-4 h-10 border-b bg-muted/50">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
              key={`h-${i}`}
              className={`h-3 ${CELL_WIDTHS[i % CELL_WIDTHS.length]}`}
            />
          ))}
        </div>

        {/* Body rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 px-4 h-12 border-b last:border-b-0"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={`${r}-${c}`}
                className={`h-4 ${CELL_WIDTHS[(c + r) % CELL_WIDTHS.length]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
