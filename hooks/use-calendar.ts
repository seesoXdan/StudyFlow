"use client";

import { useMemo } from "react";
import { eachDayOfInterval, parseISO } from "date-fns";
import { useStudyTasks, useHomework, useReflections, useEvents } from "./use-data";
import { statusFromFlags, type DayStatus } from "@/lib/calendar";
import { eventCategoryColor } from "@/lib/constants";
import { toISODate } from "@/lib/date";
import type { StudyTask, Homework, DailyReflection } from "@/types";

export interface EventBar {
  color: string;
  kind: "single" | "start" | "middle" | "end";
  title: string;
}

/** Expand events (including multi-day) into per-day bar segments for the grid. */
export function useEventBars() {
  const { events } = useEvents();
  return useMemo(() => {
    const map = new Map<string, EventBar[]>();
    for (const e of events) {
      const start = e.date;
      const end = e.endDate && e.endDate >= e.date ? e.endDate : e.date;
      const color = eventCategoryColor(e.category);
      const days = eachDayOfInterval({
        start: parseISO(start),
        end: parseISO(end),
      }).map((d) => toISODate(d));
      days.forEach((iso, i) => {
        const kind: EventBar["kind"] =
          days.length === 1
            ? "single"
            : i === 0
              ? "start"
              : i === days.length - 1
                ? "end"
                : "middle";
        const arr = map.get(iso) ?? [];
        arr.push({ color, kind, title: e.title });
        map.set(iso, arr);
      });
    }
    return map;
  }, [events]);
}

export interface DayAgg {
  study: (StudyTask & { id: string })[];
  homework: (Homework & { id: string })[];
  reflection?: DailyReflection & { id: string };
  status: DayStatus;
}

const EMPTY: DayAgg = {
  study: [],
  homework: [],
  status: "none",
};

export function useCalendarData() {
  const { tasks, loading: l1 } = useStudyTasks();
  const { homework, loading: l2 } = useHomework();
  const { reflections, loading: l4 } = useReflections();

  const byDate = useMemo(() => {
    const map = new Map<string, DayAgg>();
    const ensure = (d: string): DayAgg => {
      let agg = map.get(d);
      if (!agg) {
        agg = { study: [], homework: [], status: "none" };
        map.set(d, agg);
      }
      return agg;
    };

    tasks.forEach((t) => ensure(t.date).study.push(t));
    homework.forEach((h) => ensure(h.dueDate).homework.push(h));
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
  }, [tasks, homework, reflections]);

  return { byDate, loading: l1 || l2 || l4 };
}

export function getDayAgg(
  byDate: Map<string, DayAgg>,
  iso: string
): DayAgg {
  return byDate.get(iso) ?? EMPTY;
}
