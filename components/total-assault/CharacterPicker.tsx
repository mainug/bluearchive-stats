'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Search, Check } from 'lucide-react'
import { STUDENTS } from '@/data/students'
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

  const filterBtnStyle = (active: boolean) => ({
    padding: '3px 8px', borderRadius: 4, fontSize: 13,
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    background: active ? 'var(--bg-accent)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-secondary)',
    cursor: 'pointer', fontWeight: active ? 600 : 400,
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ background: 'var(--bg-surface)', borderRadius: 14, width: '100%', maxWidth: 760, height: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* 헤더 */}
        <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize: 17, color: 'var(--text-muted)', marginTop: 3 }}>
              {roleFilter === 'striker' ? '스트라이커' : roleFilter === 'special' ? '스페셜' : ''} 최대 {maxCount}명 · {selected.length}명 선택됨
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </motion.button>
        </div>

        {/* 바디: 사이드바 + 콘텐츠 */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* 왼쪽 사이드바 */}
          <div style={{ width: 160, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto', padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.03em' }}>학원</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {SCHOOLS.map(s => (
                  <motion.button key={s} whileTap={{ scale: 0.92 }} onClick={() => setSchool(s)} style={filterBtnStyle(school === s)}>
                    {s === '전체' ? '전체' : (SCHOOL_KO[s] ?? s)}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.03em' }}>공격 타입</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ATTACK_TYPES.map(t => (
                  <motion.button key={t} whileTap={{ scale: 0.92 }} onClick={() => setAttackType(t)} style={filterBtnStyle(attackType === t)}>
                    {t === '전체' ? '전체' : ATTACK_KO[t]}
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.03em' }}>방어 타입</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ARMOR_TYPES.map(t => (
                  <motion.button key={t} whileTap={{ scale: 0.92 }} onClick={() => setArmorType(t)} style={filterBtnStyle(armorType === t)}>
                    {t === '전체' ? '전체' : ARMOR_KO[t]}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 검색 + 그리드 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="학생 이름 검색"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px 9px 36px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', fontSize: 18, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', scrollbarGutter: 'stable' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 100px)', justifyContent: 'space-between', gap: 10 }}>
                {filtered.map((student, i) => {
                  const isSelected = selected.includes(student.id)
                  const isFull = !isSelected && selected.length >= maxCount
                  return (
                    <motion.button
                      key={student.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: isFull ? 0.4 : 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.012, 0.3), duration: 0.2 }}
                      whileHover={!isFull ? { scale: 1.06 } : undefined}
                      whileTap={!isFull ? { scale: 0.94 } : undefined}
                      onClick={() => toggle(student.id)}
                      disabled={isFull}
                      style={{
                        padding: '10px 6px', borderRadius: 10,
                        border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        background: isSelected ? 'var(--bg-accent)' : 'var(--bg-surface-2)',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        position: 'relative',
                      }}
                    >
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            transition={{ type: 'spring', damping: 18, stiffness: 400 }}
                            style={{ position: 'absolute', top: 5, right: 5, width: 16, height: 16, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Check size={10} color="#fff" strokeWidth={3} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <StudentAvatar student={student} size={62} radius={12} fontSize={13} />
                      <div style={{ fontSize: 12, color: isSelected ? 'var(--accent)' : 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.3, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {student.nameKo}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 18 }}
                >
                  검색 결과가 없어요
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* 선택된 학생 미리보기 + 확인 */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, display: 'flex', gap: 8 }}>
            <AnimatePresence mode="popLayout">
              {Array.from({ length: maxCount }).map((_, i) => {
                const id = selected[i]
                const s = id ? STUDENTS.find(x => x.id === id) : null
                return s ? (
                  <motion.div
                    key={id}
                    initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 360 }}
                  >
                    <StudentAvatar student={s} size={40} radius={9} fontSize={11} />
                  </motion.div>
                ) : (
                  <div key={`empty-${i}`} style={{ width: 40, height: 40, borderRadius: 9, border: '1.5px dashed var(--border)', background: 'var(--bg-surface-2)', flexShrink: 0 }} />
                )
              })}
            </AnimatePresence>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onConfirm(selected)}
            style={{ padding: '11px 28px', borderRadius: 9, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 19, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
          >
            확인
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
