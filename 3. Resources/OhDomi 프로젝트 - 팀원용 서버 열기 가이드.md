---
type: resource
status: active
category: "프로젝트 아키텍처"
tags: [resource/development]
---

# OhDomi 프로젝트 - 팀원용 서버 열기 가이드

팀원들이 로컬 빌드 없이 브라우저 링크만으로 OhDomi(React+Spring+closure-risk-model)를 볼 수 있게, 로컬 개발 서버를 인터넷에 열어 공유하는 절차. **다음에 "서버 열어줘" 요청을 받으면 이 문서 그대로 따라 하면 됨.**

> [!info] 2026-08-12 갱신 — 고정 URL(Tailscale Funnel)로 전환
> `trycloudflare.com` 퀵 터널은 링크가 매번 랜덤이라는 문제로 **Tailscale Funnel**로 교체 — 이제 팀원에게 항상 같은 링크(`https://user.tail43e138.ts.net/`)를 공유하면 됨, 매번 새 링크를 다시 보낼 필요 없음. 최초 설정(설치·로그인·Funnel 활성화)은 이미 이 PC에서 완료됨. 아래 "요약"과 "절차"를 Tailscale 기준으로 다시 씀 — cloudflared 방식은 "대안" 절에 남겨둠(Tailscale 계정 없는 팀원이 급하게 열 때 등).

## 요약 (핵심 3줄)
1. 로컬 4개 구성요소(Docker MySQL → Spring 8080 → closure-risk-model 8050 → React 5173)를 순서대로 띄운다. **React는 반드시 `npm run dev -- --host`로 띄울 것** — 기본 `npm run dev`는 `::1`(IPv6 loopback)에만 바인딩돼 Tailscale Funnel의 로컬 프록시(`127.0.0.1` 대상)가 502로 실패함(2026-08-12 발견).
2. Tailscale Funnel이 이 PC에 이미 설정돼 있음(`tailscale funnel --bg 5173`) — **고정 URL**: `https://user.tail43e138.ts.net/`. React 서버만 켜져 있으면 이 링크가 그대로 살아있음(Vite가 `/api`→Spring, `/risk-api`→closure-risk-model로 프록시).
3. 이 링크는 **내 컴퓨터가 켜져 있고 React 개발 서버(5173)가 살아있는 동안만** 유효 — Tailscale Funnel 설정 자체는 재부팅해도 유지되지만, 아래 서버들이 안 떠 있으면 502.

> [!warning] 2026-08-12 — Tailscale Funnel 전환 직후 로그인이 전부 막혔던 원인 2가지(이미 수정됨)
> 1. **CORS 허용 목록에 `*.ts.net`이 없었음**: `OhDomiSpring/.../CorsConfig.java`의 `allowedOriginPatterns`가 `localhost`/`127.0.0.1`/`*.trycloudflare.com`만 허용 — `https://*.ts.net` 추가해서 해결.
> 2. **Vite가 자체 CORS 처리로 preflight를 가로챔**: `vite.config.ts`의 `server.cors`가 기본값(on)이면 `/api/**`로 가는 OPTIONS 프리플라이트를 Vite가 자기가 응답해버리고 Spring까지 안 넘김(그래서 Spring 직접 호출은 되는데 터널 경유만 CORS 실패하는 혼란스러운 증상) — `server.cors: false`로 꺼서 Spring이 직접 CORS를 처리하도록 함.
> 두 파일 다 커밋 완료(`OhDomiSpring` `332a574`, `OhDomiReact` `7b4775f`), push까지 확인함(2026-08-12).

## 절차

### 1단계 — 로컬 서버 4개 기동
`OhDomiSpring/local-dev/start-local.ps1`이 이미 이 과정을 자동화해뒀음(2026-08-10 작성):
```powershell
cd C:\Users\yooyj\projects\OhDomiSpring\local-dev
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
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5173/                   # React (--host로 띄웠는지 확인)
```

### 2단계 — Funnel 상태 확인(보통 안 건드려도 됨)
Tailscale 설치·로그인·Funnel 활성화는 이 PC에 2026-08-12에 이미 완료돼 있음. 재부팅 후에도 대개 그대로 살아있지만, 혹시 안 뜨면:
```powershell
& "C:\Program Files\Tailscale\tailscale.exe" funnel status
# "No serve config"면 재등록:
& "C:\Program Files\Tailscale\tailscale.exe" funnel --bg 5173
```
확인:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://user.tail43e138.ts.net/               # React
curl -s -o /dev/null -w "%{http_code}\n" https://user.tail43e138.ts.net/api/auth/captcha  # Spring(프록시 경유)
```

### 3단계 — 팀원 안내
- 접속: **`https://user.tail43e138.ts.net/`** (항상 같은 링크, Tailscale 계정 없어도 접속 가능 — Funnel은 공개 인터넷에 여는 기능)
- 로그인: 관리자 `admin` / `1234`, 가맹점주 `qwer` / `1234` (2026-08-10 생성한 공식 데모 계정)
- 유효 조건: 내 컴퓨터가 켜져 있고 React 개발 서버(5173, `--host`로 실행)가 살아있는 동안

## 자주 겪는 문제
- **502 Bad Gateway**: React 개발 서버가 `::1`에만 바인딩돼 있으면 발생(기본 `npm run dev`가 이럼) — `npm run dev -- --host`로 다시 띄울 것(2026-08-12 발견).
- **로그인이 그냥 안 됨(에러 메시지도 잘 안 보임)**: 브라우저 콘솔에 CORS 에러가 있는지 먼저 확인 — 새 터널 도메인을 열 때마다 위 "2026-08-12" 콜아웃의 두 가지(Spring `CorsConfig` allowlist, Vite `server.cors`)를 다시 점검해야 함. curl로 직접 때리면 되는데 브라우저에서만 안 되는 게 이 문제의 특징(curl은 브라우저 CORS 프리플라이트를 안 함).
- **로그인 시 403 (CSRF)**: `SessionAuthFilter`가 `X-Requested-With: XMLHttpRequest` 헤더 없는 상태변경 요청을 막음 — 브라우저에서 React 앱의 fetch로 정상 호출하면 문제없음, curl로 직접 테스트할 때만 헤더 추가 필요. 그래도 브라우저에서 안 되면 캐시 문제일 가능성 높음 — 강력 새로고침(Ctrl+Shift+R) 또는 새 탭/시크릿 창.
- **링크 접속은 되는데 매장 데이터가 안 뜸**: closure-risk-model(8050)이 `models/` 폴더 부재로 자동 시작을 건너뛰었을 수 있음 — 팀 채널에서 모델 파일 받아 수동 실행.
- **"Uncaught SyntaxError" 등 프론트 에러가 보임**: 마찬가지로 캐시 문제일 확률이 높음. `npm run dev` 프로세스 자체가 죽었는지 `netstat -ano | grep 5173`로도 확인.

## 대안 — cloudflared 퀵 터널(Tailscale 계정 없을 때 급하게)
```bash
npx cloudflared tunnel --url http://localhost:5173
```
출력 로그의 `https://<임의문자열>.trycloudflare.com` 링크를 공유(설치 안 돼 있으면 npx가 자동 설치). **링크가 매번 랜덤**이라 재시작할 때마다 새로 공유해야 함 — 그래서 위 Tailscale 방식을 기본으로 씀. Spring `CorsConfig`에 `https://*.trycloudflare.com` 패턴은 이미 허용돼 있음(2026-08-10).

## 참조
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
- [[1. Projects/OhDomi 규제 준수 대응]] (admin/qwer 계정, CORS 터널 허용 관련 배경)
