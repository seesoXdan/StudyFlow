"use client";

import { useEffect, useState } from "react";
import {
  onSnapshot,
  query,
  type QueryConstraint,
} from "firebase/firestore";
import { colRef, docRef } from "@/lib/paths";
import { useAuth } from "./use-auth";
import type { CollectionName } from "@/types";

type WithId<T> = T & { id: string };

interface QueryResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

/**
 * Subscribe to a collection in real time. Pass `deps` to control when the
 * subscription is rebuilt (e.g. when a filter value changes).
 */
export function useCollection<T>(
  name: CollectionName,
  constraints: QueryConstraint[] = [],
  deps: unknown[] = []
): QueryResult<WithId<T>[]> {
  const { ready, configured } = useAuth();
  const [data, setData] = useState<WithId<T>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!configured) {
      setData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const q = query(colRef(name), ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) }))
        );
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, ready, configured, ...deps]);

  return { data, loading, error };
}

/** Subscribe to a single document in real time. */
export function useDocData<T>(
  name: CollectionName,
  id: string | null | undefined
): QueryResult<WithId<T> | null> {
  const { ready, configured } = useAuth();
  const [data, setData] = useState<WithId<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!configured || !id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = onSnapshot(
      docRef(name, id),
      (snap) => {
        setData(snap.exists() ? { id: snap.id, ...(snap.data() as T) } : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [name, id, ready, configured]);

  return { data, loading, error };
}
