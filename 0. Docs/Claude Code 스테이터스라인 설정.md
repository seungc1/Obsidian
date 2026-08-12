---
title: "Claude Code 스테이터스라인 설정"
doc_type: "howto"
created: "2026-07-28"
updated: "2026-07-28"
owner: "kamwoo"
summary: "PowerShell 기반 Claude Code statusLine 설정 - 폴더명/브랜치/모델/컨텍스트%/5시간 사용량 표시"
scope: "Claude Code CLI 전역 설정 (사용자 홈, vault 외부)"
audience: "본인"
keywords: ["claude-code", "statusline", "powershell", "settings.json"]
status: "active"
---

# Claude Code 스테이터스라인 설정

## 개요

Claude Code CLI 하단에 한 줄 상태 표시줄을 PowerShell 스크립트로 구성.

표시 항목: 현재 폴더명 → git 브랜치 → 모델명 → 컨텍스트 사용률(프로그레스바) → 5시간 사용량 한도.

출력 예시:
```
BigProject | master | Sonnet 5 | [■■■■□□□□□□] 40% | 5h: 12%
```

## 파일 위치

- 스크립트: `C:\Users\yooyj\.claude\statusline.ps1`
- 연결 설정: `C:\Users\yooyj\.claude\settings.json` → `statusLine` 필드

```json
"statusLine": {
  "type": "command",
  "command": "powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"C:/Users/yooyj/.claude/statusline.ps1\""
}
```

## 동작 방식

Claude Code가 매 렌더링 시 stdin으로 JSON을 넘겨주고, 스크립트가 이를 파싱해 한 줄로 출력:

- `workspace.current_dir` / `cwd` → 폴더명 (Split-Path -Leaf)
- `git --no-optional-locks rev-parse --abbrev-ref HEAD` → 브랜치 (git repo 아니면 생략)
- `model.display_name` → 모델명
- `context_window.used_percentage` → `[██░░]` 형태 프로그레스바
- `rate_limits.five_hour.used_percentage` → 5시간 한도 (세션 첫 응답 등 값이 없으면 자동 생략)

## 확인 방법

새 Claude Code 세션을 열면 하단에 바로 표시됨. 수동 테스트:

```powershell
echo '{"model":{"display_name":"Test"},"workspace":{"current_dir":"C:\\path"},"context_window":{"used_percentage":42}}' | powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:/Users/yooyj/.claude/statusline.ps1"
```

## 미포함 항목

7일 사용량 한도, PR 배지, vim 모드 표시는 요청 범위 밖이라 생략. 필요 시 동일한 패턴으로 `statusline.ps1`에 추가.

## Changelog
- 2026-07-28: ■/□가 콘솔에서 깨져 보이는 문제 - 스크립트 상단에 `[Console]::OutputEncoding = UTF8` 추가해 stdout 인코딩 고정
- 2026-07-28: 프로그레스바 문자를 #/- 에서 ■/□ 로 변경 (저장 시 UTF-8 BOM 필수 - 비ASCII 문자라 안 하면 파싱 에러)
- 2026-07-28: 프로그레스바 문자를 █/░ 에서 #/- 로 변경 (인코딩 이슈 재발 방지 겸 가독성)
- 2026-07-28: statusline.ps1이 UTF-8(BOM 없음)으로 저장되어 █/░ 문자가 깨져 파싱 에러 발생 - UTF-8 BOM으로 재저장하여 수정
- 2026-07-28: 초기 작성 - statusline.ps1 및 settings.json 연결 완료
