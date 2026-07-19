"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubjectFormDialog } from "@/components/forms/subject-form-dialog";
import { SectionHeader } from "@/components/home/section-header";
import { useSubjects } from "@/hooks/use-data";
import {
  addSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/repositories";
import { ELECTIVE_SUBJECTS } from "@/lib/constants";
import type { Subject } from "@/types";
import type { SubjectInput } from "@/lib/schemas";

type Row = Subject & { id: string };

export function SubjectManager() {
  const { subjects, loading } = useSubjects();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  const existing = useMemo(
    () => new Set(subjects.map((s) => s.name)),
    [subjects]
  );
  const availableElectives = ELECTIVE_SUBJECTS.filter(
    (e) => !existing.has(e.name)
  );

  async function quickAddElective(name: string, color: string) {
    try {
      await addSubject({ name, color, order: subjects.length });
      toast.success(`${name} 추가됨`);
    } catch {
      toast.error("추가에 실패했어요");
    }
  }

  return (
    <section>
      <SectionHeader title="과목" />
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="divide-y divide-border">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2.5">
                  <SubjectDot color={s.color} className="h-3 w-3" />
                  <span className="flex-1 text-sm font-medium">{s.name}</span>
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
              ))}
            </div>

            {availableElectives.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  빠른 추가 (탐구)
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableElectives.map((e) => (
                    <button
                      key={e.name}
                      type="button"
                      onClick={() => quickAddElective(e.name, e.color)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      <SubjectDot color={e.color} />
                      {e.name}
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="h-4 w-4" />
              과목 직접 추가
            </Button>
          </CardContent>
        </Card>
      )}

      <SubjectFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="과목 추가"
        onSubmit={async (values: SubjectInput) => {
          await addSubject({ ...values, order: subjects.length });
          toast.success("과목이 추가됐어요");
        }}
      />

      <SubjectFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        title="과목 수정"
        defaultValues={
          editRow ? { name: editRow.name, color: editRow.color } : undefined
        }
        onSubmit={async (values: SubjectInput) => {
          if (editRow) {
            await updateSubject(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="과목을 삭제할까요?"
        description={`${deleteRow?.name ?? ""} 과목을 삭제합니다. 관련 기록은 남아 있어요.`}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteSubject(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
