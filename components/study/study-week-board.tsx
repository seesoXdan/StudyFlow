"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StudyFormDialog } from "@/components/forms/study-form-dialog";
import { useStudyTasks, useSubjectMap } from "@/hooks/use-data";
import {
  addStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "@/lib/repositories";
import { buildWeek, WEEKDAY_HEADERS } from "@/lib/calendar";
import { toISODate, todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { StudyTask } from "@/types";
import type { StudyTaskInput } from "@/lib/schemas";

type Row = StudyTask & { id: string };

export function StudyWeekBoard() {
  const { tasks, loading } = useStudyTasks();
  const { subjectMap, subjects } = useSubjectMap();
  const [anchor, setAnchor] = useState(() => new Date());
  const [addDate, setAddDate] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIso, setOverIso] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const today = todayISO();

  const week = useMemo(() => buildWeek(anchor), [anchor]);
  const byDay = useMemo(() => {
    const m = new Map<string, Row[]>();
    week.forEach((d) => m.set(toISODate(d), []));
    tasks.forEach((t) => {
      const list = m.get(t.date);
      if (list) list.push(t);
    });
    m.forEach((list) =>
      list.sort(
        (a, b) =>
          Number(a.completed) - Number(b.completed) ||
          (a.startTime || "99").localeCompare(b.startTime || "99")
      )
    );
    return m;
  }, [week, tasks]);

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

  async function moveTo(id: string, iso: string) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.date === iso) return;
    try {
      await updateStudyTask(id, { date: iso });
      toast.success("날짜를 옮겼어요");
    } catch {
      toast.error("이동에 실패했어요");
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  const rangeLabel = `${week[0].getMonth() + 1}월 ${week[0].getDate()}일 ~ ${
    week[6].getMonth() + 1
  }월 ${week[6].getDate()}일`;

  return (
    <div className="space-y-4">
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

      <p className="px-1 text-center text-xs text-muted-foreground">
        카드를 마우스로 끌어 다른 날짜로 옮길 수 있어요.
      </p>

      <div className="space-y-3">
        {week.map((d, i) => {
          const iso = toISODate(d);
          const list = byDay.get(iso) ?? [];
          const isToday = iso === today;
          const isOver = overIso === iso;
          return (
            <div
              key={iso}
              onDragOver={(e) => {
                e.preventDefault();
                if (overIso !== iso) setOverIso(iso);
              }}
              onDragLeave={() => setOverIso((o) => (o === iso ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData("text/plain");
                setOverIso(null);
                setDragId(null);
                if (id) void moveTo(id, iso);
              }}
              className={cn(
                "rounded-2xl border p-3 transition-colors",
                isOver
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card"
              )}
            >
              <div className="mb-2 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      isToday ? "text-primary" : "",
                      i === 0 && !isToday ? "text-danger/80" : ""
                    )}
                  >
                    {WEEKDAY_HEADERS[i]}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {d.getDate()}일
                  </span>
                  {list.length > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {list.filter((t) => t.completed).length}/{list.length}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setAddDate(iso)}
                  aria-label="공부 추가"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {list.length === 0 ? (
                <p className="px-1 py-2 text-xs text-muted-foreground">
                  이 날의 공부가 없어요.
                </p>
              ) : (
                <div className="space-y-2">
                  {list.map((task) => {
                    const subject = subjectMap.get(task.subjectId);
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDragId(task.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOverIso(null);
                        }}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border border-border bg-background px-2.5 py-2",
                          dragId === task.id && "opacity-50"
                        )}
                      >
                        <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        <Checkbox
                          checked={task.completed}
                          disabled={busy === task.id}
                          onCheckedChange={(v) => toggle(task.id, Boolean(v))}
                          aria-label="완료"
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
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <SubjectDot color={subject?.color} />
                            {subject?.name ?? "미지정"}
                            {task.startTime ? ` · ${task.startTime}` : ""}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditRow(task)}>
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                              수정
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteRow(task)}
                              className="text-danger focus:text-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                              삭제
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <StudyFormDialog
        open={Boolean(addDate)}
        onOpenChange={(v) => !v && setAddDate(null)}
        subjects={subjects}
        title="공부 추가"
        defaultValues={addDate ? { date: addDate } : undefined}
        onSubmit={async (values: StudyTaskInput) => {
          await addStudyTask(values);
          toast.success("추가됐어요");
        }}
      />

      <StudyFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        title="공부 수정"
        defaultValues={
          editRow
            ? {
                subjectId: editRow.subjectId,
                title: editRow.title,
                date: editRow.date,
                startTime: editRow.startTime ?? "",
                endTime: editRow.endTime ?? "",
                goalMinutes: editRow.goalMinutes,
                studyMinutes: editRow.studyMinutes,
                memo: editRow.memo ?? "",
                completed: editRow.completed,
              }
            : undefined
        }
        onSubmit={async (values: StudyTaskInput) => {
          if (editRow) {
            await updateStudyTask(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="공부를 삭제할까요?"
        description={deleteRow?.title}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteStudyTask(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </div>
  );
}
