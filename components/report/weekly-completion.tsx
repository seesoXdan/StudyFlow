"use client";

import { useMemo, useState } from "react";
import { addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudyTasks, useHomework } from "@/hooks/use-data";
import {
  buildWeek,
  statusFromFlags,
  STATUS_COLOR,
  WEEKDAY_HEADERS,
} from "@/lib/calendar";
import { toISODate, todayISO, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";

interface DayRow {
  iso: string;
  studyDone: number;
  studyTotal: number;
  hwDone: number;
  hwTotal: number;
}

function rate(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

export function WeeklyCompletion() {
  const { tasks, loading: l1 } = useStudyTasks();
  const { homework, loading: l2 } = useHomework();
  const [anchor, setAnchor] = useState(() => new Date());
  const today = todayISO();

  const week = useMemo(() => buildWeek(anchor), [anchor]);

  const rows = useMemo<DayRow[]>(() => {
    return week.map((d) => {
      const iso = toISODate(d);
      const dayStudy = tasks.filter((t) => t.date === iso);
      const dayHw = homework.filter((h) => h.dueDate === iso);
      return {
        iso,
        studyDone: dayStudy.filter((t) => t.completed).length,
        studyTotal: dayStudy.length,
        hwDone: dayHw.filter((h) => h.completed).length,
        hwTotal: dayHw.length,
      };
    });
  }, [week, tasks, homework]);

  const totals = useMemo(() => {
    const sd = rows.reduce((s, r) => s + r.studyDone, 0);
    const st = rows.reduce((s, r) => s + r.studyTotal, 0);
    const hd = rows.reduce((s, r) => s + r.hwDone, 0);
    const ht = rows.reduce((s, r) => s + r.hwTotal, 0);
    return { sd, st, hd, ht };
  }, [rows]);

  if (l1 || l2) return <Skeleton className="h-96 w-full" />;

  const rangeLabel = `${formatShortDate(toISODate(week[0]))} ~ ${formatShortDate(
    toISODate(week[6])
  )}`;

  return (
    <div className="space-y-4">
      {/* Week navigator */}
      <Card>
        <CardContent className="flex items-center justify-between p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAnchor((a) => addDays(a, -7))}
            aria-label="이전 주"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">{rangeLabel}</p>
            <Button variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
              이번 주
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setAnchor((a) => addDays(a, 7))}
            aria-label="다음 주"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {/* Weekly summary */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold tracking-tight">이번 주 완료율</p>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">공부</span>
              <span className="text-muted-foreground">
                {totals.sd}/{totals.st} · {rate(totals.sd, totals.st)}%
              </span>
            </div>
            <Progress value={rate(totals.sd, totals.st)} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">숙제</span>
              <span className="text-muted-foreground">
                {totals.hd}/{totals.ht} · {rate(totals.hd, totals.ht)}%
              </span>
            </div>
            <Progress value={rate(totals.hd, totals.ht)} indicatorClassName="bg-blue" />
          </div>
        </CardContent>
      </Card>

      {/* Per-day breakdown */}
      <Card>
        <CardContent className="p-3">
          <p className="mb-2 px-1 text-sm font-bold tracking-tight">날짜별 완료 현황</p>
          <div className="divide-y divide-border">
            {rows.map((r, i) => {
              const flags = [
                ...Array(r.studyDone).fill(true),
                ...Array(r.studyTotal - r.studyDone).fill(false),
                ...Array(r.hwDone).fill(true),
                ...Array(r.hwTotal - r.hwDone).fill(false),
              ];
              const status = statusFromFlags(flags);
              const totalItems = r.studyTotal + r.hwTotal;
              const doneItems = r.studyDone + r.hwDone;
              const isToday = r.iso === today;
              return (
                <div key={r.iso} className="flex items-center gap-3 py-2.5">
                  <div className="flex w-10 flex-col items-center">
                    <span
                      className={cn(
                        "text-[11px]",
                        i === 0 ? "text-danger/80" : "text-muted-foreground"
                      )}
                    >
                      {WEEKDAY_HEADERS[i]}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        isToday && "text-primary"
                      )}
                    >
                      {r.iso.slice(8)}
                    </span>
                  </div>
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        status === "none" ? "hsl(var(--muted))" : STATUS_COLOR[status],
                    }}
                  />
                  <div className="flex-1 text-xs text-muted-foreground">
                    {totalItems === 0 ? (
                      <span>계획 없음</span>
                    ) : (
                      <span>
                        공부 {r.studyDone}/{r.studyTotal} · 숙제 {r.hwDone}/{r.hwTotal}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {totalItems ? `${rate(doneItems, totalItems)}%` : "–"}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
