"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, School, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SchoolFormDialog } from "@/components/forms/school-form-dialog";
import { useSchoolSchedule } from "@/hooks/use-data";
import {
  addSchoolPeriod,
  updateSchoolPeriod,
  deleteSchoolPeriod,
} from "@/lib/repositories";
import { WEEKDAYS } from "@/lib/constants";
import { todayWeekday } from "@/lib/date";
import type { SchoolPeriod, Weekday } from "@/types";
import type { SchoolPeriodInput } from "@/lib/schemas";

type Row = SchoolPeriod & { id: string };

export function SchoolTimetable() {
  const { periods, loading } = useSchoolSchedule();
  const [addOpen, setAddOpen] = useState(false);
  const [addDay, setAddDay] = useState<Weekday>("mon");
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  const byDay = useMemo(() => {
    const m = new Map<Weekday, Row[]>();
    WEEKDAYS.forEach((w) => m.set(w.key, []));
    periods.forEach((p) => m.get(p.day)?.push(p));
    m.forEach((list) => list.sort((a, b) => a.period - b.period));
    return m;
  }, [periods]);

  const isEmpty = !loading && periods.length === 0;

  function openAdd(day: Weekday) {
    setAddDay(day);
    setAddOpen(true);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">학교 시간표</h3>
        <Button size="sm" onClick={() => openAdd("mon")}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : isEmpty ? (
        <EmptyState
          icon={School}
          title="시간표가 비어 있어요"
          description="요일과 교시별로 수업을 추가해 보세요."
          action={
            <Button onClick={() => openAdd("mon")}>
              <Plus className="h-4 w-4" />
              수업 추가
            </Button>
          }
        />
      ) : (
        <Tabs defaultValue={todayWeekday()}>
          <TabsList className="grid w-full grid-cols-7">
            {WEEKDAYS.map((w) => (
              <TabsTrigger key={w.key} value={w.key} className="px-0">
                {w.short}
              </TabsTrigger>
            ))}
          </TabsList>
          {WEEKDAYS.map((w) => {
            const list = byDay.get(w.key) ?? [];
            return (
              <TabsContent key={w.key} value={w.key} className="space-y-2.5">
                {list.length === 0 ? (
                  <EmptyState
                    icon={School}
                    title={`${w.label} 수업이 없어요`}
                    action={
                      <Button variant="outline" size="sm" onClick={() => openAdd(w.key)}>
                        <Plus className="h-4 w-4" />
                        추가
                      </Button>
                    }
                  />
                ) : (
                  <>
                    {list.map((p) => (
                      <Card key={p.id}>
                        <CardContent className="flex items-center gap-3 p-3.5">
                          <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <span className="text-sm font-bold leading-none">
                              {p.period}
                            </span>
                            <span className="text-[9px] leading-none">교시</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{p.subject}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {[p.teacher, p.memo].filter(Boolean).join(" · ") ||
                                " "}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditRow(p)}>
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                수정
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteRow(p)}
                                className="text-danger focus:text-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                                삭제
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => openAdd(w.key)}>
                      <Plus className="h-4 w-4" />
                      {w.label} 수업 추가
                    </Button>
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}

      <SchoolFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="수업 추가"
        defaultValues={{ day: addDay }}
        onSubmit={async (values: SchoolPeriodInput) => {
          await addSchoolPeriod(values);
          toast.success("추가됐어요");
        }}
      />

      <SchoolFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="수업 수정"
        defaultValues={
          editRow
            ? {
                day: editRow.day,
                period: editRow.period,
                subject: editRow.subject,
                teacher: editRow.teacher ?? "",
                memo: editRow.memo ?? "",
              }
            : undefined
        }
        onSubmit={async (values: SchoolPeriodInput) => {
          if (editRow) {
            await updateSchoolPeriod(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="수업을 삭제할까요?"
        description={deleteRow ? `${deleteRow.period}교시 ${deleteRow.subject}` : ""}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteSchoolPeriod(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
