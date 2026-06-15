import { StudentPickRate } from '@/types'
import { ATTACK_TYPE_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'

interface Props {
  picks: StudentPickRate[]
}

const ROLE_LABEL = { striker: '스트라이커', special: '스페셜' }

export default function PickRateList({ picks }: Props) {
  const max = picks[0]?.pickRate ?? 1

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        학생 픽률 TOP {picks.length}
      </div>
      {picks.map((pick, i) => (
        <div
          key={pick.student.id}
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < picks.length - 1 ? '1px solid var(--bg-surface-2)' : 'none' }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 18, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
          <StudentAvatar student={pick.student} size={34} radius={8} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pick.student.nameKo}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
              {ROLE_LABEL[pick.student.role]} · {ATTACK_TYPE_LABEL[pick.student.attackType]}
            </div>
          </div>
          <div style={{ width: 90, flexShrink: 0 }}>
            <div style={{ height: 4, background: 'var(--bg-surface-2)', borderRadius: 2, marginBottom: 3 }}>
              <div style={{ height: 4, background: 'var(--accent)', borderRadius: 2, width: `${(pick.pickRate / max) * 100}%`, transition: 'width 0.4s' }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--accent-text)', textAlign: 'right', fontWeight: 500 }}>
              {pick.pickRate.toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
