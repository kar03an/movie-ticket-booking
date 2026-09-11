"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import BrandMark from "@/components/brand/brand-mark";
import UserMenu from "@/components/user-menu";
import { ModeToggle } from "@/components/movie/mode-toggle";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

const publicLinks = [{ href: "/movies", label: "Now Showing" }] as const;

export default function HeaderBar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const role = session?.user?.role;
  const ownerLinks =
    role === "OWNER" || role === "ADMIN"
      ? [
          { href: "/dashboard/movies", label: "Console" },
          { href: "/dashboard/shows", label: "Shows" },
        ]
      : [];

  const links = [...publicLinks, ...ownerLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-3.5 sm:px-6">
        <BrandMark />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href as Route}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition",
                  active
                    ? "bg-primary/15 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
