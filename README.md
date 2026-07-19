# StudyFlow

고등학생을 위한 **깔끔하고 빠른 공부 플래너**. 공부·숙제·시간표·오답노트·리포트를 한 곳에서 관리합니다. Apple Reminders 수준의 미니멀한 UI를 목표로 합니다.

- **화면(정적 파일)**: Next.js 정적 내보내기 → **GitHub Pages**
- **데이터**: **Firebase Firestore** (가족 공용 공간 하나를 여러 기기가 함께 사용, 자동 동기화)
- **로그인**: 화면에 보이지 않는 **자동 익명 인증** — 로그인 없이 바로 사용하지만 Firestore 보안규칙은 정상 적용
- **설치**: PWA — 폰/PC 홈 화면에 앱처럼 추가 가능

## 기술 스택

Next.js (App Router) · React · TypeScript · TailwindCSS · shadcn/ui · Firebase(Firestore/Auth) · Recharts · React Hook Form · Zod · Framer Motion

## 폴더 구조

```
app/                 # 라우트 & 페이지 (App Router)
components/
  ui/                # shadcn 기반 공통 UI
  layout/            # 헤더 · 하단 네비 · 사이드바
  cards/             # 과목/숙제/공부/리포트 카드
  forms/             # 입력 폼 (RHF + Zod)
  calendar/          # 캘린더 (월/주/일)
  report/            # 차트 (Recharts)
  homework/ study/ settings/
hooks/               # 커스텀 훅
lib/                 # firebase, utils 등
store/               # Zustand 전역 상태
types/               # 데이터 모델 타입
styles/              # 추가 스타일
public/              # 아이콘, manifest, PWA 자산
firestore.rules      # Firestore 보안규칙
.github/workflows/   # GitHub Pages 자동 배포
```

## 환경 변수

`.env.local.example`를 복사해 `.env.local`을 만들고 Firebase 웹 설정값을 채웁니다.

```bash
cp .env.local.example .env.local
```

| 변수 | 설명 |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` 등 | Firebase 콘솔 → 프로젝트 설정 → 내 앱 → SDK 설정 |
| `NEXT_PUBLIC_FAMILY_WORKSPACE_ID` | 가족 공용 공간 id (기본 `family`) |
| `NEXT_PUBLIC_BASE_PATH` | GitHub Pages 경로 `/저장소이름` (로컬은 비움) |

이 `NEXT_PUBLIC_*` 값들은 정적 클라이언트에 포함됩니다. 데이터 보호는 보안규칙이 담당하므로 노출되어도 안전합니다.

## Firebase 설정

1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트 생성
2. **빌드 → Authentication → 시작하기 → 익명(Anonymous) 로그인 사용 설정**
3. **빌드 → Firestore Database → 데이터베이스 만들기** (프로덕션 모드)
4. 웹 앱 등록 후 SDK 설정값을 `.env.local`에 입력
5. 보안규칙 배포 (아래 택1):
   - 콘솔의 Firestore → 규칙 탭에 `firestore.rules` 내용 붙여넣기, 또는
   - CLI: `npm i -g firebase-tools && firebase login && firebase deploy --only firestore:rules`

## 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000
```

## 빌드 (정적 내보내기)

```bash
npm run build   # ./out 에 정적 파일 생성
```

## 배포 (GitHub Pages)

1. GitHub에 저장소 생성 후 push
2. 저장소 **Settings → Pages → Build and deployment → Source: GitHub Actions**
3. 저장소 **Settings → Secrets and variables → Actions**에 `NEXT_PUBLIC_FIREBASE_*`, `NEXT_PUBLIC_FAMILY_WORKSPACE_ID` 등록
4. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`가 자동 빌드·배포
5. 배포 주소: `https://<사용자명>.github.io/<저장소이름>/`

> Firebase 콘솔 → Authentication → 설정 → **승인된 도메인**에 `<사용자명>.github.io`를 추가해야 로그인이 동작합니다.

## PWA 설치

배포된 주소를 브라우저에서 열고 "홈 화면에 추가"(모바일) 또는 주소창의 설치 아이콘(데스크톱)으로 앱처럼 설치합니다.

## 보안 강화 (선택)

가족용이라 자동 익명 인증으로 충분하지만, 더 엄격히 하려면 **Firebase App Check(reCAPTCHA)**를 활성화해 본인 앱의 요청만 허용할 수 있습니다.

## 개발 단계 (Phase)

1. 초기화 · 3. Firebase/DB · 4. 레이아웃 · 5. 홈 · 6. 공부 · 7. 숙제 · 8. 캘린더 · 9. 오답노트 · 10. 학교시간표 · 11. 학원시간표 · 12. 리포트 · 13. 회고 · 14. 설정 · 15. 테스트 · 16. 최적화 · 17. GitHub · 18. 배포

각 단계 완료 시 요약 후 확인을 받고 다음 단계로 진행합니다.
