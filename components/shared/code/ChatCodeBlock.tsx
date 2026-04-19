"use client";

import { useState, type ReactNode } from "react";
import { Copy, Check } from "lucide-react";
import { extractText } from "./extract-text";

type Props = {
  children: ReactNode;
  className?: string;
};

export function ChatCodeBlock({ children, className }: Props) {
  const [copied, setCopied] = useState(false);

  const language = className?.replace(/^language-/, "").replace(/^hljs\s*/, "") ?? "";

  const handleCopy = () => {
    navigator.clipboard.writeText(extractText(children)).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {
        /* clipboard denied */
      },
    );
  };

  return (
    <div className="relative group my-2">
      <pre className="rounded-lg bg-muted/40 p-4 text-xs leading-relaxed overflow-x-auto">
        <code className={className}>{children}</code>
      </pre>

      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 bg-muted/80 backdrop-blur text-muted-foreground/60 hover:text-foreground hover:bg-muted"
        title="Copy code"
      >
        {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      </button>

      {language && language !== "undefined" && (
        <span className="absolute bottom-2 right-2 text-[10px] text-muted-foreground/25 font-mono select-none">
          {language}
        </span>
      )}
    </div>
  );
}
