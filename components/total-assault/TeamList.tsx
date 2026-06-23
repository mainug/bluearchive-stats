import { motion } from 'motion/react'
import { Submission } from '@/types'
import { getStudentById } from '@/data/students'
import { DIFFICULTY_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'

interface Props {
  submissions: Submission[]
}

function StudentIcon({ studentId }: { studentId: string }) {
  const s = getStudentById(studentId)
  if (!s) return null
  return <StudentAvatar student={s} size={38} radius={8} fontSize={10} />
}

export default function TeamList({ submissions }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.3, ease: 'easeOut' }}
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}
    >
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        최근 제출 팀 구성
      </div>
      {submissions.map((sub, i) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.04, duration: 0.25, ease: 'easeOut' }}
          style={{ padding: '9px 0', borderBottom: i < submissions.length - 1 ? '1px solid var(--bg-surface-2)' : 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: 'var(--text-primary)' }}>
              {sub.score.toLocaleString()}점
            </span>
            <span style={{ fontSize: 15, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              {DIFFICULTY_LABEL[sub.difficulty]}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sub.parties.map((party, pi) => (
              <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>
                  {pi + 1}P
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {party.map(id => <StudentIcon key={id} studentId={id} />)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
