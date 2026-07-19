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
import { academyClassSchema, type AcademyClassInput } from "@/lib/schemas";
import { WEEKDAYS } from "@/lib/constants";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: Partial<AcademyClassInput>;
  title?: string;
  onSubmit: (values: AcademyClassInput) => Promise<void>;
}

export function AcademyFormDialog({
  open,
  onOpenChange,
  defaultValues,
  title = "학원 수업 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademyClassInput>({
    resolver: zodResolver(academyClassSchema),
    defaultValues: {
      day: "mon",
      academy: "",
      subject: "",
      startTime: "18:30",
      endTime: "20:30",
      memo: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open)
      reset({
        day: "mon",
        academy: "",
        subject: "",
        startTime: "18:30",
        endTime: "20:30",
        memo: "",
        ...defaultValues,
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: AcademyClassInput) {
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>요일</Label>
              <Controller
                control={control}
                name="day"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEEKDAYS.map((w) => (
                        <SelectItem key={w.key} value={w.key}>
                          {w.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="ac-subject">과목</Label>
              <Input
                id="ac-subject"
                className="mt-1.5"
                placeholder="예: 수학"
                {...register("subject")}
              />
              <FieldError message={errors.subject?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="ac-academy">학원 이름</Label>
            <Input
              id="ac-academy"
              className="mt-1.5"
              placeholder="예: OO수학학원"
              {...register("academy")}
            />
            <FieldError message={errors.academy?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ac-start">시작 시간</Label>
              <Input id="ac-start" type="time" className="mt-1.5" {...register("startTime")} />
              <FieldError message={errors.startTime?.message} />
            </div>
            <div>
              <Label htmlFor="ac-end">종료 시간</Label>
              <Input id="ac-end" type="time" className="mt-1.5" {...register("endTime")} />
              <FieldError message={errors.endTime?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="ac-memo">메모 (선택)</Label>
            <Input id="ac-memo" className="mt-1.5" {...register("memo")} />
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
