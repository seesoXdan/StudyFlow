"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
} from "recharts";
import { Flame, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import {
  useStudyLogs,
  useStudyTasks,
  useHomework,
  useSubjects,
} from "@/hooks/use-data";
import {
  dailyStudy,
  monthlyStudy,
  subjectStudy,
  completion,
  studyStreak,
  totalMinutes,
} from "@/lib/report";
import { formatMinutes } from "@/lib/utils";

const PRIMARY = "#14B8A6";

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-4 text-sm font-bold tracking-tight">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

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

function MinutesTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-soft">
      {formatMinutes(payload[0].value)}
    </div>
  );
}

export function ReportDashboard() {
  const { logs, loading: l1 } = useStudyLogs();
  const { tasks, loading: l2 } = useStudyTasks();
  const { homework, loading: l3 } = useHomework();
  const { subjects } = useSubjects();

  const data = useMemo(() => {
    return {
      weekly: dailyStudy(logs, 7),
      monthly: monthlyStudy(logs, 6),
      bySubject: subjectStudy(logs, subjects),
      hw: completion(homework),
      task: completion(tasks),
      streak: studyStreak(logs),
      total: totalMinutes(logs),
    };
  }, [logs, tasks, homework, subjects]);

  const loading = l1 || l2 || l3;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  const noData =
    data.total === 0 && tasks.length === 0 && homework.length === 0;
  if (noData) {
    return (
      <EmptyState
        icon={BarChart3}
        title="아직 리포트가 없어요"
        description="공부 타이머를 사용하고 숙제를 완료하면 통계가 쌓여요."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Clock}
          value={formatMinutes(data.total)}
          label="총 공부 시간"
          tint={PRIMARY}
        />
        <StatCard
          icon={Flame}
          value={`${data.streak}일`}
          label="연속 공부"
          tint="#F59E0B"
        />
        <StatCard
          icon={TrendingUp}
          value={`${data.hw.rate}%`}
          label="숙제 완료율"
          tint="#2563EB"
        />
      </div>

      <ChartCard title="주간 공부 시간 (최근 7일)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<MinutesTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill={PRIMARY} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="월별 공부 시간 (최근 6개월)">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip content={<MinutesTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
            <Bar dataKey="minutes" radius={[6, 6, 0, 0]} fill="#2563EB" maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {data.bySubject.length > 0 && (
        <ChartCard title="과목별 공부 시간">
          <div className="flex items-center gap-2">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie
                  data={data.bySubject}
                  dataKey="minutes"
                  nameKey="name"
                  innerRadius={44}
                  outerRadius={72}
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.bySubject.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip content={<MinutesTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5">
              {data.bySubject.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatMinutes(s.minutes)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      )}

      <ChartCard title="완료율">
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">공부 완료</span>
              <span className="text-muted-foreground">
                {data.task.done}/{data.task.total} · {data.task.rate}%
              </span>
            </div>
            <Progress value={data.task.rate} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium">숙제 완료</span>
              <span className="text-muted-foreground">
                {data.hw.done}/{data.hw.total} · {data.hw.rate}%
              </span>
            </div>
            <Progress value={data.hw.rate} indicatorClassName="bg-blue" />
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
