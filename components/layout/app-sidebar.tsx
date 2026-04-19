"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Diamond, NotebookPen } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { navItems } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  // Hardcoded for prototype — no real API calls
  const runningAgents = 2;

  // Group separators: after Standup (index 2), after Project Planner (5), after Engage (8)
  const separatorAfter = new Set([2, 5, 8]);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <Diamond className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold">TARS</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item, index) => {
            const matchPrefix = item.activePrefix ?? item.href;
            const isActive =
              matchPrefix === "/" ? pathname === "/" : pathname.startsWith(matchPrefix);

            return (
              <div key={item.href}>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={isActive}
                    tooltip={item.label}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge === "coding-agents" && runningAgents > 0 && (
                    <SidebarMenuBadge className="bg-primary/15 text-primary border-transparent text-[10px]">
                      {runningAgents} running
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
                {separatorAfter.has(index) && <SidebarSeparator className="my-1" />}
              </div>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Quick Note"
              onClick={() => window.dispatchEvent(new CustomEvent("open-quick-note"))}
            >
              <NotebookPen className="h-4 w-4" />
              <span>Quick Note</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
