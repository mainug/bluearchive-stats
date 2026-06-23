# 블루 아카이브 총력전 통계 — 개발 로그

---

## 2026-06-23

### DB 서버 데이터 혼용 문제
**문제**: `seasons` 테이블에 JP 날짜 데이터가 Global 서버 행으로 잘못 삽입됨.  
`server` 컬럼 추가 전에 JP SQL을 실행했더니 기본값 `global`로 들어가 Global S84-S89가 생성됨.  
**해결**: `DELETE FROM seasons WHERE server = 'global' AND season > 83` 후 Global S1-S83 정확한 날짜로 재삽입.

---

### is_current 수동 관리 문제
**문제**: DB의 `is_current` 컬럼을 시즌이 바뀔 때마다 SQL로 수동 업데이트해야 했음.  
**해결**: `is_current` 제거하고 프론트에서 `start_date <= today <= end_date` 날짜 비교로 자동 계산.

---

### PK 충돌 문제
**문제**: `server` 컬럼 추가 후 `ADD PRIMARY KEY (season, server)` 실행 시 duplicate key 에러.  
원인: JP SQL을 이미 실행한 상태에서 `UPDATE seasons SET server = 'global'`로 전부 global이 됐고,  
그 상태에서 JP INSERT를 다시 하면 (season, global) 중복 발생.  
**해결**: 순서 정리 — ADD COLUMN → UPDATE → DROP CONSTRAINT → ADD PRIMARY KEY → JP INSERT 순으로 실행.

---

### 지형·지역 표기 통일
**문제**: 게임 내 표기와 달리 아웃도어/인도어로 표시됨.  
**해결**: `TERRAIN_LABEL` 및 `TerrainBadge` 수정 — outdoor→야외, indoor→실내, urban→시가전.

---

### 파티 구성 역할 미분리
**문제**: 파티 편성 시 스트라이커/스페셜 구분 없이 최대 4명만 선택 가능했음.  
실제 게임은 스트라이커 4명 + 스페셜 2명 = 6명 구성.  
**해결**: `Party` 타입을 `{ strikers: string[], specials: string[] }`로 변경.  
`CharacterPicker`에 `roleFilter` 추가, `PartyRow`를 스트라이커/스페셜 슬롯 분리 표시로 재설계.  
저장 시 `[...strikers, ...specials]` flat 배열로 변환해 Supabase 스키마 유지.

---

### 미출시 캐릭터 픽커 노출
**문제**: `released: false`인 학생도 파티 편성 픽커에서 선택 가능했음.  
**해결**: `CharacterPicker`의 `filtered` 조건에 `if (!s.released) return false` 추가.  
새 캐릭터 추가 시 `released: false`로 시작, 실제 출시 후 `true`로 업데이트하는 방식으로 관리.
