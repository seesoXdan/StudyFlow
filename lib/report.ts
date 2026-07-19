import { addDays, format, startOfMonth, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { toISODate, todayISO } from "./date";
import type { StudyTask, Subject } from "@/types";

type WithId<T> = T & { id: string };

/** Minutes studied per day for the last `n` days (oldest first). */
export function dailyStudy(tasks: StudyTask[], n = 7) {
  const today = new Date();
  const out: { key: string; label: string; minutes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    out.push({
      key: toISODate(d),
      label: format(d, "EEE", { locale: ko }),
      minutes: 0,
    });
  }
  const index = new Map(out.map((o) => [o.key, o]));
  tasks.forEach((t) => {
    const row = index.get(t.date);
    if (row) row.minutes += t.studyMinutes || 0;
  });
  return out;
}

/** Minutes studied per month for the last `n` months (oldest first). */
export function monthlyStudy(tasks: StudyTask[], n = 6) {
  const base = startOfMonth(new Date());
  const out: { key: string; label: string; minutes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = subMonths(base, i);
    out.push({
      key: format(d, "yyyy-MM"),
      label: format(d, "M월", { locale: ko }),
      minutes: 0,
    });
  }
  const index = new Map(out.map((o) => [o.key, o]));
  tasks.forEach((t) => {
    const row = index.get(t.date.slice(0, 7));
    if (row) row.minutes += t.studyMinutes || 0;
  });
  return out;
}

/** Study minutes grouped by subject (for a pie/bar). */
export function subjectStudy(tasks: StudyTask[], subjects: WithId<Subject>[]) {
  const map = new Map<string, number>();
  tasks.forEach((t) => {
    if (!t.subjectId) return;
    map.set(t.subjectId, (map.get(t.subjectId) || 0) + (t.studyMinutes || 0));
  });
  return subjects
    .map((s) => ({ name: s.name, color: s.color, minutes: map.get(s.id) || 0 }))
    .filter((r) => r.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes);
}

export function completion(items: { completed: boolean }[]) {
  const total = items.length;
  const done = items.filter((i) => i.completed).length;
  const rate = total ? Math.round((done / total) * 100) : 0;
  return { total, done, rate };
}

/** Current consecutive-day study streak (days with any recorded study time). */
export function studyStreak(tasks: StudyTask[]): number {
  const days = new Set(
    tasks.filter((t) => (t.studyMinutes || 0) > 0).map((t) => t.date)
  );
  let streak = 0;
  let cursor = new Date();
  if (!days.has(todayISO())) cursor = addDays(cursor, -1);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (days.has(toISODate(cursor))) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else break;
  }
  return streak;
}

export function totalMinutes(tasks: StudyTask[]): number {
  return tasks.reduce((s, t) => s + (t.studyMinutes || 0), 0);
}

export function subjectTaskCompletion(
  tasks: StudyTask[],
  subjects: WithId<Subject>[]
) {
  return subjects
    .map((s) => {
      const rows = tasks.filter((t) => t.subjectId === s.id);
      const c = completion(rows);
      return { name: s.name, color: s.color, ...c };
    })
    .filter((r) => r.total > 0);
}
