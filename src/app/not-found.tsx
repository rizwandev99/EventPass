import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] shadow-sm">
        <Compass className="w-7 h-7" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">Page Not Found</h1>
        <p className="text-sm text-[var(--text-muted)]">
          The page or event you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary" size="md">
          Back to Events
        </Button>
      </Link>
    </div>
  );
}
