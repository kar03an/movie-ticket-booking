import { Clapperboard } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function hasPoster(src?: string | null) {
  return Boolean(src?.trim());
}

function DummyPoster({ title, className }: { title: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-linear-to-b from-burgundy/40 via-card to-background px-4 text-center",
        className,
      )}
      aria-hidden={!title}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(90deg,transparent,transparent_12px,color-mix(in_oklch,var(--gold)_18%,transparent)_12px,color-mix(in_oklch,var(--gold)_18%,transparent)_13px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-gold/20 to-transparent" />
      <Clapperboard className="relative mb-3 size-10 text-gold/80" strokeWidth={1.25} />
      <p className="font-display relative line-clamp-3 text-sm font-semibold leading-snug text-foreground">
        {title || "Untitled"}
      </p>
      <p className="relative mt-2 text-[0.65rem] font-semibold tracking-[0.22em] text-primary uppercase">
        Poster coming soon
      </p>
    </div>
  );
}

export function MoviePoster({
  src,
  alt,
  title,
  fill = false,
  width,
  height,
  className,
  sizes,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  title?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const label = title || alt;

  if (!hasPoster(src)) {
    return <DummyPoster title={label} className={className} />;
  }

  if (fill) {
    return (
      <Image
        src={src!}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src!}
      alt={alt ?? "Movie Poster"}
      width={width ?? 400}
      height={height ?? 600}
      sizes={sizes}
      priority={priority}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}

export function MoviePosterBackdrop({ src, className }: { src?: string | null; className?: string }) {
  if (!hasPoster(src)) {
    return (
      <div className={cn("absolute inset-0 bg-linear-to-b from-primary/12 via-background to-background", className)} />
    );
  }

  return (
    <div className={cn("pointer-events-none absolute inset-0 select-none", className)}>
      <img src={src!} alt="" aria-hidden className="h-full w-full scale-110 object-cover opacity-15 blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-transparent" />
    </div>
  );
}
