"use client";

const SORT_OPTIONS = [
  { value: "rating", label: "Top Rated" },
  { value: "title", label: "A–Z" },
  { value: "newest", label: "Newest First" },
] as const;

export function SortFiltersPanel({
  sortBy,
  onChange,
}: {
  sortBy: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-4 flex animate-[slideDown_0.2s_ease] flex-col gap-4 rounded-xl border border-border bg-card/60 p-5">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-start">
        <span className="min-w-14 pt-1.5 text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase whitespace-nowrap">
          Sort by
        </span>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`cursor-pointer rounded-full border px-3 py-[0.3rem] font-sans text-[0.8125rem] transition-all duration-150 ${
                sortBy === opt.value
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border bg-muted/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}