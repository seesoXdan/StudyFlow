"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "./field-error";
import { SubjectDot } from "@/components/cards/subject-dot";
import { studyTaskSchema, type StudyTaskInput } from "@/lib/schemas";
import { todayISO } from "@/lib/date";
import type { Subject } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  defaultValues?: Partial<StudyTaskInput>;
  title?: string;
  onSubmit: (values: StudyTaskInput) => Promise<void>;
}

export function StudyFormDialog({
  open,
  onOpenChange,
  subjects,
  defaultValues,
  title = "공부 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StudyTaskInput>({
    resolver: zodResolver(studyTaskSchema),
    defaultValues: {
      subjectId: "",
      title: "",
      date: todayISO(),
      startTime: "",
      endTime: "",
      goalMinutes: undefined,
      studyMinutes: 0,
      memo: "",
      completed: false,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        subjectId: subjects[0]?.id ?? "",
        title: "",
        date: todayISO(),
        startTime: "",
        endTime: "",
        studyMinutes: 0,
        memo: "",
        completed: false,
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: StudyTaskInput) {
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch {
      toast.error("저장에 실패했어요");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <Label>과목</Label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="과목 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <span className="flex items-center gap-2">
                          <SubjectDot color={s.color} />
                          {s.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError message={errors.subjectId?.message} />
          </div>

          <div>
            <Label htmlFor="study-title">제목</Label>
            <Input
              id="study-title"
              className="mt-1.5"
              placeholder="예: 수학 미적분 문제집 3단원"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="study-date">날짜</Label>
              <Input
                id="study-date"
                type="date"
                className="mt-1.5"
                {...register("date")}
              />
              <FieldError message={errors.date?.message} />
            </div>
            <div>
              <Label htmlFor="study-goal">목표 시간(분)</Label>
              <Input
                id="study-goal"
                type="number"
                min={0}
                className="mt-1.5"
                placeholder="선택"
                {...register("goalMinutes")}
              />
              <FieldError message={errors.goalMinutes?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="study-start">시작 시간 (선택)</Label>
              <Input
                id="study-start"
                type="time"
                className="mt-1.5"
                {...register("startTime")}
              />
            </div>
            <div>
              <Label htmlFor="study-end">종료 시간 (선택)</Label>
              <Input
                id="study-end"
                type="time"
                className="mt-1.5"
                {...register("endTime")}
              />
              <FieldError message={errors.endTime?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="study-minutes">공부 시간(분)</Label>
            <Input
              id="study-minutes"
              type="number"
              min={0}
              className="mt-1.5"
              {...register("studyMinutes")}
            />
            <FieldError message={errors.studyMinutes?.message} />
          </div>

          <div>
            <Label htmlFor="study-memo">메모</Label>
            <Textarea
              id="study-memo"
              className="mt-1.5"
              placeholder="선택 입력"
              {...register("memo")}
            />
            <FieldError message={errors.memo?.message} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
