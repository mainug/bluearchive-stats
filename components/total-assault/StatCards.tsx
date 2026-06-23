interface Props {
  totalSubmissions: number
  avgScore: number
}

export default function StatCards({ totalSubmissions, avgScore }: Props) {
  const cards = [
    { label: '클리어 제출', value: totalSubmissions.toLocaleString() },
    { label: '평균 점수', value: avgScore.toLocaleString(), accent: true },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {cards.map(card => (
        <div
          key={card.label}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, color: card.accent ? 'var(--accent)' : 'var(--text-primary)' }}>
            {card.value}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{card.label}</div>
        </div>
      ))}
    </div>
  )
}
