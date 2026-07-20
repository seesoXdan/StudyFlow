"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Greeting } from "@/components/home/greeting";
import { SetupNotice } from "@/components/home/setup-notice";
import { TodayOverview } from "@/components/home/today-overview";
import { TodayStudy } from "@/components/home/today-study";
import { TodayHomework } from "@/components/home/today-homework";
import { TodayEvents } from "@/components/home/today-events";
import { ReflectionStatus } from "@/components/home/reflection-status";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Greeting />
      <SetupNotice />
      <TodayOverview />

      <Button asChild size="lg" className="w-full">
        <Link href="/study">빠른 공부 시작</Link>
      </Button>

      <TodayEvents />
      <TodayStudy />
      <TodayHomework />
      <ReflectionStatus />
    </div>
  );
}
