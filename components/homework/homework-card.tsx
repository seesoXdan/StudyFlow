"use client";

import { MoreHorizontal, Pencil, Trash2, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PRIORITY_META } from "@/lib/constants";
import { isOverdueISO, isTodayISO, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { Homework, Subject } from "@/types";

interface Props {
  homework: Homework & { id: string };
  subject?: Subject & { id: string };
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function HomeworkCard({
  homework,
  subject,
  onToggle,
  onEdit,
  onDelete,
  busy,
}: Props) {
  const overdue = !homework.completed && isOverdueISO(homework.dueDate);
  const dueToday = !homework.completed && isTodayISO(homework.dueDate);
  const p = PRIORITY_META[homework.priority];

  return (
    <Card className={cn(overdue && "border-danger/40")}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={homework.completed}
          disabled={busy}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          className="mt-0.5"
          aria-label="완료 표시"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-sm font-semibold",
                homework.completed && "text-muted-foreground line-through"
              )}
            >
              {homework.name}
            </p>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <SubjectDot color={subject?.color} />
              {subject?.name ?? "미지정"}
            </span>
            <Badge
              variant={
                overdue ? "danger" : dueToday ? "warning" : "secondary"
              }
            >
              <CalendarClock className="h-3 w-3" />
              {overdue
                ? `기한 지남 · ${formatShortDate(homework.dueDate)}`
                : dueToday
                  ? "오늘까지"
                  : formatShortDate(homework.dueDate)}
            </Badge>
            <span
              className="inline-flex items-center gap-1 font-medium"
              style={{ color: p.color }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
              {p.label}
            </span>
          </div>
          {homework.memo && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              {homework.memo}
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
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 text-muted-foreground" />
              수정
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
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
}
