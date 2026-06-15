import { Student } from '@/types'

export const SCHOOL_COLORS: Record<string, { bg: string; text: string }> = {
  Gehenna:   { bg: '#3D1A1A', text: '#F87171' },
  Abydos:    { bg: '#1A2B3D', text: '#60A5FA' },
  Trinity:   { bg: '#2D1F3D', text: '#C084FC' },
  Millennium:{ bg: '#1A2D2A', text: '#34D399' },
  Arius:     { bg: '#2D2A1A', text: '#FBBF24' },
  Hyakkiyako:{ bg: '#3D1A2D', text: '#F472B6' },
  RedWinter: { bg: '#2A1A1A', text: '#FB923C' },
  Shanhaijing:{ bg: '#1A3D2D', text: '#4ADE80' },
  SRT:       { bg: '#1E2A3D', text: '#93C5FD' },
  Valkyrie:  { bg: '#3D2A1A', text: '#FCD34D' },
  default:   { bg: '#1E2A3D', text: '#94A3B8' },
}

export const STUDENTS: Student[] = [
  { id: 'aru',              nameKo: '아루',            nameEn: 'Aru',                   school: 'Gehenna',    role: 'striker', attackType: 'explosive', armorType: 'light',   isLimited: false, released: true },
  { id: 'hoshino',          nameKo: '호시노',          nameEn: 'Hoshino',               school: 'Abydos',     role: 'striker', attackType: 'piercing',  armorType: 'heavy',   isLimited: false, released: true },
  { id: 'hoshino_swimsuit', nameKo: '호시노 (수영복)', nameEn: 'Hoshino (Swimsuit)',    school: 'Abydos',     role: 'striker', attackType: 'piercing',  armorType: 'heavy',   isLimited: true,  released: true },
  { id: 'serina',           nameKo: '세리나',          nameEn: 'Serina',                school: 'Trinity',    role: 'special', attackType: 'mystic',    armorType: 'light',   isLimited: false, released: true },
  { id: 'chinatsu',         nameKo: '치나츠 (체육제)', nameEn: 'Chinatsu (Track)',      school: 'Trinity',    role: 'special', attackType: 'explosive', armorType: 'light',   isLimited: true,  released: true },
  { id: 'iori',             nameKo: '이오리',          nameEn: 'Iori',                  school: 'Millennium', role: 'striker', attackType: 'explosive', armorType: 'light',   isLimited: false, released: true },
  { id: 'yuzu',             nameKo: '유즈',            nameEn: 'Yuzu',                  school: 'Gehenna',    role: 'striker', attackType: 'mystic',    armorType: 'light',   isLimited: false, released: true },
  { id: 'haruna',           nameKo: '하루나',          nameEn: 'Haruna',                school: 'Gehenna',    role: 'striker', attackType: 'explosive', armorType: 'heavy',   isLimited: false, released: true },
  { id: 'ako',              nameKo: '아코',            nameEn: 'Ako',                   school: 'Gehenna',    role: 'special', attackType: 'explosive', armorType: 'light',   isLimited: true,  released: true },
  { id: 'ui',               nameKo: '우이',            nameEn: 'Ui',                    school: 'Millennium', role: 'special', attackType: 'mystic',    armorType: 'light',   isLimited: false, released: true },
]

export function getStudentById(id: string): Student | undefined {
  return STUDENTS.find(s => s.id === id)
}

export function getSchoolColor(school: string) {
  return SCHOOL_COLORS[school] ?? SCHOOL_COLORS.default
}
