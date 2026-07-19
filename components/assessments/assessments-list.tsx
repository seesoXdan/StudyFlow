"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  ClipboardCheck,
  MoreHorizontal,
  Pencil,
  Trash2,
  CalendarRange,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AssessmentFormDialog } from "@/components/forms/assessment-form-dialog";
import { useAssessments, useSubjectMap } from "@/hooks/use-data";
import {
  addAssessment,
  updateAssessment,
  deleteAssessment,
} from "@/lib/repositories";
import { formatRange, isOverdueISO, todayISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Assessment } from "@/types";
import type { AssessmentInput } from "@/lib/schemas";

type Row = Assessment & { id: string };

export function AssessmentsList() {
  const { assessments, loading } = useAssessments();
  const { subjectMap, subjects } = useSubjectMap();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const items = useMemo(
    () =>
      [...assessments].sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done);
        return a.startDate.localeCompare(b.startDate);
      }),
    [assessments]
  );

  async function toggle(id: string, done: boolean) {
    setBusy(id);
    try {
      await updateAssessment(id, { done });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  const isEmpty = !loading && assessments.length === 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">수행평가</h3>
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
          icon={ClipboardCheck}
          title="등록된 수행평가가 없어요"
          description="평가 기간(며칠~며칠)과 어떤 수행평가인지 적어 관리해 보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              수행평가 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            const subject = a.subjectId ? subjectMap.get(a.subjectId) : undefined;
            const overdue = !a.done && isOverdueISO(a.endDate);
            const active =
              !a.done && !overdue && a.startDate <= todayISO() && a.endDate >= todayISO();
            return (
              <Card key={a.id} className={cn(active && "border-primary/40")}>
                <CardContent className="flex items-start gap-3 p-4">
                  <Checkbox
                    checked={a.done}
                    disabled={busy === a.id}
                    onCheckedChange={(v) => toggle(a.id, Boolean(v))}
                    className="mt-0.5"
                    aria-label="완료 표시"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        a.done && "text-muted-foreground line-through"
                      )}
                    >
                      {a.title}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                      <Badge
                        variant={overdue ? "danger" : active ? "warning" : "secondary"}
                      >
                        <CalendarRange className="h-3 w-3" />
                        {formatRange(a.startDate, a.endDate)}
                      </Badge>
                      {subject && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <SubjectDot color={subject.color} />
                          {subject.name}
                        </span>
                      )}
                    </div>
                    {a.memo && (
                      <p className="mt-1.5 text-xs text-muted-foreground">{a.memo}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditRow(a)}>
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteRow(a)}
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

      <AssessmentFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        title="수행평가 추가"
        onSubmit={async (values: AssessmentInput) => {
          await addAssessment(values);
          toast.success("추가됐어요");
        }}
      />

      <AssessmentFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        title="수행평가 수정"
        defaultValues={
          editRow
            ? {
                subjectId: editRow.subjectId ?? "none",
                title: editRow.title,
                startDate: editRow.startDate,
                endDate: editRow.endDate,
                memo: editRow.memo ?? "",
                done: editRow.done,
              }
            : undefined
        }
        onSubmit={async (values: AssessmentInput) => {
          if (editRow) {
            await updateAssessment(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="수행평가를 삭제할까요?"
        description={deleteRow?.title}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteAssessment(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
