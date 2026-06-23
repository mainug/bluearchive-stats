'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { STUDENTS, getStudentById, getSchoolColor } from '@/data/students'
import { BOSSES, ATTACK_TYPE_LABEL } from '@/data/bosses'
import { supabase } from '@/lib/supabase'
import StudentAvatar from '@/components/ui/StudentAvatar'

const ARMOR_LABEL: Record<string, string> = {
  light: '경장갑', heavy: '중장갑', special: '특수장갑', elastic: '탄성장갑', composite: '복합장갑',
}
const ROLE_LABEL: Record<string, string> = { striker: '스트라이커', special: '스페셜' }

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

  const totalAppearances = studentSubmissions.length
  const activeSeasonsCount = seasonStats.filter(s => s.appearances > 0).length
  const bestPickRate = seasonStats.length > 0 ? Math.max(...seasonStats.map(s => s.pickRate)) : 0
  const overallPickRate = useMemo(() => {
    const totalSubs = allSubmissions.filter(s => serverSeasonNums.has(s.season)).length
    return totalSubs > 0 ? (totalAppearances / totalSubs) * 100 : 0
  }, [allSubmissions, serverSeasonNums, totalAppearances])

  if (!student) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 17 }}>
        학생을 찾을 수 없어요
      </div>
    )
  }

  const schoolColor = getSchoolColor(student.school)

  return (
    <>
      {/* 헤더 */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 20px' }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16, marginBottom: 14, padding: 0 }}
          >
            <ArrowLeft size={13} />
            뒤로가기
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 20, stiffness: 300 }}>
              <StudentAvatar student={student} size={80} radius={16} fontSize={16} />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05, duration: 0.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{student.nameKo}</h1>
                <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: schoolColor.bg, color: schoolColor.text }}>
                  {student.school}
                </span>
                {student.isLimited && (
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(251,191,36,0.15)', color: '#F59E0B', border: '1px solid rgba(251,191,36,0.3)' }}>
                    한정
                  </span>
                )}
                {!student.released && (
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'rgba(99,102,241,0.15)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.3)' }}>
                    JP 선출시
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 14, fontSize: 15, color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                <span>{ROLE_LABEL[student.role]}</span>
                <span>·</span>
                <span>공격: {ATTACK_TYPE_LABEL[student.attackType]}</span>
                <span>·</span>
                <span>방어: {ARMOR_LABEL[student.armorType]}</span>
              </div>
            </motion.div>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              {(['global', 'jp'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => router.push(`/students/${studentId}?server=${s}`)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                    border: `1px solid ${server === s ? 'var(--accent)' : 'var(--border)'}`,
                    background: server === s ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                    color: server === s ? 'var(--accent)' : 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {s === 'jp' ? 'JP' : 'Global'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
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
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.3, ease: 'easeOut' }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
            >
              <div style={{ fontSize: 24, fontWeight: 700, color: card.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
                {loading ? '—' : card.value}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>{card.label}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* 시즌 픽률 테이블 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3, ease: 'easeOut' }}
            style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', minWidth: 0 }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              시즌별 픽률
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 15 }}>불러오는 중...</div>
            ) : seasonStats.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 15 }}>데이터 없음</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['시즌', '보스', '제출', '등장', '픽률'].map(h => (
                        <th key={h} style={{ padding: '6px 10px', textAlign: h === '시즌' || h === '보스' ? 'left' : 'right', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {seasonStats.map((row, i) => {
                      const boss = BOSSES.find(b => b.id === row.bossId)
                      const maxRate = Math.max(...seasonStats.map(s => s.pickRate))
                      return (
                        <motion.tr
                          key={row.season}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 + i * 0.03 }}
                          style={{ borderBottom: i < seasonStats.length - 1 ? '1px solid var(--bg-surface-2)' : 'none' }}
                        >
                          <td style={{ padding: '8px 10px', color: 'var(--text-primary)', fontWeight: 500 }}>S{row.season}</td>
                          <td style={{ padding: '8px 10px', color: 'var(--text-secondary)' }}>{boss?.nameKo ?? '—'}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.totalSubmissions}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-muted)' }}>{row.appearances}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                              <div style={{ width: 60, height: 4, background: 'var(--bg-surface-2)', borderRadius: 2, overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: maxRate > 0 ? `${(row.pickRate / maxRate) * 100}%` : '0%' }}
                                  transition={{ delay: 0.3 + i * 0.03, duration: 0.5, ease: 'easeOut' }}
                                  style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
                                />
                              </div>
                              <span style={{ color: row.pickRate > 0 ? 'var(--accent-text)' : 'var(--text-muted)', fontWeight: row.pickRate > 0 ? 500 : 400, minWidth: 42, textAlign: 'right' }}>
                                {row.pickRate > 0 ? `${row.pickRate.toFixed(1)}%` : '—'}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>

          {/* 코픽 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
            style={{ width: 240, flexShrink: 0, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
              자주 함께한 학생
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 15 }}>불러오는 중...</div>
            ) : coPicks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 15 }}>데이터 없음</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {coPicks.map((cp, i) => (
                  <motion.div
                    key={cp.student!.id}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.05, duration: 0.25 }}
                    onClick={() => router.push(`/students/${cp.student!.id}?server=${server}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', borderRadius: 7, cursor: 'pointer' }}
                    whileHover={{ background: 'var(--bg-surface-2)' } as any}
                  >
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', width: 16, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
                    <StudentAvatar student={cp.student!} size={36} radius={8} fontSize={9} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cp.student!.nameKo}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cp.count}회</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  )
}
