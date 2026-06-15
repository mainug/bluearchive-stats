'use client'

import { useState } from 'react'
import { X, Users, Plus, Trash2 } from 'lucide-react'
import { Boss, Difficulty, ClearRank } from '@/types'
import { STUDENTS } from '@/data/students'
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
    parties: string[][]
  }) => Promise<void>
}

const RANKS: ClearRank[] = ['SS', 'S', 'A', 'B', 'C']
const MAX_PARTIES = 6

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

function PartyRow({
  index, party, onEdit, onRemove, canRemove,
}: {
  index: number; party: string[]; onEdit: () => void; onRemove: () => void; canRemove: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 9, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', width: 30, flexShrink: 0 }}>{index + 1}파티</span>
      <div style={{ display: 'flex', gap: 5, flex: 1 }}>
        {Array.from({ length: 4 }).map((_, i) => {
          const id = party[i]
          const s = id ? STUDENTS.find(x => x.id === id) : null
          return s ? (
            <StudentAvatar key={i} student={s} size={34} radius={8} fontSize={10} />
          ) : (
            <div key={i} style={{ width: 34, height: 34, borderRadius: 8, border: '1.5px dashed var(--border)' }} />
          )
        })}
      </div>
      <button onClick={onEdit} style={{
        padding: '5px 10px', borderRadius: 6, border: '1px solid var(--border)',
        background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 11,
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
      }}>
        <Users size={11} />
        {party.length > 0 ? '수정' : '선택'}
      </button>
      {canRemove && (
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, flexShrink: 0 }}>
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

export default function SubmitModal({ boss, onClose, onSubmit }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('insane')
  const [rank, setRank] = useState<ClearRank>('SS')
  const [score, setScore] = useState('')
  const [parties, setParties] = useState<string[][]>([[]])
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const canSubmit = parties[0]?.length >= 1 && score.trim() !== ''

  const addParty = () => {
    if (parties.length < MAX_PARTIES) setParties(prev => [...prev, []])
  }

  const removeParty = (i: number) => {
    setParties(prev => prev.filter((_, idx) => idx !== i))
  }

  const updateParty = (i: number, ids: string[]) => {
    setParties(prev => prev.map((p, idx) => idx === i ? ids : p))
  }

  const excludedFor = (index: number) =>
    parties.flatMap((p, i) => i !== index ? p : [])

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    const parsed = parseInt(score.replace(/,/g, ''), 10)
    if (isNaN(parsed) || parsed <= 0) { setErrorMsg('점수를 올바르게 입력해주세요'); return }
    setSubmitting(true)
    setErrorMsg('')
    try {
      await onSubmit({ difficulty, rank, score: parsed, parties: parties.filter(p => p.length > 0) })
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
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto', padding: 24, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>

          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>기록 제출</div>
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

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>점수</div>
            <input
              type="text"
              placeholder="예: 5420000"
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
              파티 구성 <span style={{ color: 'var(--text-muted)' }}>(1파티 필수 · 최대 {MAX_PARTIES}파티)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {parties.map((party, i) => (
                <PartyRow
                  key={i}
                  index={i}
                  party={party}
                  onEdit={() => setPickerIndex(i)}
                  onRemove={() => removeParty(i)}
                  canRemove={parties.length > 1}
                />
              ))}
            </div>
            {parties.length < MAX_PARTIES && (
              <button
                onClick={addParty}
                style={{
                  marginTop: 8, width: '100%', padding: '8px', borderRadius: 8,
                  border: '1.5px dashed var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                }}
              >
                <Plus size={13} />
                파티 추가
              </button>
            )}
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

      {pickerIndex !== null && (
        <CharacterPicker
          title={`${pickerIndex + 1}파티 선택`}
          selected={parties[pickerIndex] ?? []}
          excluded={excludedFor(pickerIndex)}
          maxCount={4}
          onConfirm={ids => { updateParty(pickerIndex, ids); setPickerIndex(null) }}
          onClose={() => setPickerIndex(null)}
        />
      )}
    </>
  )
}
