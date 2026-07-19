import { StudyList } from "@/components/study/study-list";
import { SubjectManager } from "@/components/study/subject-manager";

export default function StudyPage() {
  return (
    <div className="space-y-6">
      <StudyList />
      <SubjectManager />
    </div>
  );
}
