import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonContentPage({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Status badge */}
      <Skeleton className="h-6 w-32 rounded-full" />

      {/* Content block */}
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
