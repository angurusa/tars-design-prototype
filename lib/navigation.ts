import {
  Home,
  Sun,
  Target,
  FileText,
  CheckSquare,
  Zap,
  LayoutGrid,
  MessageSquare,
  PenLine,
  Bot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Override for active state matching (e.g., /notes matches /notes/daily, /notes/weekly) */
  activePrefix?: string;
  /** If true, sidebar will fetch and show a live badge (e.g., running agent count) */
  badge?: "coding-agents";
};

export const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Briefing", href: "/briefing", icon: Sun },
  { label: "Standup", href: "/standup", icon: Target },

  { label: "Work Items", href: "/ado", icon: CheckSquare },
  { label: "Coding Agents", href: "/coding-agents", icon: Zap, badge: "coding-agents" },
  { label: "Project Planner", href: "/project-planner", icon: LayoutGrid },

  { label: "Notes", href: "/notes/daily", icon: FileText, activePrefix: "/notes" },
  { label: "1:1 Notes", href: "/one-on-one", icon: MessageSquare },
  { label: "Engage Posts", href: "/engage", icon: PenLine },

  { label: "Agents", href: "/agents", icon: Bot },
];
