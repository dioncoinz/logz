"use client";

import { usePathname } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  QrCode,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/locations", label: "Locations", icon: MapPin },
  { href: "/scan", label: "Scan", icon: QrCode },
  { href: "/logs", label: "Logs", icon: ClipboardList },
  { href: "/admin/team", label: "Admin", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="order-2 data-grid border-t border-sidebar/30 bg-sidebar text-sidebar-foreground lg:col-start-1 lg:row-start-1 lg:order-1 lg:min-h-screen lg:w-72 lg:border-r lg:border-t-0">
      <div className="flex flex-col gap-8 px-5 py-5 sm:px-6 lg:sticky lg:top-0 lg:py-6">
        <div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Logz</h1>
          <p className="mt-3 max-w-xs text-sm leading-6 text-sidebar-foreground/70">
            Asset issue, returns, locations, and team QR tracking for field tooling operations.
          </p>
        </div>

        <nav className="grid gap-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-primary text-primary-foreground shadow-lg shadow-black/10"
                    : "text-sidebar-foreground/74 hover:bg-white/6 hover:text-sidebar-foreground"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}