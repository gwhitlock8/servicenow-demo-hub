'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { DemoData, PersonaData, StepData, ContentBlock } from '@/types'
import { ContentBlockRenderer } from './ContentBlockRenderer'

const SCENARIO_COLORS: Record<string, string> = {
  itsm: '#62d84e',
  csm: '#3b82f6',
  hrsd: '#a78bfa',
  itom: '#2dd4bf',
}

const PERSONA_COLORS = ['#3b82f6', '#a78bfa', '#62d84e', '#2dd4bf', '#fb923c', '#f87171', '#eab308']

const PERSONA_TYPE_LABELS: Record<string, string> = {
  'decision-maker': 'Decision Maker',
  practitioner: 'Practitioner',
  champion: 'Champion',
}

function personaColor(index: number) {
  return PERSONA_COLORS[index % PERSONA_COLORS.length]
}

function parseBlocks(raw: string): ContentBlock[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parsePainPoints(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Derive persona names referenced in a step's talktrack blocks
function getPersonasInStep(blocks: ContentBlock[]): string[] {
  const names = new Set<string>()
  for (const block of blocks) {
    if (block.type === 'talktrack' && block.lines) {
      for (const line of block.lines) {
        if (line.persona) names.add(line.persona)
      }
    }
    if (block.type === 'callout' && block.persona) {
      names.add(block.persona)
    }
  }
  return Array.from(names)
}

function PersonaCard({ persona, index, compact = false }: { persona: PersonaData; index: number; compact?: boolean }) {
  const color = personaColor(index)
  const painPoints = parsePainPoints(persona.painPoints)

  if (compact) {
    return (
      <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--bg-base)', border: `1px solid ${color}30` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: painPoints.length ? '6px' : 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', background: `${color}20`,
            border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '12px', fontWeight: 700, color, flexShrink: 0,
          }}>
            {persona.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{persona.name}</div>
            {persona.role && <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.2 }}>{persona.role}</div>}
          </div>
          {persona.type && (
            <span style={{ marginLeft: 'auto', fontSize: '10px', fontWeight: 600, color, background: `${color}15`, padding: '2px 6px', borderRadius: '3px', textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 }}>
              {PERSONA_TYPE_LABELS[persona.type] ?? persona.type}
            </span>
          )}
        </div>
        {painPoints.length > 0 && (
          <div style={{ paddingLeft: '36px' }}>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {painPoints.map((pt, i) => (
                <li key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, display: 'flex', gap: '5px' }}>
                  <span style={{ color, flexShrink: 0 }}>·</span>{pt}
                </li>
              ))}
            </ul>
          </div>
        )}
        {persona.quote && (
          <p style={{ margin: '8px 0 0 36px', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
            &ldquo;{persona.quote}&rdquo;
          </p>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-card)', border: `1px solid ${color}25`, marginBottom: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%', background: `${color}20`,
          border: `2px solid ${color}`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '15px', fontWeight: 700, color, flexShrink: 0,
        }}>
          {persona.name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{persona.name}</div>
          {persona.role && <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.3 }}>{persona.role}</div>}
        </div>
        {persona.type && (
          <span style={{ fontSize: '10px', fontWeight: 700, color, background: `${color}15`, padding: '3px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {PERSONA_TYPE_LABELS[persona.type] ?? persona.type}
          </span>
        )}
      </div>
      {painPoints.length > 0 && (
        <ul style={{ margin: '0 0 8px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {painPoints.map((pt, i) => (
            <li key={i} style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
              <span style={{ color, marginTop: '2px', flexShrink: 0 }}>›</span>{pt}
            </li>
          ))}
        </ul>
      )}
      {persona.quote && (
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.5, borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
          &ldquo;{persona.quote}&rdquo;
        </p>
      )}
    </div>
  )
}

export function DemoViewer({ demo, isAdmin }: { demo: DemoData; isAdmin?: boolean }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [personasExpanded, setPersonasExpanded] = useState(true)
  const mainRef = useRef<HTMLDivElement>(null)

  const accentColor = SCENARIO_COLORS[demo.scenario] ?? 'var(--accent-green)'
  const totalSteps = demo.steps.length
  const step = demo.steps[currentStep]

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  const blocks = step ? parseBlocks(step.contentBlocks) : []
  const referencedPersonaNames = step ? getPersonasInStep(blocks) : []
  const referencedPersonas = demo.personas.filter((p) =>
    referencedPersonaNames.some((n) => n.toLowerCase() === p.name.toLowerCase())
  )

  const totalMins = demo.steps.reduce((sum, s) => sum + (s.durationMins ?? 0), 0)

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 52px)', overflow: 'hidden' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40, display: 'none' }}
          className="mobile-overlay"
        />
      )}

      {/* LEFT SIDEBAR */}
      <aside style={{
        width: '280px',
        minWidth: '280px',
        borderRight: '1px solid var(--border)',
        background: 'var(--bg-nav)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <Link
            href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '12px', marginBottom: '12px' }}
          >
            ← Back to Hub
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{
              padding: '2px 7px', borderRadius: '4px', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.07em', textTransform: 'uppercase',
              background: `${accentColor}18`, color: accentColor,
            }}>
              {demo.scenario.toUpperCase()}
            </span>
            {!demo.published && (
              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, background: 'rgba(251,146,60,0.15)', color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Draft
              </span>
            )}
          </div>
          <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '2px' }}>
            {demo.title}
          </h1>
          {demo.customer && (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>{demo.customer}</p>
          )}
          {/* Progress */}
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>Progress</span>
              <span>{currentStep + 1} / {totalSteps}</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((currentStep + 1) / totalSteps) * 100}%`, background: accentColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
          </div>
          {totalMins > 0 && (
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>⏱ {totalMins} min total</p>
          )}
          {isAdmin && (
            <Link
              href={`/admin/demos/${demo.id}/edit`}
              style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: '5px' }}
            >
              ✏️ Edit Demo
            </Link>
          )}
        </div>

        {/* Scrollable sidebar body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {/* Know Your Room */}
          {demo.personas.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <button
                onClick={() => setPersonasExpanded(!personasExpanded)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 4px',
                  color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px',
                }}
              >
                <span>Know Your Room</span>
                <span style={{ transition: 'transform 0.2s', transform: personasExpanded ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
              </button>
              {personasExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {demo.personas.map((p, i) => (
                    <PersonaCard key={p.id} persona={p} index={i} compact />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Steps navigation */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '6px 4px', marginBottom: '4px' }}>
              Demo Acts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {demo.steps.map((s, i) => {
                const isActive = i === currentStep
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentStep(i)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '6px',
                      background: isActive ? `${accentColor}12` : 'transparent',
                      border: `1px solid ${isActive ? `${accentColor}40` : 'transparent'}`,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      {s.icon && <span style={{ fontSize: '14px', flexShrink: 0 }}>{s.icon}</span>}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {s.actLabel && (
                          <div style={{ fontSize: '10px', fontWeight: 700, color: isActive ? accentColor : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2, marginBottom: '1px' }}>
                            {s.actLabel}
                          </div>
                        )}
                        <div style={{ fontSize: '12px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.title}
                        </div>
                      </div>
                      {s.durationMins && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{s.durationMins}m</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main ref={mainRef} style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {totalSteps === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>📋</span>
            <p>No steps added yet.</p>
            {isAdmin && (
              <Link href={`/admin/demos/${demo.id}/edit`} style={{ color: accentColor, textDecoration: 'none', fontSize: '14px' }}>
                Add steps →
              </Link>
            )}
          </div>
        ) : step ? (
          <>
            {/* Step header */}
            <div style={{ padding: '28px 36px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                {step.icon && (
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px', background: `${accentColor}15`,
                    border: `1px solid ${accentColor}30`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '22px', flexShrink: 0,
                  }}>
                    {step.icon}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {step.actLabel && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {step.actLabel}
                      </span>
                    )}
                    {step.durationMins && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '1px 8px', borderRadius: '4px' }}>
                        ⏱ {step.durationMins} min
                      </span>
                    )}
                  </div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: step.subtitle ? '6px' : 0, letterSpacing: '-0.02em' }}>
                    {step.title}
                  </h2>
                  {step.subtitle && (
                    <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                      {step.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Persona chips for this step */}
              {referencedPersonas.length > 0 && (
                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>Relevant to:</span>
                  {referencedPersonas.map((p, i) => {
                    const idx = demo.personas.findIndex((dp) => dp.id === p.id)
                    const color = personaColor(idx >= 0 ? idx : i)
                    return (
                      <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '20px', fontSize: '12px', background: `${color}15`, color, border: `1px solid ${color}30` }}>
                        <span style={{ fontWeight: 700 }}>{p.name.charAt(0)}</span>
                        {p.name}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Content blocks */}
            <div style={{ padding: '28px 36px', flex: 1 }}>
              <ContentBlockRenderer blocks={blocks} />

              {blocks.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>
                  No content added for this step yet.
                </div>
              )}
            </div>

            {/* Prev / Next navigation */}
            <div style={{ padding: '20px 36px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                style={{
                  padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                  border: '1px solid var(--border)', background: 'var(--bg-card)',
                  color: currentStep === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentStep === 0 ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                ← Previous
              </button>

              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {currentStep + 1} of {totalSteps}
              </span>

              {currentStep < totalSteps - 1 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  style={{
                    padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    border: 'none', background: accentColor, color: '#0b1120',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  Next →
                </button>
              ) : (
                <Link
                  href="/"
                  style={{
                    padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                    textDecoration: 'none', background: 'rgba(98,216,78,0.1)',
                    color: 'var(--accent-green)', border: '1px solid rgba(98,216,78,0.3)',
                  }}
                >
                  Back to Hub ✓
                </Link>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  )
}
