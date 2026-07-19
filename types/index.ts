/**
 * StudyFlow data models.
 *
 * All records live under a single shared family workspace in Firestore:
 *   workspaces/{workspaceId}/{collection}/{docId}
 *
 * Dates are stored as ISO strings ("2026-07-19") or ISO datetimes so the data
 * is portable and easy to query/sort on the client.
 */

export type ID = string;

/** ISO date string, e.g. "2026-07-19". */
export type ISODate = string;

export type Priority = "low" | "medium" | "high";

export type CompletionState = "completed" | "partial" | "incomplete";

/** Fixed default subjects + user-addable science electives. */
export interface Subject {
  id: ID;
  name: string; // 국어, 영어, 수학, 통합과학...
  color: string; // hsl or hex used on cards/charts
  order: number;
  isDefault: boolean;
  progress?: number; // 진도율 0-100
  progressNote?: string; // 현재 진도 메모 (예: 미적분 3단원, 교재 p.120)
  createdAt: string;
}

/** A time-blocked entry in the daily study plan. */
export interface PlanBlock {
  id: ID;
  date: ISODate;
  startTime: string; // "19:00"
  endTime: string; // "20:00"
  subjectId?: ID;
  title: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

/** A planned/finished study session. */
export interface StudyTask {
  id: ID;
  subjectId: ID;
  title: string;
  date: ISODate;
  goalMinutes?: number; // study goal
  studyMinutes: number; // actual time spent
  memo?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Raw timer/study-time entries used to total up daily study time. */
export interface StudyLog {
  id: ID;
  subjectId?: ID;
  taskId?: ID;
  date: ISODate;
  minutes: number;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
}

export interface Homework {
  id: ID;
  subjectId: ID;
  name: string;
  dueDate: ISODate;
  priority: Priority;
  memo?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WrongNote {
  id: ID;
  subjectId: ID;
  chapter: string;
  memo?: string;
  reviewed: boolean; // review check
  completed: boolean;
  date: ISODate;
  createdAt: string;
  updatedAt: string;
}

export type Weekday =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export interface SchoolPeriod {
  id: ID;
  day: Weekday;
  period: number; // 1교시, 2교시...
  subject: string;
  teacher?: string;
  memo?: string;
}

export interface AcademyClass {
  id: ID;
  day: Weekday;
  academy: string;
  subject: string;
  startTime: string; // "18:30"
  endTime: string; // "20:30"
  memo?: string;
}

export interface DailyReflection {
  id: ID; // typically the date itself
  date: ISODate;
  studied?: string; // 오늘 무엇을 공부했나요?
  difficult?: string; // 무엇이 어려웠나요?
  tomorrow?: string; // 내일은 무엇을 공부할까요?
  mood?: 1 | 2 | 3 | 4 | 5; // 오늘 기분
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: "settings";
  studentName?: string;
  school?: string;
  grade?: string;
  targetUniversity?: string;
  theme: "light" | "dark" | "system";
  dailyGoalMinutes?: number;
  updatedAt: string;
}

/** Collection name constants to avoid typos across the app. */
export const COLLECTIONS = {
  subjects: "subjects",
  studyTasks: "study_tasks",
  studyLogs: "study_logs",
  homework: "homework",
  wrongNotes: "wrong_notes",
  schoolSchedule: "school_schedule",
  academySchedule: "academy_schedule",
  reflections: "daily_reflection",
  dailyPlan: "daily_plan",
  settings: "settings",
} as const;

export type CollectionName =
  (typeof COLLECTIONS)[keyof typeof COLLECTIONS];
