'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { DemoData, PersonaData, StepData, ContentBlock, ContentBlockType, ScenarioType, PersonaType } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2)
}

function parseBlocks(raw: string): ContentBlock[] {
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

function parsePainPoints(raw?: string | null): string[] {
  if (!raw) return []
  try {
    const p = JSON.parse(raw)
    return Array.isArray(p) ? p : []
  } catch {
    return []
  }
}

// ─── types ───────────────────────────────────────────────────────────────────

interface LocalPersona {
  _id: string
  name: string
  role: string
  type: string
  painPointsRaw: string   // newline-separated
  quote: string
  order: number
}

interface LocalBlock {
  _id: string
  type: ContentBlockType
  label: string
  content: string
  itemsRaw: string        // newline-separated
  linesRaw: string        // "Persona Name: line text" per line
  persona: string
  tagsRaw: string         // comma-separated
}

interface LocalStep {
  _id: string
  order: number
  title: string
  subtitle: string
  icon: string
  durationMins: string
  actLabel: string
  blocks: LocalBlock[]
}

// ─── converters ─────────────────────────────────────────────────────────────

function toLocalPersona(p: PersonaData, idx: number): LocalPersona {
  return {
    _id: p.id ?? uid(),
    name: p.name ?? '',
    role: p.role ?? '',
    type: p.type ?? '',
    painPointsRaw: parsePainPoints(p.painPoints).join('\n'),
    quote: p.quote ?? '',
    order: p.order ?? idx,
  }
}

function toLocalBlock(b: ContentBlock): LocalBlock {
  return {
    _id: uid(),
    type: b.type,
    label: b.label ?? '',
    content: b.content ?? '',
    itemsRaw: (b.items ?? []).join('\n'),
    linesRaw: (b.lines ?? []).map((l) => l.persona ? `${l.persona}: ${l.text}` : l.text).join('\n'),
    persona: b.persona ?? '',
    tagsRaw: (b.tags ?? []).join(', '),
  }
}

function toLocalStep(s: StepData, idx: number): LocalStep {
  return {
    _id: s.id ?? uid(),
    order: s.order ?? idx,
    title: s.title ?? '',
    subtitle: s.subtitle ?? '',
    icon: s.icon ?? '',
    durationMins: s.durationMins != null ? String(s.durationMins) : '',
    actLabel: s.actLabel ?? '',
    blocks: parseBlocks(s.contentBlocks).map(toLocalBlock),
  }
}

function localPersonaToPayload(p: LocalPersona, idx: number) {
  return {
    name: p.name,
    role: p.role || undefined,
    type: p.type || undefined,
    painPoints: JSON.stringify(p.painPointsRaw.split('\n').map((s) => s.trim()).filter(Boolean)),
    quote: p.quote || undefined,
    order: idx,
  }
}

function localBlockToContentBlock(b: LocalBlock): ContentBlock {
  const items = b.itemsRaw.split('\n').map((s) => s.trim()).filter(Boolean)
  const lines = b.linesRaw.split('\n').map((line) => {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0 && colonIdx < 30) {
      return { persona: line.slice(0, colonIdx).trim(), text: line.slice(colonIdx + 1).trim() }
    }
    return { text: line.trim() }
  }).filter((l) => l.text)
  const tags = b.tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)

  const block: ContentBlock = { type: b.type }
  if (b.label) block.label = b.label
  if (b.content) block.content = b.content
  if (items.length) block.items = items
  if (lines.length) block.lines = lines
  if (b.persona) block.persona = b.persona
  if (tags.length) block.tags = tags
  return block
}

function localStepToPayload(s: LocalStep, idx: number) {
  return {
    order: idx,
    title: s.title,
    subtitle: s.subtitle || undefined,
    icon: s.icon || undefined,
    durationMins: s.durationMins ? parseInt(s.durationMins, 10) : undefined,
    actLabel: s.actLabel || undefined,
    contentBlocks: JSON.stringify(s.blocks.map(localBlockToContentBlock)),
  }
}

// ─── sub-components ──────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '6px',
  border: '1px solid var(--border)', background: 'var(--bg-base)',
  color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--text-secondary)', marginBottom: '4px',
}

const BLOCK_TYPES: ContentBlockType[] = [
  'context', 'actions', 'talktrack', 'watchfor', 'transition',
  'note', 'caution', 'callout', 'painpoints',
]

const BLOCK_LABELS: Record<ContentBlockType, string> = {
  context: 'Context',
  actions: 'Demo Steps / Actions',
  talktrack: 'Talk Track',
  watchfor: 'Watch For',
  transition: 'Transition',
  note: 'Note',
  caution: 'Caution',
  callout: 'Callout',
  painpoints: 'Pain Points Addressed',
}

function BlockEditor({ block, onChange, onRemove }: {
  block: LocalBlock
  onChange: (b: LocalBlock) => void
  onRemove: () => void
}) {
  const set = (field: keyof LocalBlock, val: string) => onChange({ ...block, [field]: val })

  const needsItems = ['actions', 'watchfor', 'caution', 'painpoints'].includes(block.type)
  const needsLines = block.type === 'talktrack'
  const needsPersona = block.type === 'callout'
  const needsTags = ['context', 'callout'].includes(block.type)

  return (
    <div style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', position: 'relative' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'center' }}>
        <select
          value={block.type}
          onChange={(e) => set('type', e.target.value as ContentBlockType)}
          style={{ ...inputStyle, width: 'auto', padding: '5px 8px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-blue)' }}
        >
          {BLOCK_TYPES.map((t) => (
            <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={onRemove}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '16px', padding: '2px 6px' }}
          title="Remove block"
        >
          ×
        </button>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        <div>
          <label style={labelStyle}>Label (optional heading)</label>
          <input style={inputStyle} value={block.label} onChange={(e) => set('label', e.target.value)} placeholder="e.g. Scene Setup, Talk Track, Watch For…" />
        </div>

        {needsPersona && (
          <div>
            <label style={labelStyle}>Persona name</label>
            <input style={inputStyle} value={block.persona} onChange={(e) => set('persona', e.target.value)} placeholder="e.g. Kevin Sharp" />
          </div>
        )}

        {block.type !== 'actions' && (
          <div>
            <label style={labelStyle}>{needsLines ? 'Intro text (optional)' : 'Content'}</label>
            <textarea
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              value={block.content}
              onChange={(e) => set('content', e.target.value)}
              placeholder={block.type === 'talktrack' ? '"Say something to open…"' : 'Content text…'}
            />
          </div>
        )}

        {needsItems && (
          <div>
            <label style={labelStyle}>Items (one per line)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              value={block.itemsRaw}
              onChange={(e) => set('itemsRaw', e.target.value)}
              placeholder={"Item one\nItem two\nItem three"}
            />
          </div>
        )}

        {needsLines && (
          <div>
            <label style={labelStyle}>Lines — format: <code style={{ fontSize: '11px', color: 'var(--accent-purple)' }}>Persona Name: line text</code> (one per line)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              value={block.linesRaw}
              onChange={(e) => set('linesRaw', e.target.value)}
              placeholder={"Kevin Sharp: What does this look like in practice?\nYou: Great question — let me show you…"}
            />
          </div>
        )}

        {needsTags && (
          <div>
            <label style={labelStyle}>Capability tags (comma-separated)</label>
            <input
              style={inputStyle}
              value={block.tagsRaw}
              onChange={(e) => set('tagsRaw', e.target.value)}
              placeholder="skill, agent, agentic, governance"
            />
          </div>
        )}
      </div>
    </div>
  )
}

function StepEditor({ step, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: {
  step: LocalStep
  index: number
  onChange: (s: LocalStep) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const set = (field: keyof LocalStep, val: string) => onChange({ ...step, [field]: val })

  const addBlock = () => {
    onChange({ ...step, blocks: [...step.blocks, { _id: uid(), type: 'context', label: '', content: '', itemsRaw: '', linesRaw: '', persona: '', tagsRaw: '' }] })
  }

  const updateBlock = (i: number, b: LocalBlock) => {
    const blocks = [...step.blocks]
    blocks[i] = b
    onChange({ ...step, blocks })
  }

  const removeBlock = (i: number) => {
    onChange({ ...step, blocks: step.blocks.filter((_, idx) => idx !== i) })
  }

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      {/* Step header */}
      <div style={{ background: 'var(--bg-card)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, minWidth: '20px' }}>#{index + 1}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
        >
          {step.icon && <span style={{ marginRight: '6px' }}>{step.icon}</span>}
          {step.title || <span style={{ color: 'var(--text-muted)' }}>Untitled step</span>}
          {step.actLabel && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>· {step.actLabel}</span>}
          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{expanded ? '▾' : '▸'}</span>
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" onClick={onMoveUp} disabled={isFirst} style={{ background: 'none', border: 'none', cursor: isFirst ? 'not-allowed' : 'pointer', color: isFirst ? 'var(--border)' : 'var(--text-muted)', fontSize: '14px', padding: '2px 5px' }}>↑</button>
          <button type="button" onClick={onMoveDown} disabled={isLast} style={{ background: 'none', border: 'none', cursor: isLast ? 'not-allowed' : 'pointer', color: isLast ? 'var(--border)' : 'var(--text-muted)', fontSize: '14px', padding: '2px 5px' }}>↓</button>
          <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: '16px', padding: '2px 6px' }}>×</button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '14px', background: 'var(--bg-base)' }}>
          {/* Step meta fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={step.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Act 1: Deflect with AI Search" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Subtitle</label>
              <input style={inputStyle} value={step.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Short description of this act" />
            </div>
            <div>
              <label style={labelStyle}>Act label</label>
              <input style={inputStyle} value={step.actLabel} onChange={(e) => set('actLabel', e.target.value)} placeholder="e.g. Opening, Act 1, Close" />
            </div>
            <div>
              <label style={labelStyle}>Duration (min)</label>
              <input style={inputStyle} type="number" min="1" value={step.durationMins} onChange={(e) => set('durationMins', e.target.value)} placeholder="12" />
            </div>
            <div>
              <label style={labelStyle}>Icon (emoji)</label>
              <input style={inputStyle} value={step.icon} onChange={(e) => set('icon', e.target.value)} placeholder="🔍" />
            </div>
          </div>

          {/* Content blocks */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              Content Blocks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {step.blocks.map((b, i) => (
                <BlockEditor
                  key={b._id}
                  block={b}
                  onChange={(updated) => updateBlock(i, updated)}
                  onRemove={() => removeBlock(i)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addBlock}
              style={{ padding: '7px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', width: '100%' }}
            >
              + Add Content Block
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PersonaEditor({ persona, index, onChange, onRemove }: {
  persona: LocalPersona
  index: number
  onChange: (p: LocalPersona) => void
  onRemove: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const set = (field: keyof LocalPersona, val: string) => onChange({ ...persona, [field]: val })

  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ background: 'var(--bg-card)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: expanded ? '1px solid var(--border)' : 'none' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>#{index + 1}</span>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}
        >
          {persona.name || <span style={{ color: 'var(--text-muted)' }}>Unnamed persona</span>}
          {persona.role && <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>· {persona.role}</span>}
          <span style={{ marginLeft: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{expanded ? '▾' : '▸'}</span>
        </button>
        <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-red)', fontSize: '16px', padding: '2px 6px' }}>×</button>
      </div>

      {expanded && (
        <div style={{ padding: '14px', background: 'var(--bg-base)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} value={persona.name} onChange={(e) => set('name', e.target.value)} placeholder="Kevin Sharp" required />
          </div>
          <div>
            <label style={labelStyle}>Job title / Role</label>
            <input style={inputStyle} value={persona.role} onChange={(e) => set('role', e.target.value)} placeholder="VP of IT Operations" />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select style={inputStyle} value={persona.type} onChange={(e) => set('type', e.target.value)}>
              <option value="">Select type…</option>
              <option value="decision-maker">Decision Maker</option>
              <option value="practitioner">Practitioner</option>
              <option value="champion">Champion</option>
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Pain points (one per line)</label>
            <textarea
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
              value={persona.painPointsRaw}
              onChange={(e) => set('painPointsRaw', e.target.value)}
              placeholder={"Too many tickets\nAgents spending too long per case\nLack of visibility into resolution trends"}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>Quote (optional)</label>
            <input style={inputStyle} value={persona.quote} onChange={(e) => set('quote', e.target.value)} placeholder='"We need to do more with less…"' />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── main form ───────────────────────────────────────────────────────────────

interface Props {
  initialData?: DemoData
}

export function DemoForm({ initialData }: Props) {
  const router = useRouter()
  const isEditing = !!initialData

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [scenario, setScenario] = useState<ScenarioType>(initialData?.scenario ?? 'itsm')
  const [customer, setCustomer] = useState(initialData?.customer ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [published, setPublished] = useState(initialData?.published ?? false)

  const [personas, setPersonas] = useState<LocalPersona[]>(
    initialData?.personas.map(toLocalPersona) ?? []
  )

  const [steps, setSteps] = useState<LocalStep[]>(
    initialData?.steps.map(toLocalStep) ?? []
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'personas' | 'steps'>('info')

  // ── personas ──
  const addPersona = () => setPersonas([...personas, { _id: uid(), name: '', role: '', type: '', painPointsRaw: '', quote: '', order: personas.length }])
  const updatePersona = (i: number, p: LocalPersona) => setPersonas(personas.map((x, idx) => idx === i ? p : x))
  const removePersona = (i: number) => setPersonas(personas.filter((_, idx) => idx !== i))

  // ── steps ──
  const addStep = () => setSteps([...steps, { _id: uid(), order: steps.length, title: '', subtitle: '', icon: '', durationMins: '', actLabel: '', blocks: [] }])
  const updateStep = (i: number, s: LocalStep) => setSteps(steps.map((x, idx) => idx === i ? s : x))
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i))
  const moveStep = (from: number, to: number) => {
    const arr = [...steps]
    const [item] = arr.splice(from, 1)
    arr.splice(to, 0, item)
    setSteps(arr)
  }

  // ── submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError('')

    const payload = {
      title: title.trim(),
      scenario,
      customer: customer.trim() || null,
      description: description.trim() || null,
      published,
      personas: personas.map(localPersonaToPayload),
      steps: steps.map(localStepToPayload),
    }

    try {
      let res: Response
      if (isEditing) {
        res = await fetch(`/api/demos/${initialData!.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        res = await fetch('/api/demos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Save failed')
      }

      const saved = await res.json()

      if (!isEditing) {
        // After create, go to edit page so user can continue adding steps
        router.push(`/admin/demos/${saved.id}/edit`)
      } else {
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!initialData) return
    if (!confirm(`Delete "${initialData.title}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/demos/${initialData.id}`, { method: 'DELETE' })
    router.push('/admin')
    router.refresh()
  }

  const tabStyle = (tab: typeof activeTab): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: activeTab === tab ? 'var(--accent-green)' : 'transparent',
    color: activeTab === tab ? '#0b1120' : 'var(--text-secondary)',
  })

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', letterSpacing: '-0.02em' }}>
            {isEditing ? `Edit: ${initialData!.title}` : 'New Demo'}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isEditing ? 'Update demo content, personas, and steps' : 'Create a new demo guide'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isEditing && (
            <a href={`/demos/${initialData!.id}`} target="_blank" rel="noreferrer"
              style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              Preview
            </a>
          )}
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.08)', color: 'var(--accent-red)', cursor: 'pointer', opacity: deleting ? 0.6 : 1 }}
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', width: 'fit-content', border: '1px solid var(--border)' }}>
        <button type="button" style={tabStyle('info')} onClick={() => setActiveTab('info')}>
          📋 Info
        </button>
        <button type="button" style={tabStyle('personas')} onClick={() => setActiveTab('personas')}>
          👤 Personas ({personas.length})
        </button>
        <button type="button" style={tabStyle('steps')} onClick={() => setActiveTab('steps')}>
          📍 Steps ({steps.length})
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* INFO TAB */}
        {activeTab === 'info' && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Title *</label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Now Assist for ITSM — Enterprise Demo" required />
            </div>
            <div>
              <label style={labelStyle}>Scenario</label>
              <select style={inputStyle} value={scenario} onChange={(e) => setScenario(e.target.value as ScenarioType)}>
                <option value="itsm">🎫 ITSM — IT Service Management</option>
                <option value="csm">🤝 CSM — Customer Service Management</option>
                <option value="hrsd">👥 HRSD — HR Service Delivery</option>
                <option value="itom">🔭 ITOM — IT Operations Management</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Customer / Account</label>
              <input style={inputStyle} value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the demo narrative and key objectives…"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                id="published"
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-green)' }}
              />
              <label htmlFor="published" style={{ ...labelStyle, margin: 0, cursor: 'pointer' }}>
                Published (visible to all visitors)
              </label>
            </div>
          </div>
        )}

        {/* PERSONAS TAB */}
        {activeTab === 'personas' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {personas.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                  No personas yet — add the people who will be in the room
                </div>
              )}
              {personas.map((p, i) => (
                <PersonaEditor
                  key={p._id}
                  persona={p}
                  index={i}
                  onChange={(updated) => updatePersona(i, updated)}
                  onRemove={() => removePersona(i)}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addPersona}
              style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', width: '100%' }}
            >
              + Add Persona
            </button>
          </div>
        )}

        {/* STEPS TAB */}
        {activeTab === 'steps' && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
              {steps.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '32px', border: '1px dashed var(--border)', borderRadius: '10px' }}>
                  No steps yet — add acts/sections for your demo walkthrough
                </div>
              )}
              {steps.map((s, i) => (
                <StepEditor
                  key={s._id}
                  step={s}
                  index={i}
                  onChange={(updated) => updateStep(i, updated)}
                  onRemove={() => removeStep(i)}
                  onMoveUp={() => moveStep(i, i - 1)}
                  onMoveDown={() => moveStep(i, i + 1)}
                  isFirst={i === 0}
                  isLast={i === steps.length - 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={addStep}
              style={{ padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', width: '100%' }}
            >
              + Add Step / Act
            </button>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {error && (
            <span style={{ fontSize: '13px', color: 'var(--accent-red)', flex: 1 }}>{error}</span>
          )}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <a href="/admin" style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </a>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '9px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', background: 'var(--accent-green)', color: '#0b1120', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create Demo'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
