"use client";

import Link from "next/link";
import type { Route } from "next";
import { useAuth } from "@/components/providers/auth-provider";
import { redirect } from "next/navigation";
import { Armchair, Clapperboard, Ticket } from "lucide-react";
import AmbientGlow from "@/components/layout/ambient-glow";

const steps = [
  {
    icon: Clapperboard,
    title: "Choose the film",
    copy: "Browse what's playing tonight — posters, ratings, and every screen in the house.",
  },
  {
    icon: Armchair,
    title: "Hold your seat",
    copy: "Tap a seat on the map. It's yours the moment you confirm, not after a queue.",
  },
  {
    icon: Ticket,
    title: "Walk in ready",
    copy: "Pay securely, keep the stub on your phone, and skip the box-office line.",
  },
];

export default function HomePage() {
  const session = useAuth();
  if (session && session.user) redirect("/movies");

  return (
    <div className="relative overflow-hidden">
      <AmbientGlow />

      <section className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="eyebrow mb-5">Your city · reserved seating</p>
        <h1 className="font-display mb-5 max-w-3xl text-[clamp(2.6rem,7vw,4.6rem)] font-semibold leading-[1.06] tracking-tight">
          A quieter way to book <em className="italic text-primary">the good seats.</em>
        </h1>
        <p className="mb-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Mtb is boutique cinema booking — every showtime, every screen, held the moment you tap it.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href={"/movies" as Route} className="btn-cinema px-8 py-[0.9rem]">
            Browse now showing
          </Link>
          <Link href={"/auth" as Route} className="btn-cinema-ghost">
            Sign in
          </Link>
        </div>
        <div className="mt-14 flex w-full max-w-xs items-center gap-2" aria-hidden>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
          <span className="flex-1 border-t border-dashed border-border" />
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/50" />
        </div>
      </section>

      <section className="relative mx-auto grid w-full max-w-6xl gap-4 px-6 pb-24 md:grid-cols-3">
        {steps.map((step, i) => (
          <article key={step.title} className="surface-card p-6 text-left">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
            </div>
            <h2 className="font-display text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
