import { cn } from "@/lib/utils";

export function SubjectDot({
  color,
  className,
}: {
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)}
      style={{ backgroundColor: color || "hsl(var(--muted-foreground))" }}
    />
  );
}

export function SubjectLabel({
  name,
  color,
}: {
  name?: string;
  color?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <SubjectDot color={color} />
      {name ?? "미지정"}
    </span>
  );
}
