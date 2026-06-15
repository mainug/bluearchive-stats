'use client'

import { Boss } from '@/types'
import { TERRAIN_LABEL } from '@/data/bosses'

interface Props {
  bosses: Boss[]
  selectedId: string
  onChange: (id: string) => void
}

export default function BossTabs({ bosses, selectedId, onChange }: Props) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {bosses.map(boss => {
        const active = boss.id === selectedId
        return (
          <button
            key={boss.id}
            onClick={() => onChange(boss.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: active ? 500 : 400,
              border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
              background: active ? 'var(--accent)' : 'var(--bg-surface)',
              color: active ? '#fff' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {boss.nameKo}
            <span style={{
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
              background: active ? 'rgba(255,255,255,0.2)' : 'var(--bg-surface-2)',
              color: active ? '#fff' : 'var(--text-muted)',
            }}>
              {TERRAIN_LABEL[boss.terrain]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
