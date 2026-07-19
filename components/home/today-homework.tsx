"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { SubjectDot } from "@/components/cards/subject-dot";
import { SectionHeader } from "./section-header";
import { useHomework, useSubjectMap } from "@/hooks/use-data";
import { updateHomework } from "@/lib/repositories";
import { isOverdueISO, isTodayISO, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export function TodayHomework() {
  const { homework, loading } = useHomework();
  const { subjectMap } = useSubjectMap();
  const [busy, setBusy] = useState<string | null>(null);

  // Incomplete homework due today or earlier (overdue), soonest first.
  const items = useMemo(
    () =>
      homework
        .filter((h) => !h.completed)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .slice(0, 6),
    [homework]
  );

  async function toggle(id: string, completed: boolean) {
    setBusy(id);
    try {
      await updateHomework(id, { completed });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <SectionHeader title="오늘의 숙제" href="/homework" />
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="남은 숙제가 없어요"
          description="숙제 탭에서 새 숙제를 추가할 수 있어요."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {items.map((hw) => {
              const subject = subjectMap.get(hw.subjectId);
              const overdue = isOverdueISO(hw.dueDate);
              const due = isTodayISO(hw.dueDate);
              return (
                <div key={hw.id} className="flex items-center gap-3 px-4 py-3">
                  <Checkbox
                    checked={hw.completed}
                    disabled={busy === hw.id}
                    onCheckedChange={(v) => toggle(hw.id, Boolean(v))}
                    aria-label="완료 표시"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{hw.name}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <SubjectDot color={subject?.color} />
                        {subject?.name ?? "미지정"}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={overdue ? "danger" : due ? "warning" : "secondary"}
                    className={cn("shrink-0")}
                  >
                    {overdue ? "기한 지남" : due ? "오늘까지" : formatShortDate(hw.dueDate)}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
