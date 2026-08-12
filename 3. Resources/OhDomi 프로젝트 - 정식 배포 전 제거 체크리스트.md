---
type: resource
status: active
category: "프로젝트 아키텍처"
tags: [resource/development]
---

# OhDomi 프로젝트 - 정식 배포 전 제거 체크리스트

데모·시연 편의를 위해 일부러 넣어둔 것들 — **정식 서비스로 배포하기 전에 반드시 확인/제거**해야 함. 세션마다 하나씩 발견되는 대로 여기 추가.

## 로그인 화면

- [ ] **아이디 자동 입력**(2026-08-12 추가) — `OhDomiReact/src/App.tsx`의 `Login` 컴포넌트, 가맹점주 선택 시 `qwer`, 관리자 선택 시 `admin`이 아이디 칸에 자동으로 채워짐(`setLoginId('qwer')`/`setLoginId('admin')`). 실제 서비스에서는 사용자가 자기 아이디를 직접 입력해야 하므로 이 자동 입력 로직 전체 제거 필요.
- [ ] **비밀번호 자동 입력** — 같은 컴포넌트, `<input name="password" defaultValue="1234">`로 로그인 폼 비밀번호 칸이 항상 "1234"로 미리 채워져 있음. 제거 필요(빈 칸으로).
- [ ] **하단 안내 문구** — "데모: 유형을 선택한 뒤 바로 로그인해 보세요." (`<div className="demo-note">`) 제거 필요.
- [ ] **`qwer` 계정에 매장이 연결돼 있지 않음**(2026-08-12 확인) — 가맹점주 데모 계정으로 `qwer`를 자동 입력하도록 바꿨는데, DB 확인 결과 `qwer` 계정은 `stores.owner_user_id`가 없어 로그인하면 "연결된 매장이 없습니다"(빈 화면)만 뜸. 실제 데모를 보여주려면 (a) `qwer`에 매장을 하나 배정하거나 (b) 대신 매장이 있는 `demo`(강남역점) 계정을 쓰도록 다시 바꿀지 결정 필요 — 지금은 사용자 지시대로 `qwer`로 그대로 둔 상태.

## 서버/인프라

- [ ] **Tailscale Funnel 고정 링크**(`https://user.tail43e138.ts.net/`, 2026-08-12 설정) — 팀 내부 시연용. 정식 배포 시 실제 도메인 + 정식 배포 인프라(클라우드 서버, 리버스 프록시, HTTPS 인증서 등)로 교체 필요.
- [ ] **React 개발 서버(`npm run dev`)를 그대로 노출 중** — Vite dev 서버는 HMR·소스맵 등 개발 편의 기능이 그대로 켜져 있고 프로덕션 최적화 빌드가 아님. 정식 배포 전 `npm run build` 산출물을 정적 파일 서버(nginx 등)로 서빙하도록 전환 필요.
- [ ] **Spring `spring.sql.init.mode: always`** — 매 기동마다 `data.sql`의 데모 계정·매장 5곳을 `INSERT IGNORE`로 재삽입. 정식 배포 DB에는 이 초기화 스크립트가 실행되지 않도록 분리 필요.
- [ ] **CORS 허용 목록에 `*.trycloudflare.com`/`*.ts.net`이 포함돼 있음**(`OhDomiSpring` `CorsConfig.java`) — 팀 시연용 터널 도메인 전부 허용 중. 정식 도메인만 허용하도록 좁혀야 함.

## 더미 데이터

- [ ] **김가네 25개 매장 임포트 데이터**(`kimgane_25_stores_import.sql` 등) — 실제 가맹점이 아닌 공개 상권 데이터 기반 데모 매장. 정식 배포 DB에는 안 들어가야 함.
- [ ] **데모 매장 5곳**(강남역점 등, `data.sql`) — 마찬가지로 데모 전용.
- [ ] **v1/v2 순위 더미데이터**(`closure-risk-model/scripts/add_demo_rankings.py`로 생성, `demo_store_synthetic: true` 플래그) — 데모 매장용으로 지어낸 위험도 순위. 실제 매장이 들어오면 이 스크립트 자체를 안 써야 함.
- [ ] **위생 점검 항목별 결과 더미**(`kimgane_hygiene_check_results_seed.sql`) — 결정적 시드로 생성한 가짜 점검 결과.
- [ ] **매출 시딩 스크립트들**(`kimgane_25_april_may_sales_seed.sql`, `kimgane_aug2025_mar2026_sales_seed.sql`) — 가짜 매출 데이터.
- 전체 더미데이터 목록/원칙은 [[3. Resources/폐점 리스크 모델 - 더미데이터 현황]] 참고(closure-risk-model 쪽은 이미 정리돼 있음, OhDomi 쪽은 이 문서가 그 역할).

## 사이드바 / 화면

- [ ] **"로딩 화면 (테스트)" 사이드바 탭**(`Page = 'loadingPreview'`, `/loading-preview`) — 내부 디자인 점검용. 정식 배포 전 사이드바 메뉴에서 제거(코드 자체는 남겨도 되지만 네비게이션 노출은 빼야 함).

## 참조
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
- [[3. Resources/폐점 리스크 모델 - 더미데이터 현황]]
