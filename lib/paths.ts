"use client";

import {
  collection,
  doc,
  type CollectionReference,
  type DocumentReference,
} from "firebase/firestore";
import { getDb, FAMILY_WORKSPACE_ID } from "./firebase";
import type { CollectionName } from "@/types";

/**
 * All data lives under a single shared family workspace:
 *   workspaces/{FAMILY_WORKSPACE_ID}/{collection}/{docId}
 */
export function colRef(name: CollectionName): CollectionReference {
  return collection(getDb(), "workspaces", FAMILY_WORKSPACE_ID, name);
}

export function docRef(name: CollectionName, id: string): DocumentReference {
  return doc(getDb(), "workspaces", FAMILY_WORKSPACE_ID, name, id);
}
