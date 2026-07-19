"use client";

import { useEffect, useState } from "react";
import { greeting } from "@/lib/utils";
import { formatKoreanDate } from "@/lib/date";
import { useSettings } from "@/hooks/use-data";

export function Greeting() {
  const { settings } = useSettings();
  const [now, setNow] = useState<Date | null>(null);

  // Avoid hydration mismatch: render date only after mount.
  useEffect(() => setNow(new Date()), []);

  const name = settings?.studentName?.trim();

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">
        {now ? formatKoreanDate(now) : " "}
      </p>
      <h2 className="text-2xl font-bold tracking-tight">
        {now ? greeting(now) : " "}
        {name ? <span className="text-primary">, {name}</span> : null}
      </h2>
    </div>
  );
}
