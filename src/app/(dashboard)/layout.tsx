import type { ReactNode } from "react";
import { RouteScrollReset } from "@/components/dashboard/route-scroll-reset";
import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[18rem,minmax(0,1fr)] lg:items-start">
      <RouteScrollReset />
      <Sidebar />
      <main className="order-1 min-h-screen overflow-anchor-none lg:col-start-2 lg:row-start-1 lg:order-2">
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-10 lg:pt-10 xl:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}