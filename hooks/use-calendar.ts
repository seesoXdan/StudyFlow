"use client";

import { useMemo } from "react";
import {
  useStudyTasks,
  useHomework,
  useWrongNotes,
  useReflections,
} from "./use-data";
import { statusFromFlags, type DayStatus } from "@/lib/calendar";
import type {
  StudyTask,
  Homework,
  WrongNote,
  DailyReflection,
} from "@/types";

export interface DayAgg {
  study: (StudyTask & { id: string })[];
  homework: (Homework & { id: string })[];
  wrongNotes: (WrongNote & { id: string })[];
  reflection?: DailyReflection & { id: string };
  status: DayStatus;
}

const EMPTY: DayAgg = {
  study: [],
  homework: [],
  wrongNotes: [],
  status: "none",
};

export function useCalendarData() {
  const { tasks, loading: l1 } = useStudyTasks();
  const { homework, loading: l2 } = useHomework();
  const { notes, loading: l3 } = useWrongNotes();
  const { reflections, loading: l4 } = useReflections();

  const byDate = useMemo(() => {
    const map = new Map<string, DayAgg>();
    const ensure = (d: string): DayAgg => {
      let agg = map.get(d);
      if (!agg) {
        agg = { study: [], homework: [], wrongNotes: [], status: "none" };
        map.set(d, agg);
      }
      return agg;
    };

    tasks.forEach((t) => ensure(t.date).study.push(t));
    homework.forEach((h) => ensure(h.dueDate).homework.push(h));
    notes.forEach((n) => ensure(n.date).wrongNotes.push(n));
    reflections.forEach((r) => {
      ensure(r.date).reflection = r;
    });

    // Compute status from study + homework completion flags.
    map.forEach((agg) => {
      const flags = [
        ...agg.study.map((s) => s.completed),
        ...agg.homework.map((h) => h.completed),
      ];
      agg.status = statusFromFlags(flags);
    });

    return map;
  }, [tasks, homework, notes, reflections]);

  return { byDate, loading: l1 || l2 || l3 || l4 };
}

export function getDayAgg(
  byDate: Map<string, DayAgg>,
  iso: string
): DayAgg {
  return byDate.get(iso) ?? EMPTY;
}
