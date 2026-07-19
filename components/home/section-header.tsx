import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function SectionHeader({
  title,
  href,
  actionLabel = "전체보기",
}: {
  title: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h3 className="text-base font-bold tracking-tight">{title}</h3>
      {href && (
        <Link
          href={href}
          className="flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
