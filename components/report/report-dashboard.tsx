"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";
import { Flame, CheckSquare, BookOpen, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useStudyTasks, useHomework, useSubjects } from "@/hooks/use-data";
import { completion, studyStreak, subjectTaskCompletion } from "@/lib/report";

function StatCard({
  icon: Icon,
  value,
  label,
  tint,
}: {
  icon: typeof Flame;
  value: string;
  label: string;
  tint: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <Icon className="h-5 w-5" style={{ color: tint }} />
        <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function RateTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-soft">
      {d.name} · {d.done}/{d.total} · {d.rate}%
    </div>
  );
}

export function ReportDashboard() {
  const { tasks, loading: l1 } = useStudyTasks();
  const { homework, loading: l2 } = useHomework();
  const { subjects } = useSubjects();

  const data = useMemo(
    () => ({
      study: completion(tasks),
      hw: completion(homework),
      streak: studyStreak(tasks),
      bySubject: subjectTaskCompletion(tasks, subjects),
    }),
    [tasks, homework, subjects]
  );

  if (l1 || l2) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (tasks.length === 0 && homework.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="아직 통계가 없어요"
        description="공부와 숙제를 추가하고 완료하면 통계가 쌓여요."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={BookOpen}
          value={`${data.study.rate}%`}
          label="공부 완료율"
          tint="#14B8A6"
        />
        <StatCard
          icon={CheckSquare}
          value={`${data.hw.rate}%`}
          label="숙제 완료율"
          tint="#2563EB"
        />
        <StatCard
          icon={Flame}
          value={`${data.streak}일`}
          label="연속 공부"
          tint="#F59E0B"
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm font-bold tracking-tight">공부 · 숙제 완료 현황</p>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">공부</span>
              <span className="text-muted-foreground">
                {data.study.done}/{data.study.total} · {data.study.rate}%
              </span>
            </div>
            <Progress value={data.study.rate} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">숙제</span>
              <span className="text-muted-foreground">
                {data.hw.done}/{data.hw.total} · {data.hw.rate}%
              </span>
            </div>
            <Progress value={data.hw.rate} indicatorClassName="bg-blue" />
          </div>
        </CardContent>
      </Card>

      {data.bySubject.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-bold tracking-tight">과목별 완료율</p>
            <ResponsiveContainer width="100%" height={Math.max(140, data.bySubject.length * 44)}>
              <BarChart
                data={data.bySubject}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={64}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<RateTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
                <Bar dataKey="rate" radius={[0, 6, 6, 0]} maxBarSize={22}>
                  {data.bySubject.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
