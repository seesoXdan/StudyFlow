"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Greeting } from "@/components/home/greeting";
import { SetupNotice } from "@/components/home/setup-notice";
import { TodayOverview } from "@/components/home/today-overview";
import { TodayStudy } from "@/components/home/today-study";
import { TodayHomework } from "@/components/home/today-homework";
import { ReflectionStatus } from "@/components/home/reflection-status";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <Greeting />
      <SetupNotice />
      <TodayOverview />

      <Button asChild size="lg" className="w-full">
        <Link href="/study">
          <Play className="h-5 w-5" fill="currentColor" strokeWidth={0} />
          빠른 공부 시작
        </Link>
      </Button>

      <TodayStudy />
      <TodayHomework />
      <ReflectionStatus />
    </div>
  );
}
