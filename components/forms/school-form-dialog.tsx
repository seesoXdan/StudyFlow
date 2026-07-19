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
import { schoolPeriodSchema, type SchoolPeriodInput } from "@/lib/schemas";
import { WEEKDAYS } from "@/lib/constants";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: Partial<SchoolPeriodInput>;
  title?: string;
  onSubmit: (values: SchoolPeriodInput) => Promise<void>;
}

export function SchoolFormDialog({
  open,
  onOpenChange,
  defaultValues,
  title = "수업 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SchoolPeriodInput>({
    resolver: zodResolver(schoolPeriodSchema),
    defaultValues: {
      day: "mon",
      period: 1,
      subject: "",
      teacher: "",
      memo: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) reset({ day: "mon", period: 1, subject: "", teacher: "", memo: "", ...defaultValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: SchoolPeriodInput) {
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
              <Label htmlFor="sc-period">교시</Label>
              <Input
                id="sc-period"
                type="number"
                min={1}
                max={12}
                className="mt-1.5"
                {...register("period")}
              />
              <FieldError message={errors.period?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="sc-subject">과목</Label>
            <Input
              id="sc-subject"
              className="mt-1.5"
              placeholder="예: 수학, 영어, 체육"
              {...register("subject")}
            />
            <FieldError message={errors.subject?.message} />
          </div>

          <div>
            <Label htmlFor="sc-teacher">선생님 (선택)</Label>
            <Input id="sc-teacher" className="mt-1.5" {...register("teacher")} />
          </div>

          <div>
            <Label htmlFor="sc-memo">메모 (선택)</Label>
            <Input id="sc-memo" className="mt-1.5" {...register("memo")} />
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
