---
type: resource
status: active
category: "AI 프롬프트"
tags: [resource/ai]
---

# 폐점 리스크 모델 - 프로젝트 썸네일 AI 프롬프트

[[1. Projects/폐점 재계약 리스크 조기경보 모델]]의 대표 썸네일 이미지를 생성하기 위해 작성한 AI 이미지 프롬프트 모음. 포스터 형태로 제목·태그라인 텍스트가 이미지 안에 직접 들어가도록 구성했고, 서로 다른 아트 디렉션 5가지를 시도해볼 수 있게 병렬로 정리.

## ⚠️ 이미지 규격 (반드시 준수)
- **680 × 680px, 1:1 정사각형 고정**
- 가로세로 비율이 다르게 나오면 안 됨 — 모든 프롬프트 하단에 규격 지시문 포함, 이미지 생성 도구 설정에서도 반드시 1:1(정사각형) 옵션으로 지정할 것
- 크롭 전제로 여백을 넓게 잡지 말고, 정사각 프레임 안에서 구도가 완결되도록 지시

## 공통 텍스트 (모든 스타일에 동일 적용)
- **제목**: "폐점 재계약 리스크 조기경보 모델"
- **태그라인**: "문 닫기 전에, 먼저 압니다"
- **보조 캡션**(선택): "AI 기반 폐점·재계약 리스크 예측"

## ⚠️ 한글 텍스트 렌더링 한계 안내
대부분의 이미지 생성 AI는 한글 텍스트를 정확히 그리지 못하고 깨진 글자로 출력하는 경우가 많습니다. 결과물의 한글이 깨진다면:
1. 텍스트 없이 비주얼만 생성 → Figma/Canva/PPT 등에서 제목·태그라인을 직접 오버레이 (가장 확실)
2. 한글 렌더링을 비교적 잘 지원하는 최신 모델(GPT-4o/Gemini 이미지 생성 등)로 재시도
3. 프롬프트 그대로 쓰되 결과물의 텍스트 부분만 리터칭 요청

각 스타일 하단에 "텍스트 없는 버전"을 함께 실어, 실패 시 그 버전 + 오버레이 조합으로 대체 가능하게 했습니다.

---

## 스타일 A — 깜빡이는 간판 (시네마틱 은유형)

나란한 프랜차이즈 간판 중 하나만 깜빡이며 위험요인이 빛의 실로 뻗어나가는 감성적 은유. (이전 버전을 정사각형 포맷으로 재구성)

### 영문
```
Movie-poster-style single key visual, square format, EXACTLY 1:1 aspect ratio, 680x680px,
nothing bleeding off the square frame.

TOP 20% (title zone, clear empty space): bold centered title line, smaller subtitle below,
clean modern Korean sans-serif (Pretendard/Noto Sans KR style), white/light text:
  - Title: "폐점 재계약 리스크 조기경보 모델"
  - Subtitle: "문 닫기 전에, 먼저 압니다"

CENTER 65%: a row of identical franchise storefronts at dusk, eye level, quiet street —
same signage shape, warm cyan-white glow, evenly repeated. One storefront in the middle
flickers: duller amber-red, mid-flicker (not dark yet — still saveable), faint heartbeat-
like flicker-line above it. Three thin threads of light rise from it, each ending in a
tiny glyph: footprint (foot traffic), storefront silhouette (competition), downward line
(sales trend) — quiet explainable "reasons."

BOTTOM 10% (small caption): "AI 기반 폐점·재계약 리스크 예측"

Style: cinematic dusk gradient (navy #0F172A to warm amber horizon), cyan-white
(#7DD3FC) healthy stores, amber-red (#F97316-#EF4444) only for the flickering store,
threads, and text accents. Shallow depth of field, flickering store sharp, rest blurred.
Quiet, premium, slightly emotional brand poster feel. Text crisp and legible, high
contrast, not overlapping the focal point. Square composition, centered, symmetrical
balance — must read correctly cropped to a perfect square.
```

### 한글
```
영화 포스터 같은 단일 키비주얼, 정사각형 포맷, 반드시 1:1 비율, 680x680px, 정사각
프레임 밖으로 아무것도 삐져나가지 않게 구성.

[상단 20%, 제목 영역, 깔끔한 여백]
굵고 중앙 정렬된 제목 한 줄, 그 아래 작은 부제. 모던 산세리프(Pretendard/Noto Sans KR),
흰색/밝은 텍스트:
  - 제목: "폐점 재계약 리스크 조기경보 모델"
  - 부제: "문 닫기 전에, 먼저 압니다"

[중앙 65%]
해질녘 눈높이에서 본 똑같이 생긴 프랜차이즈 간판들이 늘어선 거리 — 전부 같은 청백색
불빛. 그중 하나만 주황~빨강으로 깜빡이며 흐려짐(아직 꺼지지 않은, 아직 늦지 않은
상태), 위로 힘겨운 파형 선. 그 간판에서 위로 가느다란 빛의 실 세 가닥 — 발자국(유동
인구), 매장 실루엣(경쟁밀도), 아래로 꺾이는 선(매출추이) — 이 뻗어나가며 조용히
"이유"를 설명함.

[하단 10%, 작은 캡션]
"AI 기반 폐점·재계약 리스크 예측"

배경은 짙은 네이비(#0F172A)~따뜻한 앰버 해질녘 그라데이션, 정상 매장은 청백색
(#7DD3FC), 깜빡이는 매장·빛의 실·텍스트 포인트만 주황~빨강(#F97316→#EF4444). 얕은
심도로 깜빡이는 매장에 초점, 나머지는 흐림. 조용하고 프리미엄한 브랜드 포스터 느낌.
텍스트는 또렷하고 대비 뚜렷하게, 정사각형 구도 중앙 정렬·대칭 균형.
```

### 텍스트 없는 버전 (오버레이용)
```
A single symbolic hero image, square format, 1:1 aspect ratio, 680x680px, minimal and
conceptual, no UI panels, no charts, no text. A row of identical franchise storefronts at
dusk, eye level, quiet street, warm cyan-white glow repeated evenly. One storefront in the
middle flickers duller amber-red, mid-flicker, faint heartbeat flicker-line above it.
Three thin threads of light rise from it ending in tiny glyphs: footprint, storefront
silhouette, downward-sloping line. Cinematic dusk gradient (navy #0F172A to warm amber),
shallow depth of field, flickering store sharp, rest blurred. Centered, symmetrical,
square composition with top 20% left as clean empty negative space for a title overlay.
```

---

## 스타일 B — 플랫 엠블럼/배지형 (미니멀 아이콘)

간판 은유 대신, 로고처럼 쓸 수 있는 원형 배지 구성. SNS 프로필/앱 아이콘 느낌으로 재사용성이 높음.

### 영문
```
Flat minimal emblem/badge design, square format, EXACTLY 1:1 aspect ratio, 680x680px,
centered circular badge composition, generous even margin on all four sides so nothing
touches the square edge.

Center: a large circular badge/seal shape. Inside the circle, a minimal line-art icon of
a storefront awning with a simple radar/pulse ring emanating outward from it in a single
accent color — representing early detection. Around the inner rim of the circle, a thin
circular SHAP-style dial with three small tick-marks (representing risk factors) instead
of full numbers.

Directly below the circle (outside it, in the lower third of the square): the title text
in bold modern Korean sans-serif, centered:
  - Title: "폐점 재계약 리스크 조기경보 모델"
  - Small tagline beneath: "문 닫기 전에, 먼저 압니다"

Style: flat vector illustration, no gradients or photorealism, 2-3 color palette only —
deep navy (#0F172A) background, off-white (#F8FAFC) badge outline and icon linework,
single amber accent (#F59E0B) for the pulse ring and one tick mark. Clean geometric
precision, generous negative space, icon-set / app-icon quality, works small. Perfectly
centered, radially symmetric, square composition.
```

### 한글
```
플랫 미니멀 엠블럼/배지 디자인, 정사각형 포맷, 반드시 1:1 비율, 680x680px, 원형
배지가 중앙에 오는 구도, 사방 여백을 충분히 둬서 정사각 테두리에 아무것도 닿지 않게.

중앙: 큰 원형 배지/씰 모양. 원 안에는 매장 차양을 표현한 미니멀 라인아트 아이콘과
거기서 바깥으로 퍼지는 단색 레이더/펄스 링(조기 감지를 상징). 원의 안쪽 테두리를
따라 위험요인 3개를 뜻하는 작은 눈금 3개가 있는 얇은 다이얼 라인.

원 아래(원 밖, 하단 1/3 영역)에 굵은 모던 산세리프로 제목 중앙 정렬:
  - 제목: "폐점 재계약 리스크 조기경보 모델"
  - 작은 태그라인: "문 닫기 전에, 먼저 압니다"

스타일: 플랫 벡터 일러스트, 그라데이션·사실적 묘사 없음, 2~3색만 사용 — 짙은
네이비(#0F172A) 배경, 오프화이트(#F8FAFC) 배지 윤곽·아이콘 선, 앰버(#F59E0B) 단색
포인트로 펄스 링·눈금 하나만 강조. 깔끔한 기하학적 정밀함, 넉넉한 여백, 앱 아이콘/
아이콘셋 품질, 작게 축소해도 알아볼 수 있게. 완벽히 중앙 정렬된 방사 대칭 구도.
```

### 텍스트 없는 버전 (오버레이용)
```
Flat minimal emblem/badge icon, square format, 1:1 aspect ratio, 680x680px, centered
circular badge with a minimal line-art storefront awning icon and a radar/pulse ring
emanating outward, thin circular dial with three tick-marks along the inner rim. Flat
vector, no gradients, deep navy (#0F172A) background, off-white (#F8FAFC) linework, single
amber (#F59E0B) accent on the pulse ring. Generous even margin, radially symmetric,
app-icon quality, no text, bottom third left empty for a title overlay.
```

---

## 스타일 C — 라인아트 인포그래픽형 (단색 다이어그램)

경고등이나 감성 은유 없이, 리스크 게이지 자체를 주인공으로 삼는 정보 디자인 접근. 데이터 프로덕트 느낌을 가장 직접적으로 전달.

### 영문
```
Minimal single-line infographic poster, square format, EXACTLY 1:1 aspect ratio, 680x680px,
clean editorial layout, all elements contained within the square with even margins.

Center: one large circular gauge/dial (like a speedometer), drawn in thin continuous line
art, needle pointing into the upper-right "danger" zone of the arc (arc divided into three
subtle zones: safe/watch/danger, distinguished only by line weight or one accent color,
not by clip-art icons). Around the outer edge of the gauge, a few short radiating tick
lines of varying length suggest contributing risk factors (like a minimalist bar chart
folded into a radial layout), each unlabeled.

Top 20%: bold title text, centered, clean modern Korean sans-serif:
  - Title: "폐점 재계약 리스크 조기경보 모델"
  - Subtitle: "문 닫기 전에, 먼저 압니다"

Bottom 8%: small caption "AI 기반 폐점·재계약 리스크 예측"

Style: single-weight line art (like a technical blueprint or editorial diagram), off-white
background (#F8FAFC), all lines in deep navy (#0F172A), ONE accent color only — red-orange
(#EF4444) — used exclusively for the gauge needle and danger zone. No photorealism, no
gradients, no clutter. Confident, precise, data-product editorial feel — like a Bloomberg
or scientific-journal infographic. Square, centered, balanced whitespace.
```

### 한글
```
미니멀 단색 라인아트 인포그래픽 포스터, 정사각형 포맷, 반드시 1:1 비율, 680x680px,
깔끔한 에디토리얼 레이아웃, 모든 요소가 균등한 여백과 함께 정사각형 안에 완결되게.

중앙: 속도계처럼 생긴 큰 원형 게이지 하나, 얇은 단일 선으로만 그림, 바늘은 호의
오른쪽 위 "위험" 구간을 가리킴(호는 안전/주의/위험 3구간으로 나뉘되 클립아트 아이콘
없이 선 굵기나 단색 포인트로만 구분). 게이지 바깥 테두리를 따라 길이가 다른 짧은
방사형 눈금선 몇 개가 위험요인 기여도를 암시(막대그래프를 원형으로 접은 느낌), 라벨
없음.

상단 20%: 굵은 제목, 중앙 정렬, 모던 산세리프:
  - 제목: "폐점 재계약 리스크 조기경보 모델"
  - 부제: "문 닫기 전에, 먼저 압니다"

하단 8%: 작은 캡션 "AI 기반 폐점·재계약 리스크 예측"

스타일: 단일 굵기 라인아트(기술 도면/에디토리얼 다이어그램 느낌), 오프화이트 배경
(#F8FAFC), 모든 선은 짙은 네이비(#0F172A), 포인트 색은 딱 하나 — 레드오렌지(#EF4444)
— 게이지 바늘과 위험 구간에만 사용. 사실적 묘사·그라데이션·잡다한 장식 없음. 확신에
찬, 정밀한, 데이터 프로덕트 에디토리얼 느낌(블룸버그류 인포그래픽). 정사각형 중앙
정렬, 균형 잡힌 여백.
```

### 텍스트 없는 버전 (오버레이용)
```
Minimal single-line infographic diagram, square format, 1:1 aspect ratio, 680x680px, one
large circular gauge/dial in thin continuous line art, needle in the upper-right danger
zone, short radiating tick lines around the outer edge suggesting risk factors. Off-white
background (#F8FAFC), navy (#0F172A) lines, single red-orange (#EF4444) accent on needle
and danger zone only. No text, no photorealism, centered, top 20% left empty for a title
overlay.
```

---

## 스타일 D — 아이소메트릭 미니어처 지도형

도시 전체를 위에서 내려다보는 미니어처 다이오라마 느낌. "여러 매장 중 하나를 짚어낸다"는 서사를 공간감 있게 표현.

### 영문
```
Isometric miniature-diorama illustration, square format, EXACTLY 1:1 aspect ratio,
680x680px, all elements fitting inside the square frame with balanced margins.

Center-lower 70%: a small isometric city block, toy-diorama scale, with several identical
low-poly franchise storefronts arranged along a street grid, soft warm cyan-white glow
from their windows. One building glows a distinct amber-red instead, slightly larger or
subtly elevated to draw the eye, with a thin glowing ring/halo hovering above it like a
target marker (not a literal pin icon — an abstract radial glow).

Top 20%: bold centered title, clean modern Korean sans-serif:
  - Title: "폐점 재계약 리스크 조기경보 모델"
  - Subtitle: "문 닫기 전에, 먼저 압니다"

Bottom 8%: small caption "AI 기반 폐점·재계약 리스크 예측"

Style: soft isometric 3D render, matte low-poly materials (not glossy/gamey), muted deep
navy (#0F172A) base tones for the city and streets, cyan-white (#7DD3FC) window glow for
normal buildings, amber-red (#F97316-#EF4444) only for the one flagged building and its
halo. Soft ambient occlusion shadows, subtle vignette toward the square edges, calm and
precise, like a premium product-launch key visual. Centered composition, square framing.
```

### 한글
```
아이소메트릭 미니어처 다이오라마 일러스트, 정사각형 포맷, 반드시 1:1 비율, 680x680px,
모든 요소가 균형 잡힌 여백과 함께 정사각 프레임 안에 들어오게.

중앙~하단 70%: 장난감 다이오라마 스케일의 작은 아이소메트릭 도시 블록, 거리를 따라
똑같이 생긴 로우폴리 프랜차이즈 매장들이 늘어서 있고 창문에서 은은한 청백색 불빛.
그중 건물 하나만 구별되는 주황~빨강 빛을 내며, 살짝 더 크거나 미묘하게 떠 있어 시선을
끌고, 그 위로 타깃 마커처럼 얇게 빛나는 고리/헤일로(구체적인 핀 아이콘이 아니라
추상적인 방사형 광채).

상단 20%: 굵은 중앙 정렬 제목, 모던 산세리프:
  - 제목: "폐점 재계약 리스크 조기경보 모델"
  - 부제: "문 닫기 전에, 먼저 압니다"

하단 8%: 작은 캡션 "AI 기반 폐점·재계약 리스크 예측"

스타일: 부드러운 아이소메트릭 3D 렌더, 매트한 로우폴리 질감(광택/게임풍 아님), 도시와
거리는 차분한 짙은 네이비(#0F172A) 톤, 일반 건물은 청백색(#7DD3FC) 창문 빛, 표시된
건물과 헤일로만 주황~빨강(#F97316→#EF4444). 부드러운 앰비언트 오클루전 그림자,
정사각 테두리 쪽으로 은은한 비네트, 차분하고 정밀한 프리미엄 제품 런칭 키비주얼 느낌.
중앙 정렬, 정사각 프레이밍.
```

### 텍스트 없는 버전 (오버레이용)
```
Isometric miniature-diorama illustration, square format, 1:1 aspect ratio, 680x680px, a
small isometric city block with identical low-poly franchise storefronts, warm cyan-white
window glow. One building glows amber-red instead with a thin glowing halo above it like
an abstract target marker. Soft matte low-poly render, deep navy (#0F172A) base tones,
cyan-white (#7DD3FC) normal glow, amber-red (#F97316-#EF4444) flagged building only. Soft
shadows, subtle vignette, centered, top 20% left empty for a title overlay.
```

---

## 스타일 E — 맥박/심전도 에디토리얼형

"조기경보"의 시간성(아직 멈추지 않았다, 지금이 개입할 시점이다)을 가장 직접적으로 전달하는 그래프 은유.

### 영문
```
Editorial minimal poster, square format, EXACTLY 1:1 aspect ratio, 680x680px, clean
magazine-cover-style layout, all elements within the square with balanced margins.

Center: five to six thin horizontal heartbeat/pulse lines (like an ECG monitor) stacked
evenly, each a steady calm rhythmic wave in cyan-white. One line in the middle is
different: its rhythm is irregular, its peaks lower and more erratic, rendered in
amber-red, with a single small pulsing dot marking the exact point where irregularity
begins — the moment of early detection.

Top 20%: bold centered title, clean modern Korean sans-serif:
  - Title: "폐점 재계약 리스크 조기경보 모델"
  - Subtitle: "문 닫기 전에, 먼저 압니다"

Bottom 8%: small caption "AI 기반 폐점·재계약 리스크 예측"

Style: extremely minimal, mostly negative space, deep navy (#0F172A) background, thin
precise cyan-white (#7DD3FC) lines for the calm rhythms, single amber-red (#F97316-
#EF4444) line and marker dot for the at-risk one. No icons, no photorealism, feels like a
medical monitor crossed with a modern data-brand poster. Square, centered, generous
breathing room around the pulse lines.
```

### 한글
```
에디토리얼 미니멀 포스터, 정사각형 포맷, 반드시 1:1 비율, 680x680px, 깔끔한 매거진
커버 레이아웃, 모든 요소가 균형 잡힌 여백과 함께 정사각형 안에.

중앙: 5~6개의 얇은 가로 맥박/심전도 선이 고르게 쌓여 있고, 각각 차분하고 규칙적인
청백색 파형. 그중 가운데 하나만 다름 — 리듬이 불규칙하고 봉우리가 낮고 들쭉날쭉하며
주황~빨강으로 표현, 불규칙이 시작되는 지점에 작은 맥박 점 하나(조기 감지의 순간을
표시).

상단 20%: 굵은 중앙 정렬 제목, 모던 산세리프:
  - 제목: "폐점 재계약 리스크 조기경보 모델"
  - 부제: "문 닫기 전에, 먼저 압니다"

하단 8%: 작은 캡션 "AI 기반 폐점·재계약 리스크 예측"

스타일: 극도로 미니멀, 대부분 여백, 짙은 네이비(#0F172A) 배경, 차분한 파형은 얇고
정밀한 청백색(#7DD3FC) 선, 위험 파형과 마커 점만 주황~빨강(#F97316→#EF4444). 아이콘·
사실적 묘사 없음, 의료 모니터와 모던 데이터 브랜드 포스터를 섞은 느낌. 정사각형 중앙
정렬, 맥박선 주변에 여유 있는 여백.
```

### 텍스트 없는 버전 (오버레이용)
```
Editorial minimal poster, square format, 1:1 aspect ratio, 680x680px, five to six thin
horizontal heartbeat/pulse lines stacked evenly, calm rhythmic cyan-white (#7DD3FC) waves,
one middle line irregular and amber-red (#F97316-#EF4444) with a small pulsing marker dot.
Deep navy (#0F172A) background, extremely minimal, no icons, no text. Centered, top 20%
left empty for a title overlay.
```

---

## 스타일 선택 가이드
| 스타일 | 느낌 | 추천 용도 |
|---|---|---|
| A. 깜빡이는 간판 | 감성적·시네마틱 | 발표자료 표지, 스토리텔링 중심 소개 |
| B. 플랫 엠블럼 | 미니멀·로고형 | 프로필/아이콘, 반복 사용되는 브랜드 마크 |
| C. 라인아트 인포그래픽 | 정밀·데이터 중심 | 기술 리포트, 데이터사이언스 색채 강조 |
| D. 아이소메트릭 지도 | 공간감·서사적 | 프로덕트 소개, 팀 공유용 키비주얼 |
| E. 맥박/심전도 | 시간성·긴장감 | "조기경보"의 시급성을 강조하고 싶을 때 |

## 검토했던 대안 (참고용, 미채택)
- **대시보드 UI형**: OhDomi 리스크 대시보드(매장 카드+게이지+지도 핀)를 그대로 표현 — 정보량은 많지만 "제품 화면"에 가까워 프로젝트 자체의 은유로는 약함
- **위생점검 포함형**: OhDomi 실사용 기능인 AI 위생점검까지 같은 비중으로 포함 — OhDomi 전체 소개용으로는 맞지만 "우리 프로젝트(폐점 리스크 모델)" 단독 대표성은 떨어짐
- **셔터 은유**: 나란한 상점 셔터 중 하나만 반쯤 내려가고 경고등 — 스타일 A의 변형으로 흡수 가능

## 참조
- [[1. Projects/폐점 재계약 리스크 조기경보 모델]]
- [[3. Resources/OhDomi 프로젝트 - 팀 저장소 구성 및 아키텍처]]
