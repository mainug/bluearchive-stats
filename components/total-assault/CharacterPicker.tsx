'use client'

import { useState, useMemo } from 'react'
import { X, Search, Check } from 'lucide-react'
import { Student } from '@/types'
import { STUDENTS, getSchoolColor } from '@/data/students'
import StudentAvatar from '@/components/ui/StudentAvatar'

const SCHOOLS = ['전체', 'Gehenna', 'Trinity', 'Millennium', 'Abydos', 'Hyakkiyako', 'RedWinter', 'Shanhaijing', 'Arius', 'SRT', 'Valkyrie', 'Sakugawa', 'Tokiwadai', 'ETC']
const SCHOOL_KO: Record<string, string> = {
  Gehenna: '게헨나', Trinity: '트리니티', Millennium: '밀레니엄', Abydos: '아비도스',
  Hyakkiyako: '백귀야행', RedWinter: '레드윈터', Shanhaijing: '산해경', Arius: '아리우스',
  SRT: 'SRT', Valkyrie: '발키리', Sakugawa: '사쿠가와', Tokiwadai: '토키와다이', ETC: '기타',
}

interface Props {
  title: string
  selected: string[]
  excluded: string[]
  maxCount: number
  onConfirm: (ids: string[]) => void
  onClose: () => void
}

export default function CharacterPicker({ title, selected: initialSelected, excluded, maxCount, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [school, setSchool] = useState('전체')
  const [selected, setSelected] = useState<string[]>(initialSelected)

  const filtered = useMemo(() => {
    return STUDENTS.filter(s => {
      if (excluded.includes(s.id)) return false
      if (school !== '전체' && s.school !== school) return false
      if (query && !s.nameKo.includes(query) && !s.nameEn.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [query, school, excluded])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < maxCount ? [...prev, id] : prev
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>

        {/* 헤더 */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>최대 {maxCount}명 · {selected.length}명 선택됨</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* 검색 */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="학생 이름 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            {SCHOOLS.map(s => (
              <button
                key={s}
                onClick={() => setSchool(s)}
                style={{
                  padding: '3px 9px', borderRadius: 4, fontSize: 11,
                  border: `1px solid ${school === s ? 'var(--accent)' : 'var(--border)'}`,
                  background: school === s ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                  color: school === s ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: school === s ? 500 : 400,
                }}
              >
                {s === '전체' ? '전체' : (SCHOOL_KO[s] ?? s)}
              </button>
            ))}
          </div>
        </div>

        {/* 학생 그리드 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 8 }}>
            {filtered.map(student => {
              const isSelected = selected.includes(student.id)
              const isFull = !isSelected && selected.length >= maxCount
              return (
                <button
                  key={student.id}
                  onClick={() => toggle(student.id)}
                  disabled={isFull}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 9,
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                    opacity: isFull ? 0.4 : 1,
                    position: 'relative',
                    transition: 'all 0.1s',
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={9} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <StudentAvatar student={student} size={36} radius={8} fontSize={11} />
                  <div style={{ fontSize: 10, color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.nameKo}
                  </div>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: 13 }}>검색 결과가 없어요</div>
          )}
        </div>

        {/* 선택된 학생 미리보기 + 확인 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, display: 'flex', gap: 6 }}>
            {Array.from({ length: maxCount }).map((_, i) => {
              const id = selected[i]
              const s = id ? STUDENTS.find(x => x.id === id) : null
              return s ? (
                <StudentAvatar key={i} student={s} size={32} radius={7} fontSize={10} />
              ) : (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 7, border: '1.5px dashed var(--border)', background: 'var(--bg-surface-2)' }} />
              )
            })}
          </div>
          <button
            onClick={() => onConfirm(selected)}
            style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
