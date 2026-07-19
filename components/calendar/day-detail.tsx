"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckSquare,
  StickyNote,
  NotebookPen,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SubjectDot } from "@/components/cards/subject-dot";
import { MOOD_EMOJI } from "@/lib/constants";
import { formatShortDate } from "@/lib/date";
import { STATUS_COLOR, STATUS_LABEL } from "@/lib/calendar";
import { cn } from "@/lib/utils";
import type { DayAgg } from "@/hooks/use-calendar";
import type { Subject } from "@/types";

function Row({
  color,
  label,
  done,
}: {
  color?: string;
  label: string;
  done?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5 text-sm">
      <SubjectDot color={color} />
      <span className={cn("flex-1", done && "text-muted-foreground line-through")}>
        {label}
      </span>
    </div>
  );
}

export function DayDetail({
  iso,
  agg,
  subjectMap,
}: {
  iso: string;
  agg: DayAgg;
  subjectMap: Map<string, Subject & { id: string }>;
}) {
  const empty =
    agg.study.length === 0 &&
    agg.homework.length === 0 &&
    agg.wrongNotes.length === 0 &&
    !agg.reflection;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <p className="font-bold tracking-tight">{formatShortDate(iso)}</p>
          {agg.status !== "none" && (
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: STATUS_COLOR[agg.status] }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[agg.status] }}
              />
              {STATUS_LABEL[agg.status]}
            </span>
          )}
        </div>

        {empty ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            이 날의 기록이 없어요.
          </p>
        ) : (
          <div className="space-y-4">
            {agg.study.length > 0 && (
              <section>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" /> 공부
                </p>
                {agg.study.map((s) => (
                  <Row
                    key={s.id}
                    color={subjectMap.get(s.subjectId)?.color}
                    label={s.title}
                    done={s.completed}
                  />
                ))}
              </section>
            )}

            {agg.homework.length > 0 && (
              <section>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <CheckSquare className="h-3.5 w-3.5" /> 숙제
                </p>
                {agg.homework.map((h) => (
                  <Row
                    key={h.id}
                    color={subjectMap.get(h.subjectId)?.color}
                    label={h.name}
                    done={h.completed}
                  />
                ))}
              </section>
            )}

            {agg.wrongNotes.length > 0 && (
              <section>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <StickyNote className="h-3.5 w-3.5" /> 오답노트
                </p>
                {agg.wrongNotes.map((n) => (
                  <Row
                    key={n.id}
                    color={subjectMap.get(n.subjectId)?.color}
                    label={n.chapter}
                    done={n.completed}
                  />
                ))}
              </section>
            )}

            {agg.reflection && (
              <Link
                href="/reflection"
                className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5 text-sm"
              >
                <NotebookPen className="h-4 w-4 text-primary" />
                <span className="flex-1">회고 작성됨</span>
                {agg.reflection.mood && (
                  <span>{MOOD_EMOJI[agg.reflection.mood]}</span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
