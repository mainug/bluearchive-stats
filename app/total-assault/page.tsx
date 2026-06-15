'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BOSSES } from '@/data/bosses'

type Server = 'global' | 'jp'

interface Season {
  season: number
  boss_id: string | null
  start_date: string | null
  end_date: string | null
  terrain: string | null
  is_current: boolean
  server: Server
}

export default function TotalAssaultListPage() {
  const router = useRouter()
  const [server, setServer] = useState<Server>('global')
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSeasons() {
      setLoading(true)
      const { data } = await supabase
        .from('seasons')
        .select('*')
        .eq('server', server)
        .order('season', { ascending: false })
      if (data) setSeasons(data)
      setLoading(false)
    }
    fetchSeasons()
  }, [server])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>총력전</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>시즌별 보스 및 유저 기록 통계</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['global', 'jp'] as const).map(s => (
            <button
              key={s}
              onClick={() => setServer(s)}
              style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
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
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          불러오는 중...
        </div>
      ) : seasons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: 13 }}>
          등록된 시즌이 없습니다
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
          {seasons.map(season => {
            const boss = BOSSES.find(b => b.id === season.boss_id)
            const today = new Date().toISOString().slice(0, 10)
            const isCurrent = !!season.start_date && !!season.end_date
              && today >= season.start_date && today <= season.end_date
            return (
              <button
                key={season.season}
                onClick={() => router.push(`/total-assault/${season.season}?server=${season.server}`)}
                style={{
                  background: 'var(--bg-surface)',
                  border: isCurrent ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: 12,
                  padding: '16px 18px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px var(--accent)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      총력전
                    </span>
                    {isCurrent && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'var(--accent)', color: '#fff', letterSpacing: '0.03em' }}>
                        진행중
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {season.start_date ?? '—'}
                  </span>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 2 }}>
                    S{season.season}
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {boss?.nameKo ?? '—'}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {season.terrain && (
                    <TerrainBadge terrain={season.terrain} />
                  )}
                  {season.end_date && !season.is_current && (
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                      ~ {season.end_date}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TerrainBadge({ terrain }: { terrain: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    indoor:  { label: '실내', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
    outdoor: { label: '야외', color: '#16A34A', bg: 'rgba(22,163,74,0.1)' },
    urban:   { label: '시가전', color: '#2563EB', bg: 'rgba(37,99,235,0.1)' },
    special: { label: '특수', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
  }
  const style = map[terrain]
  if (!style) return null
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: style.bg, color: style.color }}>
      {style.label}
    </span>
  )
}
