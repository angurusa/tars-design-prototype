"use client";

import type { ReactNode } from "react";
import { PrototypeProvider as ContextProvider } from "@/lib/prototype-context";
import { StateControlPanel } from "./StateControlPanel";

export function PrototypeProvider({ children }: { children: ReactNode }) {
  return (
    <ContextProvider>
      {children}
      <StateControlPanel />
    </ContextProvider>
  );
}
