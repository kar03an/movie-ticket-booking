import Link from "next/link";
import type { Route } from "next";
import BrandMark from "@/components/brand/brand-mark";

export default function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/80">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-sm space-y-3">
          <BrandMark />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Boutique cinema booking — choose a film, hold a seat, and walk in with the ticket in hand.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 text-sm">
          <div className="space-y-2">
            <p className="eyebrow">Explore</p>
            <Link href={"/movies" as Route} className="block text-muted-foreground transition hover:text-foreground">
              Now showing
            </Link>
            <Link href={"/auth" as Route} className="block text-muted-foreground transition hover:text-foreground">
              Sign in
            </Link>
          </div>
          <div className="space-y-2">
            <p className="eyebrow">House rules</p>
            <p className="text-muted-foreground">Held seats expire if unpaid.</p>
            <p className="text-muted-foreground">Tickets arrive by email.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Mtb</span>
          <span className="font-mono tracking-wide">Reserve. Pay. Arrive.</span>
        </div>
      </div>
    </footer>
  );
}
