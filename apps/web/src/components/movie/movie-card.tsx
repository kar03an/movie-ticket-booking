import Link from "next/link";
import { Star, Clock, ChevronRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { TMDBMoviesType } from "@movie-ticket-booking/shared/types";
import type { ClientSessionUser } from "../providers/auth-provider";

export default function MovieCard({ movie, user }: { movie: TMDBMoviesType; user: ClientSessionUser }) {
  const router = useRouter();
  if (!user) return null;

  return (
    <article
      className="bg-[#18181b] border border-white/[0.07] rounded-[14px] overflow-hidden cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex flex-col hover:-translate-y-1.5 hover:scale-[1.03]"
      onClick={() => router.push(`/movies/${movie.id}` as Route)}
    >
      <div className="h-56 border relative">
        {movie.img && (
          <Image src={movie.img} width={400} height={500} alt={"movie-image"} className="w-full h-full object-cover" />
        )}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/65 backdrop-blur-sm border border-white/12 rounded-lg py-1 px-2 text-[0.8125rem] font-semibold text-[#fbbf24]">
          <Star className="w-2.75 h-2.75 fill-[#fbbf24] stroke-none" />
          <span>{movie.vote_average > 0 ? (movie.vote_average.toFixed(1) ?? "—") : "—"}</span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="[font-family:var(--display,'Fraunces',serif)] text-base font-semibold text-[#fafafa] leading-[1.3] m-0 line-clamp-2">
          {movie.original_title}
        </h3>

        <div className="flex flex-wrap gap-1.5">
          <span className="text-[0.6875rem] font-medium text-white/50 bg-white/6 border border-white/8 rounded py-0.5 px-1.5 tracking-[0.03em]">
            {new Date(movie.release_date).getFullYear() ?? ""}
          </span>
          <span className="text-[0.6875rem] font-medium text-white/50 bg-white/6 border border-white/8 rounded py-0.5 px-1.5 tracking-[0.03em]">
            {movie.original_language.toUpperCase() ?? ""}
          </span>
        </div>

        <p className="text-[0.8125rem] text-white/38 leading-normal m-0 line-clamp-2 flex-1">
          {movie.overview || "No overview available."}
        </p>

        <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/6">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-white/35">
              <Clock size={11} />
              {new Date(movie.release_date).toLocaleDateString()}
            </span>
          </div>

          {/* TODO: Add Link element to add movie to theatre page if user is an owner */}
          {user.role === "CUSTOMER" && (
            <Link
              href={`/movies/${movie.id}` as Route}
              className="flex items-center gap-0.75 py-1.5 px-3.5 bg-[#dc2626] text-white text-[0.8125rem] font-semibold [font-family:var(--body,'Archivo',sans-serif)] rounded-lg no-underline transition-[background,transform] duration-150 hover:bg-[#b91c1c] hover:scale-[1.04]"
              onClick={(e) => e.stopPropagation()}
            >
              Book
              <ChevronRight size={12} />
            </Link>
          )}
          {user.role === "OWNER" && (
            <Link
              href={`/dashboard/movies/${movie.id}/add` as Route}
              className="flex items-center gap-0.75 py-1.5 px-3.5 bg-[#dc2626] text-white text-[0.8125rem] font-semibold [font-family:var(--body,'Archivo',sans-serif)] rounded-lg no-underline transition-[background,transform] duration-150 hover:bg-[#b91c1c] hover:scale-[1.04]"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Add
              <ChevronRight size={12} />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="bg-[#18181b] border border-white/[0.07] rounded-[14px] overflow-hidden">
      <div className="h-70 bg-[linear-gradient(90deg,#27272a_25%,#3f3f46_50%,#27272a_75%)] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 w-[80%] rounded-md bg-[linear-gradient(90deg,#27272a_25%,#3f3f46_50%,#27272a_75%)] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-3 w-[55%] rounded-md bg-[linear-gradient(90deg,#27272a_25%,#3f3f46_50%,#27272a_75%)] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
        <div className="h-3 w-[40%] rounded-md bg-[linear-gradient(90deg,#27272a_25%,#3f3f46_50%,#27272a_75%)] bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
      </div>
    </div>
  );
}
