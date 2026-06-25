'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { supabase } from '@/lib/supabase'
import { BOSSES, TERRAIN_LABEL } from '@/data/bosses'

interface Season {
  season: number
  boss_id: string | null
  start_date: string | null
  end_date: string | null
  terrain: string | null
  server: string
}

function getStatus(season: Season) {
  if (!season.start_date || !season.end_date) return { type: 'unknown' as const }
  const today = new Date()
  const start = new Date(season.start_date)
  const end = new Date(season.end_date)
  if (today >= start && today <= end) {
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / 86400000)
    return { type: 'live' as const, label: `${daysLeft}일 남음` }
  }
  if (today < start) {
    const daysUntil = Math.ceil((start.getTime() - today.getTime()) / 86400000)
    return { type: 'upcoming' as const, label: `${daysUntil}일 후 시작` }
  }
  return { type: 'ended' as const, label: '종료' }
}

const TERRAIN_COLOR: Record<string, string> = {
  indoor: 'rgba(124,58,237,0.85)',
  outdoor: 'rgba(22,163,74,0.85)',
  urban: 'rgba(37,99,235,0.85)',
}

function RaidCard({ season, delay }: { season: Season; delay: number }) {
  const router = useRouter()
  const boss = BOSSES.find(b => b.id === season.boss_id)
  const status = getStatus(season)
  const terrainLabel = season.terrain ? TERRAIN_LABEL[season.terrain] : null
  const terrainColor = season.terrain ? TERRAIN_COLOR[season.terrain] : 'rgba(100,100,100,0.85)'
  const serverLabel = season.server === 'global' ? 'GL/KR' : 'JP'

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      onClick={() => router.push(`/total-assault/${season.season}?server=${season.server}`)}
      style={{
        position: 'relative',
        height: 240,
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: boss?.imageUrl
          ? `linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.12) 100%), url(${boss.imageUrl})`
          : undefined,
        backgroundSize: 'auto, cover',
        backgroundPosition: '0 0, left center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      whileHover={{ scale: 1.015 }}
    >
      {/* 상단 배지 */}
      <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{
          fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
          background: 'rgba(255,255,255,0.18)', color: '#fff', letterSpacing: '0.05em',
          backdropFilter: 'blur(4px)',
        }}>
          {serverLabel}
        </span>
        {status.type === 'live' && (
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
            background: '#ef4444', color: '#fff', letterSpacing: '0.05em',
          }}>
            LIVE
          </span>
        )}
        {status.type === 'upcoming' && (
          <span style={{
            fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.18)', color: '#fff', letterSpacing: '0.05em',
            backdropFilter: 'blur(4px)',
          }}>
            예정
          </span>
        )}
      </div>

      {/* 하단 텍스트 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 4, letterSpacing: '0.04em' }}>
          총력전 S{season.season}
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', lineHeight: 1.15, marginBottom: 10 }}>
          {boss?.nameKo ?? '—'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {terrainLabel && (
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 4,
                background: terrainColor, color: '#fff',
              }}>
                {terrainLabel}
              </span>
            )}
          </div>
          {status.label && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>
              {status.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [seasons, setSeasons] = useState<{ global: Season | null; jp: Season | null }>({ global: null, jp: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSeasons() {
      const { data } = await supabase
        .from('seasons')
        .select('*')
        .order('season', { ascending: false })
        .limit(10)
      if (data) {
        setSeasons({
          global: data.find(s => s.server === 'global') ?? null,
          jp: data.find(s => s.server === 'jp') ?? null,
        })
      }
      setLoading(false)
    }
    fetchSeasons()
  }, [])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 24px 80px' }}>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ marginBottom: 52, textAlign: 'center' }}
      >
        <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 12 }}>
          Blue<span style={{ color: 'var(--accent)' }}>Stats</span>
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>
          블루 아카이브 총력전 팀 구성 픽률 통계
        </div>
      </motion.div>

      {/* 현재 총력전 */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          현재 총력전
        </div>
        {loading ? (
          <div style={{ height: 240, borderRadius: 14, background: 'var(--bg-surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            불러오는 중...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {seasons.global && <RaidCard season={seasons.global} delay={0.1} />}
            {seasons.jp && <RaidCard season={seasons.jp} delay={0.18} />}
          </div>
        )}
      </div>

      {/* 바로가기 */}
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>
          바로가기
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { icon: '⚔️', title: '총력전', desc: '시즌별 보스와 팀 구성 통계', href: '/total-assault', delay: 0.22 },
            { icon: '📊', title: '학생 픽률', desc: '전체 학생 픽률 순위 및 상세 통계', href: '/students', delay: 0.28 },
          ].map(item => (
            <motion.button
              key={item.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay, duration: 0.25, ease: 'easeOut' }}
              onClick={() => router.push(item.href)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 22px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
              whileHover={{ borderColor: 'var(--accent)' }}
            >
              <span style={{ fontSize: 28 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 14, fontWeight: 400, color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 18 }}>›</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
