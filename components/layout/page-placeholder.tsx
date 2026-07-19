import { type LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function PagePlaceholder({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-5">
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}
