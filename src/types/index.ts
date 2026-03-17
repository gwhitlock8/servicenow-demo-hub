export type ScenarioType = 'itsm' | 'csm' | 'hrsd' | 'itom'
export type PersonaType = 'decision-maker' | 'practitioner' | 'champion'
export type UserRole = 'admin' | 'editor'

export type ContentBlockType =
  | 'context'
  | 'actions'
  | 'talktrack'
  | 'watchfor'
  | 'transition'
  | 'note'
  | 'caution'
  | 'callout'
  | 'painpoints'

export interface ContentBlock {
  type: ContentBlockType
  label?: string
  content?: string
  items?: string[]
  lines?: { persona?: string; text: string }[]
  persona?: string // for callout blocks
  tags?: string[]  // capability tags: 'skill' | 'agent' | 'agentic' | 'governance' | custom
}

export interface PersonaData {
  id: string
  demoId: string
  name: string
  role?: string | null
  type?: string | null
  painPoints?: string | null // JSON string of string[]
  quote?: string | null
  order: number
}

export interface StepData {
  id: string
  demoId: string
  order: number
  title: string
  subtitle?: string | null
  icon?: string | null
  durationMins?: number | null
  actLabel?: string | null
  contentBlocks: string // JSON string of ContentBlock[]
}

export interface DemoData {
  id: string
  title: string
  scenario: ScenarioType
  customer?: string | null
  description?: string | null
  published: boolean
  personas: PersonaData[]
  steps: StepData[]
  createdAt: Date
  updatedAt: Date
}

export interface UserData {
  id: string
  name?: string | null
  email: string
  role: UserRole
  createdAt: Date
}

// Extend next-auth types
declare module 'next-auth' {
  interface User {
    role?: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

