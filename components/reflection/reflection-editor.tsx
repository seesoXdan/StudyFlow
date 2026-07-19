"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, NotebookPen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { reflectionSchema, type ReflectionInput } from "@/lib/schemas";
import { saveReflection } from "@/lib/repositories";
import { useReflection } from "@/hooks/use-data";
import { todayISO, toISODate, formatShortDate } from "@/lib/date";
import { MOOD_EMOJI } from "@/lib/constants";
import { cn } from "@/lib/utils";

const MOODS = [1, 2, 3, 4, 5] as const;

export function ReflectionEditor() {
  const today = todayISO();
  const [date, setDate] = useState(today);
  const { reflection, loading } = useReflection(date);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<ReflectionInput>({
    resolver: zodResolver(reflectionSchema),
    defaultValues: { date, studied: "", difficult: "", tomorrow: "", mood: undefined },
  });

  // Load the reflection for the selected date into the form.
  useEffect(() => {
    reset({
      date,
      studied: reflection?.studied ?? "",
      difficult: reflection?.difficult ?? "",
      tomorrow: reflection?.tomorrow ?? "",
      mood: reflection?.mood,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, reflection?.id, loading]);

  function shift(delta: number) {
    setDate(toISODate(addDays(parseISO(date), delta)));
  }

  async function submit(values: ReflectionInput) {
    try {
      await saveReflection(date, values);
      toast.success("회고가 저장됐어요");
    } catch {
      toast.error("저장에 실패했어요");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex items-center justify-between p-3">
          <Button variant="ghost" size="icon" onClick={() => shift(-1)} aria-label="이전 날">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <NotebookPen className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">{formatShortDate(date)}</p>
            {date !== today && (
              <Button variant="outline" size="sm" onClick={() => setDate(today)}>
                오늘
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => shift(1)}
            disabled={date >= today}
            aria-label="다음 날"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <form onSubmit={handleSubmit(submit)}>
          <Card>
            <CardContent className="space-y-5 p-5">
              <div>
                <Label htmlFor="rf-studied">오늘 무엇을 공부했나요?</Label>
                <Textarea id="rf-studied" className="mt-1.5" {...register("studied")} />
              </div>
              <div>
                <Label htmlFor="rf-difficult">무엇이 어려웠나요?</Label>
                <Textarea id="rf-difficult" className="mt-1.5" {...register("difficult")} />
              </div>
              <div>
                <Label htmlFor="rf-tomorrow">내일은 무엇을 공부할까요?</Label>
                <Textarea id="rf-tomorrow" className="mt-1.5" {...register("tomorrow")} />
              </div>
              <div>
                <Label>오늘 기분은 어때요?</Label>
                <Controller
                  control={control}
                  name="mood"
                  render={({ field }) => (
                    <div className="mt-2 flex justify-between gap-2">
                      {MOODS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => field.onChange(m)}
                          className={cn(
                            "flex h-12 flex-1 items-center justify-center rounded-xl border text-2xl transition-all",
                            field.value === m
                              ? "border-primary bg-primary/10 scale-105"
                              : "border-border hover:bg-muted"
                          )}
                        >
                          {MOOD_EMOJI[m]}
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                회고 저장
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
