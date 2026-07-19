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
import { planBlockSchema, type PlanBlockInput } from "@/lib/schemas";
import type { Subject } from "@/types";

const NONE = "none";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  date: string;
  defaultValues?: Partial<PlanBlockInput>;
  title?: string;
  onSubmit: (values: PlanBlockInput) => Promise<void>;
}

export function PlanFormDialog({
  open,
  onOpenChange,
  subjects,
  date,
  defaultValues,
  title = "계획 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanBlockInput>({
    resolver: zodResolver(planBlockSchema),
    defaultValues: {
      date,
      startTime: "19:00",
      endTime: "20:00",
      subjectId: NONE,
      title: "",
      done: false,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        date,
        startTime: "19:00",
        endTime: "20:00",
        subjectId: NONE,
        title: "",
        done: false,
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: PlanBlockInput) {
    try {
      await onSubmit({
        ...values,
        subjectId: values.subjectId === NONE ? undefined : values.subjectId,
      });
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="pl-start">시작 시간</Label>
              <Input id="pl-start" type="time" className="mt-1.5" {...register("startTime")} />
              <FieldError message={errors.startTime?.message} />
            </div>
            <div>
              <Label htmlFor="pl-end">종료 시간</Label>
              <Input id="pl-end" type="time" className="mt-1.5" {...register("endTime")} />
              <FieldError message={errors.endTime?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="pl-title">할 일</Label>
            <Input
              id="pl-title"
              className="mt-1.5"
              placeholder="예: 수학 문제집 3단원"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label>과목 (선택)</Label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <Select value={field.value || NONE} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="과목" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>과목 미지정</SelectItem>
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
