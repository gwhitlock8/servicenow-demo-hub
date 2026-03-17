import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import Link from 'next/link'
import type { ScenarioType } from '@/types'

type DemoCard = {
  id: string
  title: string
  scenario: string
  customer: string | null
  description: string | null
  published: boolean
  personas: { id: string }[]
  steps: { id: string; durationMins: number | null }[]
}

const SCENARIOS: { id: ScenarioType; label: string; icon: string; description: string }[] = [
  { id: 'itsm', label: 'ITSM', icon: '🎫', description: 'IT Service Management · Incident, Problem, Change, Now Assist' },
  { id: 'csm', label: 'CSM', icon: '🤝', description: 'Customer Service Management · Field Service, Order Management' },
  { id: 'hrsd', label: 'HRSD', icon: '👥', description: 'HR Service Delivery · Employee Center, Lifecycle Events' },
  { id: 'itom', label: 'ITOM', icon: '🔭', description: 'IT Operations Management · Discovery, Event Management, AIOps' },
]

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  itsm: '#62d84e',
  csm: '#3b82f6',
  hrsd: '#a78bfa',
  itom: '#2dd4bf',
}

type Props = {
  searchParams: Promise<{ scenario?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { scenario } = await searchParams
  const session = await auth()
  const activeScenario = (scenario as ScenarioType) || null

  const demosRaw = await prisma.demo.findMany({
    where: {
      ...(activeScenario ? { scenario: activeScenario } : {}),
      ...(!session ? { published: true } : {}),
    },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  const demos = demosRaw as DemoCard[]

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          ServiceNow Demo Hub
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Interactive demo guides for every ServiceNow scenario
        </p>
      </div>

      {/* Scenario Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <Link
          href="/"
          style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, textDecoration: 'none',
            border: `1px solid ${!activeScenario ? 'var(--accent-green)' : 'var(--border)'}`,
            background: !activeScenario ? 'rgba(98,216,78,0.1)' : 'var(--bg-card)',
            color: !activeScenario ? 'var(--accent-green)' : 'var(--text-secondary)',
          }}
        >
          All
        </Link>
        {SCENARIOS.map((s) => (
          <Link key={s.id} href={`/?scenario=${s.id}`}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px',
              border: `1px solid ${activeScenario === s.id ? SCENARIO_COLORS[s.id] : 'var(--border)'}`,
              background: activeScenario === s.id ? `${SCENARIO_COLORS[s.id]}18` : 'var(--bg-card)',
              color: activeScenario === s.id ? SCENARIO_COLORS[s.id] : 'var(--text-secondary)',
            }}
          >
            <span>{s.icon}</span>{s.label}
          </Link>
        ))}
      </div>

      {activeScenario && (
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px', paddingLeft: '4px' }}>
          {SCENARIOS.find((s) => s.id === activeScenario)?.description}
        </p>
      )}

      {/* Demo Grid */}
      {demos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📋</div>
          <p style={{ marginBottom: '8px' }}>No demos found</p>
          {session && (
            <Link href="/admin/demos/new" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '14px' }}>
              Create your first demo →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {demos.map((demo) => {
            const color = SCENARIO_COLORS[demo.scenario as ScenarioType] || 'var(--accent-blue)'
            const scenarioInfo = SCENARIOS.find((s) => s.id === demo.scenario)
            const totalMins = demo.steps.reduce((sum, s) => sum + (s.durationMins ?? 0), 0)

            return (
              <div key={demo.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '3px', background: color }} />
                <div style={{ padding: '20px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: `${color}18`, color }}>
                      {scenarioInfo?.icon} {demo.scenario.toUpperCase()}
                    </span>
                    {!demo.published && (
                      <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Draft
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1.3 }}>
                    {demo.title}
                  </h2>
                  {demo.customer && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>{demo.customer}</p>}
                  {demo.description && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>{demo.description}</p>}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    {demo.steps.length > 0 && <span>📍 {demo.steps.length} steps</span>}
                    {totalMins > 0 && <span>⏱ {totalMins} min</span>}
                    {demo.personas.length > 0 && <span>👤 {demo.personas.length} personas</span>}
                  </div>
                </div>
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' }}>
                  <Link href={`/demos/${demo.id}`} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', background: color, color: '#0b1120' }}>
                    View Demo
                  </Link>
                  {session && (
                    <Link href={`/admin/demos/${demo.id}/edit`} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
