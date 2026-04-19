"use client";

export function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-transparent"
          : "bg-background text-muted-foreground border-border hover:bg-muted"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={active ? "opacity-80" : "opacity-60"}>({count})</span>
      )}
    </button>
  );
}
