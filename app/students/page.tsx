'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { STUDENTS } from '@/data/students'
import PickRateList from '@/components/total-assault/PickRateList'
import { StudentPickRate } from '@/types'

type Server = 'global' | 'jp'

interface RawSubmission {
  season: number
  boss_id: string
  parties: string[][]
}

interface Season {
  season: number
  server: string
}

export default function StudentsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [server, setServer] = useState<Server>((searchParams.get('server') as Server) ?? 'global')
  const [submissions, setSubmissions] = useState<RawSubmission[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const [{ data: subs }, { data: seas }] = await Promise.all([
        supabase.from('submissions').select('season, boss_id, parties').limit(5000),
        supabase.from('seasons').select('season, server'),
      ])
      if (subs) setSubmissions(subs)
      if (seas) setSeasons(seas)
      setLoading(false)
    }
    fetchData()
  }, [])

  const picks = useMemo((): StudentPickRate[] => {
    const serverSeasonNums = new Set(
      seasons.filter(s => s.server === server).map(s => s.season)
    )
    const serverSubs = submissions.filter(s => serverSeasonNums.has(s.season))
    const total = serverSubs.length
    if (total === 0) return []

    return STUDENTS
      .map(student => {
        const appearances = serverSubs.filter(s =>
          s.parties.some(p => p.includes(student.id))
        ).length
        return { student, pickCount: appearances, pickRate: appearances / total * 100 }
      })
      .filter(s => s.pickRate > 0)
      .sort((a, b) => b.pickRate - a.pickRate)
  }, [submissions, seasons, server])

  function handleServerChange(s: Server) {
    setServer(s)
    router.replace(`/students?server=${s}`, { scroll: false })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>학생 픽률</h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 16 }}>전체 시즌 기준 학생별 픽률 순위</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['global', 'jp'] as const).map(s => (
            <button
              key={s}
              onClick={() => handleServerChange(s)}
              style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 16, fontWeight: 600,
                border: server === s ? 'none' : '1px solid var(--border)',
                background: server === s ? 'var(--accent)' : 'var(--bg-surface)',
                color: server === s ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {s === 'global' ? 'Global (KR)' : 'JP'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 17 }}>
          불러오는 중...
        </div>
      ) : picks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 17 }}>
          데이터가 없습니다
        </div>
      ) : (
        <PickRateList picks={picks} />
      )}
    </div>
  )
}
