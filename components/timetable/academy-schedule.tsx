"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  GraduationCap,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AcademyFormDialog } from "@/components/forms/academy-form-dialog";
import { useAcademySchedule } from "@/hooks/use-data";
import {
  addAcademyClass,
  updateAcademyClass,
  deleteAcademyClass,
} from "@/lib/repositories";
import { WEEKDAYS } from "@/lib/constants";
import type { AcademyClass, Weekday } from "@/types";
import type { AcademyClassInput } from "@/lib/schemas";

type Row = AcademyClass & { id: string };

export function AcademySchedule() {
  const { classes, loading } = useAcademySchedule();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  const byDay = useMemo(() => {
    const m = new Map<Weekday, Row[]>();
    WEEKDAYS.forEach((w) => m.set(w.key, []));
    classes.forEach((c) => m.get(c.day)?.push(c));
    m.forEach((list) => list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    return m;
  }, [classes]);

  const isEmpty = !loading && classes.length === 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">학원 시간표</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : isEmpty ? (
        <EmptyState
          icon={GraduationCap}
          title="학원 일정이 없어요"
          description="요일별 학원 수업 시간을 추가해 보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              학원 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-5">
          {WEEKDAYS.map((w) => {
            const list = byDay.get(w.key) ?? [];
            if (list.length === 0) return null;
            return (
              <div key={w.key} className="space-y-2">
                <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {w.label}
                </p>
                {list.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="flex items-center gap-3 p-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">
                          {c.subject}
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            {c.academy}
                          </span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {c.startTime} ~ {c.endTime}
                          {c.memo ? ` · ${c.memo}` : ""}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditRow(c)}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                            수정
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteRow(c)}
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
              </div>
            );
          })}
        </div>
      )}

      <AcademyFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="학원 수업 추가"
        onSubmit={async (values: AcademyClassInput) => {
          await addAcademyClass(values);
          toast.success("추가됐어요");
        }}
      />

      <AcademyFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="학원 수업 수정"
        defaultValues={
          editRow
            ? {
                day: editRow.day,
                academy: editRow.academy,
                subject: editRow.subject,
                startTime: editRow.startTime,
                endTime: editRow.endTime,
                memo: editRow.memo ?? "",
              }
            : undefined
        }
        onSubmit={async (values: AcademyClassInput) => {
          if (editRow) {
            await updateAcademyClass(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="학원 수업을 삭제할까요?"
        description={deleteRow ? `${deleteRow.academy} ${deleteRow.subject}` : ""}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteAcademyClass(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
