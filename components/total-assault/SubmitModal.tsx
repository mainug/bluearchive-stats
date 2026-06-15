'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Boss, Difficulty, ClearRank } from '@/types'
import { STUDENTS } from '@/data/students'
import { DIFFICULTY_LABEL } from '@/data/bosses'

interface Props {
  boss: Boss
  onClose: () => void
  onSubmit: (data: {
    difficulty: Difficulty
    rank: ClearRank
    score: number
    party1: string[]
    party2: string[]
  }) => Promise<void>
}

const RANKS: ClearRank[] = ['SS', 'S', 'A', 'B', 'C']

export default function SubmitModal({ boss, onClose, onSubmit }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('insane')
  const [rank, setRank] = useState<ClearRank>('SS')
  const [score, setScore] = useState('')
  const [party1, setParty1] = useState<string[]>([])
  const [party2, setParty2] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const toggleStudent = (id: string, party: 1 | 2) => {
    const setter = party === 1 ? setParty1 : setParty2
    const current = party === 1 ? party1 : party2
    if (current.includes(id)) {
      setter(current.filter(s => s !== id))
    } else if (current.length < 4) {
      setter([...current, id])
    }
  }

  const canSubmit = party1.length >= 1 && score.trim() !== ''

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    const parsed = parseInt(score.replace(/,/g, ''), 10)
    if (isNaN(parsed) || parsed <= 0) {
      setErrorMsg('점수를 올바르게 입력해주세요')
      return
    }
    setSubmitting(true)
    setErrorMsg('')
    try {
      await onSubmit({ difficulty, rank, score: parsed, party1, party2 })
      onClose()
    } catch (e: any) {
      setErrorMsg(e?.message ?? '제출 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const SelectBtn = ({ value, current, onClick, children }: { value: string; current: string; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      style={{
        padding: '5px 12px', borderRadius: 6, fontSize: 12,
        border: `1px solid ${value === current ? 'var(--accent)' : 'var(--border)'}`,
        background: value === current ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
        color: value === current ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer', fontWeight: value === current ? 500 : 400,
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <X size={18} />
        </button>

        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>기록 제출</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>{boss.nameKo}</div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>난이도</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['torment', 'insane', 'extreme'] as Difficulty[]).map(d => (
              <SelectBtn key={d} value={d} current={difficulty} onClick={() => setDifficulty(d)}>{DIFFICULTY_LABEL[d]}</SelectBtn>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>랭크</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {RANKS.map(r => (
              <SelectBtn key={r} value={r} current={rank} onClick={() => setRank(r)}>{r}</SelectBtn>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>점수</div>
          <input
            type="text"
            placeholder="점수 입력"
            value={score}
            onChange={e => setScore(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            1파티 <span style={{ color: 'var(--text-muted)' }}>({party1.length}/4)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {STUDENTS.map(s => {
              const inP1 = party1.includes(s.id)
              const inP2 = party2.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => !inP2 && toggleStudent(s.id, 1)}
                  disabled={inP2}
                  style={{
                    padding: '4px 10px', borderRadius: 5, fontSize: 11,
                    border: `1px solid ${inP1 ? 'var(--accent)' : 'var(--border)'}`,
                    background: inP1 ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                    color: inP2 ? 'var(--text-muted)' : inP1 ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: inP2 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {s.nameKo}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            2파티 <span style={{ color: 'var(--text-muted)' }}>({party2.length}/4 · 선택)</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {STUDENTS.map(s => {
              const inP1 = party1.includes(s.id)
              const inP2 = party2.includes(s.id)
              return (
                <button
                  key={s.id}
                  onClick={() => !inP1 && toggleStudent(s.id, 2)}
                  disabled={inP1}
                  style={{
                    padding: '4px 10px', borderRadius: 5, fontSize: 11,
                    border: `1px solid ${inP2 ? 'var(--accent)' : 'var(--border)'}`,
                    background: inP2 ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                    color: inP1 ? 'var(--text-muted)' : inP2 ? 'var(--accent)' : 'var(--text-secondary)',
                    cursor: inP1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {s.nameKo}
                </button>
              )
            })}
          </div>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 7, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 12, color: '#f87171' }}>
            {errorMsg}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          style={{
            width: '100%', padding: '11px', borderRadius: 9, border: 'none',
            background: canSubmit && !submitting ? 'var(--accent)' : 'var(--bg-surface-2)',
            color: canSubmit && !submitting ? '#fff' : 'var(--text-muted)',
            fontSize: 14, fontWeight: 600, cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
          }}
        >
          {submitting ? '제출 중...' : '제출하기'}
        </button>
      </div>
    </div>
  )
}
