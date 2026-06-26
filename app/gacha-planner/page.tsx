'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { STUDENTS, SCHOOL_COLORS } from '@/data/students'
import { GACHA_POOL_1STAR, GACHA_POOL_2STAR, GACHA_POOL_3STAR, GachaStudent } from '@/data/gachaPool'
import StudentAvatar from '@/components/ui/StudentAvatar'

interface PullResult {
  rarity: 1 | 2 | 3
  isPickup: boolean
  isNew: boolean
  student: GachaStudent
}

interface Stats {
  total: number
  star3: number
  pickup: number
  pity: number
}

function pickupStudent(id: string) {
  const s = STUDENTS.find(s => s.id === id)
  if (!s) return GACHA_POOL_3STAR[0]
  return { schaleId: s.schaleId, nameKo: s.nameKo, school: s.school }
}

function randFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function doPull(pickupSchaleId: number, pity: number): PullResult {
  const r = Math.random()
  const is3Star = pity >= 199 || r < 0.025
  const isPickup = pity >= 199 || r < 0.007

  if (is3Star) {
    const student = isPickup
      ? GACHA_POOL_3STAR.find(s => s.schaleId === pickupSchaleId) ?? randFrom(GACHA_POOL_3STAR)
      : randFrom(GACHA_POOL_3STAR.filter(s => s.schaleId !== pickupSchaleId))
    return { rarity: 3, isPickup: isPickup && student.schaleId === pickupSchaleId, isNew: false, student }
  }
  if (r < 0.210) {
    return { rarity: 2, isPickup: false, isNew: false, student: randFrom(GACHA_POOL_2STAR) }
  }
  return { rarity: 1, isPickup: false, isNew: false, student: randFrom(GACHA_POOL_1STAR) }
}

const SCHOOL_NAME_KO: Record<string, string> = {
  Gehenna:     '게헨나',
  Millennium:  '밀레니엄',
  Trinity:     '트리니티',
  Abydos:      '아비도스',
  Arius:       '아리우스',
  Hyakkiyako:  '백귀야행',
  RedWinter:   '레드윈터',
  Shanhaijing: '산해경',
  SRT:         'SRT',
  Valkyrie:    '발키리',
  Sakugawa:    '사쿠가와',
  Tokiwadai:   '토키와다이',
  WildHunt:    '와일드헌트',
  Highlander:  '하이랜더',
}

const RARITY_STYLE = {
  3: { border: '2px solid #c084fc', boxShadow: '0 0 18px 4px rgba(192,132,252,0.5)', bg: 'linear-gradient(135deg, #2d1b4e 0%, #1a0f33 100%)' },
  2: { border: '2px solid #f59e0b', boxShadow: '0 0 10px 2px rgba(245,158,11,0.3)', bg: 'linear-gradient(135deg, #2d2010 0%, #1a1408 100%)' },
  1: { border: '1px solid var(--border)', boxShadow: 'none', bg: 'var(--bg-surface)' },
}

const STAR_COLOR = { 3: '#c084fc', 2: '#f59e0b', 1: '#94a3b8' }

function StarRow({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color, fontSize: 12 }}>★</span>
      ))}
    </div>
  )
}

function PullCard({ result, index, onClick }: { result: PullResult; index: number; onClick: () => void }) {
  const style = RARITY_STYLE[result.rarity]
  const portraitUrl = `https://schaledb.com/images/student/icon/${result.student.schaleId}.webp`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3, ease: 'backOut' }}
      onClick={result.rarity === 3 ? onClick : undefined}
      style={{
        position: 'relative',
        borderRadius: 12,
        border: style.border,
        boxShadow: style.boxShadow,
        background: style.bg,
        padding: '8px 8px 4px',
        cursor: result.rarity === 3 ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        aspectRatio: '0.7',
      }}
    >
      {result.isPickup && result.isNew && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
          color: '#fff', fontSize: 10, fontWeight: 700,
          padding: '3px 8px', borderRadius: 10, whiteSpace: 'nowrap', zIndex: 1,
        }}>
          New! Pick Up!
        </div>
      )}
      <div style={{ width: '100%', borderRadius: 8, overflow: 'hidden', border: `2px solid ${STAR_COLOR[result.rarity]}` }}>
        <img
          src={portraitUrl}
          alt={result.student.nameKo}
          style={{ width: '100%', display: 'block', objectFit: 'cover' }}
          onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3' }}
        />
      </div>
      <StarRow count={result.rarity} color={STAR_COLOR[result.rarity]} />
    </motion.div>
  )
}

function RevealOverlay({ result, onClose, queueLength }: { result: PullResult; onClose: () => void; queueLength: number }) {
  const [phase, setPhase] = useState<'emblem' | 'character'>('emblem')
  const school = result.student.school
  const schoolColor = SCHOOL_COLORS[school] ?? SCHOOL_COLORS.default
  const collectionUrl = `https://schaledb.com/images/student/portrait/${result.student.schaleId}.webp`
  const emblemUrl = `https://schaledb.com/images/schoolicon/${school}.png`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (phase === 'emblem') setPhase('character')
        else onClose()
      }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <AnimatePresence mode="wait">
        {phase === 'emblem' ? (
          <motion.div
            key="emblem"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', inset: 0,
              background: schoolColor.bg,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
            }}
          >
            <motion.img
              src={emblemUrl}
              alt={school}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: 'backOut' }}
              style={{ width: 180, height: 180, objectFit: 'contain', filter: 'brightness(2) drop-shadow(0 0 40px rgba(255,255,255,0.6))' }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.3 }}
              style={{ fontSize: 18, fontWeight: 700, color: schoolColor.text, letterSpacing: '0.1em' }}
            >
              {SCHOOL_NAME_KO[school] ?? school}
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 8 }}
            >
              탭하여 계속
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="character"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.92)',
              display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 48,
              padding: '0 80px',
            }}
          >
            {/* 왼쪽: 이름 정보 */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              style={{ flex: 1, maxWidth: 320 }}
            >
              <div style={{ display: 'flex', gap: 3, marginBottom: 16 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} style={{ color: '#c084fc', fontSize: 22 }}>★</span>
                ))}
              </div>
              <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 10 }}>
                {result.student.nameKo}
              </div>
              <div style={{ fontSize: 15, color: schoolColor.text, fontWeight: 600 }}>{SCHOOL_NAME_KO[school] ?? school}</div>
              {result.isPickup && (
                <div style={{ marginTop: 14, display: 'inline-block', padding: '4px 12px', borderRadius: 8, background: 'linear-gradient(90deg,#ec4899,#8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  Pick Up!
                </div>
              )}
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 32 }}>탭하여 {queueLength > 1 ? '다음' : '닫기'}</div>
            </motion.div>

            {/* 오른쪽: 이미지 */}
            <motion.img
              src={collectionUrl}
              alt={result.student.nameKo}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ maxHeight: '70vh', maxWidth: '45vw', objectFit: 'contain', borderRadius: 16 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function GachaPlannerPage() {
  const [pickupId, setPickupId] = useState<string>(STUDENTS[0]?.id ?? '')
  const [results, setResults] = useState<PullResult[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, star3: 0, pickup: 0, pity: 0 })
  const [revealTarget, setRevealTarget] = useState<PullResult | null>(null)
  const [revealQueue, setRevealQueue] = useState<PullResult[]>([])
  const [pickupCount, setPickupCount] = useState<Record<number, number>>({})

  const pickupInfo = pickupStudent(pickupId)

  const handleRevealClose = useCallback(() => {
    setRevealQueue(prev => {
      const next = prev.slice(1)
      setRevealTarget(next[0] ?? null)
      return next
    })
  }, [])

  const pull10 = useCallback(() => {
    let pity = stats.pity
    const pulls: PullResult[] = []
    let newStar3 = 0, newPickup = 0
    const newPickupCount = { ...pickupCount }

    for (let i = 0; i < 10; i++) {
      const result = doPull(pickupInfo.schaleId, pity)
      pity = result.rarity === 3 ? 0 : pity + 1

      const prev = newPickupCount[result.student.schaleId] ?? 0
      result.isNew = prev === 0
      newPickupCount[result.student.schaleId] = prev + 1

      if (result.rarity === 3) newStar3++
      if (result.isPickup) newPickup++
      pulls.push(result)
    }

    setPickupCount(newPickupCount)
    setResults(pulls)
    setStats(prev => ({
      total: prev.total + 10,
      star3: prev.star3 + newStar3,
      pickup: prev.pickup + newPickup,
      pity,
    }))

    const star3s = pulls.filter(p => p.rarity === 3)
    if (star3s.length > 0) {
      setRevealQueue(star3s)
      setRevealTarget(star3s[0])
    }
  }, [stats.pity, pickupInfo.schaleId, pickupCount])

  const statItems = [
    { label: '총 모집', value: stats.total },
    { label: '3성', value: stats.star3 },
    { label: '픽업 획득', value: stats.pickup },
    { label: '천장까지', value: 200 - stats.pity },
  ]

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px 60px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>모집 시뮬레이터</h1>
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 400 }}>3성 2.5% · 픽업 0.7% · 천장 200회</p>
      </div>

      {/* 픽업 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
        <StudentAvatar student={STUDENTS.find(s => s.id === pickupId) ?? STUDENTS[0]} size={48} radius={10} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>픽업 학생</div>
          <select
            value={pickupId}
            onChange={e => { setPickupId(e.target.value); setResults([]); setStats({ total: 0, star3: 0, pickup: 0, pity: 0 }); setPickupCount({}) }}
            style={{
              background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 6,
              color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, padding: '4px 10px', cursor: 'pointer',
            }}
          >
            {STUDENTS.filter(s => !s.nameKo.includes('(')).map(s => (
              <option key={s.id} value={s.id}>{s.nameKo}</option>
            ))}
          </select>
        </div>
        <div style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, background: 'linear-gradient(90deg,#ec4899,#8b5cf6)', color: '#fff', fontWeight: 700 }}>
          PICK UP
        </div>
      </div>

      {/* 결과 그리드 */}
      <div style={{ minHeight: 300, marginBottom: 24 }}>
        {results.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {results.map((r, i) => (
              <PullCard key={i} result={r} index={i} onClick={() => { setRevealQueue([r]); setRevealTarget(r) }} />
            ))}
          </div>
        ) : (
          <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 15, border: '1px dashed var(--border)', borderRadius: 14 }}>
            아래 버튼을 눌러 모집을 시작하세요
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={pull10}
          style={{
            background: 'linear-gradient(90deg, #4AABDE, #2A93C9)',
            border: 'none', borderRadius: 12,
            color: '#fff', fontSize: 17, fontWeight: 700,
            padding: '14px 48px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span>💎</span>
          <span>10연 모집 (1,200)</span>
        </motion.button>
      </div>

      {/* 통계 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {statItems.map(item => (
          <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* 3성 풀스크린 연출 */}
      <AnimatePresence>
        {revealTarget && (
          <RevealOverlay result={revealTarget} onClose={handleRevealClose} queueLength={revealQueue.length} />
        )}
      </AnimatePresence>
    </div>
  )
}
