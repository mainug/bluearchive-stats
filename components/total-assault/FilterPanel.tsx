'use client'

import { Difficulty } from '@/types'

export interface Filters {
  difficulty: Difficulty | 'all'
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  totalCount: number
}

const DIFFICULTIES: { value: Difficulty | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'torment', label: '토먼트' },
  { value: 'insane', label: '인세인' },
  { value: 'extreme', label: '익스트림' },
]

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 5,
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        background: active ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'pointer',
        fontWeight: active ? 500 : 400,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}

export default function FilterPanel({ filters, onChange, totalCount }: Props) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
        필터
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>난이도</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {DIFFICULTIES.map(d => (
          <Chip
            key={d.value}
            active={filters.difficulty === d.value}
            label={d.label}
            onClick={() => onChange({ ...filters, difficulty: d.value })}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        {totalCount.toLocaleString()}개 기록
      </div>
    </div>
  )
}
