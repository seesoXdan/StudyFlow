"use client";

import {
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  type QueryConstraint,
  type DocumentData,
} from "firebase/firestore";
import { colRef, docRef } from "./paths";
import type { CollectionName } from "@/types";

/** Current time as an ISO string (used for createdAt/updatedAt on records). */
export function nowISO(): string {
  return new Date().toISOString();
}

/** Add a new document with an auto id. Returns the created id. */
export async function createDoc<T extends DocumentData>(
  name: CollectionName,
  data: T
): Promise<string> {
  const ts = nowISO();
  const ref = await addDoc(colRef(name), {
    ...data,
    createdAt: ts,
    updatedAt: ts,
    _serverUpdatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Create or overwrite a document at a known id (used for date-keyed records). */
export async function upsertDoc<T extends DocumentData>(
  name: CollectionName,
  id: string,
  data: T,
  { merge = true }: { merge?: boolean } = {}
): Promise<void> {
  const ts = nowISO();
  await setDoc(
    docRef(name, id),
    { ...data, updatedAt: ts, _serverUpdatedAt: serverTimestamp() },
    { merge }
  );
}

/** Patch an existing document. */
export async function patchDoc(
  name: CollectionName,
  id: string,
  patch: DocumentData
): Promise<void> {
  await updateDoc(docRef(name, id), {
    ...patch,
    updatedAt: nowISO(),
    _serverUpdatedAt: serverTimestamp(),
  });
}

/** Delete a document. */
export async function removeDoc(
  name: CollectionName,
  id: string
): Promise<void> {
  await deleteDoc(docRef(name, id));
}

/** Read a single document once. */
export async function readDoc<T>(
  name: CollectionName,
  id: string
): Promise<(T & { id: string }) | null> {
  const snap = await getDoc(docRef(name, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as T) };
}

/** Read a collection once (optionally filtered). */
export async function readCollection<T>(
  name: CollectionName,
  ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
  const snap = await getDocs(query(colRef(name), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }));
}
