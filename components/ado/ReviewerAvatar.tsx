"use client";

export function ReviewerAvatar({
  reviewer,
}: {
  reviewer: { name: string; vote?: number; initials?: string };
}) {
  const initials =
    reviewer.initials ||
    reviewer.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  const vote = reviewer.vote ?? 0;
  const voteIcon =
    vote >= 10 ? "\u2713" : vote === 5 ? "\u2713" : vote <= -10 ? "\u2717" : "\u25CB";
  const voteColor =
    vote >= 5
      ? "text-green-600 dark:text-green-400"
      : vote < 0
        ? "text-red-500"
        : "text-muted-foreground";
  return (
    <div className="flex items-center gap-0.5" title={reviewer.name}>
      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-muted text-[10px] font-medium">
        {initials}
      </span>
      <span className={`text-xs ${voteColor}`}>{voteIcon}</span>
    </div>
  );
}
