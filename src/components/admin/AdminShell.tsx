import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-zinc-100/90 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-[1600px]">
        <AdminSidebar />
        <main className="min-w-0 flex-1 border-zinc-200/90 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 lg:border-l">
          <div className="px-4 py-8 sm:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
