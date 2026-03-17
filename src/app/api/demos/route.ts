import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const scenario = searchParams.get('scenario')
  const publishedOnly = searchParams.get('published') !== 'false'

  const session = await auth()
  const isAuthenticated = !!session

  const demos = await prisma.demo.findMany({
    where: {
      ...(scenario ? { scenario } : {}),
      ...(!isAuthenticated ? { published: true } : publishedOnly ? { published: true } : {}),
    },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(demos)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { title, scenario, customer, description, published } = body

  if (!title || !scenario) {
    return NextResponse.json({ error: 'title and scenario are required' }, { status: 400 })
  }

  const demo = await prisma.demo.create({
    data: { title, scenario, customer, description, published: published ?? false },
    include: { personas: true, steps: true },
  })

  return NextResponse.json(demo, { status: 201 })
}
