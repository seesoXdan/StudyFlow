"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Backpack,
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
import { SupplyFormDialog } from "@/components/forms/supply-form-dialog";
import { useSupplies, useSubjectMap } from "@/hooks/use-data";
import { addSupply, updateSupply, deleteSupply } from "@/lib/repositories";
import { formatRange, isOverdueISO } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { SchoolSupply } from "@/types";
import type { SupplyInput } from "@/lib/schemas";

type Row = SchoolSupply & { id: string };

export function SuppliesList() {
  const { supplies, loading } = useSupplies();
  const { subjectMap, subjects } = useSubjectMap();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const items = useMemo(
    () =>
      [...supplies].sort((a, b) => {
        if (a.done !== b.done) return Number(a.done) - Number(b.done);
        return a.endDate.localeCompare(b.endDate);
      }),
    [supplies]
  );

  async function toggle(id: string, done: boolean) {
    setBusy(id);
    try {
      await updateSupply(id, { done });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  const isEmpty = !loading && supplies.length === 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">준비물 · 학교 공지</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={Backpack}
          title="등록된 준비물이 없어요"
          description="준비 기간(며칠~며칠)과 학교 공지 사진을 함께 저장해 보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              준비물 추가
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((s) => {
            const subject = s.subjectId ? subjectMap.get(s.subjectId) : undefined;
            const overdue = !s.done && isOverdueISO(s.endDate);
            return (
              <Card key={s.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={s.done}
                      disabled={busy === s.id}
                      onCheckedChange={(v) => toggle(s.id, Boolean(v))}
                      className="mt-0.5"
                      aria-label="준비 완료"
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          s.done && "text-muted-foreground line-through"
                        )}
                      >
                        {s.title}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant={overdue ? "danger" : "secondary"}>
                          <CalendarRange className="h-3 w-3" />
                          {formatRange(s.startDate, s.endDate)}
                        </Badge>
                        {subject && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <SubjectDot color={subject.color} />
                            {subject.name}
                          </span>
                        )}
                      </div>
                      {s.memo && (
                        <p className="mt-1.5 text-xs text-muted-foreground">{s.memo}</p>
                      )}
                      {s.fileData && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.fileData}
                          alt="학교 공지"
                          className="mt-2 max-h-64 w-full rounded-xl border border-border object-contain"
                        />
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditRow(s)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteRow(s)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <SupplyFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        title="준비물 추가"
        onSubmit={async (values: SupplyInput) => {
          await addSupply(values);
          toast.success("추가됐어요");
        }}
      />

      <SupplyFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        title="준비물 수정"
        defaultValues={
          editRow
            ? {
                subjectId: editRow.subjectId ?? "none",
                title: editRow.title,
                startDate: editRow.startDate,
                endDate: editRow.endDate,
                memo: editRow.memo ?? "",
                done: editRow.done,
                fileData: editRow.fileData,
                fileName: editRow.fileName,
                fileType: editRow.fileType,
              }
            : undefined
        }
        onSubmit={async (values: SupplyInput) => {
          if (editRow) {
            await updateSupply(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="준비물을 삭제할까요?"
        description={deleteRow?.title}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteSupply(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
