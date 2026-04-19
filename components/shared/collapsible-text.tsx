"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  clampClass?: string;
  fromColor?: string;
};

export function CollapsibleText({
  children,
  clampClass = "max-h-[6.5rem]",
  fromColor = "from-background",
}: Props) {
  const [full, setFull] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (ref.current) setOverflows(ref.current.scrollHeight > ref.current.clientHeight);
  });

  return (
    <div className="relative">
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-[max-height] duration-200",
          full ? "max-h-none" : clampClass,
        )}
      >
        {children}
      </div>
      {overflows && !full && (
        <div
          className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t ${fromColor} to-transparent pointer-events-none`}
        />
      )}
      {overflows && (
        <button
          type="button"
          onClick={() => setFull((f) => !f)}
          className="text-[11px] text-muted-foreground hover:text-foreground mt-1 transition-colors"
        >
          {full ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
