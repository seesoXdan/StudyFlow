"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  StickyNote,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchBar } from "@/components/ui/search-bar";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WrongNoteFormDialog } from "@/components/forms/wrong-note-form-dialog";
import { useWrongNotes, useSubjectMap } from "@/hooks/use-data";
import {
  addWrongNote,
  updateWrongNote,
  deleteWrongNote,
} from "@/lib/repositories";
import { formatShortDate } from "@/lib/date";
import type { WrongNote } from "@/types";
import type { WrongNoteInput } from "@/lib/schemas";

type Row = WrongNote & { id: string };
const ALL = "all";

export function WrongNotesList() {
  const { notes, loading } = useWrongNotes();
  const { subjectMap, subjects } = useSubjectMap();
  const [q, setQ] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [reviewFilter, setReviewFilter] = useState(ALL); // all | todo | done
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return notes
      .filter((n) => (subjectFilter === ALL ? true : n.subjectId === subjectFilter))
      .filter((n) =>
        reviewFilter === ALL
          ? true
          : reviewFilter === "done"
            ? n.reviewed
            : !n.reviewed
      )
      .filter((n) =>
        term
          ? n.chapter.toLowerCase().includes(term) ||
            (n.memo?.toLowerCase().includes(term) ?? false)
          : true
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [notes, q, subjectFilter, reviewFilter]);

  async function toggleReviewed(row: Row) {
    setBusy(row.id);
    try {
      await updateWrongNote(row.id, {
        reviewed: !row.reviewed,
        completed: !row.reviewed,
      });
    } catch {
      toast.error("변경에 실패했어요");
    } finally {
      setBusy(null);
    }
  }

  const isEmpty = !loading && notes.length === 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold tracking-tight">오답노트</h3>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" />
          추가
        </Button>
      </div>

      {!isEmpty && (
        <div className="space-y-2.5">
          <SearchBar value={q} onChange={setQ} placeholder="단원·메모 검색" />
          <div className="flex gap-2">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="h-10 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>모든 과목</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={reviewFilter} onValueChange={setReviewFilter}>
              <SelectTrigger className="h-10 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>전체</SelectItem>
                <SelectItem value="todo">미복습</SelectItem>
                <SelectItem value="done">복습완료</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isEmpty ? (
        <EmptyState
          icon={StickyNote}
          title="오답노트가 비어 있어요"
          description="틀린 문제의 단원과 풀이를 기록해 복습해 보세요."
          action={
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              오답노트 추가
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={StickyNote} title="검색 결과가 없어요" />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const subject = subjectMap.get(n.subjectId);
            return (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <SubjectDot color={subject?.color} />
                          {subject?.name ?? "미지정"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {formatShortDate(n.date)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold">{n.chapter}</p>
                      {n.memo && (
                        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                          {n.memo}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditRow(n)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          수정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteRow(n)}
                          className="text-danger focus:text-danger"
                        >
                          <Trash2 className="h-4 w-4" />
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3">
                    <Button
                      variant={n.reviewed ? "success" : "outline"}
                      size="sm"
                      disabled={busy === n.id}
                      onClick={() => toggleReviewed(n)}
                    >
                      {n.reviewed ? (
                        <>
                          <Check className="h-4 w-4" />
                          복습완료
                        </>
                      ) : (
                        "복습 표시"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <WrongNoteFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        subjects={subjects}
        title="오답노트 추가"
        onSubmit={async (values: WrongNoteInput) => {
          await addWrongNote({ ...values, completed: values.reviewed });
          toast.success("추가됐어요");
        }}
      />

      <WrongNoteFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        subjects={subjects}
        title="오답노트 수정"
        defaultValues={
          editRow
            ? {
                subjectId: editRow.subjectId,
                chapter: editRow.chapter,
                memo: editRow.memo ?? "",
                reviewed: editRow.reviewed,
                completed: editRow.completed,
                date: editRow.date,
              }
            : undefined
        }
        onSubmit={async (values: WrongNoteInput) => {
          if (editRow) {
            await updateWrongNote(editRow.id, {
              ...values,
              completed: values.reviewed,
            });
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="오답노트를 삭제할까요?"
        description={deleteRow?.chapter}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteWrongNote(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </section>
  );
}
