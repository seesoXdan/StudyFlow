import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  addDays,
  format,
  isSameMonth,
  parseISO,
} from "date-fns";
import { ko } from "date-fns/locale";
import { toISODate } from "./date";

export type DayStatus = "completed" | "partial" | "incomplete" | "none";

/** 6-week (42 day) matrix covering the given month, Sunday-first. */
export function buildMonthMatrix(monthDate: Date): Date[][] {
  const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

/** 7 days of the week containing `date`, Sunday-first. */
export function buildWeek(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Derive a status color from a set of completion flags. */
export function statusFromFlags(flags: boolean[]): DayStatus {
  if (flags.length === 0) return "none";
  const done = flags.filter(Boolean).length;
  if (done === flags.length) return "completed";
  if (done === 0) return "incomplete";
  return "partial";
}

export const STATUS_COLOR: Record<DayStatus, string> = {
  completed: "#22C55E",
  partial: "#F59E0B",
  incomplete: "#EF4444",
  none: "transparent",
};

export const STATUS_LABEL: Record<DayStatus, string> = {
  completed: "완료",
  partial: "부분 완료",
  incomplete: "미완료",
  none: "없음",
};

export const WEEKDAY_HEADERS = ["일", "월", "화", "수", "목", "금", "토"];

export function monthTitle(monthDate: Date): string {
  return format(monthDate, "yyyy년 M월", { locale: ko });
}

export { addMonths, isSameMonth, toISODate, parseISO };
