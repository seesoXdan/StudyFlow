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
import { eventSchema, type EventInput } from "@/lib/schemas";
import { EVENT_CATEGORIES } from "@/lib/constants";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  date: string;
  defaultValues?: Partial<EventInput>;
  title?: string;
  onSubmit: (values: EventInput) => Promise<void>;
}

export function EventFormDialog({
  open,
  onOpenChange,
  date,
  defaultValues,
  title = "일정 추가",
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      date,
      startTime: "",
      endTime: "",
      title: "",
      category: "과외",
      memo: "",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        date,
        startTime: "",
        endTime: "",
        title: "",
        category: "과외",
        memo: "",
        ...defaultValues,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function submit(values: EventInput) {
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
            <Label>종류</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((c) => (
                      <SelectItem key={c.key} value={c.key}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          {c.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="ev-title">일정 내용</Label>
            <Input
              id="ev-title"
              className="mt-1.5"
              placeholder="예: 수학 과외, 피아노 학원"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <Label htmlFor="ev-date">날짜</Label>
            <Input id="ev-date" type="date" className="mt-1.5" {...register("date")} />
            <FieldError message={errors.date?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ev-start">시작 시간 (선택)</Label>
              <Input id="ev-start" type="time" className="mt-1.5" {...register("startTime")} />
            </div>
            <div>
              <Label htmlFor="ev-end">종료 시간 (선택)</Label>
              <Input id="ev-end" type="time" className="mt-1.5" {...register("endTime")} />
              <FieldError message={errors.endTime?.message} />
            </div>
          </div>

          <div>
            <Label htmlFor="ev-memo">메모 (선택)</Label>
            <Textarea id="ev-memo" className="mt-1.5" {...register("memo")} />
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
