import Link from 'next/link';
import { Notebook } from 'lucide-react';

export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold tracking-tighter text-foreground transition-colors hover:text-primary"
      aria-label="Back to homepage"
    >
      <div className="rounded-lg bg-primary p-2 text-primary-foreground">
        <Notebook className="h-5 w-5" />
      </div>
      {showText && 'MemoDams'}
    </Link>
  );
}
