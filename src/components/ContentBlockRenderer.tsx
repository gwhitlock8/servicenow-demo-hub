import type { ContentBlock } from '@/types'

const TAG_COLORS: Record<string, string> = {
  skill: '#3b82f6',
  agent: '#a78bfa',
  agentic: '#eab308',
  governance: '#2dd4bf',
}

function CapabilityTag({ tag }: { tag: string }) {
  const color = TAG_COLORS[tag.toLowerCase()] ?? '#64748b'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: '4px',
      fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
      background: `${color}20`, color, border: `1px solid ${color}40`,
    }}>
      {tag}
    </span>
  )
}

function BlockItem({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'context':
      return (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(30,45,69,0.5)', borderLeft: '3px solid var(--accent-blue)' }}>
          {block.label && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              {block.label}
            </div>
          )}
          {block.content && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
              {block.content}
            </p>
          )}
          {block.tags && block.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {block.tags.map((t) => <CapabilityTag key={t} tag={t} />)}
            </div>
          )}
        </div>
      )

    case 'actions':
      return (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(30,45,69,0.3)', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            {block.label || 'Demo Steps'}
          </div>
          {block.content && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '12px' }}>
              {block.content}
            </p>
          )}
          {block.items && block.items.length > 0 && (
            <ol style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {block.items.map((item, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
                  {item}
                </li>
              ))}
            </ol>
          )}
        </div>
      )

    case 'talktrack':
      return (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
            🗣 {block.label || 'Talk Track'}
          </div>
          {block.content && (
            <p style={{
              color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6,
              fontStyle: 'italic', margin: 0,
              marginBottom: block.lines?.length ? '12px' : 0,
            }}>
              &ldquo;{block.content}&rdquo;
            </p>
          )}
          {block.lines && block.lines.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {block.lines.map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  {line.persona && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-purple)', minWidth: '100px', paddingTop: '2px', flexShrink: 0 }}>
                      {line.persona}:
                    </span>
                  )}
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                    &ldquo;{line.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    case 'watchfor':
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)', display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>👁</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#eab308', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {block.label || 'Watch For'}
            </div>
            {block.content && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                {block.content}
              </p>
            )}
            {block.items && block.items.length > 0 && (
              <ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {block.items.map((item, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )

    case 'transition':
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '16px', paddingTop: '1px' }}>→</span>
          <div>
            {block.label && (
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                {block.label}
              </div>
            )}
            {block.content && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                {block.content}
              </p>
            )}
          </div>
        </div>
      )

    case 'note': {
      // Split content on (1), (2), ... pattern into numbered list items
      const noteItems: string[] = []
      let noteIntro = block.content ?? ''
      if (block.content) {
        const parts = block.content.split(/\s*\(\d+\)\s*/).filter(Boolean)
        const hasNumbered = /\(1\)/.test(block.content)
        if (hasNumbered && parts.length > 1) {
          noteIntro = parts[0].trim().replace(/:$/, ':')
          noteItems.push(...parts.slice(1).map(s => s.trim()))
        }
      }
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(30,45,69,0.4)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: noteItems.length ? '10px' : 0 }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', flexShrink: 0, paddingTop: '1px' }}>💡</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
              {block.label && <strong style={{ color: 'var(--text-secondary)' }}>{block.label}: </strong>}
              {noteItems.length ? noteIntro : block.content}
            </p>
          </div>
          {noteItems.length > 0 && (
            <ol style={{ margin: 0, padding: '0 0 0 36px' }}>
              {noteItems.map((item, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5, marginBottom: '6px' }}>{item}</li>
              ))}
            </ol>
          )}
        </div>
      )
    }

    case 'caution':
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.25)', display: 'flex', gap: '12px' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-orange)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {block.label || 'Caution'}
            </div>
            {block.content && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                {block.content}
              </p>
            )}
            {block.items && block.items.length > 0 && (
              <ul style={{ margin: '6px 0 0', padding: '0 0 0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {block.items.map((item, i) => (
                  <li key={i} style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )

    case 'callout':
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.2)' }}>
          {block.persona ? (
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-teal)', marginBottom: '6px' }}>
              👤 {block.persona}
            </div>
          ) : block.label && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              {block.label}
            </div>
          )}
          {block.content && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              {block.content}
            </p>
          )}
          {block.tags && block.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {block.tags.map((t) => <CapabilityTag key={t} tag={t} />)}
            </div>
          )}
        </div>
      )

    case 'painpoints':
      return (
        <div style={{ padding: '14px 16px', borderRadius: '8px', background: 'rgba(98,216,78,0.05)', border: '1px solid rgba(98,216,78,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
            📍 {block.label || 'Pain Points Addressed'}
          </div>
          {block.content && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5, marginBottom: '10px' }}>
              {block.content}
            </p>
          )}
          {block.items && block.items.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {block.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--accent-green)', fontSize: '12px', paddingTop: '2px', flexShrink: 0 }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}

export function ContentBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (!blocks.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {blocks.map((block, i) => (
        <BlockItem key={i} block={block} />
      ))}
    </div>
  )
}
