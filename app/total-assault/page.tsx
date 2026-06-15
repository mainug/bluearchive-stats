'use client'

import { useState, useMemo } from 'react'
import { Upload } from 'lucide-react'
import { BOSSES } from '@/data/bosses'
import { STUDENTS } from '@/data/students'
import { Submission, StudentPickRate, Difficulty } from '@/types'
import BossTabs from '@/components/total-assault/BossTabs'
import StatCards from '@/components/total-assault/StatCards'
import PickRateList from '@/components/total-assault/PickRateList'
import TeamList from '@/components/total-assault/TeamList'
import FilterPanel, { Filters } from '@/components/total-assault/FilterPanel'
import SubmitModal from '@/components/total-assault/SubmitModal'

const CURRENT_SEASON = 52

const MOCK_SUBMISSIONS: Submission[] = [
  { id: '1', bossId: 'chesed', difficulty: 'torment', rank: 'SS', score: 5420000, party1: ['aru', 'hoshino_swimsuit', 'serina', 'chinatsu'], party2: ['iori', 'yuzu'], season: 52, createdAt: '2025-01-01' },
  { id: '2', bossId: 'chesed', difficulty: 'insane', rank: 'SS', score: 5110000, party1: ['hoshino_swimsuit', 'iori', 'serina', 'chinatsu'], party2: ['aru', 'yuzu'], season: 52, createdAt: '2025-01-01' },
  { id: '3', bossId: 'chesed', difficulty: 'extreme', rank: 'S', score: 4880000, party1: ['aru', 'serina', 'chinatsu', 'yuzu'], party2: ['iori', 'hoshino_swimsuit'], season: 52, createdAt: '2025-01-01' },
  { id: '4', bossId: 'chesed', difficulty: 'torment', rank: 'SS', score: 5380000, party1: ['aru', 'ako', 'serina', 'chinatsu'], party2: ['iori', 'ui'], season: 52, createdAt: '2025-01-01' },
  { id: '5', bossId: 'chesed', difficulty: 'insane', rank: 'S', score: 4720000, party1: ['hoshino', 'iori', 'serina', 'ui'], party2: ['aru', 'yuzu'], season: 52, createdAt: '2025-01-01' },
  { id: '6', bossId: 'binah', difficulty: 'torment', rank: 'SS', score: 6100000, party1: ['haruna', 'ako', 'serina', 'chinatsu'], party2: ['iori', 'ui'], season: 52, createdAt: '2025-01-01' },
  { id: '7', bossId: 'binah', difficulty: 'insane', rank: 'SS', score: 5900000, party1: ['aru', 'haruna', 'serina', 'chinatsu'], party2: ['iori', 'yuzu'], season: 52, createdAt: '2025-01-01' },
]

export default function TotalAssaultPage() {
  const [selectedBossId, setSelectedBossId] = useState(BOSSES[0].id)
  const [filters, setFilters] = useState<Filters>({ difficulty: 'all' })
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS)
  const [showModal, setShowModal] = useState(false)

  const selectedBoss = BOSSES.find(b => b.id === selectedBossId)!

  const filtered = useMemo(() => {
    return submissions.filter(s => {
      if (s.bossId !== selectedBossId) return false
      if (filters.difficulty !== 'all' && s.difficulty !== filters.difficulty) return false
      return true
    })
  }, [submissions, selectedBossId, filters])

  const pickRates = useMemo((): StudentPickRate[] => {
    if (filtered.length === 0) return []
    const counts: Record<string, number> = {}
    filtered.forEach(s => {
      ;[...s.party1, ...s.party2].forEach(id => {
        counts[id] = (counts[id] ?? 0) + 1
      })
    })
    return Object.entries(counts)
      .map(([id, count]) => {
        const student = STUDENTS.find(s => s.id === id)
        if (!student) return null
        return { student, pickCount: count, pickRate: (count / filtered.length) * 100 }
      })
      .filter(Boolean)
      .sort((a, b) => b!.pickRate - a!.pickRate)
      .slice(0, 8) as StudentPickRate[]
  }, [filtered])

  const avgScore = useMemo(() => {
    if (filtered.length === 0) return 0
    return Math.round(filtered.reduce((sum, s) => sum + s.score, 0) / filtered.length)
  }, [filtered])

  const ssRate = useMemo(() => {
    if (filtered.length === 0) return 0
    const ssCount = filtered.filter(s => s.rank === 'SS').length
    return Math.round((ssCount / filtered.length) * 100)
  }, [filtered])

  const handleSubmit = (data: { difficulty: Difficulty; rank: any; score: number; party1: string[]; party2: string[] }) => {
    const newSub: Submission = {
      id: Date.now().toString(),
      bossId: selectedBossId,
      season: CURRENT_SEASON,
      createdAt: new Date().toISOString(),
      ...data,
    }
    setSubmissions(prev => [newSub, ...prev])
  }

  return (
    <>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)' }}>총력전 대시보드</h1>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-accent)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
              시즌 {CURRENT_SEASON}
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
            유저 제출 데이터 기반 · {submissions.length}개 클리어 기록
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <BossTabs bosses={BOSSES} selectedId={selectedBossId} onChange={setSelectedBossId} />
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <StatCards totalSubmissions={filtered.length} avgScore={avgScore} ssRate={ssRate} />
            {pickRates.length > 0 ? (
              <PickRateList picks={pickRates} />
            ) : (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                해당 조건의 기록이 없습니다
              </div>
            )}
            {filtered.length > 0 && <TeamList submissions={filtered.slice(0, 10)} />}
          </div>

          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                내 기록 제출
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                클리어 기록을 공유해서 커뮤니티 통계에 기여해보세요
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{ width: '100%', padding: '9px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Upload size={13} />
                기록 제출하기
              </button>
            </div>

            <FilterPanel filters={filters} onChange={setFilters} totalCount={filtered.length} />

            <div style={{ background: 'var(--bg-accent)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent-text)', marginBottom: 6 }}>데이터 기여 안내</div>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                보스 클리어 후 팀 구성과 점수를 제출하면 픽률 통계에 반영됩니다. 개인 정보는 수집하지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <SubmitModal boss={selectedBoss} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  )
}
