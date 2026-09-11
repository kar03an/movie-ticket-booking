"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { Film, Clapperboard, Armchair, Popcorn, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Movies", href: "/dashboard/movies", icon: Film },
  { label: "Shows", href: "/dashboard/shows", icon: Clapperboard },
  { label: "Seats", href: "/dashboard/seats", icon: Armchair },
] as const;

export default function OwnerDashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background text-foreground">
      <DashboardSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <DashboardContent>{children}</DashboardContent>
    </div>
  );
}

function DashboardSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-3 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Popcorn className="h-4.5 w-4.5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-sidebar-foreground">Owner console</p>
            <p className="truncate text-xs text-muted-foreground">Manage your theatre</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-5">
        <p
          className={cn(
            "mb-4 px-2 pl-12 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground",
            collapsed && "invisible",
          )}
        >
          Manage
        </p>
        <ul className="flex flex-col gap-2">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href as Route}
                  title={collapsed ? label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md pl-8 py-2 text-sm font-medium transition-colors",
                    collapsed && "justify-center px-0 pl-0",
                    isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-sidebar-border p-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-foreground",
            collapsed && "justify-center",
          )}
        >
          {collapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronLeft className="h-4 w-4 shrink-0" />}
          {/* {!collapsed && <span>Collapse</span>} */}
        </button>
      </div>
    </aside>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  return <main className="w-full h-full">{children}</main>;
}
