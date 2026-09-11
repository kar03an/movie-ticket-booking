import { Star } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import type { Movie, Show } from "@movie-ticket-booking/shared/types";
import type { ClientSessionUser } from "./providers/auth-provider";
import { format } from "date-fns";
import { MoviePoster } from "@/components/movie/movie-poster";

export default function ShowCard({ movie, shows, user }: { movie: Movie; shows: Show[]; user: ClientSessionUser }) {
  const router = useRouter();
  if (!user) return null;

  return (
    <article className="flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30">
      <div className="relative h-56">
        <MoviePoster src={movie.img} alt={movie.title} title={movie.title} width={400} height={500} />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg border border-gold/30 bg-background/70 px-2 py-1 text-[0.8125rem] font-semibold text-gold backdrop-blur-sm">
          <Star className="h-2.75 w-2.75 fill-gold stroke-none" />
          <span>{movie.vote_average.toFixed(1) ?? "—"}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-display m-0 line-clamp-2 text-base leading-[1.3] font-semibold">
          {movie.title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.03em] text-muted-foreground">
            {new Date(movie.release_date).getFullYear()}
          </span>
          <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.03em] text-muted-foreground">
            {movie.original_language.toUpperCase()}
          </span>
        </div>

        <p className="m-0 flex-1 line-clamp-2 text-[0.8125rem] leading-normal text-muted-foreground">
          {movie.overview || "No overview available."}
        </p>

        <div className="flex flex-col gap-2">
          {shows
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map((show) => (
              <button
                key={show.id}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/shows/${show.id}` as Route);
                }}
                className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <span className="mr-1">{format(new Date(show.startTime), "MMMM dd, yyyy")}</span>
                <span className="mr-1">—</span>
                <span>
                  {new Date(show.startTime).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}

export function ShowCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="skeleton-shimmer h-56" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="skeleton-shimmer h-3 w-[80%] rounded-md" />
        <div className="skeleton-shimmer h-3 w-[55%] rounded-md" />
        <div className="skeleton-shimmer h-3 w-[40%] rounded-md" />
      </div>
    </div>
  );
}
