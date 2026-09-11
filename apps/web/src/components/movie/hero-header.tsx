"use client";

import { Flame } from "lucide-react";
import SearchBar from "@/components/search-bar";
import type { Dispatch, SetStateAction } from "react";

export function HeroHeader({
  search,
  setSearch,
  showRegion,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  showRegion: boolean;
}) {
  return (
    <header className="relative w-full pb-8 pt-8">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mb-8">
          {showRegion && (
            <div className="eyebrow mb-3 inline-flex items-center gap-2">
              <Flame size={14} />
              Now showing · Delhi NCR
            </div>
          )}
          <h1 className="font-display mb-3 text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight">
            Latest <em className="italic text-primary">movies</em>
          </h1>
          <p className="m-0 max-w-130 text-base leading-[1.6] text-muted-foreground">
            Browse every film in theatres, hold your seats in seconds, and walk in with the ticket in hand.
          </p>
        </div>
        <SearchBar search={search} setSearch={setSearch} />
      </div>
    </header>
  );
}
