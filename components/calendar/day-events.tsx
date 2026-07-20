"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EventFormDialog } from "@/components/forms/event-form-dialog";
import { useEvents } from "@/hooks/use-data";
import { addEvent, updateEvent, deleteEvent } from "@/lib/repositories";
import { eventCategoryColor } from "@/lib/constants";
import { formatRange } from "@/lib/date";
import type { CalendarEvent } from "@/types";
import type { EventInput } from "@/lib/schemas";

type Row = CalendarEvent & { id: string };

export function DayEvents({
  date,
  openAddNonce = 0,
}: {
  date: string;
  openAddNonce?: number;
}) {
  const { events } = useEvents();
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [deleteRow, setDeleteRow] = useState<Row | null>(null);

  // Parent (calendar) bumps the nonce to open the quick-add input on re-click.
  useEffect(() => {
    if (openAddNonce > 0) setAddOpen(true);
  }, [openAddNonce]);

  const items = useMemo(
    () =>
      events
        .filter((e) => {
          const end = e.endDate && e.endDate >= e.date ? e.endDate : e.date;
          return e.date <= date && date <= end;
        })
        .sort((a, b) => (a.startTime || "99").localeCompare(b.startTime || "99")),
    [events, date]
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-bold tracking-tight">일정 · 과외 · 개인활동</p>
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="py-3 text-center text-sm text-muted-foreground">
            이 날의 일정이 없어요. 과외·개인활동을 추가해 보세요.
          </p>
        ) : (
          <div className="divide-y divide-border">
            {items.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: eventCategoryColor(e.category) }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{e.title}</p>
                  <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{e.category}</span>
                    {e.endDate && e.endDate !== e.date && (
                      <span>· {formatRange(e.date, e.endDate)}</span>
                    )}
                    {e.startTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {e.startTime}
                        {e.endTime ? `~${e.endTime}` : ""}
                      </span>
                    )}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditRow(e)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeleteRow(e)}
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
        )}
      </CardContent>

      <EventFormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        date={date}
        title="일정 추가"
        onSubmit={async (values: EventInput) => {
          await addEvent(values);
          toast.success("추가됐어요");
        }}
      />

      <EventFormDialog
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
        date={date}
        title="일정 수정"
        defaultValues={
          editRow
            ? {
                date: editRow.date,
                endDate: editRow.endDate ?? "",
                startTime: editRow.startTime ?? "",
                endTime: editRow.endTime ?? "",
                title: editRow.title,
                category: editRow.category,
                memo: editRow.memo ?? "",
              }
            : undefined
        }
        onSubmit={async (values: EventInput) => {
          if (editRow) {
            await updateEvent(editRow.id, values);
            toast.success("수정됐어요");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteRow)}
        onOpenChange={(v) => !v && setDeleteRow(null)}
        title="일정을 삭제할까요?"
        description={deleteRow?.title}
        onConfirm={async () => {
          if (deleteRow) {
            await deleteEvent(deleteRow.id);
            toast.success("삭제됐어요");
          }
        }}
      />
    </Card>
  );
}
