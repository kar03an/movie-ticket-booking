import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TicketPerforation() {
  return (
    <div className="relative flex items-center px-6">
      <span className="ticket-notch -left-3" />
      <span className="flex-1 border-t border-dashed border-border" />
      <span className="ticket-notch -right-3" />
    </div>
  );
}

export function TicketStub({
  children,
  className,
  accent = true,
}: {
  children: ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("surface-card relative", className)}>
      {accent && <div className="h-1 bg-linear-to-r from-burgundy via-primary to-gold" />}
      {children}
    </div>
  );
}
