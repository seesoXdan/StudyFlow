"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ImagePlus, X } from "lucide-react";
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
import { supplySchema, type SupplyInput } from "@/lib/schemas";
import { compressImage } from "@/lib/image";
import { todayISO } from "@/lib/date";
import type { Subject } from "@/types";

const NONE = "none";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  subjects: (Subject & { id: string })[];
  defaultValues?: Partial<SupplyInput>;
  title?: string;
  onSubmit: (values: SupplyInput) => Promise<void>;
}

export function SupplyFormDialog({
  open,
  onOpenChange,
  subjects,
  defaultValues,
  title = "준비물 추가",
  onSubmit,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SupplyInput>({
    resolver: zodResolver(supplySchema),
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

  const fileData = watch("fileData");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = await compressImage(file);
      setValue("fileData", data);
      setValue("fileName", file.name);
      setValue("fileType", "image/jpeg");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "업로드 실패");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeFile() {
    setValue("fileData", undefined);
    setValue("fileName", undefined);
    setValue("fileType", undefined);
  }

  async function submit(values: SupplyInput) {
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
            <Label htmlFor="sp-title">준비물 / 공지 내용</Label>
            <Input
              id="sp-title"
              className="mt-1.5"
              placeholder="예: 미술 준비물 - 물감, 붓"
              {...register("title")}
            />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="sp-start">시작일</Label>
              <Input id="sp-start" type="date" className="mt-1.5" {...register("startDate")} />
              <FieldError message={errors.startDate?.message} />
            </div>
            <div>
              <Label htmlFor="sp-end">종료일</Label>
              <Input id="sp-end" type="date" className="mt-1.5" {...register("endDate")} />
              <FieldError message={errors.endDate?.message} />
            </div>
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

          <div>
            <Label htmlFor="sp-memo">메모 (선택)</Label>
            <Textarea id="sp-memo" className="mt-1.5" {...register("memo")} />
          </div>

          <div>
            <Label>학교 공지 사진 (선택)</Label>
            {fileData ? (
              <div className="relative mt-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileData}
                  alt="공지 미리보기"
                  className="max-h-56 w-full rounded-xl border border-border object-contain"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute right-2 top-2 rounded-full bg-slate-900/70 p-1 text-white"
                  aria-label="사진 제거"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                className="mt-1.5 w-full"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
              >
                <ImagePlus className="h-4 w-4" />
                {uploading ? "처리 중…" : "사진 올리기"}
              </Button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              저장
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
