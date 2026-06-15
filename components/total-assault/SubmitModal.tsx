'use client'

import { useState } from 'react'
import { X, Users } from 'lucide-react'
import { Boss, Difficulty, ClearRank } from '@/types'
import { STUDENTS, getSchoolColor } from '@/data/students'
import { DIFFICULTY_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'
import CharacterPicker from './CharacterPicker'

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

function SelectBtn({ value, current, onClick, children }: { value: string; current: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 6, fontSize: 12,
      border: `1px solid ${value === current ? 'var(--accent)' : 'var(--border)'}`,
      background: value === current ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
      color: value === current ? 'var(--accent)' : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: value === current ? 500 : 400,
    }}>
      {children}
    </button>
  )
}

function PartySlots({ party, onEdit }: { party: string[]; onEdit: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: 4 }).map((_, i) => {
          const id = party[i]
          const s = id ? STUDENTS.find(x => x.id === id) : null
          return s ? (
            <StudentAvatar key={i} student={s} size={38} radius={9} />
          ) : (
            <div key={i} style={{ width: 38, height: 38, borderRadius: 9, border: '1.5px dashed var(--border)', background: 'var(--bg-surface-2)' }} />
          )
        })}
      </div>
      <button onClick={onEdit} style={{
        marginLeft: 4, padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)',
        background: 'var(--bg-surface-2)', color: 'var(--text-secondary)', fontSize: 12,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <Users size={13} />
        {party.length > 0 ? '수정' : '선택'}
      </button>
    </div>
  )
}

export default function SubmitModal({ boss, onClose, onSubmit }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('insane')
  const [rank, setRank] = useState<ClearRank>('SS')
  const [score, setScore] = useState('')
  const [party1, setParty1] = useState<string[]>([])
  const [party2, setParty2] = useState<string[]>([])
  const [picker, setPicker] = useState<1 | 2 | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const canSubmit = party1.length >= 1 && score.trim() !== ''

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    const parsed = parseInt(score.replace(/,/g, ''), 10)
    if (isNaN(parsed) || parsed <= 0) { setErrorMsg('점수를 올바르게 입력해주세요'); return }
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

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 420, padding: 24, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>

          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>기록 제출</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 20 }}>{boss.nameKo}</div>

          {/* 난이도 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>난이도</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['torment', 'insane', 'extreme'] as Difficulty[]).map(d => (
                <SelectBtn key={d} value={d} current={difficulty} onClick={() => setDifficulty(d)}>{DIFFICULTY_LABEL[d]}</SelectBtn>
              ))}
            </div>
          </div>

          {/* 랭크 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>랭크</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {RANKS.map(r => (
                <SelectBtn key={r} value={r} current={rank} onClick={() => setRank(r)}>{r}</SelectBtn>
              ))}
            </div>
          </div>

          {/* 점수 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>점수</div>
            <input
              type="text"
              placeholder="예: 5420000"
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            />
          </div>

          {/* 1파티 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              1파티 <span style={{ color: 'var(--text-muted)' }}>({party1.length}/4)</span>
            </div>
            <PartySlots party={party1} onEdit={() => setPicker(1)} />
          </div>

          {/* 2파티 */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
              2파티 <span style={{ color: 'var(--text-muted)' }}>({party2.length}/4 · 선택)</span>
            </div>
            <PartySlots party={party2} onEdit={() => setPicker(2)} />
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

      {picker !== null && (
        <CharacterPicker
          title={`${picker}파티 선택`}
          selected={picker === 1 ? party1 : party2}
          excluded={picker === 1 ? party2 : party1}
          maxCount={4}
          onConfirm={ids => { picker === 1 ? setParty1(ids) : setParty2(ids); setPicker(null) }}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  )
}
