"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubjectDot } from "@/components/cards/subject-dot";
import { useSubjects } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { addStudyLog } from "@/lib/repositories";
import { todayISO } from "@/lib/date";
import { TIMER_PRESETS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NONE = "none";

function mmss(totalSec: number) {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function StudyTimer() {
  const { subjects } = useSubjects();
  const { configured } = useAuth();
  const [subjectId, setSubjectId] = useState<string>(NONE);
  const [duration, setDuration] = useState(TIMER_PRESETS[0] * 60);
  const [remaining, setRemaining] = useState(TIMER_PRESETS[0] * 60);
  const [running, setRunning] = useState(false);
  const startedAtRef = useRef<string | null>(null);

  const save = useCallback(
    async (elapsedSec: number, silent = false) => {
      const minutes = Math.round(elapsedSec / 60);
      if (minutes < 1) {
        if (!silent) toast.info("저장할 시간이 1분 미만이에요");
        return;
      }
      if (!configured) {
        toast.info("미리보기 모드예요 (Firebase 미연결)");
        return;
      }
      try {
        await addStudyLog({
          minutes,
          date: todayISO(),
          subjectId: subjectId === NONE ? undefined : subjectId,
          startedAt: startedAtRef.current ?? undefined,
          endedAt: new Date().toISOString(),
        });
        toast.success(`${minutes}분 공부 시간이 저장됐어요`);
      } catch {
        toast.error("저장에 실패했어요");
      }
    },
    [configured, subjectId]
  );

  // Tick every second while running.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => (r <= 1 ? 0 : r - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // Auto-save when the countdown completes.
  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      void save(duration);
      setRemaining(duration);
      startedAtRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, running]);

  function selectPreset(min: number) {
    if (running) return;
    setDuration(min * 60);
    setRemaining(min * 60);
  }

  function toggleRun() {
    if (!running && !startedAtRef.current) {
      startedAtRef.current = new Date().toISOString();
    }
    setRunning((v) => !v);
  }

  function reset() {
    setRunning(false);
    setRemaining(duration);
    startedAtRef.current = null;
  }

  async function saveNow() {
    const elapsed = duration - remaining;
    setRunning(false);
    await save(elapsed);
    setRemaining(duration);
    startedAtRef.current = null;
  }

  const elapsedSec = duration - remaining;
  const progress = duration ? (elapsedSec / duration) * 100 : 0;

  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold tracking-tight">스터디 타이머</p>
          <div className="w-40">
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={running}
            >
              <SelectTrigger className="h-9">
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
          </div>
        </div>

        {/* Preset chips */}
        <div className="flex gap-2">
          {TIMER_PRESETS.map((min) => (
            <button
              key={min}
              type="button"
              onClick={() => selectPreset(min)}
              disabled={running}
              className={cn(
                "flex-1 rounded-xl border py-2 text-sm font-semibold transition-colors disabled:opacity-60",
                duration === min * 60
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card hover:bg-muted"
              )}
            >
              {min}분
            </button>
          ))}
        </div>

        {/* Time display */}
        <div className="flex flex-col items-center py-2">
          <span className="font-mono text-5xl font-bold tabular-nums tracking-tight">
            {mmss(remaining)}
          </span>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={toggleRun}>
            {running ? (
              <>
                <Pause className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                일시정지
              </>
            ) : (
              <>
                <Play className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                시작
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={reset}
            aria-label="초기화"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={saveNow}
            disabled={elapsedSec < 60}
          >
            <Save className="h-4 w-4" />
            저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
