"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, CalendarDays, Calendar } from "lucide-react";

const TABS = [
  { href: "/notes/daily", label: "Daily", icon: FileText },
  { href: "/notes/weekly", label: "Weekly", icon: CalendarDays },
  { href: "/notes/monthly", label: "Monthly", icon: Calendar },
];

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="-mx-6 -my-4 lg:-mx-8 flex flex-col h-[calc(100vh-var(--topbar-height))]">
      <div className="flex border-b shrink-0 px-6 lg:px-8">
        {TABS.map(({ href, label, icon: TabIcon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm border-b-2 transition-colors ${
              pathname.startsWith(href)
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground/80"
            }`}
          >
            <TabIcon className="size-3.5" />
            {label}
          </Link>
        ))}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
