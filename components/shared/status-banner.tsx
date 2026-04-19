"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, XCircle } from "lucide-react";

const variants = {
  info: {
    container: "border-info/30 bg-info/5",
    icon: Info,
    iconColor: "text-info",
  },
  warning: {
    container: "border-warning/30 bg-warning/5",
    icon: AlertTriangle,
    iconColor: "text-warning",
  },
  error: {
    container: "border-destructive/30 bg-destructive/5",
    icon: XCircle,
    iconColor: "text-destructive",
  },
};

type Props = {
  variant: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
};

export function StatusBanner({ variant, children, className }: Props) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 flex items-start gap-3 text-sm animate-in fade-in duration-200",
        config.container,
        className,
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", config.iconColor)} />
      <div className="flex-1">{children}</div>
    </div>
  );
}
