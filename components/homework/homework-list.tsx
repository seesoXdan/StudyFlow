"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { HomeworkCard } from "./homework-card";
import { HomeworkFormDialog } from "@/components/forms/homework-form-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useHomework, useSubjectMap } from "@/hooks/use-data";
import {
  addHomework,
  updateHomework,
  deleteHomework,
} from "@/lib/repositories";
import { todayISO } from "@/lib/date";
import { PRIORITY_META } from "@/lib/constants";
import type { Homework } from "@/types";
import type { HomeworkInput } from "@/lib/schemas";

type Row = Homework & { id: string };

const GROUPS = [
  { key: "overdue", label: "지난 숙제" },
  { key: "today", label: "오늘 마감" },
  { key: "upcoming", label: "예정" },
  { key: "done", label: "완료" },
] as const;

function byPriorityThenDue(a: Row, b: Row) {
  const pa = PRIORITY_META[a.priority].order;
  const pb = PRIORITY_META[b.priority].order;
  if (pa !== pb) return pa - pb;
  return a.dueDate.localeCompare(b.dueDate);
}

export function HomeworkList() {
  const { homework, loading } = useHomework();
  const { subjectMap, subjects } = useSubjectMap();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const today = todayISO();
    const g: Record<string, Row[]> = {
      overdue: [],
      today: [],
      upcoming: [],
      done: [],
    };
    for (const h of homework) {
      if (h.completed) g.done.push(h);
      else if (h.dueDate < today) g.overdue.push(h);
      else if (h.dueDate === today) g.today.push(h);
      else g.upcoming.push(h);
    }
    g.overdue.sort(byPriorityThenDue);
    g.today.sort(byPriorityThenDue);
    g.upcoming.sort(byPriorityThenDue);
    g.done.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    return g;
  }, [homework]);

  async function toggle(id: string, completed: boolean) {
    setBusy(id);
    try {
      await updateHomework(id, { completed });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  const isEmpty = !loading && homework.length === 0;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">숙제</h3>
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
          icon={CheckSquare}
          title="등록된 숙제가 없어요"
          description="마감일과 우선순위로 숙제를 관리해 보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              숙제 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {GROUPS.map(({ key, label }) =>
            grouped[key].length ? (
              <div key={key} className="space-y-2.5">
                <p className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {label}
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                    {grouped[key].length}
                  </span>
                </p>
                {grouped[key].map((hw) => (
                  <HomeworkCard
                    key={hw.id}
                    homework={hw}
                    subject={subjectMap.get(hw.subjectId)}
                    busy={busy === hw.id}
                    onToggle={(c) => toggle(hw.id, c)}
                    onEdit={() => setEditRow(hw)}
                    onDelete={() => setDeleteRow(hw)}
                  />
                ))}
              </div>
            ) : null
          )}
        </div>
      )}

      <HomeworkFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        title="숙제 추가"
        onSubmit={async (values: HomeworkInput) => {
          await addHomework(values);
          toast.success("추가됐어요");
        }}
      />

      <HomeworkFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        title="숙제 수정"
        defaultValues={
          editRow
            ? {
                subjectId: editRow.subjectId,
                name: editRow.name,
                dueDate: editRow.dueDate,
                priority: editRow.priority,
                memo: editRow.memo ?? "",
                completed: editRow.completed,
              }
            : undefined
        }
        onSubmit={async (values: HomeworkInput) => {
          if (editRow) {
            await updateHomework(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="숙제를 삭제할까요?"
        description={deleteRow?.name}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteHomework(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
