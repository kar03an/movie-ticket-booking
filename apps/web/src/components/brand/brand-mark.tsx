import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export default function BrandMark({
  href = "/",
  className,
}: {
  href?: Route | string;
  className?: string;
}) {
  return (
    <Link
      href={href as Route}
      className={cn("group inline-flex items-center gap-2 no-underline", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 font-display text-sm font-semibold text-primary">
        M
      </span>
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Mtb
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
