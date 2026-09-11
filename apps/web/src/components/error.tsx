import Link from "next/link";

interface ErrorComponentProps {
  message: string;
  link?: string | null;
  linkText?: string | null;
}

export default function ErrorComponent({ message, link = null, linkText = null }: ErrorComponentProps) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-24">
      <p className="font-display text-xl text-muted-foreground">{message}</p>
      {link && (
        <Link href={link} className="btn-cinema text-sm">
          {linkText}
        </Link>
      )}
    </div>
  );
}
