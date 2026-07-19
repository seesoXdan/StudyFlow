"use client";

import { useState } from "react";
import { addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthView } from "./month-view";
import { DayDetail } from "./day-detail";
import { DayEvents } from "./day-events";
import { useSubjectMap } from "@/hooks/use-data";
import { useCalendarData, getDayAgg } from "@/hooks/use-calendar";
import { buildWeek, STATUS_COLOR, WEEKDAY_HEADERS } from "@/lib/calendar";
import { toISODate, todayISO, formatShortDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export function Calendar() {
  const today = todayISO();
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [selectedISO, setSelectedISO] = useState(today);
  const [addNonce, setAddNonce] = useState(0);
  const { byDate, loading } = useCalendarData();
  const { subjectMap } = useSubjectMap();

  const selectedDate = parseISO(selectedISO);
  const week = buildWeek(selectedDate);

  function shiftDay(delta: number) {
    setSelectedISO(toISODate(addDays(selectedDate, delta)));
  }

  // First click selects the date; clicking the already-selected date opens
  // the quick "일정 추가" input directly.
  function handleSelect(iso: string) {
    if (iso === selectedISO) setAddNonce((n) => n + 1);
    else setSelectedISO(iso);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const detail = (
    <>
      <DayEvents date={selectedISO} openAddNonce={addNonce} />
      <DayDetail
        iso={selectedISO}
        agg={getDayAgg(byDate, selectedISO)}
        subjectMap={subjectMap}
      />
    </>
  );

  return (
    <Tabs defaultValue="month" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="month">월</TabsTrigger>
        <TabsTrigger value="week">주</TabsTrigger>
        <TabsTrigger value="day">일</TabsTrigger>
      </TabsList>

      <TabsContent value="month" className="mt-0 space-y-4">
        <MonthView
          monthDate={monthDate}
          setMonthDate={setMonthDate}
          selectedISO={selectedISO}
          onSelect={handleSelect}
          byDate={byDate}
        />
        <p className="px-1 text-center text-xs text-muted-foreground">
          날짜를 한 번 더 누르면 일정을 바로 추가할 수 있어요.
        </p>
        {detail}
      </TabsContent>

      <TabsContent value="week" className="mt-0 space-y-4">
        <Card>
          <CardContent className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => shiftDay(-7)}
                aria-label="이전 주"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <p className="text-sm font-semibold">
                {formatShortDate(toISODate(week[0]))} ~{" "}
                {formatShortDate(toISODate(week[6]))}
              </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => shiftDay(7)}
                aria-label="다음 주"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {week.map((day, i) => {
                const iso = toISODate(day);
                const selected = iso === selectedISO;
                const isToday = iso === today;
                const status = getDayAgg(byDate, iso).status;
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => handleSelect(iso)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl py-2 transition-colors",
                      selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[11px]",
                        selected
                          ? "text-primary-foreground/80"
                          : i === 0
                            ? "text-danger/80"
                            : "text-muted-foreground"
                      )}
                    >
                      {WEEKDAY_HEADERS[i]}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        isToday && !selected && "font-bold text-primary"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor:
                          status === "none"
                            ? "transparent"
                            : selected
                              ? "rgba(255,255,255,0.9)"
                              : STATUS_COLOR[status],
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        {detail}
      </TabsContent>

      <TabsContent value="day" className="mt-0 space-y-4">
        <Card>
          <CardContent className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDay(-1)}
              aria-label="이전 날"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">
                {formatShortDate(selectedISO)}
              </p>
              {selectedISO !== today && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedISO(today)}
                >
                  오늘
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDay(1)}
              aria-label="다음 날"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
        {detail}
      </TabsContent>
    </Tabs>
  );
}
