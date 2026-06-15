import { Boss } from '@/types'

export const BOSSES: Boss[] = [
  {
    id: 'chesed',
    nameKo: '헤세드',
    nameEn: 'Chesed',
    terrain: 'outdoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Chesed.png',
  },
  {
    id: 'binah',
    nameKo: '비나',
    nameEn: 'Binah',
    terrain: 'indoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Binah.png',
  },
  {
    id: 'kaitenFX',
    nameKo: '카이텐FX',
    nameEn: 'Kaiten FX Mk.0',
    terrain: 'outdoor',
    weaknesses: ['piercing'],
    imageUrl: 'https://schale.gg/images/raid/Boss_ShiroKuro.png',
  },
  {
    id: 'hieronymus',
    nameKo: '히에로니무스',
    nameEn: 'Hieronymus',
    terrain: 'indoor',
    weaknesses: ['mystic'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Hieronymus.png',
  },
  {
    id: 'hod',
    nameKo: '호드',
    nameEn: 'Hod',
    terrain: 'outdoor',
    weaknesses: ['piercing'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Hod.png',
  },
  {
    id: 'netzach',
    nameKo: '네짜크',
    nameEn: 'Netzach',
    terrain: 'special',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Netzach.png',
  },
  {
    id: 'perorosPeak',
    nameKo: '페로로스 정상',
    nameEn: "Perorodzilla's Peak",
    terrain: 'outdoor',
    weaknesses: ['mystic'],
    imageUrl: 'https://schale.gg/images/raid/Boss_PerorosPeak.png',
  },
  {
    id: 'goz',
    nameKo: '고즈',
    nameEn: 'Goz',
    terrain: 'indoor',
    weaknesses: ['sonic'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Goz.png',
  },
]

export const TERRAIN_LABEL: Record<string, string> = {
  indoor: '인도어',
  outdoor: '아웃도어',
  special: '스페셜',
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  extreme: '익스트림',
  insane: '인세인',
  torment: '토먼트',
}

export const ATTACK_TYPE_LABEL: Record<string, string> = {
  explosive: '폭발',
  piercing: '관통',
  mystic: '신비',
  sonic: '진동',
}

export const RANK_ORDER: Record<string, number> = {
  SS: 5, S: 4, A: 3, B: 2, C: 1,
}
