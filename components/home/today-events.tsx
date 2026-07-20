"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHeader } from "./section-header";
import { useEvents } from "@/hooks/use-data";
import { todayISO } from "@/lib/date";
import { eventCategoryColor } from "@/lib/constants";

export function TodayEvents() {
  const { events, loading } = useEvents();
  const today = todayISO();

  const items = useMemo(
    () =>
      events
        .filter((e) => e.date === today)
        .sort((a, b) => (a.startTime || "99").localeCompare(b.startTime || "99")),
    [events, today]
  );

  if (loading) return <Skeleton className="h-20 w-full" />;
  if (items.length === 0) return null;

  return (
    <section>
      <SectionHeader title="오늘의 일정" href="/calendar" />
      <Card>
        <CardContent className="divide-y divide-border p-0">
          {items.map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: eventCategoryColor(e.category) }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.title}</p>
                <p className="text-xs text-muted-foreground">{e.category}</p>
              </div>
              {e.startTime && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {e.startTime}
                  {e.endTime ? `~${e.endTime}` : ""}
                </span>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
