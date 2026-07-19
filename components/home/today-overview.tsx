"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useStudyTasks,
  useHomework,
  useSettings,
  useStudyLogs,
} from "@/hooks/use-data";
import { todayISO, isOverdueISO } from "@/lib/date";
import { formatMinutes } from "@/lib/utils";

function ProgressRing({
  percent,
  label,
  sub,
}: {
  percent: number;
  label: string;
  sub: string;
}) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, percent));
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          className="stroke-muted"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-primary transition-all duration-700 ease-out"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold tracking-tight">{label}</span>
        <span className="text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2.5">
      <p className="text-lg font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export function TodayOverview() {
  const { tasks, loading: t1 } = useStudyTasks();
  const { homework, loading: t2 } = useHomework();
  const { logs } = useStudyLogs();
  const { settings } = useSettings();
  const today = todayISO();

  const stats = useMemo(() => {
    const todayTasks = tasks.filter((t) => t.date === today);
    const studyMinutes = logs
      .filter((l) => l.date === today)
      .reduce((sum, l) => sum + (l.minutes || 0), 0);
    const doneTasks = todayTasks.filter((t) => t.completed).length;
    const openHomework = homework.filter((h) => !h.completed);
    const overdue = openHomework.filter((h) => isOverdueISO(h.dueDate)).length;

    const goal = settings?.dailyGoalMinutes || 0;
    const percent = goal
      ? (studyMinutes / goal) * 100
      : todayTasks.length
        ? (doneTasks / todayTasks.length) * 100
        : 0;

    return {
      studyMinutes,
      doneTasks,
      totalTasks: todayTasks.length,
      openHomework: openHomework.length,
      overdue,
      goal,
      percent,
    };
  }, [tasks, homework, logs, settings, today]);

  if (t1 || t2) {
    return <Skeleton className="h-40 w-full" />;
  }

  const ringLabel =
    stats.studyMinutes >= 60
      ? `${(stats.studyMinutes / 60).toFixed(1)}h`
      : `${stats.studyMinutes}분`;

  return (
    <Card>
      <CardContent className="flex items-center gap-5 p-5">
        <ProgressRing
          percent={stats.percent}
          label={ringLabel}
          sub={stats.goal ? `목표 ${formatMinutes(stats.goal)}` : "오늘 공부"}
        />
        <div className="grid flex-1 grid-cols-2 gap-2.5">
          <Stat
            value={`${stats.doneTasks}/${stats.totalTasks}`}
            label="공부 완료"
          />
          <Stat value={`${stats.openHomework}건`} label="남은 숙제" />
          <Stat value={formatMinutes(stats.studyMinutes)} label="오늘 공부 시간" />
          <Stat
            value={stats.overdue ? `${stats.overdue}건` : "0건"}
            label="지난 숙제"
          />
        </div>
      </CardContent>
    </Card>
  );
}
