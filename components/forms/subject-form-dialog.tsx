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
import { FieldError } from "./field-error";
import { subjectSchema, type SubjectInput } from "@/lib/schemas";
import { SUBJECT_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: Partial<SubjectInput>;
  title?: string;
  onSubmit: (values: SubjectInput) => Promise<void>;
}

export function SubjectFormDialog({
  open,
  onOpenChange,
  defaultValues,
  title = "과목 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectInput>({
    resolver: zodResolver(subjectSchema),
    defaultValues: { name: "", color: SUBJECT_COLORS[5], ...defaultValues },
  });

  useEffect(() => {
    if (open) {
      reset({ name: "", color: SUBJECT_COLORS[5], ...defaultValues });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: SubjectInput) {
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
            <Label htmlFor="subject-name">과목명</Label>
            <Input
              id="subject-name"
              className="mt-1.5"
              placeholder="예: 물리, 미적분"
              autoFocus
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <Label>색상</Label>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="mt-2 flex flex-wrap gap-2.5">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={c}
                      onClick={() => field.onChange(c)}
                      className={cn(
                        "h-8 w-8 rounded-full transition-transform",
                        field.value === c
                          ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                          : "hover:scale-110"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            />
            <FieldError message={errors.color?.message} />
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
