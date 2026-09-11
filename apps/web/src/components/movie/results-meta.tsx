"use client";

import { X } from "lucide-react";

export function ResultsMeta({
  count,
  hasActiveFilters,
  onClear,
}: {
  count: number;
  hasActiveFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm text-muted-foreground">
        {count} {count === 1 ? "film" : "films"} found
      </span>
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="flex cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-2 py-1 font-sans text-[0.8125rem] text-primary transition-colors duration-150 hover:bg-primary/10"
        >
          <X size={12} />
          Clear filters
        </button>
      )}
    </div>
  );
}
