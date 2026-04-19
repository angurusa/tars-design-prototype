"use client";

import { useEffect } from "react";
import { useSidebar } from "@/components/ui/sidebar";

export function KeyboardShortcuts() {
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;

      // Cmd+/ — Toggle sidebar
      if (isMod && e.key === "/") {
        e.preventDefault();
        toggleSidebar();
      }

      // Cmd+Shift+N — Quick Note
      if (isMod && e.shiftKey && e.key === "N") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-quick-note"));
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return null;
}
