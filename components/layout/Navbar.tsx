'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const NAV_ITEMS = [
  { href: '/total-assault', label: '총력전' },
  { href: '/gacha-planner', label: '모집 시뮬레이터' },
  { href: '/students', label: '학생 픽률' },
  { href: '/calendar', label: '캘린더' },
]

export default function Navbar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <header style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 19, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>BlueStats</div>
            <div style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 500 }}>블루 아카이브 통계</div>
          </Link>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  fontSize: 17,
                  fontWeight: active ? 500 : 400,
                  color: active ? 'var(--accent)' : 'var(--text-secondary)',
                  background: active ? 'var(--bg-accent)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            )
          })}
          <button
            onClick={toggle}
            style={{
              marginLeft: 8,
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--bg-surface-2)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </nav>
      </div>
    </header>
  )
}
