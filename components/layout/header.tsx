"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, isActivePath } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";

function usePageTitle() {
  const pathname = usePathname();
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV];
  const match = all.find((i) => isActivePath(pathname, i.href));
  return match?.label ?? "서진 대학가자";
}

export function Header() {
  const title = usePageTitle();

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-2 px-4 lg:px-6">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-4.5 w-4.5" strokeWidth={2.2} />
            </div>
          </Link>
          <h1 className="text-lg font-bold tracking-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
