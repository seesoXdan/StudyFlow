"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildMonthMatrix,
  WEEKDAY_HEADERS,
  STATUS_COLOR,
  monthTitle,
  addMonths,
  isSameMonth,
} from "@/lib/calendar";
import { toISODate, todayISO } from "@/lib/date";
import { getDayAgg, type DayAgg, type EventBar } from "@/hooks/use-calendar";
import { cn } from "@/lib/utils";

function barClass(kind: EventBar["kind"]) {
  switch (kind) {
    case "single":
      return "mx-1 rounded-full";
    case "start":
      return "ml-1 rounded-l-full";
    case "end":
      return "mr-1 rounded-r-full";
    default:
      return "";
  }
}

export function MonthView({
  monthDate,
  setMonthDate,
  selectedISO,
  onSelect,
  byDate,
  eventBars,
}: {
  monthDate: Date;
  setMonthDate: (d: Date) => void;
  selectedISO: string;
  onSelect: (iso: string) => void;
  byDate: Map<string, DayAgg>;
  eventBars: Map<string, EventBar[]>;
}) {
  const weeks = buildMonthMatrix(monthDate);
  const today = todayISO();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthDate(addMonths(monthDate, -1))}
            aria-label="이전 달"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <p className="text-base font-bold tracking-tight">
            {monthTitle(monthDate)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMonthDate(addMonths(monthDate, 1))}
            aria-label="다음 달"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7">
          {WEEKDAY_HEADERS.map((w, i) => (
            <div
              key={w}
              className={cn(
                "pb-2 text-center text-xs font-semibold",
                i === 0 ? "text-danger/80" : "text-muted-foreground"
              )}
            >
              {w}
            </div>
          ))}

          {weeks.flat().map((day) => {
            const iso = toISODate(day);
            const inMonth = isSameMonth(day, monthDate);
            const isToday = iso === today;
            const selected = iso === selectedISO;
            const status = getDayAgg(byDate, iso).status;
            const bars = eventBars.get(iso) ?? [];
            return (
              <button
                key={iso}
                type="button"
                onClick={() => onSelect(iso)}
                className={cn(
                  "relative flex aspect-square flex-col items-center gap-0.5 rounded-xl pt-1.5 text-sm transition-colors",
                  !inMonth && "text-muted-foreground/40",
                  selected
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "hover:bg-muted",
                  isToday && !selected && "font-bold text-primary"
                )}
              >
                <span className="leading-none">{day.getDate()}</span>

                {/* Completion status — small corner dot */}
                {status !== "none" && (
                  <span
                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: selected
                        ? "rgba(255,255,255,0.9)"
                        : STATUS_COLOR[status],
                    }}
                  />
                )}

                {/* Events — single-day shown as text, multi-day as a bar */}
                {bars.length > 0 && (
                  <div className="w-full space-y-0.5 px-0.5">
                    {bars.slice(0, 2).map((b, bi) =>
                      b.kind === "single" ? (
                        <span
                          key={bi}
                          className="block truncate text-[9px] leading-tight"
                          style={{
                            color: selected ? "rgba(255,255,255,0.95)" : b.color,
                          }}
                        >
                          {b.title}
                        </span>
                      ) : (
                        <div
                          key={bi}
                          className={cn("h-[3px]", barClass(b.kind))}
                          style={{
                            backgroundColor: selected
                              ? "rgba(255,255,255,0.9)"
                              : b.color,
                          }}
                          title={b.title}
                        />
                      )
                    )}
                    {bars.length > 2 && (
                      <span
                        className={cn(
                          "block text-[8px] leading-none",
                          selected
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        )}
                      >
                        +{bars.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {(
            [
              ["completed", "완료"],
              ["partial", "부분"],
              ["incomplete", "미완료"],
            ] as const
          ).map(([s, label]) => (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLOR[s] }}
              />
              {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
