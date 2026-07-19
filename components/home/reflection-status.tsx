"use client";

import Link from "next/link";
import { NotebookPen, Check, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useReflection } from "@/hooks/use-data";
import { todayISO } from "@/lib/date";
import { MOOD_EMOJI } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ReflectionStatus() {
  const today = todayISO();
  const { reflection } = useReflection(today);
  const written = Boolean(
    reflection &&
      (reflection.studied ||
        reflection.difficult ||
        reflection.tomorrow ||
        reflection.mood)
  );

  return (
    <Link href="/reflection" className="block">
      <Card className="transition-colors hover:bg-muted/40">
        <CardContent className="flex items-center gap-3 p-4">
          <div
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-xl",
              written
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary"
            )}
          >
            {written ? (
              <Check className="h-5 w-5" strokeWidth={2.4} />
            ) : (
              <NotebookPen className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">오늘의 회고</p>
            <p className="truncate text-xs text-muted-foreground">
              {written
                ? "오늘 회고를 작성했어요. 잘하고 있어요!"
                : "하루를 돌아보며 회고를 남겨보세요."}
            </p>
          </div>
          {written && reflection?.mood ? (
            <span className="text-xl">{MOOD_EMOJI[reflection.mood]}</span>
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
