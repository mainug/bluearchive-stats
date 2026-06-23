'use client'

import { useState } from 'react'
import { X, Users, Plus, Trash2 } from 'lucide-react'
import { Boss, Difficulty } from '@/types'
import { STUDENTS } from '@/data/students'
import { DIFFICULTY_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'
import CharacterPicker from './CharacterPicker'

interface Props {
  boss: Boss
  availableDifficulties: Difficulty[]
  server?: 'global' | 'jp'
  onClose: () => void
  onSubmit: (data: {
    difficulty: Difficulty
    score: number
    parties: string[][]
  }) => Promise<void>
}

const MAX_PARTIES = 6

type Party = { strikers: string[]; specials: string[] }

function SelectBtn({ value, current, onClick, children }: { value: string; current: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 16px', borderRadius: 8, fontSize: 16,
      border: `1px solid ${value === current ? 'var(--accent)' : 'var(--border)'}`,
      background: value === current ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
      color: value === current ? 'var(--accent)' : 'var(--text-secondary)',
      cursor: 'pointer', fontWeight: value === current ? 500 : 400,
    }}>
      {children}
    </button>
  )
}

function Slot({ id, size = 44 }: { id?: string; size?: number }) {
  const s = id ? STUDENTS.find(x => x.id === id) : null
  return s
    ? <StudentAvatar student={s} size={size} radius={10} fontSize={12} />
    : <div style={{ width: size, height: size, borderRadius: 10, border: '1.5px dashed var(--border)' }} />
}

function PartyRow({
  index, party, onEditStrikers, onEditSpecials, onRemove, canRemove,
}: {
  index: number
  party: Party
  onEditStrikers: () => void
  onEditSpecials: () => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div style={{ background: 'var(--bg-surface-2)', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-muted)', width: 44, flexShrink: 0 }}>{index + 1}파티</span>
        {canRemove && (
          <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, marginLeft: 'auto' }}>
            <Trash2 size={15} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* 스트라이커 */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>스트라이커</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {Array.from({ length: 4 }).map((_, i) => <Slot key={i} id={party.strikers[i]} />)}
            <button onClick={onEditStrikers} style={{
              padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 4,
            }}>
              <Users size={12} />
              {party.strikers.length > 0 ? '수정' : '선택'}
            </button>
          </div>
        </div>
        {/* 구분선 */}
        <div style={{ width: 1, height: 60, background: 'var(--border)', flexShrink: 0 }} />
        {/* 스페셜 */}
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>스페셜</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {Array.from({ length: 2 }).map((_, i) => <Slot key={i} id={party.specials[i]} />)}
            <button onClick={onEditSpecials} style={{
              padding: '5px 10px', borderRadius: 7, border: '1px solid var(--border)',
              background: 'var(--bg-surface)', color: 'var(--text-secondary)', fontSize: 14,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, marginLeft: 4,
            }}>
              <Users size={12} />
              {party.specials.length > 0 ? '수정' : '선택'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

type PickerState = { partyIndex: number; role: 'striker' | 'special' } | null

export default function SubmitModal({ boss, availableDifficulties, server, onClose, onSubmit }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>(
    availableDifficulties[0] ?? 'insane'
  )
  const [score, setScore] = useState('')
  const [parties, setParties] = useState<Party[]>([{ strikers: [], specials: [] }])
  const [pickerState, setPickerState] = useState<PickerState>(null)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const canSubmit = parties[0]?.strikers.length >= 1 && score.trim() !== ''

  const addParty = () => {
    if (parties.length < MAX_PARTIES) setParties(prev => [...prev, { strikers: [], specials: [] }])
  }

  const removeParty = (i: number) => {
    setParties(prev => prev.filter((_, idx) => idx !== i))
  }

  const updatePartyRole = (i: number, role: 'striker' | 'special', ids: string[]) => {
    setParties(prev => prev.map((p, idx) => idx === i ? { ...p, [role + 's']: ids } : p))
  }

  const allSelected = (excludeIndex: number) =>
    parties.flatMap((p, i) => i !== excludeIndex ? [...p.strikers, ...p.specials] : [])

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    const parsed = parseInt(score.replace(/,/g, ''), 10)
    if (isNaN(parsed) || parsed <= 0) { setErrorMsg('점수를 올바르게 입력해주세요'); return }
    setSubmitting(true)
    setErrorMsg('')
    try {
      const flatParties = parties
        .map(p => [...p.strikers, ...p.specials])
        .filter(p => p.length > 0)
      await onSubmit({ difficulty, score: parsed, parties: flatParties })
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
        <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '95vh', overflowY: 'auto', padding: 40, position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>

          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>기록 제출</div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24 }}>{boss.nameKo}</div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 10 }}>난이도</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {availableDifficulties.map(d => (
                <SelectBtn key={d} value={d} current={difficulty} onClick={() => setDifficulty(d)}>{DIFFICULTY_LABEL[d]}</SelectBtn>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 10 }}>점수</div>
            <input
              type="text"
              placeholder="예: 5420000"
              value={score}
              onChange={e => setScore(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 17, outline: 'none' }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 12 }}>
              파티 구성 <span style={{ color: 'var(--text-muted)' }}>(1파티 필수 · 최대 {MAX_PARTIES}파티)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {parties.map((party, i) => (
                <PartyRow
                  key={i}
                  index={i}
                  party={party}
                  onEditStrikers={() => setPickerState({ partyIndex: i, role: 'striker' })}
                  onEditSpecials={() => setPickerState({ partyIndex: i, role: 'special' })}
                  onRemove={() => removeParty(i)}
                  canRemove={parties.length > 1}
                />
              ))}
            </div>
            {parties.length < MAX_PARTIES && (
              <button
                onClick={addParty}
                style={{
                  marginTop: 10, width: '100%', padding: '10px', borderRadius: 9,
                  border: '1.5px dashed var(--border)', background: 'transparent',
                  color: 'var(--text-muted)', fontSize: 15, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Plus size={15} />
                파티 추가
              </button>
            )}
          </div>

          {errorMsg && (
            <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 7, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 14, color: '#f87171' }}>
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            style={{
              width: '100%', padding: '14px', borderRadius: 10, border: 'none',
              background: canSubmit && !submitting ? 'var(--accent)' : 'var(--bg-surface-2)',
              color: canSubmit && !submitting ? '#fff' : 'var(--text-muted)',
              fontSize: 18, fontWeight: 600, cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? '제출 중...' : '제출하기'}
          </button>
        </div>
      </div>

      {pickerState !== null && (() => {
        const { partyIndex, role } = pickerState
        const party = parties[partyIndex]
        return (
          <CharacterPicker
            title={`${partyIndex + 1}파티`}
            selected={role === 'striker' ? party.strikers : party.specials}
            excluded={allSelected(partyIndex)}
            maxCount={role === 'striker' ? 4 : 2}
            roleFilter={role}
            server={server}
            onConfirm={ids => { updatePartyRole(partyIndex, role, ids); setPickerState(null) }}
            onClose={() => setPickerState(null)}
          />
        )
      })()}
    </>
  )
}
