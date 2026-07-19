import { addDays, format, startOfMonth, subMonths, parseISO } from "date-fns";
import { ko } from "date-fns/locale";
import { toISODate, todayISO } from "./date";
import type { StudyLog, StudyTask, Homework, Subject } from "@/types";

type WithId<T> = T & { id: string };

/** Minutes studied per day for the last `n` days (oldest first). */
export function dailyStudy(logs: StudyLog[], n = 7) {
  const today = new Date();
  const out: { key: string; label: string; minutes: number }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const iso = toISODate(d);
    out.push({ key: iso, label: format(d, "EEE", { locale: ko }), minutes: 0 });
  }
  const index = new Map(out.map((o) => [o.key, o]));
  logs.forEach((l) => {
    const row = index.get(l.date);
    if (row) row.minutes += l.minutes || 0;
  });
  return out;
}

/** Minutes studied per month for the last `n` months (oldest first). */
export function monthlyStudy(logs: StudyLog[], n = 6) {
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
  logs.forEach((l) => {
    const key = l.date.slice(0, 7);
    const row = index.get(key);
    if (row) row.minutes += l.minutes || 0;
  });
  return out;
}

/** Study minutes grouped by subject (for a pie/bar). */
export function subjectStudy(
  logs: StudyLog[],
  subjects: WithId<Subject>[]
) {
  const map = new Map<string, number>();
  logs.forEach((l) => {
    if (!l.subjectId) return;
    map.set(l.subjectId, (map.get(l.subjectId) || 0) + (l.minutes || 0));
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

/** Current consecutive-day study streak ending today (or yesterday). */
export function studyStreak(logs: StudyLog[]): number {
  const days = new Set(
    logs.filter((l) => (l.minutes || 0) > 0).map((l) => l.date)
  );
  let streak = 0;
  let cursor = new Date();
  // Allow the streak to count from today; if nothing today, start from yesterday.
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

export function totalMinutes(logs: StudyLog[]): number {
  return logs.reduce((s, l) => s + (l.minutes || 0), 0);
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

export { parseISO };
