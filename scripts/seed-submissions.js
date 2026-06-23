const { createClient } = require('@supabase/supabase-js')

const sb = createClient(
  'https://ayfhfquulrzuqqoqkntk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZmhmcXV1bHJ6dXFxb3FrbnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NzMzMjEsImV4cCI6MjA5NzA0OTMyMX0.6UUdCQj3owXALQ49B9_2MCEr5_2vV34z6tKF0X2iXVQ'
)

function pick(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randScore(difficulty) {
  switch (difficulty) {
    case 'lunatic': return randInt(35000000, 60000000)
    case 'torment': return randInt(18000000, 40000000)
    case 'insane':  return randInt(8000000, 20000000)
    case 'extreme': return randInt(3000000, 9000000)
  }
}

// Parties: 4 strikers + 2 specials, saved as flat array
function makeParty(strikerPool, specialPool) {
  return [...pick(strikerPool, 4), ...pick(specialPool, 2)]
}

function makeSubmissions(season, bossId, count, strikerPool, specialPool, diffWeights) {
  const rows = []
  for (let i = 0; i < count; i++) {
    const difficulty = weightedPick(diffWeights)
    const numParties = randInt(1, 2)
    const parties = []
    for (let p = 0; p < numParties; p++) {
      parties.push(makeParty(strikerPool, specialPool))
    }
    rows.push({ season, boss_id: bossId, difficulty, score: randScore(difficulty), parties })
  }
  return rows
}

function weightedPick(weights) {
  const total = weights.reduce((s, [, w]) => s + w, 0)
  let r = Math.random() * total
  for (const [val, w] of weights) {
    r -= w
    if (r <= 0) return val
  }
  return weights[weights.length - 1][0]
}

const diffAll = [['lunatic', 15], ['torment', 40], ['insane', 30], ['extreme', 15]]

// ─── Boss pools ─────────────────────────────────────────────────────────────

const SPECIALS_GENERAL = ['ako', 'hare', 'nagisa', 'fuuka', 'hibiki', 'kotama', 'hanae', 'juri', 'chinatsu', 'nodoka', 'serina', 'mashiro']
const SPECIALS_MYSTIC  = ['shizuko', 'chinatsu', 'nodoka', 'serina', 'ayane', 'shimiko', 'fuuka', 'hare', 'ako']
const SPECIALS_SONIC   = ['serina', 'shimiko', 'fuuka', 'hare', 'juri', 'hanae', 'chinatsu', 'nodoka']
const SPECIALS_PIERCING = ['ako', 'hare', 'nagisa', 'fuuka', 'ayane', 'utaha', 'nodoka', 'chinatsu', 'kotama']

const STRIKERS_EXPLOSIVE = [
  'hina', 'eimi', 'mutsuki', 'kayoko', 'akari', 'izumi', 'yuuka', 'shiroko', 'shun', 'aru',
  'haruka', 'serika', 'ch0063', 'suzumi', 'azusa', 'koharu', 'ch0101', 'ch0233', 'ch0231', 'ch0230',
  'ch0088', 'ch0135', 'ch0138', 'ch0215', 'ch0217', 'ch0185',
]

const STRIKERS_PIERCING = [
  'iori', 'hoshino', 'maki', 'neru', 'hihumi', 'tsurugi', 'akane', 'hasumi', 'nonomi', 'zunko',
  'tsubaki', 'kotori', 'pina', 'midori', 'momoi', 'cherino', 'yuzu', 'tomoe', 'marina', 'miyako',
  'kazusa', 'ch0137', 'ch0069', 'ch0167', 'seia', 'ch0240', 'ch0239',
]

const STRIKERS_MYSTIC = [
  'haruna', 'chise', 'asuna', 'izuna', 'aris', 'wakamo', 'shiroko_ridingsuit', 'ch0100',
  'ch0155', 'mutsuki_newyear', 'mimori', 'hinata', 'ch0113', 'ch0114', 'ch0095',
  'sakurako', 'ch0198', 'ch0107', 'ibukim', 'kei', 'subaru', 'takane', 'kanoe',
]

const STRIKERS_SONIC = [
  'momiji', 'ch0071', 'ch0089', 'ch0161', 'ch0224', 'ch0225', 'ch0209',
  'chiaki', 'rei', 'hikari', 'nozomi', 'nagusa', 'eri', 'miyo', 'fuyu', 'aoba',
]

// ─── Seasons to seed ────────────────────────────────────────────────────────

async function main() {
  const batches = [
    // Global
    { season: 83, boss_id: 'binah',      count: 35, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 82, boss_id: 'hovercraft', count: 30, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 81, boss_id: 'kurokage',   count: 28, strikers: STRIKERS_MYSTIC,    specials: SPECIALS_MYSTIC,   diffs: diffAll },
    { season: 80, boss_id: 'yesod',      count: 28, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 79, boss_id: 'geburah',    count: 22, strikers: STRIKERS_PIERCING,  specials: SPECIALS_PIERCING, diffs: diffAll },
    { season: 78, boss_id: 'perorosPeak',count: 20, strikers: STRIKERS_MYSTIC,    specials: SPECIALS_MYSTIC,   diffs: diffAll },
    { season: 77, boss_id: 'hod',        count: 20, strikers: STRIKERS_PIERCING,  specials: SPECIALS_PIERCING, diffs: diffAll },
    // JP
    { season: 89, boss_id: 'drumbarka',  count: 30, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 88, boss_id: 'kaitenFX',   count: 28, strikers: STRIKERS_PIERCING,  specials: SPECIALS_PIERCING, diffs: diffAll },
    { season: 87, boss_id: 'goz',        count: 25, strikers: STRIKERS_SONIC,     specials: SPECIALS_SONIC,    diffs: diffAll },
    { season: 86, boss_id: 'binah',      count: 30, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 85, boss_id: 'hovercraft', count: 25, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 84, boss_id: 'kurokage',   count: 22, strikers: STRIKERS_MYSTIC,    specials: SPECIALS_MYSTIC,   diffs: diffAll },
    { season: 83, boss_id: 'yesod',      count: 25, strikers: STRIKERS_EXPLOSIVE, specials: SPECIALS_GENERAL,  diffs: diffAll },
    { season: 82, boss_id: 'geburah',    count: 22, strikers: STRIKERS_PIERCING,  specials: SPECIALS_PIERCING, diffs: diffAll },
    { season: 81, boss_id: 'perorosPeak',count: 20, strikers: STRIKERS_MYSTIC,    specials: SPECIALS_MYSTIC,   diffs: diffAll },
    { season: 80, boss_id: 'hod',        count: 20, strikers: STRIKERS_PIERCING,  specials: SPECIALS_PIERCING, diffs: diffAll },
    { season: 79, boss_id: 'goz',        count: 18, strikers: STRIKERS_SONIC,     specials: SPECIALS_SONIC,    diffs: diffAll },
  ]

  let total = 0
  for (const b of batches) {
    const rows = makeSubmissions(b.season, b.boss_id, b.count, b.strikers, b.specials, b.diffs)
    const { error } = await sb.from('submissions').insert(rows)
    if (error) {
      console.error(`[오류] S${b.season} ${b.boss_id}:`, error.message)
    } else {
      console.log(`[완료] S${b.season} ${b.boss_id}: ${rows.length}건`)
      total += rows.length
    }
  }
  console.log(`\n총 ${total}건 삽입 완료`)
}

main()
