import { Student } from '@/types'
import { getSchoolColor } from '@/data/students'

interface Props {
  student: Student
  size?: number
  radius?: number
  fontSize?: number
}

export default function StudentAvatar({ student, size = 34, radius = 8, fontSize = 11 }: Props) {
  const color = getSchoolColor(student.school)
  const initials = student.nameKo.replace(/[^가-힣a-zA-Z]/g, '').slice(0, 2)
  const imageUrl = `https://schaledb.com/images/student/icon/${student.schaleId}.webp`

  return (
    <div
      title={student.nameKo}
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: color.bg,
        border: `1px solid ${color.text}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize,
        fontWeight: 600,
        color: color.text,
        letterSpacing: '-0.02em',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <img
        src={imageUrl}
        alt={student.nameKo}
        width={size}
        height={size}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
      />
      {initials}
    </div>
  )
}
