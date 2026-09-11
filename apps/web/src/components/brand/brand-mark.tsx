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
      className={cn("group inline-flex items-center no-underline", className)}
    >
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Mtb
        <span className="text-primary">.</span>
      </span>
    </Link>
  );
}
