"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ShowCard from "@/components/show-card";
import ErrorComponent from "@/components/error";
import { useTheatre } from "@/hooks/query/useTheatre";
import { useTheatreActiveShows, type TheatreActiveShowsResponse } from "@/hooks/query/useTheatreActiveShows";

export default function TheatreShows() {
  const session = useAuth();
  const theatreQuery = useTheatre(session);
  const activeShowsQuery = useTheatreActiveShows(theatreQuery.data?.id);
  const [movieShow, setMovieShows] = useState<TheatreActiveShowsResponse["data"]>([]);

  useEffect(() => {
    console.log("active shows data: ", activeShowsQuery.data);
    setMovieShows(activeShowsQuery.data ?? []);
  }, [activeShowsQuery.data]);

  if (activeShowsQuery.isPending) {
    return (
      <div className="pt-64 bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeShowsQuery.isPending) {
    return (
      <div className="pt-64 bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activeShowsQuery.isError) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6">
        <div className="max-w-sm text-center">
          <p className="text-sm font-medium text-primary">Couldn't load theatre shows</p>
          <p className="mt-1 text-sm text-muted-foreground">{activeShowsQuery.error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8">
      {movieShow.length > 0 && (
        <div className="w-full">
          <h1 className="mt-2 mb-6 flex justify-center ml-1 text-2xl font-semibold tracking-tight text-foreground">
            Current Active Shows
          </h1>
          {session?.user && (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
              {movieShow.map((show) => (
                <ShowCard key={show.movie.id} movie={show.movie} shows={show.shows} user={session.user} />
              ))}
            </div>
          )}
        </div>
      )}
      {movieShow.length <= 0 && (
        <ErrorComponent message="No Active Shows" link={"/dashboard/movies"} linkText={"Add Shows"} />
      )}
    </div>
  );
}
