"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PipelineStep } from "@/lib/types";

/**
 * Simulates text streaming by progressively revealing characters.
 * Returns the displayed portion and whether streaming is active.
 */
export function useStreamingText(
  fullText: string,
  active: boolean,
  options?: { charsPerTick?: number; intervalMs?: number },
) {
  const { charsPerTick = 8, intervalMs = 30 } = options ?? {};
  const [charIndex, setCharIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setCharIndex(0);
      return;
    }

    intervalRef.current = setInterval(() => {
      setCharIndex((prev) => {
        const next = prev + charsPerTick;
        if (next >= fullText.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return fullText.length;
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, fullText.length, charsPerTick, intervalMs]);

  const isStreaming = active && charIndex < fullText.length;
  const displayedText = active ? fullText.slice(0, charIndex) : "";

  return { displayedText, isStreaming, progress: fullText.length > 0 ? charIndex / fullText.length : 0 };
}

/**
 * Simulates pipeline steps advancing over time.
 * Returns the current step states.
 */
export function useStreamingSteps(
  stepLabels: string[],
  active: boolean,
  options?: { stepDurationMs?: number },
) {
  const { stepDurationMs = 3000 } = options ?? {};
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    if (!active) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(0);
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev >= stepLabels.length - 1) {
          clearInterval(interval);
          return stepLabels.length; // all done
        }
        return prev + 1;
      });
    }, stepDurationMs);

    return () => clearInterval(interval);
  }, [active, stepLabels.length, stepDurationMs]);

  const steps: PipelineStep[] = stepLabels.map((label, i) => ({
    label,
    status: activeIndex > i ? "done" : activeIndex === i ? "active" : "pending",
  }));

  const isComplete = activeIndex >= stepLabels.length;

  return { steps, isComplete, activeStepIndex: activeIndex };
}

/**
 * Simulates a progress bar that fills over time.
 */
export function useStreamingProgress(
  active: boolean,
  options?: { durationMs?: number; maxProgress?: number },
) {
  const { durationMs = 15000, maxProgress = 0.85 } = options ?? {};
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }

    const tickMs = 200;
    const increment = maxProgress / (durationMs / tickMs);

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= maxProgress) {
          clearInterval(interval);
          return maxProgress;
        }
        return next;
      });
    }, tickMs);

    return () => clearInterval(interval);
  }, [active, durationMs, maxProgress]);

  return progress;
}
