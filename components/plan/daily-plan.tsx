"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { addDays, parseISO } from "date-fns";
import {
  Plus,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PlanFormDialog } from "@/components/forms/plan-form-dialog";
import { usePlanBlocks, useSubjectMap } from "@/hooks/use-data";
import {
  addPlanBlock,
  updatePlanBlock,
  deletePlanBlock,
} from "@/lib/repositories";
import { todayISO, toISODate, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { PlanBlock } from "@/types";
import type { PlanBlockInput } from "@/lib/schemas";

type Row = PlanBlock & { id: string };

export function DailyPlan() {
  const today = todayISO();
  const [date, setDate] = useState(today);
  const { blocks, loading } = usePlanBlocks();
  const { subjectMap, subjects } = useSubjectMap();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const dayBlocks = useMemo(
    () =>
      blocks
        .filter((b) => b.date === date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [blocks, date]
  );

  function shift(delta: number) {
    setDate(toISODate(addDays(parseISO(date), delta)));
  }

  async function toggle(id: string, done: boolean) {
    setBusy(id);
    try {
      await updatePlanBlock(id, { done });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  const doneCount = dayBlocks.filter((b) => b.done).length;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-3">
          <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="이전 날">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{formatShortDate(date)}</p>
            {date !== today && (
              <Button variant="outline" size="sm" onClick={() => setDate(today)}>
                오늘
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => shift(1)} aria-label="다음 날">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-muted-foreground">
          {dayBlocks.length > 0
            ? `${doneCount}/${dayBlocks.length} 완료`
            : "시간대별 공부 계획"}
        </p>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          계획 추가
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : dayBlocks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="이 날의 계획이 없어요"
          description="시간대별로 공부 계획을 세워보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              계획 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {dayBlocks.map((b) => {
            const subject = b.subjectId ? subjectMap.get(b.subjectId) : undefined;
            return (
              <Card key={b.id}>
                <CardContent className="flex items-center gap-3 p-3.5">
                  <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-primary/10 py-1.5 text-primary">
                    <span className="text-xs font-bold leading-tight">{b.startTime}</span>
                    <span className="text-[10px] leading-tight text-primary/70">
                      {b.endTime}
                    </span>
                  </div>
                  <Checkbox
                    checked={b.done}
                    disabled={busy === b.id}
                    onCheckedChange={(v) => toggle(b.id, Boolean(v))}
                    aria-label="완료 표시"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        b.done && "text-muted-foreground line-through"
                      )}
                    >
                      {b.title}
                    </p>
                    {subject && (
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <SubjectDot color={subject.color} />
                        {subject.name}
                      </span>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRow(b)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteRow(b)}
                        className="text-danger focus:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PlanFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        date={date}
        title="계획 추가"
        onSubmit={async (values: PlanBlockInput) => {
          await addPlanBlock(values);
          toast.success("추가됐어요");
        }}
      />

      <PlanFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        date={date}
        title="계획 수정"
        defaultValues={
          editRow
            ? {
                date: editRow.date,
                startTime: editRow.startTime,
                endTime: editRow.endTime,
                subjectId: editRow.subjectId ?? "none",
                title: editRow.title,
                done: editRow.done,
              }
            : undefined
        }
        onSubmit={async (values: PlanBlockInput) => {
          if (editRow) {
            await updatePlanBlock(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="계획을 삭제할까요?"
        description={deleteRow?.title}
        onConfirm={async () => {
          if (deleteRow) {
            await deletePlanBlock(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </div>
  );
}
