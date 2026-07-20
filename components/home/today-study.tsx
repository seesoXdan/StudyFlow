"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SubjectDot } from "@/components/cards/subject-dot";
import { SectionHeader } from "./section-header";
import { useStudyTasks, useSubjectMap } from "@/hooks/use-data";
import { updateStudyTask } from "@/lib/repositories";
import { todayISO } from "@/lib/date";
import { formatMinutes, cn } from "@/lib/utils";

export function TodayStudy() {
  const { tasks, loading } = useStudyTasks();
  const { subjectMap } = useSubjectMap();
  const [busy, setBusy] = useState<string | null>(null);
  const today = todayISO();

  const todayTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.date === today)
        .sort(
          (a, b) =>
            Number(a.completed) - Number(b.completed) ||
            (a.startTime || "99").localeCompare(b.startTime || "99")
        ),
    [tasks, today]
  );

  async function toggle(id: string, completed: boolean) {
    setBusy(id);
    try {
      await updateStudyTask(id, { completed });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <SectionHeader title="오늘의 공부" href="/study" />
      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : todayTasks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="오늘 계획한 공부가 없어요"
          description="공부 탭에서 오늘 할 공부를 추가해 보세요."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border p-0">
            {todayTasks.map((task) => {
              const subject = subjectMap.get(task.subjectId);
              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Checkbox
                    checked={task.completed}
                    disabled={busy === task.id}
                    onCheckedChange={(v) => toggle(task.id, Boolean(v))}
                    aria-label="완료 표시"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        task.completed &&
                          "text-muted-foreground line-through"
                      )}
                    >
                      {task.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <SubjectDot color={subject?.color} />
                        {subject?.name ?? "미지정"}
                      </span>
                      {task.startTime && (
                        <span>
                          · {task.startTime}
                          {task.endTime ? `~${task.endTime}` : ""}
                        </span>
                      )}
                      {task.studyMinutes > 0 && (
                        <span>· {formatMinutes(task.studyMinutes)}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </section>
  );
}
