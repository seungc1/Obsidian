---
type: resource
status: active
category: "프로젝트 아키텍처"
tags: [resource/development]
---

# OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처

[[1. Projects/폐점 재계약 리스크 조기경보 모델]]이 최종적으로 반영될 목적지 서비스(OhDomi, 프랜차이즈 매장 관리 대시보드)의 팀 저장소 5개를 분석·정리. 코드는 vault에 복사하지 않고 각 저장소 경로/역할/현재 통합 상태만 기록(2026-08-04 최초 클론 스냅샷, **2026-08-07 재확인**).

> [!warning] 자동 감시 루틴이 실제로는 동작하지 않고 있었음(2026-08-07 발견)
> 아래 "자동 감시 루틴" 절이 매일 자동 갱신을 약속하지만, 그 루틴이 참조해야 할 스냅샷 파일(`.claude/oh-domi-repo-snapshot.json`)이 vault에 전혀 존재하지 않아 — 루틴이 한 번도 실행되지 않았거나 설정이 유실된 것으로 보임. 이번엔 5개 저장소를 전부 수동으로 다시 클론/pull해 직접 재확인했다(아래 "현재 통합 상태" 갱신됨). **루틴 자체는 다음에 점검 필요** — 그전까지는 이 문서를 열 때마다 "최근 확인 시점 기준"이라는 문구를 믿지 말고 수동 재확인할 것.

> [!info] 2026-08-10 갱신 — 아래 §1~2의 "리스크는 더미 데이터" 서술은 더 이상 사실이 아님
> 이날 세션에서 규제 준수 점검([[1. Projects/OhDomi 규제 준수 대응]]) 작업을 하며 실제로 확인·변경한 것들:
> - `OhDomiReact`의 `AdminRiskPrediction`/`AdminStoreRiskList`/`AdminSalesAnalysis`는 이미 실제 API(`riskApi.ts`, `/api/risk-assessments/latest`, `/api/ui/admin/sales`, closure-risk-model의 `/risk-api/rankings`)를 쓰고 있었음 — `adminRiskDummy.ts` 더미는 더 이상 렌더링 경로에 없음(§17 이후 리스크 모델 v2 통합 과정에서 이미 교체된 것으로 보이며, 이 문서가 그 갱신을 놓치고 있었음)
> - `OhDomiSpring`에 세션 쿠키 기반 인증/인가가 새로 생김(`auth` 패키지: `SessionManager`/`SessionAuthFilter`/`CaptchaService` 등) — 로그인 전엔 `/api/**` 전체가 401, 관리자 전용 경로는 403으로 막힘
> - 공식 데모 계정 생성: 관리자 `admin`/`1234`, 가맹점주 `qwer`/`1234`(소속 매장 없음)
> - **김가네 임포트 매장을 216개에서 25개로 축소**(커밋 `c507bcd`) — 위험도 대비가 뚜렷한 매장 쌍, 안전~위험 전 구간 스펙트럼, SHAP 영향요인 8종 다양성, 서울 밖 지역 대표 4곳을 선별. 전체 216개 SQL은 `kimgane_216_*_full216_backup.sql`로 이름만 바꿔 백업 보존, 새 `kimgane_25_*_import.sql`이 실제 시드. **현재 DB 총 매장 수는 30개(데모 5 + 김가네 25) — 아래 "216개 실매장을 OhDomi DB로 들여오는 것" 절(§, 2026-08-07/08 로그)의 "매장 221개(데모 5+임포트 216)" 최종 확인 수치는 이 축소로 더 이상 사실이 아님**, 그 절은 임포트 당시의 히스토리 기록으로만 남겨둠
> - 김가네 25개 매장에 상권 평균 매출 기반 데모 매출 데이터 시딩(`customer_orders`) — 이전엔 전부 0원이었음
> - 팀원 접속용 서버/터널 여는 절차 문서화: [[3. Resources/OhDomi 프로젝트 - 팀원용 서버 열기 가이드]]
> §1/§2 표와 본문은 아직 이 내용을 반영해 다시 쓰지 않았음 — 다음에 이 문서를 열 때 전체 재검증 권장.

> [!info] 2026-08-11 갱신 — 하루 세션에서 OhDomiReact·closure-risk-model 양쪽에 다수 기능/버그 수정, 둘 다 push 완료
> **OhDomiReact** (커밋 `2082dbd`):
> - 매장 상세의 "예비창업자 상담자료" 탭을 "가맹점 양도·양수 자료"로 교체 — 지점·상권·계약은 그대로 두고 사업자만 바뀌는 케이스 전용, 양도·양수 체크리스트(자격/동의/승계/정산) 신설
> - 알림 벨에 위생점검 조치 항목 노출(5건 초과 시 더보기), 전역 "준비 중 버튼" 인터셉터가 실제 동작하는 버튼까지 오탐하던 버그 발견·수정(HygieneCheck 이후 반복된 패턴)
> - 가맹점 관리 페이지네이션 React key 중복 버그, SHAP 위험요인 막대가 전부 100%로 보이던 스케일 계산 버그, 전체 매장 목록 표의 정렬 시 컬럼 밀림·행 구분선 어긋남 버그 수정
> - 희망상권 탐색: 후보지 상담자료 PDF/.md 다운로드, 공정위 표준양식(「예상매출액 산정서의 표준양식에 관한 규정」) 기반 예상매출액 산정서 별도 문서 신설(계산은 `calc_expected_sales()` 재사용)
> - 매장 상세 상담자료 다운로드에 PDF/한글(RTF) 선택 메뉴 추가
>
> **closure-risk-model** (커밋 `a8bf7e7`):
> - `generate_transfer_packet()`(가맹점 양도·양수), `generate_expected_sales_certificate()`(표준양식 예상매출액 산정서), `rtf_export.py`(한글 파일 내보내기) 신설
> - `hwpx_export.py`(HWPX 직접 구현)를 시도했으나 문단 겹침 등 렌더링 문제를 여러 차례 수정해도 한글 프로그램에서 못 고쳐 RTF로 전환 — HWPX 코드/엔드포인트는 남아있지만 프론트에서는 더 이상 안 씀
> - `fetch_all_trdar_chg_ix()`(서울 열린데이터광장 상권변화지표) 캐싱 추가 — 매장 상세 페이지를 열 때마다 API를 35번씩 재호출하던 게 `district-analysis` 500 에러(외부 API 일시 장애)의 실제 원인이었음, 48초→0.7초로 확인
>
> 시연 시나리오 5(업종 구조적 위험 더미)와 더미데이터 현황 문서는 이 세션 이전(2026-08-11 오전)에 이미 갱신됨 — [[3. Resources/폐점 리스크 모델 - 웹사이트 시연 시나리오 (비교 매장 기반)]], [[3. Resources/폐점 리스크 모델 - 더미데이터 현황]] 참고.

> [!info] 2026-08-11 갱신 (계속) — OhDomiReact 로딩 화면 개선 + 위생 점검 미완료 시나리오 (2026-08-12 기준 커밋 `de4441b`로 반영 완료)
> **OhDomiReact**:
> - 대시보드류 로딩을 "MySQL 데이터를 불러오는 중" 텍스트에서 실제 레이아웃 형태의 스켈레톤 셰이머로 교체(`ApiDataState.tsx`), 몇 초~수십 초 걸리는 생성 작업(상담자료/산정서/AI 사진분석)은 공용 `GeneratingBanner` 스피너 배너로 통일, 사이드바에 내부 확인용 "로딩 화면 (테스트)" 탭 추가
> - 매출 분석 페이지에서 "총 주문 수"/"평균 객단가" 카드 제거(2열 그리드로 축소)
> **OhDomiSpring**:
> - **위생 점검 미완료 매장 시나리오 추가** — 김가네 25개 임포트 매장 중 3곳(`KG-005`/`KG-084`/`KG-178`, store_id 1004/1083/1177)의 `hygiene_inspections` 행을 삭제(`kimgane_3_hygiene_pending_scenario.sql`, 되돌리기용 `..._rollback.sql`). **전체 매장 수는 여전히 30개**(데모 5 + 김가네 25) — 그중 27곳만 위생 점검 완료, 3곳은 미확인 상태가 되어 통합 대시보드 "위생 점검 완료 27/30 · 3개 매장 확인 필요"로 표시됨. 라이브 DB(`docker exec ohdomi-mysql`)에 직접 적용 완료, `data.sql`에는 반영 안 함(이 3곳은 원래 `kimgane_25_stores_import.sql`로 별도 적용된 데이터라 Spring 재시작으로 되돌아가지 않음)
> - 위 변경 모두 아직 git commit 전 상태 — 다음에 이 문서를 열 때 실제로 커밋됐는지 재확인할 것

> [!info] 2026-08-12 갱신 — 하루 종일 세션: 팀원용 고정 링크 정식화, 화면 일관성 버그 다수 수정, URL 라우팅 도입
> **팀원용 서버 접속**: `trycloudflare.com` 랜덤 링크 → **Tailscale Funnel 고정 링크**(`https://user.tail43e138.ts.net/`)로 전환, 절차는 [[3. Resources/OhDomi 프로젝트 - 팀원용 서버 열기 가이드]]에 반영. 전환 직후 로그인이 막혔던 원인 2가지 — Spring CORS 허용목록에 `*.ts.net` 누락, Vite 자체 CORS 프리플라이트 가로채기 — 둘 다 수정.
>
> **화면 간 데이터 불일치 버그 다수 발견·수정**(같은 매장인데 화면마다 다른 값이 뜨던 것들):
> - 위생 점검 관리자 페이지가 "최신 점검"을 다른 화면(점주 페이지, 가맹점 관리)과 다른 기준(`MAX(inspection_id)` vs `inspected_at DESC`)으로 판단해 강남역점이 화면마다 92점/양호·81점/주의로 다르게 뜸 — 기준 통일
> - "본사 조치 필요 항목"이 위생 점검 페이지에선 `improvement_tasks`(수동 등록 과제)만 보고 매장별 점검 현황과는 다른 소스를 봐서 긴급 매장이 조치 목록에 안 뜨던 문제 — 점검 현황과 같은 소스로 통일
> - 매출 분석 "지역별 매출 비교"의 비중(%)이 지역 매출 합계(선택한 기간)와 전혀 다른 기간(29일 고정)의 총매출로 나눠져 있던 버그 — 같은 기간끼리 계산하도록 수정, 1개월/3개월/6개월/1년 기간 선택 탭도 추가
> - 리스크 데이터가 옛 모델(`risk_assessments` 테이블)과 새 모델(closure-risk-model v1/v2, `/risk-api/rankings`) 두 시스템으로 나뉘어 있어 데모 매장 5곳이 "전체 매장 목록" 등 새 모델 기반 화면에 아예 안 뜨던 문제 — 완전 통합 대신 데모 매장용 v1/v2 더미 순위를 만들어 채움(아래 §2·[[3. Resources/폐점 리스크 모델 - 더미데이터 현황]] 참고, `closure-risk-model/scripts/add_demo_rankings.py`) — **두 모델 자체는 여전히 안 합쳐짐**, 이건 임시 봉합
>
> **"일반 사이트와 다른 점" 점검 후 수정**: 새로고침하면 세션이 살아있어도 로그인 화면으로 튕기던 버그(`GET /api/auth/me` 신설로 세션 복구) → 이어서 **페이지 상태가 URL에 전혀 반영 안 되던 것 자체**를 발견해 `react-router-dom` 도입(새로고침해도 보던 페이지 유지, 뒤로/앞으로가기 정상 동작, 매장 상세 링크 공유 가능). 그 외 렌더링 에러 시 흰 화면만 남던 문제(ErrorBoundary 추가), 브라우저 탭 제목 고정, 비밀번호 표시 토글, 사이드바 위생 점검 알림 숫자가 하드코딩 `2`였던 것도 실데이터로 교체.
>
> **디자인 스킬 적용**: 위생 점수 추이·월별 매출 추이 차트를 `dataviz` 스킬 절차(monotone cubic 곡선, 접근성 검증된 색상, 선택적 라벨, 표 보기 폴백)로 재설계 후 `high-end-visual-design` 스킬에서 통하는 부분(모션 물리, 부드러운 그림자)만 발췌 적용 — 랜딩페이지용 다크 글래스 테마 등은 이 앱과 안 맞아 의도적으로 제외. "데이터 못 불러왔을 때" 에러 화면도 같은 방식으로 재구성(세션 만료 감지 시 "다시 시도" 대신 "새로고침" 안내로 분기).
>
> **더미데이터 확장**: 월별 매출 추이 5개월→13개월(작년 8월~당월), 위생 점검 항목별 결과(조리대 청결 등 4개 항목)가 매장 1곳에만 있던 것을 27곳 전부로 확장, 조치 항목 설명 문구가 전부 동일했던 것을 실제 위험 사유로 다양화.
>
> **로그인 화면**: 마지막 로그인 유형(가맹점주/관리자) 기억해 기본 선택, 아이디 자동 입력을 유형별로 분기(가맹점주→`qwer`, 관리자→`admin`) — **이 자동 입력들은 데모 전용, 정식 배포 전 제거 필요**: [[3. Resources/OhDomi 프로젝트 - 정식 배포 전 제거 체크리스트]] 신설. 단, `qwer` 계정엔 매장이 연결 안 돼 있어 가맹점주로 로그인하면 빈 화면만 뜨는 것도 같이 발견 — 체크리스트에 기록.
>
> `OhDomiReact`(커밋 `de4441b`~`584abfd`)·`OhDomiSpring`(`2e7e35c`~`05a3f22`)·`closure-risk-model`(`349f558`) — 이 콜아웃에 적힌 내용 전부(지역별 매출 기간 필터, 에러 화면 재구성, 로그인 자동입력 변경, 사이드바 배지 포함) **push까지 완료**(2026-08-12 최종 확인).

## 요약 (핵심 3줄) — 2026-08-12 갱신
1. OhDomi는 React(프론트) + Spring(백엔드) 기반 프랜차이즈 매장 관리 SaaS(재고/발주/위생점검/매출/게시판/리스크 대시보드)이며, 팀의 여러 모델(폐점 리스크 모델 포함)이 최종적으로 통합되는 목적지 프로젝트다.
2. **hygiene_ai**(위생 이미지 분석 FastAPI)는 이미 Spring/React에 정식 통합돼 실사용 중. 리스크는 실제로는 **여전히 두 시스템**(Spring `risk_assessments` 테이블 기반 옛 모델 / closure-risk-model v1·v2 percentile 기반 새 모델)으로 나뉘어 있다 — `AdminRiskPrediction`은 옛 모델(`/api/risk-assessments/latest`)을, `AdminStoreRiskList`/`AdminStoreDetail`/`AdminRenewalCheck`/`AdminDistrictProspect`는 새 모델(`/risk-api/rankings`)을 쓴다. 2026-08-12에 데모 매장 5곳이 새 모델 화면에서 통째로 빠지는 증상만 더미 데이터로 봉합했을 뿐, **스키마 자체는 아직 안 합쳐짐**(OhDomiAI의 병합 제안이 여전히 대기 중이라는 §3은 그대로 유효).
3. 이 미병합 상태의 핵심 원인은 스키마 충돌: 기존 `risk_assessments`(운영지표: `sales_change_rate`/`hygiene_score`/`complaint_count`)와 OhDomiAI가 설계한 모델 기반 스키마(`model_version`/`location_risk_score`/SHAP 요인)가 정면으로 다르다 — OhDomd;iAI README가 팀 결정 대기 중이라고 명시한 사안.

## 저장소 지도

| 저장소                  | 역할                                | 스택                                      | 통합 상태                                    |
| -------------------- | --------------------------------- | --------------------------------------- | ---------------------------------------- |
| `OhDomiReact`        | 프론트엔드 대시보드(점주용/관리자용)              | React 19 + TypeScript + Vite            | 위생 연동 완료, 리스크는 더미 데이터                    |
| `OhDomiSpring`       | 백엔드 REST API                      | Spring Boot 4.1 + Java 17 + JPA + MySQL | 위생 연동 완료, 리스크는 운영지표 스키마(모델 미반영)          |
| `hygiene_ai`         | 매장 위생 사진 AI 분석                    | Python FastAPI + OpenAI Vision          | **정식 통합 완료·실사용 중**                       |
| `OhDomiAI`           | closure-risk-model ↔ OhDomi 연결 레포 | Python(FastAPI 옵션) + SQL 패치             | **패치 준비 완료, 병합 대기**(스키마 충돌 미해결)          |
| `closure-risk-model` | 폐점/재계약 리스크 모델(별도 문서화됨)            | Python(scikit-learn/LightGBM)           | [[3. Resources/폐점 리스크 모델 - 코드 파일 구성]] 참고 |

## 1. OhDomiReact — 프론트엔드 대시보드

- React 19 + TypeScript + Vite. `npm run dev`, 로컬 개발 시 `/api`를 `http://127.0.0.1:8080`(Spring)으로 프록시.
- `src/pages/` 하위에 역할별 화면 분리: 점주용(`StoreManagement`, `StoreSalesOrder`, `StoreSalesStatus`, `HygieneCheck`, `Auth`, `board`) + 관리자용(`AdminStoreManagement`, `AdminSalesAnalysis`, `AdminHygieneCheck`, `AdminRiskPrediction`).
- `src/api/`(`authApi.ts`, `boardApi.ts`, `useApiData.ts`, `ApiDataState.tsx`)가 Spring 호출을 담당하나, **리스크 관련 API 클라이언트는 아직 없음** — `AdminRiskPrediction.tsx`가 `adminRiskDummy.ts`의 하드코딩된 매장 7곳(부산서면점 리스크87 등, 매출변화율/위생점수/민원건수 등 운영지표 목업)을 그대로 렌더링.
- 위생 페이지는 이미 실제 API 연동: JPG/PNG/WebP 10MB 이하 이미지를 `/api/hygiene-inspections/analyze`로 전송 후 점수·항목결과·이력·개선과제를 갱신.

## 2. OhDomiSpring — 백엔드 API

- Spring Boot 4.1, Java 17, `spring-boot-starter-data-jpa`/`validation`/`webmvc`, MySQL(`mysql-connector-j`), Lombok. 로컬 기본 포트 8080.
- 패키지 구조(`src/main/java/com/ohdomi/backend/`): `auth`, `board`, `global`(공통 예외 등), `hygiene`, `order`, `report`(UI 집계 엔드포인트), `risk`, `store`.
- 엔드포인트는 매장/직원/설비/재고/발주/위생/게시판/리스크/UI집계(overview 등) 전 영역을 커버(전체 목록은 `readme.md` 참고). `GET/POST /api/risk-assessments*`는 **`risk` 패키지의 `RiskController.java`** 하나로 구현.
- **현재 `RiskController` 스키마**: `risk_score`, `risk_level`, `sales_change_rate`, `hygiene_score`, `delayed_order_count`, `complaint_count`, `main_reason`, `prediction`, `recommended_action` — 전부 운영지표 기반. 폐점 리스크 모델이 실제로 내는 `model_version`(V1/V2/V1_ONLY)·백분위·SHAP 위험요인·조항 후보는 이 스키마에 없음.
- ERD(`docs/ERD.md`)에도 `RISK_ASSESSMENTS`가 `STORES`에 붙는 것으로만 정의돼 있고, 모델 산출 필드는 아직 반영 안 됨.
- 위생 연동은 `hygiene` 패키지(`HygieneAiClient`/`HygieneController`)로 이미 완성 — `HYGIENE_AI_BASE_URL`(기본 `http://127.0.0.1:8000`)로 hygiene_ai를 호출해 이미지 판정→점수→개선과제를 한 트랜잭션에 저장.

## 3. hygiene_ai — 위생 점검 이미지 분석 서비스

- Python FastAPI, OpenAI Vision 모델로 39개 위생 체크리스트 항목(`data/hygiene_shooting_checklist_v6.csv`, 홀/주방 등 구역별 최대 점수·판정기준 포함) 중 요청된 항목을 판정해 구역별/매장 종합 점수 반환.
- 로컬: `uvicorn last_hygiene_api:app --port 8000`. 엔드포인트: `GET /healthz`, `GET /api/v1/checklist`, `POST /api/v1/review`(multipart 사진 분석), `GET /docs`.
- EC2 systemd 배포 설정(`hygiene-api.service`) 포함 — 나머지 4개 레포 중 유일하게 상시 운영 서버 배포 경로가 문서화돼 있음.
- 테스트(`tests/test_api.py`)는 OpenAI API를 직접 호출하지 않는 계약 테스트.

## 4. OhDomiAI — 폐점 리스크 모델 ↔ OhDomi 연결 레포

closure-risk-model의 산출값을 OhDomi 사이트에 반영하기 위한 **연결 전용** 레포. 모델 코드도 사이트 코드도 직접 담지 않고 경로 참조 + 패치 사본만 보관하는 설계(어느 한쪽이 바뀌어도 이 레포만 재실행하면 됨). **2026-08-07 재확인**: `feature/closure-risk-score` 브랜치가 PR #1로 이 레포 자체의 `main`에 머지됨(2026-08-04 스냅샷 당시엔 미병합 상태였음) — 단, 이건 OhDomiAI 저장소 안에서의 정리일 뿐, `spring-patch/`·`react-patch/`가 실제 `OhDomiSpring`/`OhDomiReact` 저장소에 병합된 건 아직 아님(아래 "현재 통합 상태" 표 그대로 유효). 내용 자체는 스냅샷 당시와 동일(신규 파일 없음, README 소폭 보강만).

**배치 워크플로우**:
```
closure-risk-model (모델, 별도 레포)
        │  combine_scores.py / clause_recommendation.py
        ▼
score_ohdomi.py  →  ohdomi_scores.json   (매장별 v1/v2 점수 + SHAP 위험요인)
        │
        ▼
gen_sql.py       →  risk_data.sql        (OhDomiSpring data.sql용 MERGE INTO 문)
```
1. `score_ohdomi.py` — OhDomi 데모 매장 5곳(강남역/성수/잠실/여의도/부산서면)의 주소로 v1(전국 브랜드)·v2(서울 매장) 점수·위험요인 계산. OhDomi는 FTC 미등록 가상 브랜드라 브랜드 정적 피처는 업종 평균으로 근사(실제 값 생기면 `BASE_FEATURES` 교체 필요).
2. `gen_sql.py` — 결과를 `risk_data.sql`(MERGE INTO `risk_assessments`/`risk_factors`)로 변환.
3. 결과를 `OhDomiSpring/src/main/resources/data.sql`·`schema.sql`에 수동 반영(아직 실행 안 됨).

**실시간 서비스(`service/`)**: closure-risk-model을 경로로만 참조하는 FastAPI(`uvicorn service.main:app --port 8001`). `GET /health`, `GET /demo-stores[/{id}]`(사전 계산 결과 즉시 반환), `POST /risk-score`(임의 주소 실시간 계산, 카카오 지오코딩+서울 열린데이터광장 API 호출로 수초~수십초 소요). 상시 운영 서버는 아직 없음(로컬 uvicorn만 확인됨).

**DB 스키마 상태(2026-07-29 기준, README 기록)**:
- `OhDomiSpring`이 `encrypt` 브랜치에서 이미 H2→MySQL(AWS RDS 예정) 전환됨 확인. 이 레포의 `spring-patch/schema_risk_mysql.sql`도 MySQL 문법(AUTO_INCREMENT, 인라인 INDEX)에 맞춤.
- **`risk_assessments` 블록은 적용 보류** — 기존 운영지표 스키마와 모델 기반 스키마가 충돌(위 섹션 2 참고). 결정 나기 전엔 적용 금지로 명시돼 있음.
- **`risk_factors` 테이블은 즉시 적용 가능** — `risk_assessment_id`만 참조하는 순수 추가 테이블이라 `risk_assessments` 결정과 무관.
- 팀 논의 필요 질문 3가지(README에 명시): (1) 모델 기반으로 완전 대체할지, (2) 별개 테이블로 나란히 둘지, (3) 관리자 리스크 화면의 하드코딩된 전 매장 공통 가중치를 매장별 SHAP 근거로 바꿀지.

**하이브리드 캐시 구조 제안**: 사용자 요청(`GET /latest`)은 항상 `risk_assessments` 캐시 테이블만 읽어 빠르게 응답하고, 모델 서버 호출(`RiskModelClient`→OhDomiAI `service/`의 `/risk-score`)은 스케줄러(`@Scheduled`) 또는 관리자의 수동 `/refresh`로만 트리거 — 모델 서버가 느리거나 죽어도 사이트 응답 경로에 영향 없는 설계. 로컬에서 uvicorn+Spring 동시 구동해 전체 흐름(`/refresh`→`/latest`) 확인 완료(2026-07-29, OhDomiAI README 기록).

**`spring-patch/`, `react-patch/`(아직 각자 레포에 미병합)**:
- `schema_risk.sql`(H2, 로컬용) / `schema_risk_mysql.sql`(MySQL) — 재설계된 DDL
- `risk/RiskController.java` — `GET /latest`(SHAP 위험요인+모델버전 태그) / `POST /refresh`(캐시 수동 갱신)
- `risk/RiskModelClient.java` — OhDomiAI `service/main.py`의 `/risk-score` 호출 (`RestClient`, Jackson 3 `tools.jackson.databind.*`, Spring Boot 4.1 기준)
- `risk/OhDomiDemoStores.java` — `score_ohdomi.py`의 `BASE_FEATURES`/`STORES`와 동일 값(둘이 어긋나지 않게 항상 같이 수정 필요)
- `risk/RiskAssessmentRefreshService.java` — 매일 자동 갱신(`@Scheduled`) + `gen_sql.py`와 동일한 `classify_level` 로직을 Java로 이식
- `application_risk_model_snippet.yaml` — `risk-model.api-url`(기본 `http://localhost:8001`), `risk-model.refresh-cron`
- `BackendApplication.java` — `@EnableScheduling` 추가분
- `react-patch/api/riskApi.ts`, `types/risk.ts` — 백엔드 호출 클라이언트/타입
- `react-patch/AdminRiskPrediction.tsx` — `adminRiskDummy.ts` 대신 실제 API 데이터 사용, 매출/위생/발주 등 모델과 무관한 지표는 제거하고 선택 매장의 SHAP 요인 카드로 교체

**주의사항(README 명시)**:
- `clause_template`은 계약서 삽입용 문구가 아니라 법무 검토용 초안 — 프론트에서 항상 이 사실을 함께 표시해야 함
- 서울 데모 매장 4곳은 v1·v2 모두 백분위 75% 아래라 전부 `SAFE`로 계산됨(임의 조작 아님, 실제 모델 출력)
- 부산서면점은 v2(서울 전용 모델) 대상이 아니라 v1만 적용(`model_version = 'V1_ONLY'`)

## 5. closure-risk-model

이미 상세히 문서화돼 있음 — 코드 구조·데이터 소스·모델링 여정 전체는 다음을 참고:
- [[3. Resources/폐점 리스크 모델 - 코드 파일 구성]]
- [[3. Resources/폐점 리스크 모델 - 공공데이터 소스 목록]]
- [[1. Projects/폐점 재계약 리스크 조기경보 모델]]

## 현재 통합 상태 (2026-08-07 재확인 — 5개 저장소 전부 재클론/pull 후 직접 코드 확인, 2026-08-04 스냅샷과 결론 동일함을 재검증)

| 항목                                  | 상태       | 근거                                                                  |
| ----------------------------------- | -------- | ------------------------------------------------------------------- |
| 위생 AI 연동                            | ✅ 완료·실사용 | Spring `hygiene` 패키지, React 위생 페이지 모두 실제 API 호출                     |
| Spring `risk` 패키지 존재                | ✅ 존재     | `RiskController.java` 확인                                            |
| Spring `risk` 스키마가 모델 기반인가          | ❌ 아니오    | 여전히 `sales_change_rate`/`hygiene_score`/`complaint_count` 등 운영지표 필드 |
| React 리스크 화면이 실제 API를 쓰는가           | ❌ 아니오    | `AdminRiskPrediction.tsx`가 `adminRiskDummy.ts` 하드코딩 값 렌더링           |
| `risk_factors`(SHAP 근거) 테이블         | ❌ 미적용    | OhDomiAI가 "즉시 적용 가능"으로 표시했으나 Spring 본체에 아직 없음                       |
| OhDomiAI `service/`(실시간 스코어링) 상시 배포 | ❌ 없음     | README에 로컬 uvicorn 확인만 기록, 배포 서버 미정                                 |

## 미해결 이슈 / 다음 단계
1. **스키마 결정**: `risk_assessments`를 모델 기반으로 완전 대체할지, 운영지표와 병행할지, 대체한다면 기존 대시보드 카드(매출변화율 등)를 뭘로 교체할지 팀 결정 필요 — OhDomiAI README가 명시한 미해결 질문 그대로.
2. **patch 병합**: `spring-patch/`·`react-patch/`는 참고용 사본일 뿐 실제 Git 병합이 아니므로, 결정이 나면 각 레포(`OhDomiSpring`/`OhDomiReact`)에 실제로 반영(PR)하는 작업이 남아있음.
3. **모델 서버 상시화**: `service/`(포트 8001)를 데모/발표용 로컬 구동을 넘어 팀원이 상시 접근 가능한 서버(EC2 등)로 올릴지 결정 필요.
4. **브랜드 실측 데이터 반영**: OhDomi는 FTC 미등록 가상 브랜드라 `score_ohdomi.py`의 `BASE_FEATURES`가 업종 평균 근사값 — 실제 OhDomi 매장 데이터(초기비용/계약기간 등)가 생기면 이 부분부터 교체.

## 가맹점 관리·위생점검·매출 화면의 더미데이터 점검 (2026-08-07 (계속))

"가맹점 관리·위생점검에 페이지마다 서로 다른 더미데이터를 쓰는 것 같다"는 리포트로 점검 —
**우리 쪽(폐점 리스크 모델) 페이지가 아니라 OhDomi 자체 화면**(리스크 대시보드 제외)이 대상.
결론부터: 걱정했던 것과 달리 **7개 중 6개는 이미 실제 MySQL DB로 전환 완료**돼 있었고,
남은 건 딱 1개(발주 관리)뿐이었다. 실행은 안 하고 점검만(사용자 요청) — 실제 데이터 파일 7개
(`*Dummy.ts`)와 그걸 쓰는 화면 7개, Spring 쪽 대응 엔드포인트를 전부 코드로 직접 대조.

**핵심 발견**: 언제인지는 커밋 로그 확인 필요하지만, 누군가 원래 더미 데이터(매장 5곳 —
강남역점/성수점/잠실점/여의도점/부산서면점, 각 점주 이름까지)를 **그대로 `OhDomiSpring`의
`data.sql` 시드 데이터로 옮기고**, 그 값을 정확히 같은 JSON 모양으로 반환하는 `/api/ui/*`
전용 엔드포인트(`UiDataController.java`)를 만들어뒀다. React 쪽 6개 페이지는 이미 이
엔드포인트를 실제로 호출하도록 바뀌어 있었고, `*Dummy.ts` 파일들은 런타임 값이 아니라
**TypeScript 타입 추론용(`import type`)으로만 남아있는 상태**였다(이름은 여전히 "Dummy"라
헷갈리기 쉬움).

| 화면(React) | 파일 | 상태 | 근거 |
|---|---|---|---|
| 매장 관리(점주) | `StoreManagement.tsx` | ✅ 실 DB | `useApiData('/api/ui/stores/{id}/management')`, dummy는 `import type`만 |
| 위생 점검(점주) | `HygieneCheck.tsx` | ✅ 실 DB | `useApiData('/api/ui/stores/{id}/hygiene')` + `/api/hygiene-inspections/check-items` |
| 매출 현황(점주) | `StoreSalesStatus.tsx` | ✅ 실 DB | `useApiData('/api/ui/stores/{id}/sales')` |
| **발주 관리(점주)** | **`StoreSalesOrder.tsx`** | ❌ **더미 그대로** | `useApiData` 호출 자체가 없음 — `storeSalesOrderDummy.ts`에서 값을 직접 `import`해 렌더링, `storeId` prop도 안 씀(`_storeId`로 unused 처리) |
| 가맹점 관리(관리자) | `AdminStoreManagement.tsx` | ✅ 실 DB | `useApiData('/api/ui/admin/stores')` |
| 위생 점검(관리자) | `AdminHygieneCheck.tsx` | ✅ 실 DB | `useApiData('/api/ui/admin/hygiene')` |
| 매출 분석(관리자) | `AdminSalesAnalysis.tsx` | ✅ 실 DB | `useApiData('/api/ui/admin/sales')` |

**남은 갭은 딱 하나, 이미 준비는 다 돼 있음**: `OrderController.java`(발주 추천/구매내역)와
`UiDataController.orders(storeId)`(`/api/ui/stores/{storeId}/orders`, `orderSummary`/
`recommendedOrders`/`recentOrders`/`aiOrderInsights` 필드명까지 프론트 더미와 완전히 동일하게
설계됨)가 이미 존재하고, `data.sql`에 `inventory_items`/`order_recommendations`/
`purchase_orders` 시드 데이터도 이미 들어있음(빈 테이블 아님, 확인 완료). `App.tsx`도 이미
`<StoreSalesOrder storeId={account.storeId} />`로 실제 storeId를 넘기고 있어 — 프론트에서
`StoreManagement.tsx`와 똑같은 패턴(`useApiData` 훅 추가)으로 한 파일만 고치면 되는, 백엔드
작업이 전혀 필요 없는 순수 프론트 배선 누락.

**요청하신 방향(우리 더미데이터 쪽으로 합치지 않고, 기존 실 DB로 넘기기)과 이미 일치**: 이
6개 페이지가 채택한 방식 자체가 정확히 그 방향(자체 프론트 더미를 없애고 팀의 기존 MySQL로
전부 넘김)이었다 — `StoreSalesOrder.tsx` 하나만 그 흐름에서 빠진 것으로 보인다. 아직 실행은
안 함(점검만 요청받음) — 진행하려면 알려주세요.

## 폐점 리스크 모델의 216개 실매장을 OhDomi DB로 들여오는 것 — 점검(2026-08-07 (계속))

"저기(OhDomi 가맹점 관리/위생점검)에 우리가 만든 216개 매장이 왜 안 보이나" → "해야 한다고
생각한다"는 요청으로 실제 스키마 대조. **실행은 안 함(점검만 요청받음)** — 기술적으로는
충분히 가능하지만, 아래 이유로 팀 결정이 먼저 필요해 보인다.

**1. 스키마 갭 — closure-risk-model 쪽 CSV(`kimgane_real_stores_216.csv`)에 있는 컬럼은
`brand_nm`/`store_name_raw`/`sido`/`sigungu`/`dong`/`road_address`/`lot_address`/`lon`/`lat`
뿐**이고, OhDomi `stores` 테이블(`schema.sql`)의 NOT NULL 컬럼과 대조하면:

| `stores` 컬럼 | NOT NULL | 216개 CSV에 있는가 | 비고 |
|---|---|---|---|
| `owner_user_id`(FK) | ✅ | ❌ | 매장마다 `app_users` 계정이 있어야 함(아래 3번 참고) |
| `store_code`(UNIQUE) | ✅ | ❌ | 새로 발급 필요 |
| `name` | ✅ | ⚠️ | CSV의 `store_name_raw`가 216행 전부 그냥 "김가네"임 — 지점 구분이 안 됨, `road_address` 조합 등으로 지어내야 함 |
| `region` | ✅ | ✅ | `sido`+`sigungu` 조합 가능 |
| `address` | ✅ | ✅ | `road_address` |
| `phone` | ✅ | ❌ | 없음 |
| `open_time`/`close_time` | ✅ | ❌ | 없음 |
| `operation_status` | ✅ | ❌ | 없음(기본값 'OPEN'으로 채우는 건 가능) |
| `contract_ends_on` | nullable | ❌ | 없음(closure-risk-model 쪽도 같은 이유로 더미 처리한 바로 그 필드 — [[3. Resources/폐점 리스크 모델 - 더미데이터 현황]] 참고) |
| `exclusive_area_sqm` | nullable | ❌ | 없음(마찬가지로 이미 더미 처리해본 필드) |
| `latitude`/`longitude` | nullable | ✅ | `lat`/`lon` |
| `monthly_sales_target` | ✅(기본 0) | ❌ | 기본값 0으로 채우면 통과는 됨 |

즉 위도/경도/주소 3개만 실제로 있고 나머지는 전부 새로 채워야 한다 — closure-risk-model
자체 화면에서 이미 겪은 것과 정확히 같은 패턴("전용면적", "계약일자" 등, [[3. Resources/폐점
리스크 모델 - 더미데이터 현황]])이 여기서도 반복된다.

**2. 위생점검 관리자 화면은 매장만 넣는다고 안 뜸**: `UiDataController.adminHygiene()`이
`hygiene_inspections`를 **INNER JOIN**으로 묶는다 — 해당 매장에 위생 점검 이력이 하나도 없으면
목록에서 아예 빠진다(가맹점 관리 쪽 `adminStores()`는 `COALESCE`로 없어도 0점 처리해 보이므로
이 문제 없음). 216개를 위생점검 화면에도 보이게 하려면 매장마다 `hygiene_inspections` 더미
행을 최소 1개씩 같이 넣어야 함.

**3. "점주 계정" 문제 — 기술보다 설계 질문에 가까움**: `stores.owner_user_id`는 NOT NULL FK라
매장마다 `app_users` 행이 있어야 삽입 자체가 된다. 두 방식이 가능한데 트레이드오프가 다르다:
   - **매장마다 새 계정 216개 생성**: DB 제약은 만족하지만, 실제로 그 계정으로 로그인해 "내
     매장"을 관리할 점주가 없다(216개 실매장은 OhDomi에 가입한 적 없는 진짜 타사 매장 —
     로그인 정보를 지어내는 셈).
   - **기존 계정 하나에 몰아서 연결**: 스키마상 막혀있진 않지만(owner_user_id에 유니크 제약
     없음), 점주용 "매장 관리" 화면이 `account.storeId` 단일값 전제라 그 계정으로 로그인하면
     216개 중 1개만 보임 — 관리자 화면(전체 목록)에서만 의미가 있고 점주 화면 목적엔 안 맞음.
   - **가맹점 관리/위생점검의 "관리자"용 화면만 목적이라면** 점주 로그인 문제는 사실상
     무관하고, 플레이스홀더 계정 1개(또는 소수)만 있으면 충분 — 아마 이게 실제로 필요한
     범위일 가능성이 높음(사용자 요청이 "가맹점 관리나 위생점검"이라 관리자 화면을 말한 것으로
     보임).

**4. 더 근본적인 질문 — 이게 정말 맞는 방향인가**: 216개는 OhDomi에 가입한 적 없는 **실제
타사(김가네 본사와 무관하게 존재하는 진짜 영업 중인) 매장**이다. 이걸 OhDomi의 "가맹점
관리"(이 SaaS에 실제로 가입한 매장을 관리자가 운영하는 화면) DB에 넣으면, 화면상으로는
"이 216개가 OhDomi 서비스에 가입한 우리 가맹점"처럼 보이게 된다 — 실제로는 아니다. 로컬
연구용 화면(우리가 만든 closure-risk-model 웹페이지, 더미라고 화면에 계속 명시해 옴)과
달리, OhDomi는 실제 서비스 형태의 DB라 이 차이가 더 크게 느껴질 수 있다. 다음 중 어느
의도인지에 따라 접근이 달라진다:
   - (a) "OhDomi를 김가네의 실제 운영 플랫폼으로 만든다" → 진짜 온보딩 프로젝트(계약 상태
     확인, 실제 점주 초청, 실제 전화번호/영업시간 등 수집)가 필요, 더미로 채울 일이 아님.
   - (b) "다양한 매장 규모/지역으로 화면 데모·테스트를 더 풍부하게 하고 싶다" → 216개를
     그대로 다 쓸 필요 없이 일부(예: 20~30개)만 골라 다른 데모 매장처럼 명확히 더미 데이터로
     채워 넣는 것으로 충분.
   - (c) "폐점 리스크 모델 계산 결과를 OhDomi 화면에서 보고 싶다" → 이미 있는 경로(`OhDomiAI`
     연결 레포, `risk_assessments`/`risk_factors`)를 쓰는 게 맞고, `stores` 테이블 자체를
     늘릴 필요는 없을 수 있음(리스크 대시보드는 이미 5개 데모 매장 기준으로 설계돼 있음).

**결론**: 기술적으로 막혀있지 않다(스키마 제약 전부 우회 가능) — 다만 "무엇을 위해 넣는가"에
따라 필요한 작업량과 방식이 크게 달라져서, 실행 전에 위 (a)/(b)/(c) 중 어느 쪽인지 정하는 게
먼저인 것 같다. 결정되면 실제 SQL 생성(216 stores + 최소 1 owner + 위생점검 더미 1건씩)은
어렵지 않게 진행 가능.

### 실행: SQL 생성 완료, DB 반영은 아직 (2026-08-07 (계속))

(a) 선택 + "실데이터로 확보 가능한 건 실데이터로, 아니면 더미로" 확정 — `closure-risk-model`에
`scripts/gen_ohdomi_store_import.py` 신설, 216개 CSV를 읽어 OhDomi 스키마에 맞는 SQL을
생성해 **`OhDomiSpring/kimgane_216_stores_import.sql`(레포 안, 팀 검토용 파일)로 저장**.
`OhDomiAI`의 `score_ohdomi.py`→`gen_sql.py`→`risk_data.sql` 흐름과 동일 원칙 — **라이브 DB에
직접 쓰지 않고 파일만 생성**, 팀이 검토 후 `data.sql`에 반영하거나 별도 마이그레이션으로
실행하는 걸 전제로 함.

**실데이터로 채운 필드**: `address`(도로명주소), `region`(시도+시군구), `latitude`/`longitude` —
전부 원본 CSV 그대로.

**더미로 채운 필드**(전부 매장 주소 시드 `hashlib.sha1` 결정적 해시 — closure-risk-model
자체 화면에서 써온 것과 같은 방식, 스크립트를 다시 돌려도 같은 매장은 항상 같은 값):
- `phone`(010-XXXX-XXXX), `open_time`/`close_time`(07~09시 시작·21~23시 마감 범위)
- `contract_ends_on`(오늘부터 0~730일 뒤), `exclusive_area_sqm`(20~120㎡ — closure-risk-model
  산정서 더미와 동일 범위 재사용), `monthly_sales_target`(2,500만~5,500만원)
- `store_code`(`KG-001`~`KG-216`, 순번), `name`(행정동 이름 기반 — 예: "김가네 강현면점",
  같은 동에 여러 매장이 있으면 "(2호)"처럼 번호 부여, 216개 중 동명 충돌 24건 확인 후 처리)
- 위생점검(`hygiene_inspections`) 매장당 1건 — 점수도 같은 해시 시드(60~98점), `reviewer`/
  `summary`에 "매장 임포트(더미)"/"실 점검 결과 아님"을 문구로 직접 박아둠(나중에 실제
  점검 데이터와 헷갈리지 않도록 DB 값 자체에 표시)

**점주 계정**: 216개 매장 전부를 새 플레이스홀더 계정 1개(`login_id='kimgane_hq'`, 이름에
"실제 점주 계정 아님" 명시)에 연결 — 216개 진짜 계정을 지어내는 대신, 관리자용 화면(가맹점
관리·위생점검) 노출이 목적이라는 점을 반영(위 3번 항목 판단 그대로).

**검증**: 스키마 컬럼 길이 제한(VARCHAR) 대비 실제 생성값 길이 확인(전부 여유 있음), `store_id`/
`inspection_id`/`user_id`를 기존 데모 데이터(1~7)와 안 겹치게 1000번대부터 시작. closure-
risk-model 테스트 스위트 72/73 통과(무관한 기존 실패 1건 그대로, 이 스크립트는 독립적이라
회귀 없음).

**아직 안 한 것 — 팀 검토 후 진행**: 이 SQL을 실제로 `OhDomiSpring`의 `data.sql`에 합치거나
DB에 실행하는 것 자체는 안 함(공유 인프라 반영이라 팀 확인 먼저 필요하다고 판단) —
`OhDomiSpring/kimgane_216_stores_import.sql` 파일이 리뷰 대기 상태로 남아있음.

### 사용자 확인 후 실제 적용 완료 (2026-08-08)

바로 적용했을 때 생길 문제 7가지를 먼저 짚었고("재계약 검토 58건 오탐", "매출 ₩0으로
보임", "페이지네이션 없음", "리스크 예측 화면과 안 맞음", "롤백 어려움", "ID 충돌 가능성",
"공용 데모 비밀번호 재사용"), 사용자가 "적용 전에 하면 좋을 것들 먼저 준비하고 진행해줘"로
확정 — 아래 순서로 전부 처리:

1. **`UiDataController.java` 보강**(`adminStores()`/`adminHygiene()`): `store_code` 노출 +
   `source`("IMPORTED"/"DEMO") 필드 추가, 주문이 아예 없는 매장은 "₩0" 대신 "데이터 없음"으로
   구분, 위생점검 추이 차트(`hygieneTrend`)에서 임포트 매장(전부 오늘 날짜로 몰림) 제외해
   기존 7일 추이가 더미로 왜곡되지 않게 함.
2. **프런트 검색+페이지네이션+배지**: `AdminStoreManagement.tsx`/`AdminHygieneCheck.tsx`에
   클라이언트 사이드 검색(이름/지역/점주)+20개 단위 페이지네이션 추가, 임포트 매장 이름 옆에
   "임포트" 배지 표시(더미 데이터임을 화면에서 바로 구분 가능하게).
3. **적용 직전 DB 상태 재확인**: `docker exec ohdomi-mysql`로 직접 조회, 현재 최대 ID(stores=5,
   app_users=6, hygiene_inspections=7)가 임포트 시작 ID(1000)와 안 겹침을 확인 후 진행.
4. **롤백 스크립트**: `kimgane_216_stores_rollback.sql`(자식→부모 순서로 DELETE) 준비 —
   **실제로 한 번 사용함**(아래 인코딩 문제 발견 후 되돌리고 재적용).
5. **실제 적용**: `docker exec -i ohdomi-mysql mysql -uroot ohdomi < kimgane_216_stores_import.sql`
   로 로컬 개발 DB(`ohdomi-mysql` 컨테이너)에 반영 — **실행 중이던 Spring 프로세스(3개, 다른
   포트/PID 혼재)를 정리하고 재시작해 코드 변경사항 반영**.

**적용 중 실제로 발견·수정한 버그**: 첫 적용 직후 API 응답에서 한글이 전부 깨짐(예: "김가네
강현면점"이 "ê¹€ê°€ë„¤...") — SQL 파일 자체는 올바른 UTF-8이었는데, `mysql` 클라이언트가
stdin을 기본(비-UTF-8) 세션 문자셋으로 읽어들이며 깨진 것으로 확인(기존 데모 5개 매장은
Spring 부팅 시 `data.sql`을 통해 다른 경로로 들어가 멀쩡했음, 임포트 216개만 영향받음). 방금
만든 롤백 스크립트로 216개를 지우고, `--default-character-set=utf8mb4` 옵션을 붙여 재적용해
해결 — 롤백 스크립트가 실전에서 바로 검증된 셈.

**최종 확인**(`/api/ui/admin/stores`, `/api/ui/admin/hygiene` 실제 응답으로 검증) — ⚠️ **2026-08-10에 216개 임포트가 25개로 축소되어 아래 수치는 더 이상 현재 상태가 아님(위 2026-08-10 갱신 콜아웃 참고), 이 절은 당시 임포트 작업 기록으로만 유지**:
- 매장 221개(데모 5 + 임포트 216), 위생점검 221건 전부 정상 노출, 한글 정상 표시
- 임포트 매장은 "데이터 없음"(매출)·"임포트" 배지로 데모 매장과 화면에서 구분됨
- `riskStores: 2`(원래 데모 그대로, 임포트 매장은 리스크 평가 없어 기본 "안전" — 액션 필요
  목록에 안 섞임), `contractExpiring: 60`(원래 2 + 임포트 58, "재계약 검토" 표시 자체는
  남지만 임포트 배지로 더미 계약일자임을 알 수 있음)
- 위생 추이 차트는 원래 데모 3일치(`07-19`~`07-21`)만 표시 — 임포트 더미가 안 섞임(의도대로)

프런트(`npx tsc --noEmit`)·백엔드(`gradlew compileJava`) 둘 다 클린 컴파일 확인.

### 적용 후 발견된 버그 2건 추가 수정 (2026-08-08 (계속))

"같은 서울인데 지역별 현황에 여러 장으로 뜬다"는 리포트로 확인한 두 가지 원인 — 전부
`adminStores()`의 `regionStats`(지역별 가맹점 현황) 쪽 문제, 임포트 전엔 표본이 작아
(서울 데모 4곳) 눈에 덜 띄었을 뿐 **원래 있던 버그**를 이번에 발견해 같이 고침:

1. **GROUP BY가 표시 라벨보다 세밀했음**: SQL은 `region` 원본 전체(예: "서울 강남구")로
   `GROUP BY` 하고, 화면 표시만 `.split(" ")[0]`로 시도명만 잘랐다 — 시군구가 다르면
   전부 별개 그룹으로 집계된 뒤 라벨만 우연히 같아져 중복 카드처럼 보임. 같은 파일의
   `adminSales()`가 이미 SQL 단에서 `SUBSTRING_INDEX(region,' ',1)`로 시도명만 잘라
   `GROUP BY`하는 올바른 패턴을 쓰고 있어 그대로 재사용해 수정.
2. **시도 표기 방식이 안 맞았음**: 기존 데모 5곳은 region을 "서울"/"부산"(축약형)으로
   저장하는데, 임포트 216개는 CSV의 `sido` 원본("서울특별시"/"경상남도" 등 공식 전체
   명칭)을 그대로 써서 1번을 고쳐도 "서울"과 "서울특별시"가 별개 카드로 남는 문제 —
   `scripts/gen_ohdomi_store_import.py`에 `SIDO_SHORT` 매핑 16개(전국 시도) 추가해
   기존 데모 표기에 맞춤. 롤백 스크립트로 216개 삭제 후 재적용(이번에도 `--default-
   character-set=utf8mb4` 유지).

**최종 확인**: 지역별 카드가 92개 뒤섞인 "서울"류 중복 없이 정확히 16개(전국 시도 수)로
정리, 카드별 매장 수 합계가 전체 221과 일치. 서울 92개(데모 4+임포트 88)로 정상 병합.

## 자동 감시 루틴 (2026-08-04 신설, **2026-08-07 기준 미동작 확인**)

원래 설계: 이 문서와 아래 5개 저장소 상태를 사람이 매번 다시 확인하지 않아도 되도록, 매일 오후
6시(KST) 클라우드 루틴(`OhDomi 팀 저장소 일일 변경 감지`, `trig_01YZGM6t2Qr8F3pMh2EmaiSB`)이 자동
실행되어야 했다.

- **동작(설계상)**: 5개 저장소(OhDomiReact/OhDomiSpring/hygiene_ai/OhDomiAI/closure-risk-model)의
  HEAD 커밋을 `.claude/oh-domi-repo-snapshot.json`(vault 루트, 이전 실행 기록)과 비교 → 변경된
  저장소가 있으면 `git log`/`git diff --stat`으로 실제 변경 내용을 확인해 이 문서의 관련 섹션과
  [[1. Projects/폐점 재계약 리스크 조기경보 모델]]의 진행 로그를 자동 갱신하고 vault 저장소에
  커밋·푸시한다.
- **2026-08-07 확인 결과: 스냅샷 파일(`.claude/oh-domi-repo-snapshot.json`)이 vault에 존재하지
  않음** — 루틴이 한 번도 정상 실행되지 않았거나 설정이 유실된 것으로 보임. "이 문서를 열었을 때가
  항상 최근 확인 시점 기준"이라는 아래 문구는 **현재 사실이 아니다** — 실제로는 2026-08-04
  스냅샷에서 3일간 갱신이 없었고, 이번에 수동으로 5개 저장소를 재클론/pull해 대신 확인했다(다행히
  결론 자체는 바뀌지 않았음 — 위 "현재 통합 상태" 참고).
- **다음에 필요한 조치**: 루틴(`trig_01YZGM6t2Qr8F3pMh2EmaiSB`)이 실제로 존재/활성 상태인지
  `https://claude.ai/code/routines/trig_01YZGM6t2Qr8F3pMh2EmaiSB`에서 확인하고, 죽어있으면
  재생성하거나 수동 점검 주기(예: 이 프로젝트를 다시 열 때마다)로 대체할 것.
- **우선 확인 항목(루틴이 살아나면)**: `OhDomiSpring`의 `risk` 패키지가 모델 기반 스키마로
  바뀌는지, `OhDomiReact`의 `AdminRiskPrediction`이 더미 데이터에서 실제 API 호출로 바뀌는지,
  `OhDomiAI`의 `spring-patch`/`react-patch`가 실제로 병합되는지 — 즉 위 "미해결 이슈" 1~2번이
  해소되는 순간을 포착하는 것이 목적.

## 참조
- [[1. Projects/폐점 재계약 리스크 조기경보 모델]]
- [[3. Resources/폐점 리스크 모델 - 코드 파일 구성]]
- [[3. Resources/폐점 리스크 모델 - 종합 활용 계획서]]
- [[3. Resources/OhDomi 프로젝트 - 팀원용 서버 열기 가이드]]
- [[3. Resources/OhDomi 프로젝트 - 정식 배포 전 제거 체크리스트]]
