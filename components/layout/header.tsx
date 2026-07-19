"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MoreHorizontal } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV, isActivePath } from "@/lib/nav";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function usePageTitle() {
  const pathname = usePathname();
  const all = [...PRIMARY_NAV, ...SECONDARY_NAV];
  const match = all.find((i) => isActivePath(pathname, i.href));
  return match?.label ?? "StudyFlow";
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
          <div className="lg:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="더보기">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>더보기</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SECONDARY_NAV.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
