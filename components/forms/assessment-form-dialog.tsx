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
import { assessmentSchema, type AssessmentInput } from "@/lib/schemas";
import { todayISO } from "@/lib/date";
import type { Subject } from "@/types";

const NONE = "none";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  defaultValues?: Partial<AssessmentInput>;
  title?: string;
  onSubmit: (values: AssessmentInput) => Promise<void>;
}

export function AssessmentFormDialog({
  open,
  onOpenChange,
  subjects,
  defaultValues,
  title = "수행평가 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssessmentInput>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      subjectId: NONE,
      title: "",
      startDate: todayISO(),
      endDate: todayISO(),
      memo: "",
      done: false,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        subjectId: NONE,
        title: "",
        startDate: todayISO(),
        endDate: todayISO(),
        memo: "",
        done: false,
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: AssessmentInput) {
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

          <div>
            <Label htmlFor="as-title">어떤 수행평가인가요?</Label>
            <Input
              id="as-title"
              className="mt-1.5"
              placeholder="예: 국어 발표 수행평가"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="as-start">시작일</Label>
              <Input id="as-start" type="date" className="mt-1.5" {...register("startDate")} />
              <FieldError message={errors.startDate?.message} />
            </div>
            <div>
              <Label htmlFor="as-end">종료일</Label>
              <Input id="as-end" type="date" className="mt-1.5" {...register("endDate")} />
              <FieldError message={errors.endDate?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="as-memo">메모 (선택)</Label>
            <Textarea
              id="as-memo"
              className="mt-1.5"
              placeholder="평가 방식, 준비 내용 등"
              {...register("memo")}
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
