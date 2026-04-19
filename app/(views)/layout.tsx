import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { CommandPalette } from "@/components/layout/command-palette";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { Toaster } from "sonner";
import { QuickNoteDialog } from "@/components/shared/quick-note-dialog";

export default function ViewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <TopBar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </SidebarInset>
        <CommandPalette />
        <KeyboardShortcuts />
        <Toaster
          richColors={false}
          toastOptions={{
            classNames: {
              success: "border-primary/20 [&>[data-icon]]:text-primary",
            },
          }}
        />
        <QuickNoteDialog />
      </SidebarProvider>
    </TooltipProvider>
  );
}
