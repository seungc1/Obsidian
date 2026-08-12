---
type: resource
status: active
category: "모델 정의서"
tags: [resource/ai]
---

# 폐점 리스크 모델 — `risk_assessments`·`risk_factors` 스키마 정의서

[[1. Projects/폐점 재계약 리스크 조기경보 모델]]의 산출값을 OhDomi 서비스 DB에 저장할 때 쓰는 두 테이블(`risk_assessments`, `risk_factors`)의 컬럼별 목적을 정리한 문서. Spring 백엔드 팀에 "우리가 실제로 쓰는 스키마가 무엇이고 왜 필요한지"를 전달하기 위해 작성(2026-08-05) — 기존에 `risk_assessments`를 쓰던 다른 기능(운영지표 기반)과 병합/공존 방식을 정하는 건 이 문서의 범위 밖이며, 백엔드 팀 판단에 맡긴다.

원본 스키마: `ohdomi-risk-integration/spring-patch/schema_risk.sql`(로컬 경로 `C:\Users\yooyj\projects\ohdomi-risk-integration`, 아직 OhDomiSpring 실제 코드에 병합되지 않은 패치 상태).

---

## 1. `risk_assessments` — 매장별 위험도 판단 결과

가맹관리 담당자가 "이 매장이 지금 얼마나 위험한지"를 한눈에 보는 요약 정보. 매장 1건당 한 행.

| 컬럼 | 목적 |
|---|---|
| `risk_assessment_id` | 기본키 |
| `store_id` | 어느 매장에 대한 판단인지(`stores` 테이블 참조, FK) |
| `model_version` | `V1_ONLY`(전국 브랜드 단위만 판단, 서울 외 지역) 또는 `V1_V2`(서울 매장이면 입지 단위까지 추가 판단) |
| `risk_score` | 0~100 종합 위험 점수 |
| `risk_level` | `HIGH` / `INDUSTRY_RISK` / `LOCATION_RISK` / `WARNING` / `SAFE` — 5단계 위험 등급(`combine_scores.py`의 2x2 결합 판단 결과) |
| `location_risk_score` | 서울 매장인 경우의 입지 단위(v2) 위험 점수 — 전국 매장(v1만 계산됨)은 NULL |
| `classification_detail` | 위 등급을 사람이 읽을 수 있는 문장으로 풀어쓴 것(예: "안전 — 업종·입지 둘 다 양호") |
| `main_reason` | 위험도에 가장 큰 영향을 준 요인 1줄 요약 |
| `prediction` | 이 매장의 폐업/재계약 실패 리스크에 대한 예측 문장 |
| `recommended_action` | 권고 조치 1줄 |
| `assessed_at` | 이 판단이 계산된 시각 |

## 2. `risk_factors` — 위험요인 상세(SHAP 근거)

`risk_assessments`의 종합 점수 하나만으로는 "왜 위험한지"를 알 수 없어서, 그 근거를 요인별로 펼쳐 보여주는 상세 테이블. 매장 1건당 여러 행(위험요인 개수만큼).

| 컬럼 | 목적 |
|---|---|
| `risk_factor_id` | 기본키 |
| `risk_assessment_id` | 어느 위험도 판단에 딸린 요인인지(`risk_assessments` 참조, FK) |
| `model_version` | `V1`(전국) 또는 `V2`(서울 매장) — 같은 매장이라도 두 모델의 SHAP 기여도 값 단위(0~1 vs 0~100)가 달라 섞어서 비교하면 안 됨 |
| `factor_rank` | 이 요인이 몇 번째로 큰 영향을 줬는지(1위, 2위…) |
| `feature_name` | 원본 피처명(예: `avg_competitors_250m`) |
| `category` | 사람이 읽을 카테고리명(예: "경쟁밀도") |
| `shap_contribution` | 이 요인이 위험도에 기여한 정도(수치) |
| `evidence` | "반경 250m 내 경쟁점포 12개" 같은 근거 문장 |
| `prevention_action` | 이 요인에 대한 예방조치 제안 |
| `clause_template` | 재계약 조항 후보 — ⚠️ 법무 검토용 초안이며 바로 계약서에 넣는 문구가 아님. 실제 삽입·재계약 거절은 사람이 최종 판단 |

---

## 3. 안 쓰는 필드 (참고)

두 테이블 다 `sales_change_rate` / `hygiene_score` / `delayed_order_count` / `complaint_count` 같은 운영지표 필드는 **전혀 쓰지 않는다**. 저희가 필요한 건 위 컬럼들뿐이다. 기존에 그 필드들을 쓰던 다른 기능(매출/위생 관련 화면 등)과 어떻게 공존시킬지 — 같은 테이블에 컬럼을 추가하는 식으로 병행할지, 완전히 별도 테이블/서비스로 분리할지 — 는 이 스키마 자체를 잘 아는 백엔드 팀이 판단할 사안.

## 4. 참조

- 원본 패치 스키마: `ohdomi-risk-integration/spring-patch/schema_risk.sql`
- 데이터를 채우는 로직: `combine_scores.py`(risk_score/risk_level/classification_detail), `clause_recommendation.py`(risk_factors 전체)
- [[1. Projects/폐점 재계약 리스크 조기경보 모델]]
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
