"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyTasks, useHomework } from "@/hooks/use-data";
import { todayISO, isOverdueISO } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-3">
      <p className="text-xl font-bold tracking-tight">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function TodayOverview() {
  const { tasks, loading: t1 } = useStudyTasks();
  const { homework, loading: t2 } = useHomework();
  const today = todayISO();

  const stats = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === today);
    const studyMinutes = todayTasks.reduce(
      (sum, t) => sum + (t.studyMinutes || 0),
      0
    );
    const doneTasks = todayTasks.filter((t) => t.completed).length;
    const openHomework = homework.filter((h) => !h.completed);
    const overdue = openHomework.filter((h) => isOverdueISO(h.dueDate)).length;

    return {
      studyMinutes,
      doneTasks,
      totalTasks: todayTasks.length,
      openHomework: openHomework.length,
      overdue,
    };
  }, [tasks, homework, today]);

  if (t1 || t2) {
    return <Skeleton className="h-32 w-full" />;
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-2.5 p-4">
        <Stat value={formatMinutes(stats.studyMinutes)} label="오늘 공부 시간" />
        <Stat value={`${stats.doneTasks}/${stats.totalTasks}`} label="공부 완료" />
        <Stat value={`${stats.openHomework}건`} label="남은 숙제" />
        <Stat
          value={stats.overdue ? `${stats.overdue}건` : "0건"}
          label="지난 숙제"
        />
      </CardContent>
    </Card>
  );
}
