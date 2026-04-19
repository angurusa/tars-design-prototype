"use client";

import { useState } from "react";
import type { ApprovalQueueItem } from "@/lib/types";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Check, Trash2, Loader2 } from "lucide-react";
import { ConfirmDiscardDialog } from "@/components/shared/confirm-discard-dialog";

interface ApprovalCardProps {
  item: ApprovalQueueItem;
  displayName?: string;
  loading?: boolean;
  onApprove?: () => void;
  onDiscard?: () => void;
  onPreview: () => void;
}

export function ApprovalCard({
  item,
  displayName,
  loading,
  onApprove,
  onDiscard,
  onPreview,
}: ApprovalCardProps) {
  const [discardOpen, setDiscardOpen] = useState(false);

  return (
    <>
      <Card variant="interactive">
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{displayName ?? item.agentName}</span>
            <span className="text-xs text-muted-foreground">
              {item.timestamp
                ? new Date(item.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })
                : ""}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">{item.preview}</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm" disabled={loading} onClick={onPreview}>
            <Eye data-icon="inline-start" />
            Preview
          </Button>
          {onApprove && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
              onClick={onApprove}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check data-icon="inline-start" />
              )}
              Approve
            </Button>
          )}
          {onDiscard && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={loading}
              onClick={() => setDiscardOpen(true)}
            >
              <Trash2 data-icon="inline-start" />
              Discard
            </Button>
          )}
        </CardFooter>
      </Card>

      {onDiscard && (
        <ConfirmDiscardDialog
          open={discardOpen}
          onOpenChange={setDiscardOpen}
          onConfirm={onDiscard}
        />
      )}
    </>
  );
}
