import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format minutes as "1시간 20분" / "45분". */
export function formatMinutes(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h}시간 ${r}분`;
  if (h) return `${h}시간`;
  return `${r}분`;
}

/** Greeting based on the hour of day (Korean). */
export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 6) return "새벽까지 고생이 많아요";
  if (h < 12) return "좋은 아침이에요";
  if (h < 18) return "오후도 힘내요";
  return "오늘 하루도 수고했어요";
}
