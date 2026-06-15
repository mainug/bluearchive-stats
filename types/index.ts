export type Terrain = 'indoor' | 'outdoor' | 'special' | 'urban'
export type Difficulty = 'extreme' | 'insane' | 'torment'
export type AttackType = 'explosive' | 'piercing' | 'mystic' | 'sonic'
export type ArmorType = 'light' | 'heavy' | 'special' | 'elastic'
export type Role = 'striker' | 'special'
export interface Boss {
  id: string
  nameKo: string
  nameEn: string
  terrain: Terrain
  imageUrl?: string
  weaknesses: AttackType[]
}

export interface Student {
  id: string
  nameKo: string
  nameEn: string
  school: string
  role: Role
  attackType: AttackType
  armorType: ArmorType
  imageUrl?: string
  isLimited: boolean
  released: boolean
}

export interface Submission {
  id: string
  bossId: string
  difficulty: Difficulty
  score: number
  parties: string[][]
  season: number
  createdAt: string
}

export interface StudentPickRate {
  student: Student
  pickCount: number
  pickRate: number
}
