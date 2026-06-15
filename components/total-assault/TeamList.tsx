import { Submission } from '@/types'
import { getStudentById } from '@/data/students'
import { DIFFICULTY_LABEL } from '@/data/bosses'
import StudentAvatar from '@/components/ui/StudentAvatar'

interface Props {
  submissions: Submission[]
}

const RANK_STYLE: Record<string, { bg: string; color: string }> = {
  SS: { bg: 'rgba(251,191,36,0.12)', color: '#D97706' },
  S:  { bg: 'rgba(167,139,250,0.12)', color: '#7C3AED' },
  A:  { bg: 'rgba(74,171,222,0.12)', color: '#4AABDE' },
  B:  { bg: 'rgba(100,200,100,0.12)', color: '#16A34A' },
  C:  { bg: 'rgba(148,163,184,0.12)', color: '#64748B' },
}

function StudentIcon({ studentId }: { studentId: string }) {
  const s = getStudentById(studentId)
  if (!s) return null
  return <StudentAvatar student={s} size={28} radius={6} fontSize={9} />
}

export default function TeamList({ submissions }: Props) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
        최근 제출 팀 구성
      </div>
      {submissions.map((sub, i) => {
        const rankStyle = RANK_STYLE[sub.rank] ?? RANK_STYLE.C
        return (
          <div key={sub.id} style={{ padding: '9px 0', borderBottom: i < submissions.length - 1 ? '1px solid var(--bg-surface-2)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: rankStyle.bg, color: rankStyle.color }}>
                {sub.rank}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {sub.score.toLocaleString()}점
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {DIFFICULTY_LABEL[sub.difficulty]}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {sub.parties.map((party, pi) => (
                <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>
                    {pi + 1}P
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {party.map(id => <StudentIcon key={id} studentId={id} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
