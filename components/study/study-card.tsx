"use client";

import { MoreHorizontal, Pencil, Trash2, Clock, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { SubjectDot } from "@/components/cards/subject-dot";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMinutes, cn } from "@/lib/utils";
import type { StudyTask, Subject } from "@/types";

interface Props {
  task: StudyTask & { id: string };
  subject?: Subject & { id: string };
  onToggle: (completed: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function StudyCard({
  task,
  subject,
  onToggle,
  onEdit,
  onDelete,
  busy,
}: Props) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={task.completed}
          disabled={busy}
          onCheckedChange={(v) => onToggle(Boolean(v))}
          className="mt-0.5"
          aria-label="완료 표시"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-semibold",
              task.completed && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <SubjectDot color={subject?.color} />
              {subject?.name ?? "미지정"}
            </span>
            {task.studyMinutes > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatMinutes(task.studyMinutes)}
              </span>
            )}
            {task.goalMinutes ? (
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5" />
                목표 {formatMinutes(task.goalMinutes)}
              </span>
            ) : null}
          </div>
          {task.memo && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              {task.memo}
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
