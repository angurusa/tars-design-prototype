"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const IS_MAC = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
const MOD_KEY = IS_MAC ? "⌘" : "Ctrl";

export function QuickNoteDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-quick-note", handler);
    return () => window.removeEventListener("open-quick-note", handler);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open]);

  const handleSubmit = () => {
    if (!content.trim() || saving) return;
    setSaving(true);
    // Simulate saving
    setTimeout(() => {
      toast.success("Note saved");
      setContent("");
      setOpen(false);
      setSaving(false);
    }, 500);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setContent("");
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Note</DialogTitle>
        </DialogHeader>
        <Textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-24 resize-none"
          disabled={saving}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <kbd className="text-caption text-muted-foreground/60">{MOD_KEY}+Enter to save</kbd>
          <Button onClick={handleSubmit} disabled={saving || !content.trim()} size="sm">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
