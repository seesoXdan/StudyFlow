"use client";

import { useMemo } from "react";
import { orderBy } from "firebase/firestore";
import { useCollection, useDocData } from "./use-firestore";
import { COLLECTIONS } from "@/types";
import type {
  Subject,
  StudyTask,
  Homework,
  WrongNote,
  StudyLog,
  DailyReflection,
  Settings,
  SchoolPeriod,
  AcademyClass,
  PlanBlock,
} from "@/types";

type WithId<T> = T & { id: string };

export function useSubjects() {
  const { data, loading } = useCollection<Subject>(COLLECTIONS.subjects, [
    orderBy("order", "asc"),
  ]);
  return { subjects: data, loading };
}

/** id → Subject lookup for rendering subject names/colors. */
export function useSubjectMap() {
  const { subjects, loading } = useSubjects();
  const map = useMemo(() => {
    const m = new Map<string, WithId<Subject>>();
    subjects.forEach((s) => m.set(s.id, s));
    return m;
  }, [subjects]);
  return { subjectMap: map, subjects, loading };
}

export function useStudyTasks() {
  const { data, loading } = useCollection<StudyTask>(COLLECTIONS.studyTasks);
  return { tasks: data, loading };
}

export function useHomework() {
  const { data, loading } = useCollection<Homework>(COLLECTIONS.homework);
  return { homework: data, loading };
}

export function useWrongNotes() {
  const { data, loading } = useCollection<WrongNote>(COLLECTIONS.wrongNotes);
  return { notes: data, loading };
}

export function useStudyLogs() {
  const { data, loading } = useCollection<StudyLog>(COLLECTIONS.studyLogs);
  return { logs: data, loading };
}

export function useSchoolSchedule() {
  const { data, loading } = useCollection<SchoolPeriod>(
    COLLECTIONS.schoolSchedule
  );
  return { periods: data, loading };
}

export function useAcademySchedule() {
  const { data, loading } = useCollection<AcademyClass>(
    COLLECTIONS.academySchedule
  );
  return { classes: data, loading };
}

export function usePlanBlocks() {
  const { data, loading } = useCollection<PlanBlock>(COLLECTIONS.dailyPlan);
  return { blocks: data, loading };
}

export function useReflections() {
  const { data, loading } = useCollection<DailyReflection>(
    COLLECTIONS.reflections
  );
  return { reflections: data, loading };
}

export function useReflection(date: string) {
  const { data, loading } = useDocData<DailyReflection>(
    COLLECTIONS.reflections,
    date
  );
  return { reflection: data, loading };
}

export function useSettings() {
  const { data, loading } = useDocData<Settings>(
    COLLECTIONS.settings,
    "settings"
  );
  return { settings: data, loading };
}
