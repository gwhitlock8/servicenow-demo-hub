'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function NavBar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  return (
    <nav
      style={{
        background: 'var(--bg-nav)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '8px',
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          marginRight: '24px',
        }}
      >
        <span style={{ fontSize: '18px' }}>⚡</span>
        <span
          style={{
            fontWeight: 700,
            fontSize: '15px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Demo Hub
        </span>
      </Link>

      {/* Scenario nav */}
      {(['itsm', 'csm', 'hrsd', 'itom'] as const).map((s) => (
        <Link
          key={s}
          href={`/?scenario=${s}`}
          style={{
            padding: '5px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {s}
        </Link>
      ))}

      <div style={{ flex: 1 }} />

      {/* Right side */}
      {session ? (
        <>
          <Link
            href="/admin"
            style={{
              padding: '5px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              textDecoration: 'none',
              color: isActive('/admin') ? 'var(--accent-green)' : 'var(--text-secondary)',
              background: isActive('/admin') ? 'rgba(98,216,78,0.1)' : 'transparent',
            }}
          >
            Admin
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{
              padding: '5px 14px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
          <span
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              paddingLeft: '4px',
            }}
          >
            {session.user?.name || session.user?.email}
          </span>
        </>
      ) : (
        <Link
          href="/login"
          style={{
            padding: '5px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            background: 'var(--accent-green)',
            color: '#0b1120',
          }}
        >
          Sign in
        </Link>
      )}
    </nav>
  )
}
