'use client'

import { Suspense, useState, useMemo, useEffect, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Upload, RefreshCw, ArrowLeft } from 'lucide-react'
import { BOSSES, getAvailableDifficulties } from '@/data/bosses'
import { STUDENTS } from '@/data/students'
import { Submission, StudentPickRate, Difficulty } from '@/types'
import { supabase } from '@/lib/supabase'
import StatCards from '@/components/total-assault/StatCards'
import PickRateList from '@/components/total-assault/PickRateList'
import TeamList from '@/components/total-assault/TeamList'
import FilterPanel, { Filters } from '@/components/total-assault/FilterPanel'
import SubmitModal from '@/components/total-assault/SubmitModal'

interface Season {
  season: number
  boss_id: string | null
  start_date: string | null
  end_date: string | null
  is_current: boolean
  server: string
}

export default function SeasonDetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 15 }}>불러오는 중...</div>}>
      <SeasonDetailContent />
    </Suspense>
  )
}

function SeasonDetailContent() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const seasonNum = Number(params.season)
  const server = searchParams.get('server') ?? 'global'

  const [filters, setFilters] = useState<Filters>({ difficulty: 'all' })
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [seasonInfo, setSeasonInfo] = useState<Season | null>(null)

  useEffect(() => {
    async function fetchSeason() {
      const { data } = await supabase
        .from('seasons')
        .select('*')
        .eq('season', seasonNum)
        .eq('server', server)
        .single()
      if (data) setSeasonInfo(data)
    }
    if (seasonNum) fetchSeason()
  }, [seasonNum, server])

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('season', seasonNum)
      .order('created_at', { ascending: false })
      .limit(500)

    if (!error && data) {
      setSubmissions(data.map(row => ({
        id: row.id,
        bossId: row.boss_id,
        difficulty: row.difficulty,
        score: row.score,
        parties: row.parties ?? [],
        season: row.season,
        createdAt: row.created_at,
      })))
    }
    setLoading(false)
  }, [seasonNum])

  useEffect(() => {
    if (seasonNum) fetchSubmissions()
  }, [seasonNum, fetchSubmissions])

  const currentBoss = BOSSES.find(b => b.id === seasonInfo?.boss_id)
  const today = new Date().toISOString().slice(0, 10)
  const isCurrent = !!seasonInfo?.start_date && !!seasonInfo?.end_date
    && today >= seasonInfo.start_date && today <= seasonInfo.end_date
  const availableDifficulties = getAvailableDifficulties(server, seasonNum)

  const filtered = useMemo(() => {
    if (filters.difficulty === 'all') return submissions
    return submissions.filter(s => s.difficulty === filters.difficulty)
  }, [submissions, filters])

  const pickRates = useMemo((): StudentPickRate[] => {
    if (filtered.length === 0) return []
    const counts: Record<string, number> = {}
    filtered.forEach(s => {
      s.parties.flat().forEach(id => {
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

  const handleSubmit = async (data: {
    difficulty: Difficulty
    score: number
    parties: string[][]
  }) => {
    const { error } = await supabase.from('submissions').insert({
      boss_id: seasonInfo?.boss_id ?? null,
      difficulty: data.difficulty,
      score: data.score,
      parties: data.parties,
      season: seasonNum,
    })
    if (error) throw new Error(error.message)
    await fetchSubmissions()
  }

  return (
    <>
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>
          <button
            onClick={() => router.push('/total-assault')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, marginBottom: 8, padding: 0 }}
          >
            <ArrowLeft size={13} />
            시즌 목록으로
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>총력전 대시보드</h1>
            <span style={{ fontSize: 13, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-accent)', color: 'var(--accent)', border: '1px solid var(--border-strong)' }}>
              시즌 {seasonNum}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              {server === 'jp' ? 'JP' : 'Global'}
            </span>
            {isCurrent && (
              <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: 'var(--accent)', color: '#fff' }}>
                진행중
              </span>
            )}
            {currentBoss && (
              <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>
                {currentBoss.nameKo}
              </span>
            )}
            {seasonInfo?.start_date && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {seasonInfo.start_date} ~ {seasonInfo.end_date ?? '진행중'}
              </span>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 3 }}>
            유저 제출 데이터 기반 · {submissions.length.toLocaleString()}개 클리어 기록
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <StatCards totalSubmissions={filtered.length} avgScore={avgScore} />

            {loading ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 15, color: 'var(--text-muted)' }}>데이터 불러오는 중...</div>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 48, textAlign: 'center' }}>
                <div style={{ fontSize: 16, color: 'var(--text-primary)', marginBottom: 6 }}>아직 제출된 기록이 없어요</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>첫 번째로 클리어 기록을 공유해보세요!</div>
              </div>
            ) : (
              <>
                <PickRateList picks={pickRates} />
                <TeamList submissions={filtered.slice(0, 10)} />
              </>
            )}
          </div>

          <div style={{ width: 200, flexShrink: 0 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                내 기록 제출
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>
                클리어 기록을 공유해서 커뮤니티 통계에 기여해보세요
              </p>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontSize: 15, fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8,
                }}
              >
                <Upload size={13} />
                기록 제출하기
              </button>
              <button
                onClick={fetchSubmissions}
                style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
              >
                <RefreshCw size={12} />
                새로고침
              </button>
            </div>

            <FilterPanel filters={filters} onChange={setFilters} totalCount={filtered.length} availableDifficulties={availableDifficulties} />

            <div style={{ background: 'var(--bg-accent)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--accent-text)', marginBottom: 6 }}>데이터 기여 안내</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                보스 클리어 후 팀 구성과 점수를 제출하면 픽률 통계에 반영됩니다. 개인 정보는 수집하지 않습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showModal && currentBoss && (
        <SubmitModal boss={currentBoss} availableDifficulties={availableDifficulties} server={server as 'global' | 'jp'} onClose={() => setShowModal(false)} onSubmit={handleSubmit} />
      )}
    </>
  )
}
