'use client'

import { motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StudentPickRate } from '@/types'
import { ATTACK_TYPE_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'

interface Props {
  picks: StudentPickRate[]
}

const ROLE_LABEL = { striker: '스트라이커', special: '스페셜' }

export default function PickRateList({ picks }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const server = searchParams.get('server') ?? 'global'
  const max = picks[0]?.pickRate ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        학생 픽률 TOP {picks.length}
      </div>
      {picks.map((pick, i) => (
        <motion.div
          key={pick.student.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 + i * 0.04, duration: 0.25, ease: 'easeOut' }}
          onClick={() => router.push(`/students/${pick.student.id}?server=${server}`)}
          whileHover={{ background: 'var(--bg-surface-2)' } as any}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 6px', borderBottom: i < picks.length - 1 ? '1px solid var(--bg-surface-2)' : 'none', cursor: 'pointer', borderRadius: 6, margin: '0 -6px' }}
        >
          <span style={{ fontSize: 15, color: 'var(--text-muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
          <StudentAvatar student={pick.student} size={44} radius={10} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pick.student.nameKo}
            </div>
            <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
              {ROLE_LABEL[pick.student.role]} · {ATTACK_TYPE_LABEL[pick.student.attackType]}
            </div>
          </div>
          <div style={{ width: 90, flexShrink: 0 }}>
            <div style={{ height: 4, background: 'var(--bg-surface-2)', borderRadius: 2, marginBottom: 3 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(pick.pickRate / max) * 100}%` }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.5, ease: 'easeOut' }}
                style={{ height: 4, background: 'var(--accent)', borderRadius: 2 }}
              />
            </div>
            <div style={{ fontSize: 16, color: 'var(--accent-text)', textAlign: 'right', fontWeight: 500 }}>
              {pick.pickRate.toFixed(1)}%
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
