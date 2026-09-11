import { Search, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

export default function SearchBar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="mb-0 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-card/70 px-4 transition duration-200 focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px] focus-within:shadow-primary/10">
        <div className="flex shrink-0 text-muted-foreground">
          <Search size={18} />
        </div>
        <input
          id="movies-search-input"
          type="text"
          className="flex-1 border-none bg-transparent py-3.5 font-sans text-[0.9375rem] text-foreground outline-none placeholder:text-muted-foreground/50"
          placeholder='Search "The Quiet Hour", "Thriller", ...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button
            className="flex cursor-pointer items-center rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            type="button"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
