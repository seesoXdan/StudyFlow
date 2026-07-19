"use client";

import { readCollection, upsertDoc } from "./db";
import { COLLECTIONS, type CollectionName } from "@/types";

const ALL: CollectionName[] = Object.values(COLLECTIONS);

interface Backup {
  app: "StudyFlow";
  version: 1;
  exportedAt: string;
  data: Record<string, Record<string, unknown>[]>;
}

/** Remove server-only / non-portable fields before export or re-import. */
function clean(doc: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc)) {
    if (k === "_serverUpdatedAt") continue;
    out[k] = v;
  }
  return out;
}

/** Read every collection into a single portable object. */
export async function exportAll(): Promise<Backup> {
  const data: Record<string, Record<string, unknown>[]> = {};
  for (const name of ALL) {
    const docs = await readCollection<Record<string, unknown>>(name);
    data[name] = docs.map((d) => clean(d as Record<string, unknown>));
  }
  return {
    app: "StudyFlow",
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
}

/** Trigger a browser download of the backup JSON. */
export function downloadBackup(backup: Backup) {
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `studyflow-backup-${backup.exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Restore documents from a backup (upserts by original id). */
export async function importAll(parsed: unknown): Promise<number> {
  const backup = parsed as Backup;
  if (!backup || backup.app !== "StudyFlow" || !backup.data) {
    throw new Error("올바른 StudyFlow 백업 파일이 아니에요");
  }
  let count = 0;
  for (const name of ALL) {
    const docs = backup.data[name] ?? [];
    for (const doc of docs) {
      const { id, ...rest } = doc as { id?: string } & Record<string, unknown>;
      if (!id) continue;
      await upsertDoc(name, id, clean(rest));
      count += 1;
    }
  }
  return count;
}
