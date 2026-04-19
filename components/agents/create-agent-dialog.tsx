"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil, Plus, Sparkles, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { DATA_SOURCE_LABELS } from "@/lib/constants";

type CustomAgentGenerateResponse = {
  name: string;
  description: string;
  tags: string[];
  triggerType: "scheduled" | "on-demand";
  schedule: string | null;
  dataSources: string[];
  systemPrompt: string;
  maxTokens: number;
  outputFormat: "markdown" | "json";
  recordType: string;
};

type Step = "describe" | "review";

const ALL_DATA_SOURCES = Object.entries(DATA_SOURCE_LABELS);

export function CreateAgentDialog({
  onCreated,
  editAgentId,
}: {
  onCreated: () => void;
  editAgentId?: string;
}) {
  const isEdit = !!editAgentId;
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>(isEdit ? "review" : "describe");
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [config, setConfig] = useState<CustomAgentGenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // When editing, load mock config
  useEffect(() => {
    if (open && editAgentId && !config) {
      setLoadingEdit(true);
      // Simulate fetch with mock data
      setTimeout(() => {
        setConfig({
          name: "PR Staleness Monitor",
          description: "Check open PRs and flag stale ones",
          tags: ["code-health"],
          triggerType: "scheduled" as "scheduled" | "on-demand",
          schedule: "0 9 * * 1-5",
          dataSources: ["ado-prs"],
          systemPrompt: "You are a PR health monitor. Check all open PRs and flag any that have been open more than 5 days without a review.",
          maxTokens: 4096,
          outputFormat: "markdown" as "markdown" | "json",
          recordType: "custom-agent-output",
        });
        setStep("review");
        setLoadingEdit(false);
      }, 800);
    }
  }, [open, editAgentId, config]);

  const reset = () => {
    setStep(isEdit ? "review" : "describe");
    setDescription("");
    setConfig(null);
    setError(null);
    setShowPrompt(false);
  };

  const handleGenerate = async () => {
    if (!description.trim()) return;
    setGenerating(true);
    setError(null);
    // Simulate AI generation with mock config
    await new Promise((r) => setTimeout(r, 1500));
    setConfig({
      name: "PR Staleness Monitor",
      description: description.trim(),
      tags: ["code-health", "notifications"],
      triggerType: "scheduled",
      schedule: "0 9 * * 1-5",
      dataSources: ["ado-prs"],
      systemPrompt:
        "You are a PR health monitor. Check all open PRs and flag any that have been open more than 5 days without a review. Group by repo and sort by age.",
      maxTokens: 4096,
      outputFormat: "markdown",
      recordType: "custom-agent-output",
    });
    setStep("review");
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    setOpen(false);
    reset();
    onCreated();
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editAgentId) return;
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    try {
      // Simulate delete
      await new Promise((r) => setTimeout(r, 500));
      setOpen(false);
      reset();
      onCreated();
    } catch {
      setError("Failed to delete agent");
    }
  };

  const updateConfig = (field: string, value: unknown) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const toggleDataSource = (key: string) => {
    if (!config) return;
    const current = config.dataSources ?? [];
    const next = current.includes(key) ? current.filter((s) => s !== key) : [...current, key];
    updateConfig("dataSources", next);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      {isEdit ? (
        <DialogTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          }
        />
      ) : (
        <DialogTrigger
          render={
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Agent
            </Button>
          }
        />
      )}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit
              ? "Edit Agent"
              : step === "describe"
                ? "Create a New Agent"
                : "Review Configuration"}
          </DialogTitle>
        </DialogHeader>

        {loadingEdit && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading config...
          </div>
        )}

        {step === "describe" && !isEdit && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Describe what you want your agent to do. TARS will draft the configuration for you.
            </p>
            <textarea
              className="w-full min-h-[100px] rounded-md border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="e.g., Every morning at 9 AM, check all my open PRs and flag any that have been open more than 5 days without a review..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!description.trim() || generating}
                className="gap-1.5"
              >
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate Config
              </Button>
            </div>
          </div>
        )}

        {step === "review" && config && (
          <div className="space-y-4">
            {!isEdit && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-generated
              </Badge>
            )}

            {/* Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <Input value={config.name} onChange={(e) => updateConfig("name", e.target.value)} />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <Input
                value={config.description}
                onChange={(e) => updateConfig("description", e.target.value)}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Tags</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {config.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Schedule</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={config.schedule ?? ""}
                  placeholder="Cron expression (e.g., 0 9 * * 1-5)"
                  onChange={(e) => updateConfig("schedule", e.target.value || null)}
                  className="flex-1 font-mono text-xs"
                />
                <Badge variant="outline" className="shrink-0 self-center">
                  {config.triggerType}
                </Badge>
              </div>
            </div>

            {/* Data Sources */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data Sources</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {ALL_DATA_SOURCES.map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.dataSources.includes(key)}
                      onChange={() => toggleDataSource(key)}
                      className="rounded"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* System Prompt (collapsible) */}
            <div>
              <button
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => setShowPrompt(!showPrompt)}
              >
                {showPrompt ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
                System Prompt (Advanced)
              </button>
              {showPrompt && (
                <textarea
                  className="w-full min-h-[120px] mt-1 rounded-md border bg-muted/30 px-3 py-2 text-xs font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                  value={config.systemPrompt}
                  onChange={(e) => updateConfig("systemPrompt", e.target.value)}
                />
              )}
            </div>

            {/* Output Config */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Output Format</label>
                <select
                  value={config.outputFormat}
                  title="Output format"
                  onChange={(e) => updateConfig("outputFormat", e.target.value)}
                  className="w-full mt-1 rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="markdown">Markdown</option>
                  <option value="json">JSON</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground">Max Tokens</label>
                <Input
                  type="number"
                  title="Max tokens"
                  placeholder="4096"
                  value={config.maxTokens}
                  onChange={(e) => updateConfig("maxTokens", parseInt(e.target.value) || 4096)}
                  className="mt-1"
                />
              </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t">
              {isEdit && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
              <div className="flex-1" />
              <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isEdit ? "Save Changes" : "Create Agent"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
