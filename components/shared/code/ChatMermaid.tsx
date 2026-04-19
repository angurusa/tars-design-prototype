"use client";

import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";

type Props = {
  chart: string;
};

/** Stubbed mermaid renderer for prototype — shows source code only */
export function ChatMermaid({ chart }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group my-2 rounded-lg border border-border/30 bg-muted/20 overflow-hidden">
      <div className="flex items-center justify-end gap-1 px-2 py-1 border-b border-border/20">
        <span className="text-[10px] text-muted-foreground/40 font-mono mr-auto">mermaid</span>
        <Code className="size-3.5 text-muted-foreground/40" />
        <button
          type="button"
          onClick={handleCopy}
          className="rounded p-1 text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
          title="Copy source"
        >
          {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="p-4 text-xs leading-relaxed overflow-x-auto">
        <code>{chart}</code>
      </pre>
    </div>
  );
}
