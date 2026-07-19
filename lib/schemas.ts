import { z } from "zod";

/** Shared, friendly validation messages (Korean). */
const required = (label: string) => `${label}을(를) 입력해 주세요`;

export const subjectSchema = z.object({
  name: z.string().trim().min(1, required("과목명")).max(20, "20자 이하로 입력해 주세요"),
  color: z.string().regex(/^#([0-9a-fA-F]{6})$/, "색상을 선택해 주세요"),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

export const studyTaskSchema = z.object({
  subjectId: z.string().min(1, "과목을 선택해 주세요"),
  title: z.string().trim().min(1, required("공부 제목")).max(60),
  date: z.string().min(1, "날짜를 선택해 주세요"),
  goalMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  studyMinutes: z.coerce.number().int().min(0).max(1440).default(0),
  memo: z.string().max(500).optional(),
  completed: z.boolean().default(false),
});
export type StudyTaskInput = z.infer<typeof studyTaskSchema>;

export const homeworkSchema = z.object({
  subjectId: z.string().min(1, "과목을 선택해 주세요"),
  name: z.string().trim().min(1, required("숙제 이름")).max(80),
  dueDate: z.string().min(1, "마감일을 선택해 주세요"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  memo: z.string().max(500).optional(),
  completed: z.boolean().default(false),
});
export type HomeworkInput = z.infer<typeof homeworkSchema>;

export const wrongNoteSchema = z.object({
  subjectId: z.string().min(1, "과목을 선택해 주세요"),
  chapter: z.string().trim().min(1, required("단원")).max(80),
  memo: z.string().max(1000).optional(),
  reviewed: z.boolean().default(false),
  completed: z.boolean().default(false),
  date: z.string().min(1, "날짜를 선택해 주세요"),
});
export type WrongNoteInput = z.infer<typeof wrongNoteSchema>;

export const schoolPeriodSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  period: z.coerce.number().int().min(1).max(12),
  subject: z.string().trim().min(1, required("과목")).max(20),
  teacher: z.string().max(20).optional(),
  memo: z.string().max(200).optional(),
});
export type SchoolPeriodInput = z.infer<typeof schoolPeriodSchema>;

export const academyClassSchema = z
  .object({
    day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
    academy: z.string().trim().min(1, required("학원 이름")).max(30),
    subject: z.string().trim().min(1, required("과목")).max(20),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "시작 시간을 입력해 주세요"),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "종료 시간을 입력해 주세요"),
    memo: z.string().max(200).optional(),
  })
  .refine((v) => v.endTime > v.startTime, {
    message: "종료 시간은 시작 시간보다 늦어야 해요",
    path: ["endTime"],
  });
export type AcademyClassInput = z.infer<typeof academyClassSchema>;

export const reflectionSchema = z.object({
  date: z.string().min(1),
  studied: z.string().max(1000).optional(),
  difficult: z.string().max(1000).optional(),
  tomorrow: z.string().max(1000).optional(),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
});
export type ReflectionInput = z.infer<typeof reflectionSchema>;

export const settingsSchema = z.object({
  studentName: z.string().max(20).optional(),
  school: z.string().max(40).optional(),
  grade: z.string().max(20).optional(),
  targetUniversity: z.string().max(40).optional(),
  theme: z.enum(["light", "dark", "system"]).default("system"),
  dailyGoalMinutes: z.coerce.number().int().min(0).max(1440).optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
