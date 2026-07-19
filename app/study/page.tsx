import { StudyTimer } from "@/components/study/study-timer";
import { StudyList } from "@/components/study/study-list";
import { SubjectManager } from "@/components/study/subject-manager";

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <StudyTimer />
      <StudyList />
      <SubjectManager />
    </div>
  );
}
