"use client";

import { type ReactNode, type ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";
import { ChatCodeBlock, ChatMermaid, extractText } from "@/components/shared/code";

export function MarkdownRenderer({
  content,
  className,
  size = "md",
}: {
  content: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const sm = size === "sm";

  return (
    <div className={cn(sm ? "space-y-3" : "space-y-4", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          h1: ({ children }) => (
            <h1
              className={cn(
                "font-bold tracking-tight leading-tight mt-6 mb-3",
                sm ? "text-base" : "text-2xl",
              )}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={cn(
                "font-semibold tracking-tight mt-8 mb-3 pb-2 border-b border-border/50",
                sm ? "text-sm" : "text-lg",
              )}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn("font-semibold mt-5 mb-2", sm ? "text-[13px]" : "text-base")}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={cn("leading-7 text-foreground", sm ? "text-[13px]" : "text-sm")}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className={cn("list-disc pl-5 space-y-1.5", sm ? "text-[13px]" : "text-sm")}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn("list-decimal pl-5 space-y-1.5", sm ? "text-[13px]" : "text-sm")}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn("leading-7", sm ? "text-[13px]" : "text-sm")}>{children}</li>
          ),
          pre: ({ children }) => {
            const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
            if (child?.props?.className?.includes("language-mermaid")) {
              const text = extractText(child.props.children);
              return <ChatMermaid chart={text} />;
            }
            return <>{children}</>;
          },
          code: ({ children, className: codeClassName }) => {
            const isBlock =
              codeClassName?.startsWith("language-") || codeClassName?.startsWith("hljs");
            if (isBlock) {
              return <ChatCodeBlock className={codeClassName}>{children}</ChatCodeBlock>;
            }
            return (
              <code
                className={cn(
                  "font-mono bg-muted px-1.5 py-0.5 rounded",
                  sm ? "text-xs" : "text-sm",
                )}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <blockquote
              className={cn(
                "border-l-2 border-primary pl-4 italic text-muted-foreground",
                sm ? "text-[13px]" : "text-sm",
              )}
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border my-4" />,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          a: ({ children, href }) => {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                className="text-primary underline underline-offset-4 hover:text-primary/80 inline-flex items-center gap-1"
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
                {isExternal && <ExternalLink className="h-3 w-3 inline shrink-0" />}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-muted/20 transition-colors">{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">{children}</th>
          ),
          td: ({ children }) => <td className="px-3 py-2.5 align-top">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
