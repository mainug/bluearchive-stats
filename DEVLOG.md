# 블루 아카이브 총력전 통계 — 개발 로그

---

## 2026-06-25

### 메인 페이지 구현
**내용**: `app/page.tsx` redirect 제거, 유즈트렌즈(yuzutrends.app) 참고한 랜딩 페이지로 교체.  
- **현재 총력전 카드**: Supabase `seasons`에서 서버별 최신 시즌 fetch. 보스 이미지를 카드 배경으로 사용 + 다크 그라디언트 오버레이. LIVE/예정 배지, 남은 일수, 지형 배지 표시.  
- **바로가기 카드**: 총력전 목록, 학생 픽률 2열 카드.  
**버그**: `schaledb.com/images/raid/Boss_Binah.png` 경로가 실제로는 SPA index.html을 반환함(`Content-Type: text/html`). DevTools로 실제 경로 확인 — `Boss_Portrait_{Name}_Lobby.png` 패턴. `bosses.ts` 전체 imageUrl 수정.  
**파일**: `app/page.tsx`, `data/bosses.ts`

---

## 2026-06-23 (2)

### 학생 상세 페이지 개선

#### 시드 데이터 삽입
**내용**: bluearchive-torment 사이트 데이터를 직접 가져오기 어려워(수동 스크래핑 기반) 보스 약점별 캐릭터 풀을 구성해 랜덤 시드 데이터 448건 삽입. Global 7시즌, JP 11시즌 커버.  
**파일**: `scripts/seed-submissions.js`

#### lunatic 난이도 DB 제약 추가
**문제**: `submissions_difficulty_check` 제약에 'lunatic'이 없어서 삽입 불가.  
**해결**: Supabase 대시보드에서 constraint 재생성 후 시드 스크립트에 lunatic(35M~60M점) 추가해 재시드.

#### 스탠딩 일러스트 background-image 방식 전환
**문제**: SchaleDB portrait 이미지 캔버스 비율이 캐릭터마다 달라(세로형 ~532×1024, 가로형 히나 ~1400×927) `objectFit` 단일 값으로 통일 불가.  
**해결**: SchaleDB 방식 참고 — `<img>` 대신 `background-image: url() no-repeat center top / cover`로 전환. cover로 통일해 히나 날개 일부 크롭되지만 캐릭터 본체 항상 표시. 패널 너비 550px로 확대.

#### 일러스트 패널 오른쪽 경계 페이드
**해결**: 패널 오른쪽 가장자리에 `linear-gradient(to right, transparent, var(--bg-page))` 80px 오버레이 추가. 일러스트와 통계 영역 경계가 자연스럽게 전환됨.

#### 학생 상세 페이지 차트 추가
**내용**: 시즌별 픽률 테이블 위에 두 가지 시각화 차트 추가.  
- **난이도별 픽률**: lunatic/torment/insane/extreme별 픽률 가로 막대 차트 (난이도마다 색상 구분)  
- **보스별 픽률**: 해당 학생이 많이 기용된 보스 TOP 7 가로 막대 차트  
**버그**: `RawSubmission` 인터페이스에 `boss_id` 필드 누락으로 차트 데이터가 비어있던 문제 수정.  
**파일**: `app/students/[id]/page.tsx`

### 학생 상세 페이지 스크롤바 중복
**문제**: 오른쪽 통계 패널(`overflowY: auto`)과 body 기본 스크롤이 동시에 활성화되어 스크롤바가 두 개 표시됨.  
**해결**: 페이지 진입 시 `document.body.style.overflow = 'hidden'` 적용, 언마운트 시 원복. 외부 컨테이너에 `overflow: hidden`도 추가.  
**파일**: `app/students/[id]/page.tsx`

---

## 2026-06-23

### 학생 상세 스탠딩 일러스트 크기 통일
**문제**: 학생 상세 페이지 왼쪽 패널의 portrait 일러스트가 캐릭터마다 크기·위치가 들쭉날쭉.
**원인**: SchaleDB `portrait/{schaleId}.webp` 캔버스 크기가 캐릭터마다 다름(세로형 532×1024 ~ 가로형 1400×927). 기존 코드는 아래정렬(`align-items:flex-end`) + 높이 기준(`maxHeight:100%`)이라 캔버스 높이 차이가 그대로 노출됨.
**해결**: 고정 박스 `objectFit:cover` + `objectPosition:center top`으로 본체 크기 통일. 컨테이너는 가로 꽉 채우고(좌우 공백 제거) 위 20px·아래 64px 여백으로 축소 느낌. 히나처럼 가로로 넓은 캔버스는 날개 끝이 일부 크롭되지만 본체 크기는 통일됨.

### onLoad 동적 objectFit으로 인한 첫 로드/새로고침 불일치
**문제**: 일러스트가 처음 진입 시엔 위쪽에 작게 찌그러지고, 새로고침하면 정상(꽉 참)으로 나오는 비결정적 동작.
**원인**: 가로>세로 캔버스는 좌우 크롭을 피하려 `onLoad`에서 `contain`으로 동적 전환하게 했는데, `onLoad`는 이미지가 새로 로드될 때만 발화. 첫 SPA 진입은 발화 → contain(top 정렬이라 위에 작게), 새로고침은 캐시 로드라 미발화 → 초기값 cover(정상). 캐시 타이밍에 따라 결과가 달라짐.
**해결**: 동적 분기(`portraitFit` state·`onLoad`·리셋 effect) 전부 제거하고 `cover`로 고정 → 진입/새로고침 항상 동일.

### 헤더 BA 플레이스홀더 아이콘 제거
**해결**: Navbar 좌측의 미완성 "BA" 박스 아이콘 제거, "BlueStats / 블루 아카이브 통계" 텍스트만 유지.

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

### 전체 텍스트 가독성 개선 (폰트·색상·굵기)
**문제**: 다크 테마 텍스트가 회색빛으로 가독성 낮음. 라이트 테마 텍스트도 뿌옇게 보임.  
**해결**:
- Pretendard Variable 폰트 적용 (CDN dynamic-subset) — 한국어 소자 선명도 향상
- 전체 컴포넌트 font-size +4px 일괄 증가 (9개 파일 75건)
- 다크 테마: `--text-secondary` `#9EC4E0`, `--text-muted` `#6A9AB8`로 밝게
- 라이트 테마: 파란 기운 제거 → `--text-primary #0D0D0D`, `--text-secondary #222222`, `--text-muted #555555`
- `body`에 `-webkit-font-smoothing: antialiased` 추가
- 라이트 테마 `font-weight: 600`, 다크 테마 `font-weight: 400`으로 분리  
**파일**: `app/globals.css`, `app/layout.tsx`, 컴포넌트 전체

---

### CharacterPicker 스크롤바로 인한 카드 크기 변동
**문제**: 캐릭터가 많을 때 스크롤바가 생기면서 그리드 컨테이너 너비가 줄어들고, 카드가 왼쪽으로 밀려 필터링 전후 카드 크기가 달라 보임.  
**해결**: 그리드 스크롤 컨테이너에 `scrollbar-gutter: stable` 추가. 스크롤바 유무와 관계없이 항상 동일한 너비를 유지.  
**파일**: `components/total-assault/CharacterPicker.tsx`

---

### 학생 상세 페이지 일러스트 레이아웃 개선
**문제**: 스탠딩 일러스트를 `position: absolute` + `left` 수치로 위치 조정 시 캐릭터마다 일러스트 구도가 달라 통일되지 않음.  
**해결**: 컨테이너를 패널 전체 크기(`top: 20, bottom: 64, left: 0, right: 0`)로 고정하고 이미지에 `objectFit: cover, objectPosition: center top` 적용. 모든 캐릭터가 상단 중앙 기준으로 패널을 꽉 채우도록 통일.  
**파일**: `app/students/[id]/page.tsx`

---

### 학생 개별 페이지 추가
**기능**: 학생 ID 기반 상세 페이지(`/students/[id]`) 신규 추가.  
**내용**:
- 학생 프로필 (아바타, 학원, 역할, 공격/방어 타입, 한정/JP 선출시 뱃지)
- 총계 카드: 총 등장 횟수, 활동 시즌 수, 전체 픽률, 최고 픽률
- 시즌별 픽률 테이블 (보스명, 제출 수, 등장 수, 픽률 바)
- 자주 함께한 학생 코픽 TOP 8 (클릭 시 해당 학생 페이지로 이동)
- Global/JP 서버 토글
- PickRateList 학생 행 클릭 시 해당 학생 페이지로 이동 연결  
**파일**: `app/students/[id]/page.tsx`, `components/total-assault/PickRateList.tsx`

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
