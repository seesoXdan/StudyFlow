"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Download, Upload, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldError } from "@/components/forms/field-error";
import { settingsSchema, type SettingsInput } from "@/lib/schemas";
import { saveSettings } from "@/lib/repositories";
import { useSettings } from "@/hooks/use-data";
import { exportAll, downloadBackup, importAll } from "@/lib/backup";

export function SettingsForm() {
  const { settings, loading } = useSettings();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [backupBusy, setBackupBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      studentName: "",
      school: "",
      grade: "",
      targetUniversity: "",
      theme: "system",
      dailyGoalMinutes: undefined,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        studentName: settings.studentName ?? "",
        school: settings.school ?? "",
        grade: settings.grade ?? "",
        targetUniversity: settings.targetUniversity ?? "",
        theme: settings.theme ?? "system",
        dailyGoalMinutes: settings.dailyGoalMinutes,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.updatedAt]);

  async function submit(values: SettingsInput) {
    try {
      await saveSettings(values);
      setTheme(values.theme);
      toast.success("설정이 저장됐어요");
    } catch {
      toast.error("저장에 실패했어요");
    }
  }

  async function doExport() {
    setBackupBusy(true);
    try {
      const backup = await exportAll();
      downloadBackup(backup);
      toast.success("백업 파일을 내려받았어요");
    } catch {
      toast.error("백업에 실패했어요");
    } finally {
      setBackupBusy(false);
    }
  }

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBackupBusy(true);
    try {
      const text = await file.text();
      const count = await importAll(JSON.parse(text));
      toast.success(`${count}개 항목을 복원했어요`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "복원에 실패했어요"
      );
    } finally {
      setBackupBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(submit)}>
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="text-sm font-bold tracking-tight">내 정보</p>
            <div>
              <Label htmlFor="st-name">이름</Label>
              <Input id="st-name" className="mt-1.5" {...register("studentName")} />
              <FieldError message={errors.studentName?.message} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="st-school">학교</Label>
                <Input id="st-school" className="mt-1.5" {...register("school")} />
              </div>
              <div>
                <Label htmlFor="st-grade">학년</Label>
                <Input id="st-grade" className="mt-1.5" placeholder="예: 2학년" {...register("grade")} />
              </div>
            </div>
            <div>
              <Label htmlFor="st-univ">목표 대학</Label>
              <Input id="st-univ" className="mt-1.5" {...register("targetUniversity")} />
            </div>
            <div>
              <Label htmlFor="st-goal">하루 목표 공부 시간(분)</Label>
              <Input
                id="st-goal"
                type="number"
                min={0}
                className="mt-1.5"
                placeholder="예: 180"
                {...register("dailyGoalMinutes")}
              />
              <FieldError message={errors.dailyGoalMinutes?.message} />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              저장
            </Button>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">다크 모드</p>
              <p className="text-xs text-muted-foreground">어두운 테마로 전환</p>
            </div>
          </div>
          <Switch
            checked={mounted ? resolvedTheme === "dark" : false}
            onCheckedChange={(v) => setTheme(v ? "dark" : "light")}
            aria-label="다크 모드"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-5">
          <div>
            <p className="text-sm font-bold tracking-tight">백업 &amp; 복원</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              모든 데이터를 파일로 저장하거나 되돌릴 수 있어요.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={doExport}
              disabled={backupBusy}
            >
              <Download className="h-4 w-4" />
              백업 내보내기
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
              disabled={backupBusy}
            >
              <Upload className="h-4 w-4" />
              복원하기
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onImportFile}
            />
          </div>
        </CardContent>
      </Card>

      <p className="px-1 text-center text-xs text-muted-foreground">
        서진 대학가자 · 가족 공용 · 로그인 없이 사용
      </p>
    </div>
  );
}
