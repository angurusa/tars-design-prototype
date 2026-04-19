"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle, Circle, X } from "lucide-react";

type Step = {
  label: string;
  status: "done" | "active" | "pending" | "failed";
};

interface LiveAgentPanelProps {
  agentName: string;
  steps: Step[];
  isStreaming: boolean;
  error: string | null;
  startedAt: number | null;
  onClose: () => void;
}

function StepIcon({ status }: { status: Step["status"] }) {
  switch (status) {
    case "done":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "active":
      return <Loader2 className="h-4 w-4 text-info animate-spin" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-destructive" />;
    default:
      return <Circle className="h-4 w-4 text-muted-foreground" />;
  }
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="text-sm text-muted-foreground tabular-nums">
      {mins}m {secs.toString().padStart(2, "0")}s
    </span>
  );
}

export function LiveAgentPanel({
  agentName,
  steps,
  isStreaming,
  error,
  startedAt,
  onClose,
}: LiveAgentPanelProps) {
  return (
    <Card className="border-info/50">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Live Agent Output</h2>
          <Badge variant="outline" className="font-mono text-xs">
            {agentName}
          </Badge>
          {isStreaming && startedAt && <ElapsedTime startedAt={startedAt} />}
          {!isStreaming && !error && (
            <Badge variant="secondary" className="text-xs">Complete</Badge>
          )}
          {error && (
            <Badge variant="destructive" className="text-xs">Failed</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.label} className="flex items-center gap-2 text-sm">
              <StepIcon status={step.status} />
              <span className={step.status === "active" ? "font-medium" : ""}>
                {step.label}
              </span>
            </div>
          ))}
          {steps.length === 0 && isStreaming && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </div>
          )}
        </div>
        {error && (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
