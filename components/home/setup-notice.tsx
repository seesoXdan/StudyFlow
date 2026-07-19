"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export function SetupNotice() {
  const { ready, configured } = useAuth();
  if (!ready || configured) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardContent className="flex items-start gap-3 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div className="text-sm">
          <p className="font-semibold">Firebase 연결이 아직 안 됐어요</p>
          <p className="mt-0.5 text-muted-foreground">
            지금은 미리보기 모드예요. 데이터를 저장하려면 <code>.env.local</code>에
            Firebase 키를 넣어 주세요. (README의 “Firebase 설정” 참고)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
