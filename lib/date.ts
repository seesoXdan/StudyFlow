import { format, parseISO, isValid } from "date-fns";
import { ko } from "date-fns/locale";
import type { Weekday } from "@/types";

/** Local date as "YYYY-MM-DD" (not UTC). */
export function toISODate(date: Date = new Date()): string {
  return format(date, "yyyy-MM-dd");
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** "2026년 7월 19일 일요일" */
export function formatKoreanDate(date: Date = new Date()): string {
  return format(date, "yyyy년 M월 d일 EEEE", { locale: ko });
}

/** "7월 19일 (일)" — compact. */
export function formatShortDate(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return iso;
  return format(d, "M월 d일 (EEE)", { locale: ko });
}

/** "7월 10일" or "7월 10일 ~ 7월 14일" for a date range. */
export function formatRange(start: string, end: string): string {
  const s = parseISO(start);
  if (!isValid(s)) return start;
  const left = format(s, "M월 d일", { locale: ko });
  if (start === end) return left;
  const e = parseISO(end);
  const right = format(e, "M월 d일", { locale: ko });
  return `${left} ~ ${right}`;
}

export function isTodayISO(iso: string): boolean {
  return iso === todayISO();
}

/** Due date is before today (and not today). */
export function isOverdueISO(iso: string): boolean {
  return iso < todayISO();
}

const WEEKDAY_INDEX: Weekday[] = [
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
];

/** Current weekday key for schedule lookups. */
export function todayWeekday(date: Date = new Date()): Weekday {
  return WEEKDAY_INDEX[date.getDay()];
}

export function weekdayOf(iso: string): Weekday {
  const d = parseISO(iso);
  return WEEKDAY_INDEX[isValid(d) ? d.getDay() : 0];
}
