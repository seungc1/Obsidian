---
type: resource
status: active
category: "프로젝트 아키텍처"
tags: [resource/development]
---

# OhDomi 프로젝트 - 팀원용 서버 열기 가이드

팀원들이 로컬 빌드 없이 브라우저 링크만으로 OhDomi(React+Spring+closure-risk-model)를 볼 수 있게, 로컬 개발 서버를 인터넷에 열어 공유하는 절차. **다음에 "서버 열어줘" 요청을 받으면 이 문서 그대로 따라 하면 됨.**

## 요약 (핵심 3줄)
1. 로컬 4개 구성요소(Docker MySQL → Spring 8080 → closure-risk-model 8050 → React 5173)를 순서대로 띄운다.
2. `npx cloudflared tunnel --url http://localhost:5173`로 **React 개발 서버 하나만** 터널링하면 충분하다 — Vite가 `/api`→Spring, `/risk-api`→closure-risk-model로 프록시해주므로 나머지 서버는 터널 없이도 팀원에게 그대로 노출됨.
3. cloudflared가 출력하는 `https://xxxxx.trycloudflare.com` 링크를 팀원에게 공유. 이 세션(터미널)을 유지하는 동안만 살아있고, 링크는 매번 랜덤으로 새로 생성됨(고정 URL 아님).

## 절차

### 1단계 — 로컬 서버 4개 기동
`OhDomiSpring/local-dev/start-local.ps1`이 이미 이 과정을 자동화해뒀음(2026-08-10 작성):
```powershell
cd ~/projects/OhDomiSpring/local-dev
powershell -ExecutionPolicy Bypass -File start-local.ps1
```
스크립트가 하는 일:
- Docker Desktop이 꺼져 있으면 실행 후 대기, `ohdomi-mysql` 컨테이너 기동
- Spring 백엔드(`gradlew bootRun`, 8080) 새 창에서 시작 + 응답 확인까지 대기
- 김가네 25개 매장 시드 데이터 없으면 자동 임포트
- closure-risk-model API(8050) — `models/` 폴더 있을 때만 자동 시작(없으면 팀 채널에서 모델 번들 받아야 함)
- React 개발 서버(5173) 새 창에서 시작

최초 1회는 `1_최초설치.bat`(`setup-local.ps1` 실행)을 먼저 돌려야 함. 이후엔 `2_서버시작.bat` 더블클릭 또는 위 명령 하나로 반복 가능.

동작 확인:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/api/auth/captcha   # Spring
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8050/rankings           # closure-risk-model
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/                   # React
```

### 2단계 — 터널 열기
```bash
npx cloudflared tunnel --url http://localhost:5173
```
출력 로그에서 `https://<임의문자열>.trycloudflare.com` 형태의 URL을 찾아 팀원에게 전달. (설치 안 돼 있으면 npx가 자동으로 받아서 실행함 — 별도 설치 불필요.)

### 3단계 — 팀원 안내
- 접속: 위 링크 그대로
- 로그인: 관리자 `admin` / `1234`, 가맹점주 `qwer` / `1234` (2026-08-10 생성한 공식 데모 계정)
- 이 터널은 **내 컴퓨터가 켜져 있고 cloudflared 프로세스가 살아있는 동안만** 유효 — 컴퓨터를 끄거나 터미널을 닫으면 링크가 끊김

## 자주 겪는 문제
- **로그인 시 403 (CSRF/CORS)**: Spring `CorsConfig`에 `https://*.trycloudflare.com` 패턴이 이미 허용돼 있음(2026-08-10 수정). 그래도 안 되면 브라우저 캐시 문제일 가능성이 높음 — 강력 새로고침(Ctrl+Shift+R) 또는 새 탭/시크릿 창.
- **링크 접속은 되는데 매장 데이터가 안 뜸**: closure-risk-model(8050)이 `models/` 폴더 부재로 자동 시작을 건너뛰었을 수 있음 — 팀 채널에서 모델 파일 받아 수동 실행.
- **"Uncaught SyntaxError" 등 프론트 에러가 보임**: 마찬가지로 캐시 문제일 확률이 높음. `npm run dev` 프로세스 자체가 죽었는지 `netstat -ano | grep 5173`로도 확인.
- **재시작할 때마다 링크가 바뀜**: `trycloudflare.com` 퀵 터널은 고정 URL을 지원 안 함 — 고정 링크가 필요하면 Cloudflare 계정으로 named tunnel을 만들어야 함(아직 미설정).

## 참조
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
- [[1. Projects/OhDomi 규제 준수 대응]] (admin/qwer 계정, CORS 터널 허용 관련 배경)
