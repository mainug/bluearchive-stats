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

---

### students.ts released 플래그 전원 true 오류
**문제**: students.ts 194명 전원이 `released: true`로 표기돼 있었으나, SchaleDB의 `IsReleased[1]`(Global 기준) 확인 결과 22명이 실제로는 미출시 상태.  
**원인**: 데이터 초기 입력 시 Global 출시 여부를 확인하지 않고 전원 true로 입력.  
**해결**: SchaleDB JSON(`IsReleased[1]=false`)과 schaleId 교차 검증 후 22명을 `released: false`로 수정.  
미출시 22명: 카요코/아루(드레스), 아카리(새해), 우미카, 츠바키(가이드), 카즈사/요시미/아이리(밴드), 키라라, 모모이/미도리(메이드), 세리카/칸나/후부키/키리노/모에/아츠코/사오리/히요리(수영복), 호시노(무장), 시로코\*테러.  
**참고 출처**: SchaleDB GitHub(`IsReleased` 필드), blue-utils.me(JP 전용 이탤릭 표시) 교차 확인.

---

### 학생 데이터 대규모 누락 및 전면 갱신
**문제**: 데이터 소스로 사용하던 `lonqie/SchaleDB` GitHub JSON이 최신화되지 않아 194명만 있었음. 실제 schaledb.com 기준 264명.  
누락 현황: Global 출시 57명 미포함, JP 선출시 13명 미포함.  
또한 기존 released:false로 잘못 표시한 22명이 실제로는 모두 Global 출시 완료 상태였음.  
**원인**: 데이터 소스를 GitHub raw JSON(`lonqie/SchaleDB`)으로 사용했는데, 이 레포가 schaledb.com보다 한참 뒤처져 있었음.  
**해결**:
- 데이터 소스를 `schaledb.com/data/en(kr)/students.min.json`으로 교체
- 누락 70명(Global 57 + JP 선출시 13) 추가 → 총 264명
- 기존 22명 released:false → released:true로 수정 → 최종 Global 251명 / JP 선출시 13명
- 신규 학교 WildHunt, Highlander 추가 (SCHOOL_COLORS + CharacterPicker)
- 신규 방어타입 composite 추가 (ArmorType)

### JP 픽커 서버 인식 버그
**문제**: CharacterPicker가 server prop을 받지 않아 JP 서버 제출 시에도 released:false 캐릭터(JP 선출시 13명)가 필터링됨.  
**해결**: `server?: 'global' | 'jp'` prop을 `page.tsx → SubmitModal → CharacterPicker`로 전달. 필터 조건: `if (!s.released && server !== 'jp') return false`.

---

### CharacterPicker 스크롤바로 인한 카드 크기 변동
**문제**: 캐릭터가 많을 때 스크롤바가 생기면서 그리드 컨테이너 너비가 줄어들고, 카드가 왼쪽으로 밀려 필터링 전후 카드 크기가 달라 보임.  
**해결**: 그리드 스크롤 컨테이너에 `scrollbar-gutter: stable` 추가. 스크롤바 유무와 관계없이 항상 동일한 너비를 유지.  
**파일**: `components/total-assault/CharacterPicker.tsx`

---

### CharacterPicker 공격/방어 타입 필터 추가
**문제**: 학원(school) 필터만 있어서 약점 속성이나 방어 타입 기준으로 캐릭터를 찾기 불편했음.  
**해결**: 공격 타입(폭발/관통/신비/진동) · 방어 타입(경/중/특수/탄성/복합장갑) 필터 행 추가. 기존 학원 필터와 AND 조합으로 동작.  
**파일**: `components/total-assault/CharacterPicker.tsx`

---

### 학생 아이콘 이미지 미표시 (신규 캐릭터)
**문제**: `StudentAvatar`가 `raw.githubusercontent.com/SchaleDB/SchaleDB` GitHub raw URL에서 이미지를 가져왔는데, JSON 데이터가 outdated였던 것처럼 이미지 레포도 새로 추가한 70명의 이미지가 없을 수 있음.  
**해결**: 이미지 URL을 `schaledb.com/images/student/icon/{schaleId}.webp`로 교체. 데이터 소스와 동일한 최신 소스를 쓰므로 264명 전원 커버.  
**파일**: `components/ui/StudentAvatar.tsx:14`
