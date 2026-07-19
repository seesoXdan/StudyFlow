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
import { homeworkSchema, type HomeworkInput } from "@/lib/schemas";
import { PRIORITY_META } from "@/lib/constants";
import { todayISO } from "@/lib/date";
import type { Subject, Priority } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  defaultValues?: Partial<HomeworkInput>;
  title?: string;
  onSubmit: (values: HomeworkInput) => Promise<void>;
}

const PRIORITIES: Priority[] = ["high", "medium", "low"];

export function HomeworkFormDialog({
  open,
  onOpenChange,
  subjects,
  defaultValues,
  title = "숙제 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<HomeworkInput>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      subjectId: "",
      name: "",
      dueDate: todayISO(),
      priority: "medium",
      memo: "",
      completed: false,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        subjectId: subjects[0]?.id ?? "",
        name: "",
        dueDate: todayISO(),
        priority: "medium",
        memo: "",
        completed: false,
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: HomeworkInput) {
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
            <Label htmlFor="hw-name">숙제 이름</Label>
            <Input
              id="hw-name"
              className="mt-1.5"
              placeholder="예: 영어 단어 시험 범위 암기"
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="hw-due">마감일</Label>
              <Input
                id="hw-due"
                type="date"
                className="mt-1.5"
                {...register("dueDate")}
              />
              <FieldError message={errors.dueDate?.message} />
            </div>
            <div>
              <Label>우선순위</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          <span className="flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: PRIORITY_META[p].color }}
                            />
                            {PRIORITY_META[p].label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="hw-memo">메모</Label>
            <Textarea
              id="hw-memo"
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
