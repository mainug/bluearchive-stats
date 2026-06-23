'use client'

import { useEffect, useState, useMemo, Suspense } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { getStudentById, getSchoolColor } from '@/data/students'
import { BOSSES, ATTACK_TYPE_LABEL } from '@/data/bosses'
import { supabase } from '@/lib/supabase'
import StudentAvatar from '@/components/ui/StudentAvatar'

const ARMOR_LABEL: Record<string, string> = {
  light: '경장갑', heavy: '중장갑', special: '특수장갑', elastic: '탄성장갑', composite: '복합장갑',
}
const ROLE_LABEL: Record<string, string> = { striker: '스트라이커', special: '스페셜' }
const SCHOOL_KO: Record<string, string> = {
  Gehenna: '게헨나', Trinity: '트리니티', Millennium: '밀레니엄', Abydos: '아비도스',
  Hyakkiyako: '백귀야행', RedWinter: '레드윈터', Shanhaijing: '산해경', Arius: '아리우스',
  SRT: 'SRT', Valkyrie: '발키리', WildHunt: '와일드헌트', Highlander: '하이랜더',
  Sakugawa: '사쿠가와', Tokiwadai: '토키와다이', ETC: '기타',
}

interface SeasonRow {
  season: number
  server: string
  boss_id: string | null
  start_date: string | null
  end_date: string | null
}

interface RawSubmission {
  id: string
  season: number
  boss_id: string
  difficulty: string
  score: number
  parties: string[][]
  created_at: string
}

interface SeasonStat {
  season: number
  bossId: string | null
  totalSubmissions: number
  appearances: number
  pickRate: number
}

interface CoPick {
  student: ReturnType<typeof getStudentById>
  count: number
}

const NAVBAR_H = 52

export default function StudentDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 17 }}>불러오는 중...</div>}>
      <StudentDetailContent />
    </Suspense>
  )
}

function StudentDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const studentId = params.id as string
  const server = (searchParams.get('server') ?? 'global') as 'global' | 'jp'

  const student = getStudentById(studentId)
  const [allSubmissions, setAllSubmissions] = useState<RawSubmission[]>([])
  const [seasons, setSeasons] = useState<SeasonRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [{ data: seasonsData }, { data: subsData }] = await Promise.all([
        supabase.from('seasons').select('*').eq('server', server).order('season', { ascending: false }),
        supabase.from('submissions').select('*').order('created_at', { ascending: false }).limit(5000),
      ])
      setSeasons(seasonsData ?? [])
      setAllSubmissions(subsData ?? [])
      setLoading(false)
    }
    fetchData()
  }, [server])

  const serverSeasonNums = useMemo(() => new Set(seasons.map(s => s.season)), [seasons])

  const studentSubmissions = useMemo(() =>
    allSubmissions.filter(s =>
      serverSeasonNums.has(s.season) &&
      s.parties.some(party => party.includes(studentId))
    ), [allSubmissions, serverSeasonNums, studentId])

  const seasonStats = useMemo((): SeasonStat[] => {
    const allServerSubs = allSubmissions.filter(s => serverSeasonNums.has(s.season))
    return seasons.map(season => {
      const totalSubs = allServerSubs.filter(s => s.season === season.season)
      const appearances = totalSubs.filter(s => s.parties.some(p => p.includes(studentId)))
      return {
        season: season.season,
        bossId: season.boss_id,
        totalSubmissions: totalSubs.length,
        appearances: appearances.length,
        pickRate: totalSubs.length > 0 ? (appearances.length / totalSubs.length) * 100 : 0,
      }
    }).filter(s => s.totalSubmissions > 0)
  }, [allSubmissions, seasons, serverSeasonNums, studentId])

  const coPicks = useMemo((): CoPick[] => {
    const counts: Record<string, number> = {}
    studentSubmissions.forEach(sub => {
      sub.parties.forEach(party => {
        if (!party.includes(studentId)) return
        party.forEach(id => {
          if (id === studentId) return
          counts[id] = (counts[id] ?? 0) + 1
        })
      })
    })
    return Object.entries(counts)
      .map(([id, count]) => ({ student: getStudentById(id), count }))
      .filter(x => x.student != null)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) as CoPick[]
  }, [studentSubmissions, studentId])

  const DIFF_LABEL: Record<string, string> = { lunatic: '루나틱', torment: '토먼트', insane: '인세인', extreme: '익스트림' }
  const DIFF_COLOR: Record<string, string> = { lunatic: '#c084fc', torment: '#f87171', insane: '#60a5fa', extreme: '#4ade80' }

  const difficultyStats = useMemo(() => {
    const validKeys = new Set(seasons.map(s => `${s.season}|${s.boss_id}`))
    return ['lunatic', 'torment', 'insane', 'extreme'].map(diff => {
      const total = allSubmissions.filter(s => validKeys.has(`${s.season}|${s.boss_id}`) && s.difficulty === diff)
      const appearances = total.filter(s => s.parties.some(p => p.includes(studentId)))
      return { diff, total: total.length, appearances: appearances.length, pickRate: total.length > 0 ? appearances.length / total.length * 100 : 0 }
    }).filter(d => d.total > 0)
  }, [allSubmissions, seasons, studentId])

  const bossStats = useMemo(() => {
    const map = new Map<string, { total: number; appearances: number }>()
    seasons.forEach(s => {
      if (!s.boss_id) return
      const subs = allSubmissions.filter(sub => sub.season === s.season && sub.boss_id === s.boss_id)
      const app = subs.filter(sub => sub.parties.some(p => p.includes(studentId)))
      const prev = map.get(s.boss_id) ?? { total: 0, appearances: 0 }
      map.set(s.boss_id, { total: prev.total + subs.length, appearances: prev.appearances + app.length })
    })
    return Array.from(map.entries())
      .map(([bossId, d]) => ({ bossId, nameKo: BOSSES.find(b => b.id === bossId)?.nameKo ?? bossId, ...d, pickRate: d.total > 0 ? d.appearances / d.total * 100 : 0 }))
      .filter(b => b.appearances > 0)
      .sort((a, b) => b.pickRate - a.pickRate)
      .slice(0, 7)
  }, [allSubmissions, seasons, studentId])

  const totalAppearances = studentSubmissions.length
  const activeSeasonsCount = seasonStats.filter(s => s.appearances > 0).length
  const bestPickRate = seasonStats.length > 0 ? Math.max(...seasonStats.map(s => s.pickRate)) : 0
  const overallPickRate = useMemo(() => {
    const totalSubs = allSubmissions.filter(s => serverSeasonNums.has(s.season)).length
    return totalSubs > 0 ? (totalAppearances / totalSubs) * 100 : 0
  }, [allSubmissions, serverSeasonNums, totalAppearances])

  if (!student) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 17 }}>학생을 찾을 수 없어요</div>
  }

  const schoolColor = getSchoolColor(student.school)
  const portraitUrl = `https://schaledb.com/images/student/portrait/${student.schaleId}.webp`


  return (
    <div style={{ display: 'flex', height: `calc(100vh - ${NAVBAR_H}px)` }}>

      {/* ── 왼쪽: 캐릭터 일러스트 패널 ── */}
      <div style={{
        width: 550,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${schoolColor.bg}cc 0%, var(--bg-page) 100%)`,
      }}>
        {/* 배경 원형 글로우 */}
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: 280, height: 280, borderRadius: '50%',
          background: `radial-gradient(circle, ${schoolColor.bg}88 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />

        {/* 뒤로가기 */}
        <button
          onClick={() => router.back()}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: 20, cursor: 'pointer', color: '#fff', fontSize: 14, padding: '6px 12px', backdropFilter: 'blur(4px)' }}
        >
          <ArrowLeft size={13} />
          뒤로가기
        </button>

        {/* 스탠딩 일러스트 — SchaleDB 방식: background contain + scale 확대 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
            backgroundImage: `url(${portraitUrl})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center top',
            backgroundSize: 'cover',
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))',
          }}
        />

        {/* 오른쪽 경계 페이드 */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0, right: 0, width: 80,
          background: 'linear-gradient(to right, transparent, var(--bg-page))',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* 하단 이름 오버레이 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
          padding: '32px 20px 20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: schoolColor.bg, color: schoolColor.text }}>
              {SCHOOL_KO[student.school] ?? student.school}
            </span>
            {student.isLimited && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'rgba(251,191,36,0.2)', color: '#FCD34D', border: '1px solid rgba(251,191,36,0.4)' }}>한정</span>
            )}
            {!student.released && (
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: 'rgba(99,102,241,0.2)', color: '#A5B4FC', border: '1px solid rgba(99,102,241,0.4)' }}>JP 선출시</span>
            )}
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{student.nameKo}</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 3 }}>
            {ROLE_LABEL[student.role]} · {ATTACK_TYPE_LABEL[student.attackType]} · {ARMOR_LABEL[student.armorType]}
          </div>
        </div>
      </div>

      {/* ── 오른쪽: 통계 ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-page)' }}>
        {/* 상단 바 */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StudentAvatar student={student} size={36} radius={8} fontSize={10} />
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>{student.nameKo} 통계</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['global', 'jp'] as const).map(s => (
              <button key={s} onClick={() => router.push(`/students/${studentId}?server=${s}`)} style={{
                padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                border: `1px solid ${server === s ? 'var(--accent)' : 'var(--border)'}`,
                background: server === s ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                color: server === s ? 'var(--accent)' : 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                {s === 'jp' ? 'JP' : 'Global'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* 총계 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: '총 등장', value: `${totalAppearances}회` },
              { label: '활동 시즌', value: `${activeSeasonsCount}시즌` },
              { label: '전체 픽률', value: `${overallPickRate.toFixed(1)}%`, accent: true },
              { label: '최고 픽률', value: `${bestPickRate.toFixed(1)}%`, accent: true },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25, ease: 'easeOut' }}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: card.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {loading ? '—' : card.value}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 3 }}>{card.label}</div>
              </motion.div>
            ))}
          </div>

          {/* 차트 행 */}
          <div style={{ display: 'flex', gap: 14 }}>
            {/* 난이도별 픽률 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>난이도별 픽률</div>
              {loading ? <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>불러오는 중...</div> :
                difficultyStats.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>데이터 없음</div> :
                difficultyStats.map((d, i) => (
                  <div key={d.diff} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < difficultyStats.length - 1 ? 10 : 0 }}>
                    <span style={{ width: 52, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0, textAlign: 'right' }}>{DIFF_LABEL[d.diff]}</span>
                    <div style={{ flex: 1, height: 18, background: 'var(--bg-surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.pickRate}%` }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        style={{ height: '100%', background: DIFF_COLOR[d.diff], borderRadius: 4 }}
                      />
                    </div>
                    <span style={{ width: 42, fontSize: 13, fontWeight: 600, color: DIFF_COLOR[d.diff], textAlign: 'right', flexShrink: 0 }}>{d.pickRate.toFixed(1)}%</span>
                  </div>
                ))
              }
            </motion.div>

            {/* 보스별 픽률 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>보스별 픽률</div>
              {loading ? <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>불러오는 중...</div> :
                bossStats.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: 14, padding: '12px 0' }}>데이터 없음</div> :
                bossStats.map((b, i) => (
                  <div key={b.bossId} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: i < bossStats.length - 1 ? 10 : 0 }}>
                    <span style={{ width: 64, fontSize: 13, color: 'var(--text-secondary)', flexShrink: 0, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.nameKo}</span>
                    <div style={{ flex: 1, height: 18, background: 'var(--bg-surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(b.pickRate / bossStats[0].pickRate) * 100}%` }}
                        transition={{ delay: 0.2 + i * 0.06, duration: 0.5, ease: 'easeOut' }}
                        style={{ height: '100%', background: 'var(--accent)', borderRadius: 4, opacity: 0.85 + 0.15 * (1 - i / bossStats.length) }}
                      />
                    </div>
                    <span style={{ width: 42, fontSize: 13, fontWeight: 600, color: 'var(--accent-text)', textAlign: 'right', flexShrink: 0 }}>{b.pickRate.toFixed(1)}%</span>
                  </div>
                ))
              }
            </motion.div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            {/* 시즌 픽률 테이블 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.25, ease: 'easeOut' }}
              style={{ flex: 1, minWidth: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                시즌별 픽률
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>불러오는 중...</div>
              ) : seasonStats.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>데이터 없음</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['시즌', '보스', '제출', '등장', '픽률'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: h === '시즌' || h === '보스' ? 'left' : 'right', fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seasonStats.filter(s => s.appearances > 0).map((row, i, arr) => {
                      const boss = BOSSES.find(b => b.id === row.bossId)
                      const maxRate = Math.max(...arr.map(s => s.pickRate))
                      return (
                        <motion.tr
                          key={row.season}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.18 + i * 0.025 }}
                          style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--bg-surface-2)' : 'none' }}
                        >
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)', fontWeight: 500 }}>S{row.season}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{boss?.nameKo ?? '—'}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.totalSubmissions}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.appearances}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                              <div style={{ width: 56, height: 4, background: 'var(--bg-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: maxRate > 0 ? `${(row.pickRate / maxRate) * 100}%` : '0%' }}
                                  transition={{ delay: 0.28 + i * 0.025, duration: 0.5, ease: 'easeOut' }}
                                  style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
                                />
                              </div>
                              <span style={{ color: row.pickRate > 0 ? 'var(--accent-text)' : 'var(--text-muted)', fontWeight: row.pickRate > 0 ? 600 : 400, minWidth: 40, textAlign: 'right' }}>
                                {row.pickRate > 0 ? `${row.pickRate.toFixed(1)}%` : '—'}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </motion.div>

            {/* 코픽 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.25, ease: 'easeOut' }}
              style={{ width: 240, flexShrink: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                자주 함께한 학생
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>불러오는 중...</div>
              ) : coPicks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>데이터 없음</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {coPicks.map((cp, i) => (
                    <motion.div
                      key={cp.student!.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.04, duration: 0.2 }}
                      onClick={() => router.push(`/students/${cp.student!.id}?server=${server}`)}
                      className="hover-surface"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 4px', borderRadius: 7, cursor: 'pointer' }}
                    >
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                      <StudentAvatar student={cp.student!} size={34} radius={8} fontSize={9} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {cp.student!.nameKo}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cp.count}회</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
