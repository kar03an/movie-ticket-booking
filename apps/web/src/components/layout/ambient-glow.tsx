export default function AmbientGlow({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="absolute -top-40 left-1/2 h-100 w-150 -translate-x-1/2 rounded-full bg-primary/12 blur-3xl" />
      <div className="absolute top-1/3 right-[-10%] h-80 w-80 rounded-full bg-burgundy/10 blur-3xl" />
    </div>
  );
}
