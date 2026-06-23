'use client'

import { useState, useMemo } from 'react'
import { X, Search, Check } from 'lucide-react'
import { Student } from '@/types'
import { STUDENTS, getSchoolColor } from '@/data/students'
import StudentAvatar from '@/components/ui/StudentAvatar'

const SCHOOLS = ['전체', 'Gehenna', 'Trinity', 'Millennium', 'Abydos', 'Hyakkiyako', 'RedWinter', 'Shanhaijing', 'Arius', 'SRT', 'Valkyrie', 'WildHunt', 'Highlander', 'Sakugawa', 'Tokiwadai', 'ETC']
const SCHOOL_KO: Record<string, string> = {
  Gehenna: '게헨나', Trinity: '트리니티', Millennium: '밀레니엄', Abydos: '아비도스',
  Hyakkiyako: '백귀야행', RedWinter: '레드윈터', Shanhaijing: '산해경', Arius: '아리우스',
  SRT: 'SRT', Valkyrie: '발키리', WildHunt: '와일드헌트', Highlander: '하이랜더',
  Sakugawa: '사쿠가와', Tokiwadai: '토키와다이', ETC: '기타',
}

const ATTACK_TYPES = ['전체', 'explosive', 'piercing', 'mystic', 'sonic'] as const
const ATTACK_KO: Record<string, string> = {
  explosive: '폭발', piercing: '관통', mystic: '신비', sonic: '진동',
}

const ARMOR_TYPES = ['전체', 'light', 'heavy', 'special', 'elastic', 'composite'] as const
const ARMOR_KO: Record<string, string> = {
  light: '경장갑', heavy: '중장갑', special: '특수장갑', elastic: '탄성장갑', composite: '복합장갑',
}

interface Props {
  title: string
  selected: string[]
  excluded: string[]
  maxCount: number
  roleFilter?: 'striker' | 'special'
  server?: 'global' | 'jp'
  onConfirm: (ids: string[]) => void
  onClose: () => void
}

export default function CharacterPicker({ title, selected: initialSelected, excluded, maxCount, roleFilter, server, onConfirm, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [school, setSchool] = useState('전체')
  const [attackType, setAttackType] = useState('전체')
  const [armorType, setArmorType] = useState('전체')
  const [selected, setSelected] = useState<string[]>(initialSelected)

  const filtered = useMemo(() => {
    return STUDENTS.filter(s => {
      if (!s.released && server !== 'jp') return false
      if (excluded.includes(s.id)) return false
      if (roleFilter && s.role !== roleFilter) return false
      if (school !== '전체' && s.school !== school) return false
      if (attackType !== '전체' && s.attackType !== attackType) return false
      if (armorType !== '전체' && s.armorType !== armorType) return false
      if (query && !s.nameKo.includes(query) && !s.nameEn.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [query, school, attackType, armorType, excluded, roleFilter, server])

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < maxCount ? [...prev, id] : prev
    )
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 720, height: '90vh', display: 'flex', flexDirection: 'column' }}>

        {/* 헤더 */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
              {roleFilter === 'striker' ? '스트라이커' : roleFilter === 'special' ? '스페셜' : ''} 최대 {maxCount}명 · {selected.length}명 선택됨
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        {/* 검색 */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="학생 이름 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SCHOOLS.map(s => (
              <button
                key={s}
                onClick={() => setSchool(s)}
                style={{
                  padding: '4px 11px', borderRadius: 5, fontSize: 12,
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>공격</span>
            {ATTACK_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setAttackType(t)}
                style={{
                  padding: '4px 11px', borderRadius: 5, fontSize: 12,
                  border: `1px solid ${attackType === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: attackType === t ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                  color: attackType === t ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: attackType === t ? 500 : 400,
                }}
              >
                {t === '전체' ? '전체' : ATTACK_KO[t]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, flexShrink: 0 }}>방어</span>
            {ARMOR_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setArmorType(t)}
                style={{
                  padding: '4px 11px', borderRadius: 5, fontSize: 12,
                  border: `1px solid ${armorType === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: armorType === t ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                  color: armorType === t ? 'var(--accent)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontWeight: armorType === t ? 500 : 400,
                }}
              >
                {t === '전체' ? '전체' : ARMOR_KO[t]}
              </button>
            ))}
          </div>
        </div>

        {/* 학생 그리드 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px', scrollbarGutter: 'stable' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 100px)', justifyContent: 'space-between', gap: 10 }}>
            {filtered.map(student => {
              const isSelected = selected.includes(student.id)
              const isFull = !isSelected && selected.length >= maxCount
              return (
                <button
                  key={student.id}
                  onClick={() => toggle(student.id)}
                  disabled={isFull}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                    cursor: isFull ? 'not-allowed' : 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    opacity: isFull ? 0.4 : 1,
                    position: 'relative',
                    transition: 'all 0.1s',
                  }}
                >
                  {isSelected && (
                    <div style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <StudentAvatar student={student} size={62} radius={12} fontSize={13} />
                  <div style={{ fontSize: 11, color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {student.nameKo}
                  </div>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>검색 결과가 없어요</div>
          )}
        </div>

        {/* 선택된 학생 미리보기 + 확인 */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            {Array.from({ length: maxCount }).map((_, i) => {
              const id = selected[i]
              const s = id ? STUDENTS.find(x => x.id === id) : null
              return s ? (
                <StudentAvatar key={i} student={s} size={40} radius={9} fontSize={11} />
              ) : (
                <div key={i} style={{ width: 40, height: 40, borderRadius: 9, border: '1.5px dashed var(--border)', background: 'var(--bg-surface-2)' }} />
              )
            })}
          </div>
          <button
            onClick={() => onConfirm(selected)}
            style={{ padding: '11px 28px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  )
}
