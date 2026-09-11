"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, User, ChevronDown, Film, Armchair, Clapperboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState, useRef, useEffect } from "react";
import type { Route } from "next";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isPending) {
    return <div className="h-9 w-9 rounded-xl bg-muted animate-pulse" />;
  }

  if (!session) {
    return (
      <Link
        href={"/auth" as Route}
        className="rounded-xl border border-border bg-secondary/60 px-4 py-2 text-sm font-semibold text-foreground/90 transition hover:border-primary/40 hover:text-foreground"
      >
        Sign In
      </Link>
    );
  }

  const user = session.user;
  const isCustomer = (user as { role?: string }).role === "CUSTOMER";
  const displayName = user.name ?? user.email;
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = () => {
    setOpen(false);
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/auth" as Route),
      },
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex hover:cursor-pointer items-center gap-2 rounded-xl border border-border bg-secondary/60 px-2.5 py-1.5 text-sm transition hover:border-primary/40 hover:bg-muted"
      >
        {/* Avatar */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-bold text-primary select-none">
          {initials}
        </span>
        <span className="max-w-30 truncate text-foreground/90 font-medium hidden sm:block">{displayName}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border bg-card shadow-2xl shadow-black/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-100">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-sm font-bold text-primary select-none">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={"/profile" as Route}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition hover:bg-muted hover:text-foreground"
            >
              <User className="h-4 w-4 text-muted-foreground" />
              View Profile
            </Link>
            <Link
              href={"/movies" as Route}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition hover:bg-muted hover:text-foreground"
            >
              <Film className="h-4 w-4 text-muted-foreground" />
              Browse Movies
            </Link>
            {(user.role === "OWNER" || user.role === "ADMIN") && (
              <>
                <Link
                  href={"/dashboard/seats" as Route}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition hover:bg-muted hover:text-foreground"
                >
                  <Armchair className="h-4 w-4 text-muted-foreground" />
                  Manage Seats
                </Link>
                <Link
                  href={"/dashboard/movies" as Route}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition hover:bg-muted hover:text-foreground"
                >
                  <Film className="h-4 w-4 text-muted-foreground" />
                  Create Show
                </Link>
                <Link
                  href={"/dashboard/shows" as Route}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground/90 transition hover:bg-muted hover:text-foreground"
                >
                  <Clapperboard className="h-4 w-4 text-muted-foreground" />
                  Active Shows
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-primary transition hover:bg-primary/10 hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
