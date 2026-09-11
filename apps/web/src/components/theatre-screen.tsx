export default function TheatreScreen() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
      <svg viewBox="0 0 600 60" className="h-10 w-full max-w-md" aria-hidden="true">
        <path
          d="M 10 10 Q 300 55 590 10"
          fill="none"
          stroke="url(#screenGradient)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="screenGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--gold)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">screen</span>
    </div>
  );
}
