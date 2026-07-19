"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WeeklyCompletion } from "./weekly-completion";
import { ReportDashboard } from "./report-dashboard";

export function ReportView() {
  return (
    <Tabs defaultValue="completion" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="completion">완료 현황</TabsTrigger>
        <TabsTrigger value="stats">공부 통계</TabsTrigger>
      </TabsList>
      <TabsContent value="completion" className="mt-0">
        <WeeklyCompletion />
      </TabsContent>
      <TabsContent value="stats" className="mt-0">
        <ReportDashboard />
      </TabsContent>
    </Tabs>
  );
}
