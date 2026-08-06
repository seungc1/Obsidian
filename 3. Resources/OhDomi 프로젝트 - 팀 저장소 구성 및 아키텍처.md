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

## 요약 (핵심 3줄)
1. OhDomi는 React(프론트) + Spring(백엔드) 기반 프랜차이즈 매장 관리 SaaS(재고/발주/위생점검/매출/게시판/리스크 대시보드)이며, 팀의 여러 모델(폐점 리스크 모델 포함)이 최종적으로 통합되는 목적지 프로젝트다.
2. **hygiene_ai**(위생 이미지 분석 FastAPI)는 이미 Spring/React에 정식 통합돼 실사용 중이지만, **OhDomiAI**(폐점 리스크 모델↔OhDomi 연결 레포)가 제안한 리스크 통합은 **아직 병합되지 않았다** — Spring `RiskController`는 여전히 매출/위생점수 기반 운영지표 스키마이고, React `AdminRiskPrediction`은 여전히 더미 데이터(`adminRiskDummy.ts`)를 쓴다.
3. 이 미병합 상태의 핵심 원인은 스키마 충돌: 기존 `risk_assessments`(운영지표: `sales_change_rate`/`hygiene_score`/`complaint_count`)와 OhDomiAI가 설계한 모델 기반 스키마(`model_version`/`location_risk_score`/SHAP 요인)가 정면으로 다르다 — OhDomiAI README가 팀 결정 대기 중이라고 명시한 사안.

## 저장소 지도

| 저장소 | 역할 | 스택 | 통합 상태 |
|---|---|---|---|
| `OhDomiReact` | 프론트엔드 대시보드(점주용/관리자용) | React 19 + TypeScript + Vite | 위생 연동 완료, 리스크는 더미 데이터 |
| `OhDomiSpring` | 백엔드 REST API | Spring Boot 4.1 + Java 17 + JPA + MySQL | 위생 연동 완료, 리스크는 운영지표 스키마(모델 미반영) |
| `hygiene_ai` | 매장 위생 사진 AI 분석 | Python FastAPI + OpenAI Vision | **정식 통합 완료·실사용 중** |
| `OhDomiAI` | closure-risk-model ↔ OhDomi 연결 레포 | Python(FastAPI 옵션) + SQL 패치 | **패치 준비 완료, 병합 대기**(스키마 충돌 미해결) |
| `closure-risk-model` | 폐점/재계약 리스크 모델(별도 문서화됨) | Python(scikit-learn/LightGBM) | [[3. Resources/폐점 리스크 모델 - 코드 파일 구성]] 참고 |

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
