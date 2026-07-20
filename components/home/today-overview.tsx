"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyTasks, useHomework } from "@/hooks/use-data";
import { todayISO, isOverdueISO } from "@/lib/date";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-3 text-center">
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
    const doneTasks = todayTasks.filter((t) => t.completed).length;
    const openHomework = homework.filter((h) => !h.completed);
    const overdue = openHomework.filter((h) => isOverdueISO(h.dueDate)).length;

    return {
      doneTasks,
      totalTasks: todayTasks.length,
      openHomework: openHomework.length,
      overdue,
    };
  }, [tasks, homework, today]);

  if (t1 || t2) {
    return <Skeleton className="h-24 w-full" />;
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-3 gap-2.5 p-4">
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
