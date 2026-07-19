import type { Priority, Weekday } from "@/types";

/** Default subjects every student starts with (편성 순서 유지). */
export const DEFAULT_SUBJECTS: { name: string; color: string }[] = [
  { name: "국어", color: "#EF4444" },
  { name: "영어", color: "#2563EB" },
  { name: "수학", color: "#14B8A6" },
  { name: "통합과학", color: "#22C55E" },
  { name: "통합사회", color: "#F59E0B" },
  { name: "한국사", color: "#8B5CF6" },
];

/** Science electives the student can add. */
export const ELECTIVE_SUBJECTS: { name: string; color: string }[] = [
  { name: "물리", color: "#0EA5E9" },
  { name: "화학", color: "#EC4899" },
  { name: "생명과학", color: "#10B981" },
  { name: "지구과학", color: "#F97316" },
];

/** Palette used when a user creates a custom subject. */
export const SUBJECT_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#22C55E", "#10B981",
  "#14B8A6", "#0EA5E9", "#2563EB", "#8B5CF6", "#EC4899",
  "#64748B",
];

export const WEEKDAYS: { key: Weekday; label: string; short: string }[] = [
  { key: "mon", label: "월요일", short: "월" },
  { key: "tue", label: "화요일", short: "화" },
  { key: "wed", label: "수요일", short: "수" },
  { key: "thu", label: "목요일", short: "목" },
  { key: "fri", label: "금요일", short: "금" },
  { key: "sat", label: "토요일", short: "토" },
  { key: "sun", label: "일요일", short: "일" },
];

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; order: number }
> = {
  high: { label: "높음", color: "#EF4444", order: 0 },
  medium: { label: "보통", color: "#F59E0B", order: 1 },
  low: { label: "낮음", color: "#64748B", order: 2 },
};

export const MOOD_EMOJI: Record<number, string> = {
  1: "😞",
  2: "😕",
  3: "😐",
  4: "🙂",
  5: "😄",
};

/** Preset study timer lengths (minutes). */
export const TIMER_PRESETS = [25, 50, 90] as const;
