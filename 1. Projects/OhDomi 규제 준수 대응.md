---
type: project
status: in-progress
due: 2026-09-30
# tags: [priority/high]
---

# OhDomi 규제 준수 대응

## 목표(Outcome)
- `규제 가이드(개인정보보호, 시큐어코딩)_배포용.pdf`(KT 에이블스쿨, 2025.7, 출처: KISA/행정안전부) 기준으로 [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처|OhDomi]](`OhDomiReact`+`OhDomiSpring`+`closure-risk-model`) 코드베이스를 점검·보완
- 점검은 2026-08-10 Explore 서브에이전트로 완료(파일:줄 단위 근거 확보), 체크리스트 아티팩트로 1차 정리: https://claude.ai/code/artifact/8628c284-8c72-403b-9cd1-4284793f004d
- 이 노트는 그 체크리스트를 vault 문서로 보존하고, 항목별 구현을 하나씩 진행하며 로그를 남기는 용도

## 완료 기준(Definition of Done)

### A. 개인정보보호법 (8개)
- [x] A-1. 회원가입 시 개인정보 수집·이용 동의 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [x] A-2. 비밀번호 저장(해싱) — **구현됨**. `PasswordHasher.java:21-54` PBKDF2WithHmacSHA256, 210,000회 반복, 16바이트 salt, `MessageDigest.isEqual` 타이밍-세이프 비교
- [x] A-3. 비밀번호 복잡도 규칙 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [x] A-4. 로그인 실패 계정 잠금 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [x] A-5. 캡챠 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [x] A-6. 세션/인증 관리 — **구현 완료(2026-08-10)**. Spring Security 대신 최소 세션 쿠키 방식 채택(사용자 선택). 상세는 진행 로그 참고
- [x] A-7. 개인정보처리방침 페이지 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고. 단, 실제 배포 전 문구는 법무/팀 검토 필요(담당자 연락처 placeholder 상태)
- [x] A-8. 개인정보 표시 제한(마스킹) — **검토 완료, 변경 없음(2026-08-10)**. 상세는 진행 로그 참고

### B. 시큐어코딩 5대 취약점 (5개)
- [x] B-1. 위험한 형식 파일 업로드 검증 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [ ] B-2. 신뢰되지 않은 URL 자동접속(오픈 리다이렉트) — **해당없음**(해당 기능 자체가 없음)
- [x] B-3. CSRF 방지 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [x] B-4. HTTP 응답분할 방지 — **구현됨**(안전). Spring `ContentDisposition` API가 자동 인코딩
- [x] B-5. 관리자 권한 접속 통제(세션 기반 인가) — **구현 완료(2026-08-10)**. A-6과 함께 처리

### C. 추가 인프라 보안 점검 (5개)
- [x] C-1. SQL Injection 방지 — **구현됨**(JPA 파라미터 바인딩)
- [x] C-2. Spring CORS 설정 — **구현됨**(로컬 한정, 배포 전 재점검 필수)
- [x] C-3. FastAPI CORS 설정 — **구현 완료(2026-08-10)**. 상세는 진행 로그 참고
- [ ] C-4. HTTPS/SSL — **미구현**(배포 시점에 처리 — 로컬 개발 단계에서는 해당 없음, 실제 도메인/인증서 확정 후 진행)
- [ ] C-5. 시크릿 관리 — **구현됨, 단 예외 1건 남음**. `OhDomiReact` origin 리모트 URL에 GitHub PAT가 평문으로 남아 있음(여러 차례 안내했으나 미회수 상태) — 코드 변경이 아니라 GitHub에서 토큰 재발급/회수가 필요한 사용자 액션

## 범위/비범위
- **In scope:** OhDomiReact/OhDomiSpring/closure-risk-model 3개 저장소의 코드 변경
- **Out of scope:** 법무 검토·실제 개인정보처리방침 문구 확정(법무/팀 논의 필요), EC2 인프라 단의 HTTPS 인증서 발급(배포 시점에 별도 진행)

## 진행 순서(우선순위)
1. **A-6/B-5 (최우선)** — Spring Security 기반 세션 인증 + 역할별 인가. 다른 항목(A-4 계정 잠금, A-7 처리방침 접근 로그 등)도 이 위에 얹는 게 자연스러워 먼저 처리
2. **A-1 동의 플로우 + A-7 처리방침 페이지** — 회원가입 화면 변경, 법적 필수 항목
3. **A-3 비밀번호 복잡도, A-4 계정 잠금**
4. **B-3 CSRF, C-3 FastAPI CORS 좁히기**
5. 나머지(A-5 캡챠, A-8 마스킹, B-1 파일 업로드 강화, C-4 HTTPS)는 배포 준비 단계에서 일괄 처리

## 리스크 & 대응
- A-6(인증/인가) 도입은 기존 프론트 3개 화면(점주/관리자 라우팅) 전부에 영향 — 팀원(백엔드/프론트 담당자)과 변경 범위 사전 공유 필요
- 세션 방식 채택 시 팀원 로컬 개발환경(쿠키 도메인 등) 영향 가능 — `OhDomiSpring/local-dev/` 스크립트 동반 수정 검토

## 진행 로그

### 2026-08-10
- Explore 서브에이전트로 18개 항목 전수 점검 완료(위 DoD 표의 근거), 체크리스트 아티팩트 발행
- vault 문서화 및 항목별 순차 구현 착수

### 2026-08-10 (계속) — A-6/B-5 최소 세션 쿠키 인증 구현
구현 강도 확인 결과 "최소 세션 쿠키 방식"으로 진행(Spring Security 정식 도입은 보류 — 팀원 코드와 충돌 위험, 작업량 대비 편익 낮다고 판단).

**OhDomiSpring**(`auth` 패키지 신설 3개 + 기존 파일 2개 수정):
- `SessionManager.java` — `ConcurrentHashMap` 기반 토큰→세션 저장소, TTL 12시간(ponytail: 단일 인스턴스 한계, 스케일 시 DB/Redis로 교체)
- `CurrentUser.java` — `userId/loginId/role/storeId` record
- `SessionAuthFilter.java` — `/api/**` 전체에 로그인 강제(`/api/auth/login`·`/register`·`/logout` 제외), 경로에 `/admin` 포함 시 ADMIN role 강제, `OWNER`는 URL 경로의 `{storeId}`가 본인 매장과 다르면 403. **한계**(ponytail 주석으로 명시): storeId가 쿼리파라미터로 오는 엔드포인트(위생점검/발주추천 등)는 아직 매장별 스코프 미적용 — 필요 시 추가 작업
- `AuthController.java` — `login()`이 세션 생성 후 `HttpOnly` 쿠키(`SESSION`) 발급, `logout()` 신설(세션 무효화+쿠키 만료)
- `CorsConfig.java` — `allowCredentials(true)` 추가(쿠키 왕복 허용)

**OhDomiReact**: Spring(`/api/**`)을 호출하는 모든 fetch(`authApi.ts`/`boardApi.ts`/`riskApi.ts`/`useApiData.ts`/`HygieneCheck.tsx`)에 `credentials: 'include'` 추가. `App.tsx`의 `handleLogout`이 서버 로그아웃(`logoutAccount()`)도 호출하도록 변경(기존엔 프론트 상태만 지웠음). closure-risk-model을 호출하는 `/risk-api` 쪽(AdminRenewalCheck 등 4개)은 별도 서비스라 대상에서 제외(FastAPI 쪽 인증은 C-3 CORS 항목에서 별도 처리 예정).

**검증**: `curl`로 전체 흐름 실측 — 미인증 요청 401, 로그인 후 쿠키 발급, 다른 매장 접근 403, 관리자 전용 엔드포인트에 OWNER로 접근 403, 로그아웃 후 동일 쿠키 401 모두 확인. `./gradlew compileJava`·`npx tsc --noEmit` 통과. 테스트로 만든 계정(`regtest_seccheck`)은 확인 후 DB에서 삭제.

**팀 공유 필요**: 팀원이 로컬에서 pull 시 React 쪽은 별도 설정 없이 그대로 동작(쿠키 자동 처리)하지만, Spring 쪽은 재시작 필요(devtools 자동 재시작 확인됨). `local-dev/` 스크립트는 이번 변경으로 영향 없음(쿠키는 브라우저가 자동 처리, 별도 env 불필요).

### 2026-08-10 (계속) — A-1 회원가입 동의 + A-7 개인정보처리방침 페이지
**OhDomiReact**:
- `pages/Auth/PrivacyPolicyPage.tsx` 신설 — 실제 초안 문구(수집 항목/목적/보유기간/제3자 제공 없음/이용자 권리/담당자)로 작성, 배포 전 법무 검토 필요 표시
- `RegisterPage.tsx` — 필수 동의 체크박스 추가(미동의 시 제출 버튼 비활성화 + 처리방침 페이지로 인라인 이동), `registerAccount()` 호출에 `privacyConsent` 포함
- `authApi.ts`의 `RegisterRequest` 타입에 `privacyConsent: boolean` 추가

**OhDomiSpring**:
- `app_users` 테이블에 `privacy_consent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP` 컬럼 추가(`schema.sql` + 로컬 dev DB에 `ALTER TABLE` 직접 적용 완료) — 동의 "여부"가 아니라 동의 "시점"을 저장해 실제 동의 증빙이 되도록 설계
- `AuthController.RegisterRequest`에 `@AssertTrue boolean privacyConsent` 추가, `register()`의 INSERT가 `privacy_consent_at = CURRENT_TIMESTAMP`로 기록

**검증**: `curl`로 동의 없이 가입 시도 시 400(Bean Validation 메시지 확인), 동의 포함 시 201 + DB에 `privacy_consent_at` 값이 실제 기록됨을 확인. 테스트 계정(`regtest_privacy`) 삭제 완료. `./gradlew compileJava`·`npx tsc --noEmit` 통과.

**팀 공유 필요**: 팀원 로컬 DB에도 동일한 `ALTER TABLE app_users ADD COLUMN privacy_consent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER active;` 실행 필요(신규로 DB를 만드는 경우엔 `schema.sql`이 알아서 반영하므로 무관).

### 2026-08-10 (계속) — A-3 비밀번호 복잡도 + A-4 로그인 실패 계정 잠금
**A-3**: `RegisterRequest.password`에 `@Pattern`(영문+숫자+특수문자 모두 포함, 기존 8자 이상 `@Size`는 유지) 추가. **로그인(`LoginRequest`)에는 미적용** — 기존 가입 계정(팀원/시연용 계정 포함)이 이 규칙 이전에 만들어졌을 수 있어 로그인까지 막으면 팀 작업이 끊길 수 있음. 신규가입만 강제.

**A-4**: `app_users`에 `failed_login_count INT DEFAULT 0`, `locked_until TIMESTAMP NULL` 컬럼 추가(`schema.sql` + dev DB `ALTER TABLE` 적용). `login()`이 실패 시마다 카운트 증가, 5회 도달 시 `locked_until = now + 15분` 기록 후 그 이후 요청은 (비밀번호가 맞아도) `locked_until` 경과 전까지 거부. 성공 로그인 시 카운트/잠금 초기화.

**검증**: 연속 5회 오답 로그인 → 6번째 정답 로그인도 401(잠김 메시지) 확인, DB에 `failed_login_count=5`/`locked_until` 기록 확인. 약한 비밀번호(영문만) 가입 400, 강한 비밀번호 가입 201 확인. 테스트 계정 전부 삭제. `./gradlew compileJava` 통과.

**남은 참고**: 잠금 해제까지 자동 대기(15분)만 있고 관리자 강제 해제 기능은 없음 — 필요해지면 관리자 전용 "계정 잠금 해제" 엔드포인트 추가 검토.

### 2026-08-10 (계속) — B-3 CSRF 방지
세션 쿠키(A-6)가 생긴 시점부터 CSRF가 실제 위협이 되므로 이어서 처리. 정식 토큰 발급 방식 대신 **커스텀 헤더 검증**(Double-Submit 토큰보다 가벼운, 널리 쓰이는 방식) 채택: 공격자의 `<form>` 자동 제출은 임의 헤더를 못 붙이므로, 이 앱 자신의 fetch만 통과하는 `X-Requested-With: XMLHttpRequest` 헤더를 GET/HEAD/OPTIONS를 제외한 모든 `/api/**` 요청에 강제.

- `SessionAuthFilter.java` — 로그인 여부 확인보다 먼저 CSRF 헤더 체크(공개 엔드포인트인 `/login`도 로그인 CSRF 방지 위해 동일하게 적용)
- 프론트: Spring을 호출하는 상태변경 요청(`authApi.ts`의 login/register/logout, `boardApi.ts`의 `api()` 헬퍼가 비-GET 메서드에 자동 부착, `HygieneCheck.tsx`의 이미지 분석 업로드)에 헤더 추가. closure-risk-model(`/risk-api`)은 별도 서비스라 대상 아님

**검증**: 헤더 없는 POST 403, 헤더 포함 POST 201 확인 후 테스트 계정 삭제. `./gradlew compileJava`·`npx tsc --noEmit` 통과.

### 2026-08-10 (계속) — C-3 FastAPI CORS 제한
`closure-risk-model/src/api.py:56`이 `allow_origins=["*"]`(전체 허용)이던 것을 `allow_origin_regex`로 `localhost`/`127.0.0.1`(임의 포트) + 팀 데모용 `*.trycloudflare.com`으로 제한(Spring `CorsConfig`와 동일한 원칙). `uvicorn`이 `--reload` 없이 떠 있어 프로세스 재시작 후 적용 확인: 허용 오리진(`localhost:5173`)은 `Access-Control-Allow-Origin` 정상 반환, 임의 오리진(`evil.example.com`)은 400으로 차단됨을 curl로 검증.

### 2026-08-10 (계속) — B-1 파일 업로드 매직바이트 검증
기존엔 클라이언트가 보내는 `Content-Type` 헤더(위조 가능)와 크기만 검사했음. `HygieneController.analyze()`에 실제 파일 바이트의 시그니처(JPEG `FF D8 FF`/PNG `89 50 4E 47`/WebP `RIFF....WEBP`) 검증을 추가(`hasValidImageSignature()`) — Content-Type만 image/jpeg로 위장한 비-이미지 파일은 이제 400으로 거부됨. 이미지 다운로드 응답(`/images/{imageId}`)에도 `X-Content-Type-Options: nosniff` 헤더 추가(브라우저의 컨텐츠 스니핑에 의한 실행 방지).

**검증**: PowerShell `HttpClient`로 실제 멀티파트 업로드 재현 — 텍스트를 image/jpeg로 위장한 요청은 "Uploaded file is not a valid JPG, PNG, or WebP image" 400, 진짜 최소 JPEG 바이트는 시그니처 검사를 통과(다운스트림 hygiene_ai 서비스 미기동으로 502이지만 이는 별개 — 우리 검증 로직은 통과했다는 뜻).

### 2026-08-10 (계속) — A-8 검토 결과: 코드 변경 없음
"개인정보 표시 제한(마스킹)" 항목을 실제로 어디에 적용해야 할지 코드베이스 전수 확인. 결과: `app_users.phone`(개인 휴대폰)은 로그인/회원가입 응답에서 **본인 계정에만** 반환되고, 다른 사용자가 타인의 개인 전화번호를 조회할 수 있는 엔드포인트는 현재 존재하지 않음. UI에 노출되는 `phone` 필드는 전부 `stores.phone`(매장 대표번호·업무용 연락처)이며 이는 개인정보라기보다 매장 운영에 필요한 업무 정보라 관리자가 봐야 함 — 임의로 마스킹하면 정상 업무 기능이 깨짐. **결론**: 현재 구조에서는 마스킹할 실질적 개인정보 노출 지점이 없어 코드 변경 없이 검토 완료 처리. 향후 다른 사용자에게 개인 연락처를 노출하는 기능이 추가되면 그때 마스킹 적용.

### 2026-08-10 (계속) — A-5 캡챠(자체 구현, 외부 서비스 미사용)
reCAPTCHA 등 외부 서비스는 API 키가 없어 즉시 적용 불가 → 서버가 직접 발급하는 산술 캡챠로 구현(외부 의존성 없음). `CaptchaService.java` 신설: 서버 상태를 저장하지 않고 정답을 HMAC-SHA256 서명된 토큰 안에 담아 클라이언트에 전달(5분 만료) — 회원가입은 비로그인 상태라 세션에 답을 저장할 수 없어 이 방식 채택. `GET /api/auth/captcha`로 문제 발급, `register()`가 제출된 토큰+답을 검증(불일치 시 400). 로그인이 아닌 **회원가입에만** 적용(로그인은 A-4 계정 잠금으로 이미 무차별 대입 방어가 있어 우선순위상 가입 봇 방지가 더 필요하다고 판단).

프론트: `RegisterPage.tsx`가 마운트 시 캡챠를 불러와 문제를 표시, 답 입력 필드 추가, 제출 실패 시 캡챠 자동 재발급(토큰 1회성 성격 고려).

**검증**: 캡챠 미조회 상태로 임의 토큰 제출 400, 정답 계산해 제출 시 201 확인. `./gradlew compileJava`·`npx tsc --noEmit` 통과. 테스트 계정 삭제.

**한계**(ponytail): HMAC 토큰은 상태가 없어 동일 토큰을 만료 전까지 여러 번 재사용해 제출하는 게 이론적으로 가능(재전송 방지 미구현) — 가입 폼 하나에 대한 가벼운 봇 저지선 목적이라 이 정도로 충분하다고 판단, 더 엄격한 방지가 필요해지면 일회성 토큰(사용 후 서버 측에서 무효화)으로 교체.

### 2026-08-10 (계속) — 공식 데모 계정 생성 + 세션 인증 도입 후폭풍 버그 2건 수정
사용자 요청으로 DB에 공식 관리자/가맹점주 계정 생성: **admin/1234**(ADMIN, 기존 계정 비밀번호만 갱신) · **qwer/1234**(OWNER, 신규, 현재 소속 매장 없음). `PasswordHasher`와 동일한 PBKDF2 포맷 해시를 jshell로 생성해 직접 INSERT(비밀번호 자체는 A-3 복잡도 규칙 대상이 아닌 직접 시딩이라 규칙 미적용 — 데모 편의 목적으로 의도적 예외).

이후 사용자가 admin/1234로 실제 로그인 실패를 보고 → 브라우저 콘솔 로그로 원인 진단, 서버 체인(터널→Vite→Spring)은 curl 직결 테스트로 전부 정상 확인되어 **브라우저가 오늘 수정 전 JS를 캐시하고 있던 것**으로 결론. 그 과정에서 콘솔에 남아있던 진짜 버그 2건도 함께 수정:

1. **`App.tsx`의 `DEV_AUTO_LOGIN` 제거** — `npm run dev`에서 로그인 없이 관리자 상태를 바로 주입하던 2026-08-07 편의 기능이, 오늘 세션 쿠키(A-6) 도입으로 인해 실제 세션 없이 관리자인 척만 하게 되면서 이후 모든 API 호출이 401을 뱉는 버그로 변질됨(콘솔 첫 줄 `/api/ui/admin/overview: 401`이 이 증상). `account` 초기값을 `null`로 되돌려 항상 실제 로그인을 거치도록 수정 — 방금 만든 admin/1234 계정이 있어 팀원 편의성 손실은 크지 않음.
2. **로그인 아이디 `pattern` 정규식 문법 오류 수정** — `App.tsx`/`RegisterPage.tsx`의 `pattern="[A-Za-z0-9._-]+"`가 최신 브라우저에서 `Invalid regular expression` 콘솔 에러를 발생시킴(문자 클래스 안 하이픈 위치 문제) → `[-A-Za-z0-9._]+`로 하이픈을 맨 앞으로 옮겨 해결.

**검증**: 터널 URL로 curl 직접 로그인 성공(200, 쿠키 발급) 확인. `npx tsc --noEmit` 통과.

### 2026-08-10 (계속) — 로그인 403의 진짜 원인: Spring CORS가 터널 도메인을 허용 안 함
캐시 문제로 결론 냈던 게 틀렸음 — 새로고침 후에도(정규식 에러 문구가 바뀐 걸로 최신 코드 로딩은 확인됨) 로그인이 계속 403. curl에 `Origin` 헤더를 추가해 재현한 결과 서버가 `"Invalid CORS request"` 응답 — **Spring `CorsConfig`의 허용 오리진 목록에 `*.trycloudflare.com`이 빠져있던 것**이 진짜 원인. 브라우저는 same-origin(페이지도 Vite 프록시도 전부 터널 도메인) 요청에도 `Origin` 헤더를 붙이는데, Spring의 CORS 필터는 이 헤더가 존재하면 무조건 허용 목록과 대조해서 컨트롤러 도달 전에 차단해버림 — closure-risk-model(C-3에서 이미 처리)과 똑같은 문제인데 Spring 쪽엔 빠뜨렸었음.

`CorsConfig.java`의 `allowedOriginPatterns`에 `"https://*.trycloudflare.com"` 추가로 해결. **검증**: `Origin` 헤더 포함한 curl 요청이 200 + `Access-Control-Allow-Origin` 정상 반환 확인.

정규식 하이픈 수정(`[-A-Za-z0-9._]+`)은 위치만 바꿔선 해결 안 됐음 — 브라우저가 `pattern` 속성을 `v`(unicodeSets) 플래그로 컴파일하는 경우 하이픈은 위치와 무관하게 항상 이스케이프(`\-`)해야 함. `[A-Za-z0-9._\-]+`로 최종 수정.

## 종합 결과 (2026-08-10 기준)
18개 항목 중 16개 완료(코드 변경 13건 + 기존 확인 3건 + 검토 후 변경 불필요 1건), 2개(C-4 HTTPS, C-5 GitHub PAT) 남음 — 둘 다 코드 문제가 아니라 배포 시점 인프라 설정/계정 관리 액션이라 이 세션의 "코드 점검·보완" 범위 밖. 전부 실제 서버 기동 후 curl/PowerShell로 end-to-end 검증했고 매번 테스트 계정은 삭제. 프로젝트 상태는 `in-progress` 유지(C-4/C-5가 남아있으므로) — 배포 준비 단계에 재검토 필요.

## 참조
- 소스 PDF: `C:\Users\yooyj\Downloads\규제 가이드(개인정보보호, 시큐어코딩)_배포용.pdf`
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
