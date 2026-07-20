"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StudyWeekBoard } from "./study-week-board";
import { StudyList } from "./study-list";
import { SubjectManager } from "./subject-manager";

export function StudyView() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="board" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="board">주간 보드</TabsTrigger>
          <TabsTrigger value="list">목록</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-0">
          <StudyWeekBoard />
        </TabsContent>
        <TabsContent value="list" className="mt-0">
          <StudyList />
        </TabsContent>
      </Tabs>

      <SubjectManager />
    </div>
  );
}
