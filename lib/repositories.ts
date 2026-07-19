"use client";

import { getDocs } from "firebase/firestore";
import { colRef } from "./paths";
import { createDoc, patchDoc, removeDoc, upsertDoc, createDoc as add } from "./db";
import { COLLECTIONS } from "@/types";
import { DEFAULT_SUBJECTS } from "./constants";
import type {
  StudyTaskInput,
  HomeworkInput,
  WrongNoteInput,
  SchoolPeriodInput,
  AcademyClassInput,
  ReflectionInput,
  SettingsInput,
  SubjectInput,
} from "./schemas";

/* ----------------------------- Subjects ------------------------------ */

/** Seed the 6 default subjects the first time the workspace is opened. */
export async function ensureDefaultSubjects(): Promise<void> {
  const snap = await getDocs(colRef(COLLECTIONS.subjects));
  if (!snap.empty) return;
  await Promise.all(
    DEFAULT_SUBJECTS.map((s, i) =>
      add(COLLECTIONS.subjects, {
        name: s.name,
        color: s.color,
        order: i,
        isDefault: true,
      })
    )
  );
}

export function addSubject(input: SubjectInput & { order: number }) {
  return createDoc(COLLECTIONS.subjects, { ...input, isDefault: false });
}
export function updateSubject(id: string, patch: Partial<SubjectInput>) {
  return patchDoc(COLLECTIONS.subjects, id, patch);
}
export function deleteSubject(id: string) {
  return removeDoc(COLLECTIONS.subjects, id);
}

/* ---------------------------- Study tasks ---------------------------- */

export function addStudyTask(input: StudyTaskInput) {
  return createDoc(COLLECTIONS.studyTasks, input);
}
export function updateStudyTask(id: string, patch: Partial<StudyTaskInput>) {
  return patchDoc(COLLECTIONS.studyTasks, id, patch);
}
export function deleteStudyTask(id: string) {
  return removeDoc(COLLECTIONS.studyTasks, id);
}

/* ------------------------------ Homework ----------------------------- */

export function addHomework(input: HomeworkInput) {
  return createDoc(COLLECTIONS.homework, input);
}
export function updateHomework(id: string, patch: Partial<HomeworkInput>) {
  return patchDoc(COLLECTIONS.homework, id, patch);
}
export function deleteHomework(id: string) {
  return removeDoc(COLLECTIONS.homework, id);
}

/* ---------------------------- Wrong notes ---------------------------- */

export function addWrongNote(input: WrongNoteInput) {
  return createDoc(COLLECTIONS.wrongNotes, input);
}
export function updateWrongNote(id: string, patch: Partial<WrongNoteInput>) {
  return patchDoc(COLLECTIONS.wrongNotes, id, patch);
}
export function deleteWrongNote(id: string) {
  return removeDoc(COLLECTIONS.wrongNotes, id);
}

/* -------------------------- School schedule -------------------------- */

export function addSchoolPeriod(input: SchoolPeriodInput) {
  return createDoc(COLLECTIONS.schoolSchedule, input);
}
export function updateSchoolPeriod(id: string, patch: Partial<SchoolPeriodInput>) {
  return patchDoc(COLLECTIONS.schoolSchedule, id, patch);
}
export function deleteSchoolPeriod(id: string) {
  return removeDoc(COLLECTIONS.schoolSchedule, id);
}

/* -------------------------- Academy schedule ------------------------- */

export function addAcademyClass(input: AcademyClassInput) {
  return createDoc(COLLECTIONS.academySchedule, input);
}
export function updateAcademyClass(id: string, patch: Partial<AcademyClassInput>) {
  return patchDoc(COLLECTIONS.academySchedule, id, patch);
}
export function deleteAcademyClass(id: string) {
  return removeDoc(COLLECTIONS.academySchedule, id);
}

/* ---------------------------- Reflections ---------------------------- */

/** Reflections are keyed by date (one per day). */
export function saveReflection(date: string, input: ReflectionInput) {
  return upsertDoc(COLLECTIONS.reflections, date, { ...input, date });
}
export function deleteReflection(date: string) {
  return removeDoc(COLLECTIONS.reflections, date);
}

/* ------------------------------ Settings ----------------------------- */

export function saveSettings(input: SettingsInput) {
  return upsertDoc(COLLECTIONS.settings, "settings", { ...input, id: "settings" });
}

/* ---------------------------- Study logs ----------------------------- */

export function addStudyLog(entry: {
  minutes: number;
  date: string;
  subjectId?: string;
  taskId?: string;
  startedAt?: string;
  endedAt?: string;
}) {
  return createDoc(COLLECTIONS.studyLogs, entry);
}
