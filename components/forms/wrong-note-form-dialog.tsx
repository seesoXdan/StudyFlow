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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldError } from "./field-error";
import { SubjectDot } from "@/components/cards/subject-dot";
import { wrongNoteSchema, type WrongNoteInput } from "@/lib/schemas";
import { todayISO } from "@/lib/date";
import type { Subject } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  defaultValues?: Partial<WrongNoteInput>;
  title?: string;
  onSubmit: (values: WrongNoteInput) => Promise<void>;
}

export function WrongNoteFormDialog({
  open,
  onOpenChange,
  subjects,
  defaultValues,
  title = "오답노트 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WrongNoteInput>({
    resolver: zodResolver(wrongNoteSchema),
    defaultValues: {
      subjectId: "",
      chapter: "",
      memo: "",
      reviewed: false,
      completed: false,
      date: todayISO(),
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        subjectId: subjects[0]?.id ?? "",
        chapter: "",
        memo: "",
        reviewed: false,
        completed: false,
        date: todayISO(),
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: WrongNoteInput) {
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
            <Label htmlFor="wn-chapter">단원</Label>
            <Input
              id="wn-chapter"
              className="mt-1.5"
              placeholder="예: 이차함수 - 최댓값/최솟값"
              {...register("chapter")}
            />
            <FieldError message={errors.chapter?.message} />
          </div>

          <div>
            <Label htmlFor="wn-memo">메모 (틀린 이유·풀이)</Label>
            <Textarea
              id="wn-memo"
              className="mt-1.5 min-h-[120px]"
              placeholder="왜 틀렸는지, 어떻게 푸는지 정리해 보세요."
              {...register("memo")}
            />
            <FieldError message={errors.memo?.message} />
          </div>

          <Controller
            control={control}
            name="reviewed"
            render={({ field }) => (
              <label className="flex items-center gap-3">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(Boolean(v))}
                />
                <span className="text-sm font-medium">복습 완료</span>
              </label>
            )}
          />

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
