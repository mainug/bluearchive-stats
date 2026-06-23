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
    terrain: 'outdoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Binah.png',
  },
  {
    id: 'shiroKuro',
    nameKo: '시로&쿠로',
    nameEn: 'ShiroKuro',
    terrain: 'urban',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_ShiroKuro.png',
  },
  {
    id: 'kaitenFX',
    nameKo: '카이텐FX',
    nameEn: 'Kaiten FX Mk.0',
    terrain: 'outdoor',
    weaknesses: ['piercing'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Kaiten.png',
  },
  {
    id: 'hieronymus',
    nameKo: '예로니무스',
    nameEn: 'Hieronymus',
    terrain: 'indoor',
    weaknesses: ['mystic'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Hieronymus.png',
  },
  {
    id: 'hod',
    nameKo: '호드',
    nameEn: 'Hod',
    terrain: 'urban',
    weaknesses: ['piercing'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Hod.png',
  },
  {
    id: 'netzach',
    nameKo: '네짜크',
    nameEn: 'Netzach',
    terrain: 'outdoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Netzach.png',
  },
  {
    id: 'perorosPeak',
    nameKo: '페로로지라',
    nameEn: 'Perorodzilla',
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
  {
    id: 'gregorius',
    nameKo: '그레고리오',
    nameEn: 'Gregorius',
    terrain: 'indoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Gregorius.png',
  },
  {
    id: 'hovercraft',
    nameKo: '호버크래프트',
    nameEn: 'Hovercraft',
    terrain: 'outdoor',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Hovercraft.png',
  },
  {
    id: 'kurokage',
    nameKo: '쿠로카게',
    nameEn: 'Myouki Kurokage',
    terrain: 'urban',
    weaknesses: ['mystic'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Kurokage.png',
  },
  {
    id: 'geburah',
    nameKo: '게부라',
    nameEn: 'Geburah',
    terrain: 'outdoor',
    weaknesses: ['piercing'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Geburah.png',
  },
  {
    id: 'yesod',
    nameKo: '예소드',
    nameEn: 'Yesod',
    terrain: 'urban',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Yesod.png',
  },
  {
    id: 'drumbarka',
    nameKo: '드럼바카',
    nameEn: 'Drumbarka',
    terrain: 'urban',
    weaknesses: ['explosive'],
    imageUrl: 'https://schale.gg/images/raid/Boss_Drumbarka.png',
  },
]

export const TERRAIN_LABEL: Record<string, string> = {
  indoor: '실내',
  outdoor: '야외',
  urban: '시가전',
  special: '스페셜',
}

export const DIFFICULTY_LABEL: Record<string, string> = {
  extreme: '익스트림',
  insane: '인세인',
  torment: '토먼트',
  lunatic: '루나틱',
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

import { Difficulty } from '@/types'

export function getAvailableDifficulties(server: string, season: number): Difficulty[] {
  const hasTorment =
    (server === 'jp' && season >= 47) ||
    (server === 'global' && season >= 44)
  const hasLunatic =
    (server === 'jp' && season >= 74) ||
    (server === 'global' && season >= 71)
  if (hasLunatic) return ['lunatic', 'torment', 'insane', 'extreme']
  if (hasTorment) return ['torment', 'insane', 'extreme']
  return ['insane', 'extreme']
}
