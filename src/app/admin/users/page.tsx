'use client'

import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'

interface UserData {
  id: string
  name?: string | null
  email: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('editor')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to load users')
      setUsers(await res.json())
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadUsers() }, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create user')
      setUsers([...users, data])
      setName(''); setEmail(''); setPassword(''); setRole('editor')
      setShowForm(false)
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(userId: string, userEmail: string) {
    if (!confirm(`Delete user ${userEmail}?`)) return
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    setUsers(users.filter((u) => u.id !== userId))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px', borderRadius: '6px',
    border: '1px solid var(--border)', background: 'var(--bg-base)',
    color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '36px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/admin" style={{ fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            ← Admin
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Users
          </h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ padding: '9px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, border: 'none', background: 'var(--accent-green)', color: '#0b1120', cursor: 'pointer' }}
        >
          {showForm ? 'Cancel' : '+ New User'}
        </button>
      </div>

      {/* Create user form */}
      {showForm && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Create User</h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Name</label>
              <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Email *</label>
              <input style={inputStyle} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@company.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Password *</label>
              <input style={inputStyle} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" minLength={8} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>Role</label>
              <select style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {createError && (
              <div style={{ gridColumn: '1 / -1', padding: '8px 12px', borderRadius: '6px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--accent-red)', fontSize: '13px' }}>
                {createError}
              </div>
            )}
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '13px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={creating} style={{ padding: '8px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, border: 'none', background: 'var(--accent-green)', color: '#0b1120', cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users list */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {users.length} user{users.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-red)' }}>{error}</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No users yet</div>
        ) : (
          users.map((user, i) => (
            <div
              key={user.id}
              style={{
                padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(98,216,78,0.15)', border: '1.5px solid rgba(98,216,78,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', flexShrink: 0 }}>
                {(user.name ?? user.email).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: '150px' }}>
                {user.name && <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</div>}
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
              <span style={{
                padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                background: user.role === 'admin' ? 'rgba(251,146,60,0.12)' : 'rgba(59,130,246,0.12)',
                color: user.role === 'admin' ? 'var(--accent-orange)' : 'var(--accent-blue)',
              }}>
                {user.role}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleDelete(user.id, user.email)}
                style={{ padding: '5px 10px', borderRadius: '5px', fontSize: '12px', border: '1px solid rgba(248,113,113,0.2)', background: 'transparent', color: 'var(--accent-red)', cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
