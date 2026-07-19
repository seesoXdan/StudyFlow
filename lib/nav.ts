import {
  Home,
  BookOpen,
  CheckSquare,
  CalendarDays,
  BarChart3,
  ClipboardList,
  Backpack,
  ClipboardCheck,
  School,
  GraduationCap,
  NotebookPen,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Bottom navigation (primary). */
export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "홈", icon: Home },
  { href: "/study", label: "공부", icon: BookOpen },
  { href: "/homework", label: "숙제", icon: CheckSquare },
  { href: "/calendar", label: "캘린더", icon: CalendarDays },
  { href: "/report", label: "리포트", icon: BarChart3 },
];

/** Secondary destinations (sidebar / more menu). */
export const SECONDARY_NAV: NavItem[] = [
  { href: "/plan", label: "하루 계획", icon: ClipboardList },
  { href: "/supplies", label: "준비물", icon: Backpack },
  { href: "/assessments", label: "수행평가", icon: ClipboardCheck },
  { href: "/school", label: "학교 시간표", icon: School },
  { href: "/academy", label: "학원 시간표", icon: GraduationCap },
  { href: "/reflection", label: "오늘의 회고", icon: NotebookPen },
  { href: "/settings", label: "설정", icon: Settings },
];

/** Match the current pathname against a nav href (basePath-safe). */
export function isActivePath(pathname: string, href: string): boolean {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (href === "/") return clean === "/";
  return clean === href || clean.startsWith(href + "/");
}
