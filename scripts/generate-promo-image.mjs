#!/usr/bin/env node
// NVIDIA FLUX.1-dev로 메뉴 홍보 이미지를 생성하는 프로토타입.
// 사용법:
//   NVIDIA_API_KEY=nvapi-xxx node generate-promo-image.mjs \
//     --menu "냉짬뽕" --season "여름" \
//     --scene "Korean cold spicy seafood noodle soup with ice, shrimp, mussels, red broth, black stone bowl, bright summer commercial food photography" \
//     --out ./output
//
// 주의(직접 확인함): FLUX.1-dev는 한국어 프롬프트를 신뢰할 수 없게 해석함
// (텍스트가 깨지고 엉뚱한 이미지가 나옴). --scene은 반드시 영어 장면 묘사로 넣을 것.
// --menu/--season은 파일명과 로그용 메타데이터일 뿐, 프롬프트에 그대로 섞지 않음.
//
// --price와 --copy(JSON 문자열, 예: '{"emotional":"...","highlight":"...","cta":"..."}')를
// 넘기면 이미지와 같은 이름의 manifest.json도 함께 생성됨 — 테이블오더 화면이 바로 읽을 수 있는 형태.

const ENDPOINT = "https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, "");
    args[key] = argv[i + 1];
  }
  return args;
}

async function main() {
  const { menu, season, scene, price, copy, out = ".", seed = "0", steps = "30" } = parseArgs(process.argv.slice(2));

  if (!scene) {
    console.error("사용법: --scene \"<영어 장면 묘사>\" 는 필수입니다. (--menu, --season은 선택, 파일명용)");
    process.exit(1);
  }
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    console.error("환경변수 NVIDIA_API_KEY가 설정되어 있지 않습니다.");
    process.exit(1);
  }

  const prompt = `Professional commercial food advertisement photo. ${scene}. Appetizing, vibrant colors, studio lighting, high detail.`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      mode: "base",
      seed: Number(seed),
      cfg_scale: 3.5,
      steps: Number(steps),
    }),
  });

  if (!res.ok) {
    console.error(`API 오류 (HTTP ${res.status}):`, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  const artifact = data.artifacts?.[0];
  if (!artifact || artifact.finishReason !== "SUCCESS") {
    console.error("생성 실패:", JSON.stringify(data));
    process.exit(1);
  }

  const fs = await import("node:fs");
  const path = await import("node:path");
  fs.mkdirSync(out, { recursive: true });

  const slug = (menu || "promo").replace(/[^\w가-힣-]/g, "_");
  const filename = `${slug}_${season || ""}_${Date.now()}.jpg`.replace(/_+/g, "_");
  const filepath = path.join(out, filename);

  fs.writeFileSync(filepath, Buffer.from(artifact.base64, "base64"));
  console.log(`저장됨: ${filepath}`);

  if (copy) {
    const manifest = {
      menu: menu || null,
      season: season || null,
      price: price || null,
      copy: JSON.parse(copy),
      image_path: filepath,
      generated_at: new Date().toISOString(),
    };
    const manifestPath = filepath.replace(/\.jpg$/, ".json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`매니페스트 저장됨: ${manifestPath}`);
  }
}

main();
