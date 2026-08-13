import Link from "next/link";
import { Logo, Wordmark } from "@/components/logo";

export function SiteHeader() {
  return (
    <header className="px-6 py-5">
      <Link href="/" className="inline-flex items-center gap-2 text-primary">
        <Logo className="size-7" />
        <Wordmark className="text-foreground" />
      </Link>
    </header>
  );
}
