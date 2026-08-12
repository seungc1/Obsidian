---
title: "NVIDIA FLUX.1-dev 이미지 생성 API 가이드"
doc_type: "howto"
created: 2026-08-03
updated: 2026-08-03
owner: "kamwoo"
summary: "NVIDIA 무료 API로 black-forest-labs/flux.1-dev를 호출해 이미지를 생성하는 방법. 실제 테스트로 검증된 내용만 정리."
scope: "메뉴 홍보 이미지 생성 및 관련 프로토타입"
audience: "팀"
keywords: ["nvidia", "flux.1-dev", "image-generation", "api"]
related: []
status: "active"
---

# NVIDIA FLUX.1-dev 이미지 생성 API 가이드

`black-forest-labs/flux.1-dev` 하나만 다룹니다. NVIDIA 무료 티어에서 다른 모델(schnell, SDXL, SD3.5-Large)은 타임아웃/404로 막혀 있어 실사용 불가 확인됨 — 그래서 이 모델만 씀.


무료 티어 제한: 계정당 분당 ~40 요청.

## 엔드포인트

```
POST https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev
Authorization: Bearer nvapi-xxxxx
```

(주의: LLM 채팅용 엔드포인트 `integrate.api.nvidia.com/v1`과는 다른 엔드포인트임)

## 요청 파라미터

```json
{
  "prompt": "영어 장면 묘사",
  "mode": "base",
  "seed": 0,
  "cfg_scale": 3.5,
  "steps": 25
}
```

- `mode`는 `"base"` 고정 (`text-to-image`를 넣으면 422 에러남). `canny`/`depth`는 이미지 조건부 생성용, 지금은 안 씀
- `prompt`는 **반드시 영어로**. 한국어 프롬프트를 넣으면 텍스트가 깨지고 완전히 엉뚱한 이미지(예: 애니메이션 캐릭터)가 나오는 것을 실제로 확인함
- 응답은 `artifacts[0].base64`에 이미지가 들어있음 (JPEG, base64 디코드해서 저장)

## curl 예시

```bash
curl -X POST "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev" \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "cozy coffee shop interior, warm lighting", "mode": "base", "seed": 0, "cfg_scale": 3.5, "steps": 25}'
```

한글이 프롬프트/메타데이터에 섞이면 curl `-d`의 인코딩이 깨질 수 있으니, `--data-binary @파일.json`(UTF-8로 저장한 파일)을 쓸 것.

## 사내 스크립트 (검증 완료)

`scripts/generate-promo-image.mjs` — 메뉴 정보를 받아 이미지 + 매니페스트(JSON)를 생성.

```bash
NVIDIA_API_KEY=nvapi-xxx node scripts/generate-promo-image.mjs \
  --menu "매콤크림파스타" --price "12900" \
  --scene "Spicy cream pasta with bacon and chili oil, steam rising, close-up appetizing shot" \
  --copy '{"emotional":"매콤함과 부드러움의 완벽한 조합","cta":"지금 주문해 보세요"}' \
  --out ./output
```

결과: `output/매콤크림파스타_....jpg` + 같은 이름의 `.json` (테이블오더 화면이 바로 읽는 형태)

- `--menu`, `--season`, `--price`: 파일명/매니페스트용 메타데이터
- `--scene`: FLUX에 들어갈 영어 장면 묘사 (필수)
- `--copy`: JSON 문자열로 홍보 문구 (선택, 넘기면 매니페스트 생성됨)

## Changelog
- 2026-08-03: flux.1-dev 전용 가이드로 범위 축소 (다른 모델 비교/경고 섹션 제거)
