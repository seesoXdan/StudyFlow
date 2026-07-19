"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { StudyCard } from "./study-card";
import { StudyFormDialog } from "@/components/forms/study-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStudyTasks, useSubjectMap } from "@/hooks/use-data";
import {
  addStudyTask,
  updateStudyTask,
  deleteStudyTask,
} from "@/lib/repositories";
import { todayISO } from "@/lib/date";
import type { StudyTask } from "@/types";
import type { StudyTaskInput } from "@/lib/schemas";

type Row = StudyTask & { id: string };

const GROUPS = [
  { key: "today", label: "오늘" },
  { key: "upcoming", label: "다가오는" },
  { key: "past", label: "지난" },
] as const;

export function StudyList() {
  const { tasks, loading } = useStudyTasks();
  const { subjectMap, subjects } = useSubjectMap();
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState<Row | null>(null);
  const [deleteTask, setDeleteTask] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const today = todayISO();
    const g: Record<string, Row[]> = { today: [], upcoming: [], past: [] };
    for (const t of tasks) {
      if (t.date === today) g.today.push(t);
      else if (t.date > today) g.upcoming.push(t);
      else g.past.push(t);
    }
    g.today.sort((a, b) => Number(a.completed) - Number(b.completed));
    g.upcoming.sort((a, b) => a.date.localeCompare(b.date));
    g.past.sort((a, b) => b.date.localeCompare(a.date));
    return g;
  }, [tasks]);

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

  const isEmpty = !loading && tasks.length === 0;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">학습 세션</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={BookOpen}
          title="아직 학습 세션이 없어요"
          description="오늘 할 공부를 추가해 계획을 세워보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              공부 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {GROUPS.map(({ key, label }) =>
            grouped[key].length ? (
              <div key={key} className="space-y-2.5">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                </p>
                {grouped[key].map((task) => (
                  <StudyCard
                    key={task.id}
                    task={task}
                    subject={subjectMap.get(task.subjectId)}
                    busy={busy === task.id}
                    onToggle={(c) => toggle(task.id, c)}
                    onEdit={() => setEditTask(task)}
                    onDelete={() => setDeleteTask(task)}
                  />
                ))}
              </div>
            ) : null
          )}
        </div>
      )}

      <StudyFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        title="공부 추가"
        onSubmit={async (values: StudyTaskInput) => {
          await addStudyTask(values);
          toast.success("추가됐어요");
        }}
      />

      <StudyFormDialog
        open={Boolean(editTask)}
        onOpenChange={(v) => !v && setEditTask(null)}
        subjects={subjects}
        title="공부 수정"
        defaultValues={
          editTask
            ? {
                subjectId: editTask.subjectId,
                title: editTask.title,
                date: editTask.date,
                goalMinutes: editTask.goalMinutes,
                studyMinutes: editTask.studyMinutes,
                memo: editTask.memo ?? "",
                completed: editTask.completed,
              }
            : undefined
        }
        onSubmit={async (values: StudyTaskInput) => {
          if (editTask) {
            await updateStudyTask(editTask.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTask)}
        onOpenChange={(v) => !v && setDeleteTask(null)}
        title="학습 세션을 삭제할까요?"
        description={deleteTask?.title}
        onConfirm={async () => {
          if (deleteTask) {
            await deleteStudyTask(deleteTask.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
