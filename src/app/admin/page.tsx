import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ScenarioType } from '@/types'

type DemoRow = {
  id: string
  title: string
  scenario: string
  customer: string | null
  published: boolean
  personas: { id: string }[]
  steps: { id: string; durationMins: number | null }[]
}

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  itsm: '#62d84e',
  csm: '#3b82f6',
  hrsd: '#a78bfa',
  itom: '#2dd4bf',
}

const SCENARIO_ICONS: Record<ScenarioType, string> = {
  itsm: '🎫',
  csm: '🤝',
  hrsd: '👥',
  itom: '🔭',
}

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/admin')

  const [demos, userCount] = await Promise.all([
    prisma.demo.findMany({
      include: {
        personas: { select: { id: true } },
        steps: { select: { id: true, durationMins: true } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.user.count(),
  ])

  const demoRows = demos as DemoRow[]
  const published = demoRows.filter((d) => d.published).length
  const drafts = demoRows.length - published
  const totalSteps = demoRows.reduce((sum, d) => sum + d.steps.length, 0)

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.02em' }}>
            Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Manage demo guides and users
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/admin/users"
            style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)', background: 'var(--bg-card)' }}
          >
            👤 Manage Users
          </Link>
          <Link
            href="/admin/demos/new"
            style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', background: 'var(--accent-green)', color: '#0b1120' }}
          >
            + New Demo
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px', marginBottom: '36px' }}>
        {[
          { label: 'Total Demos', value: demos.length, icon: '📋', color: 'var(--accent-green)' },
          { label: 'Published', value: published, icon: '✅', color: 'var(--accent-teal)' },
          { label: 'Drafts', value: drafts, icon: '📝', color: 'var(--accent-orange)' },
          { label: 'Total Steps', value: totalSteps, icon: '📍', color: 'var(--accent-blue)' },
          { label: 'Users', value: userCount, icon: '👤', color: 'var(--accent-purple)' },
        ].map((stat) => (
          <div key={stat.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Demos table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>All Demos</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{demos.length} total</span>
        </div>

        {demos.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
            <p style={{ marginBottom: '12px' }}>No demos yet</p>
            <Link href="/admin/demos/new" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '14px' }}>
              Create your first demo →
            </Link>
          </div>
        ) : (
          <div>
            {demoRows.map((demo, i) => {
              const color = SCENARIO_COLORS[demo.scenario as ScenarioType] ?? 'var(--accent-blue)'
              const icon = SCENARIO_ICONS[demo.scenario as ScenarioType] ?? '📋'
              const totalMins = demo.steps.reduce((sum, s) => sum + (s.durationMins ?? 0), 0)

              return (
                <div
                  key={demo.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i < demos.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                  }}
                >
                  {/* Scenario badge */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                    letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: `${color}18`, color, flexShrink: 0, minWidth: '70px',
                  }}>
                    {icon} {demo.scenario.toUpperCase()}
                  </span>

                  {/* Title + customer */}
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                      {demo.title}
                    </div>
                    {demo.customer && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{demo.customer}</div>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0, flexWrap: 'wrap' }}>
                    <span>{demo.steps.length} steps</span>
                    {totalMins > 0 && <span>{totalMins}m</span>}
                    <span>{demo.personas.length} personas</span>
                  </div>

                  {/* Status */}
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0,
                    background: demo.published ? 'rgba(45,212,191,0.12)' : 'rgba(251,146,60,0.12)',
                    color: demo.published ? 'var(--accent-teal)' : 'var(--accent-orange)',
                  }}>
                    {demo.published ? 'Published' : 'Draft'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <Link
                      href={`/demos/${demo.id}`}
                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/demos/${demo.id}/edit`}
                      style={{ padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textDecoration: 'none', background: `${color}18`, color }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
