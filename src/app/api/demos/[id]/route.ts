import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const demo = await prisma.demo.findUnique({
    where: { id },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
  })

  if (!demo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const session = await auth()
  if (!demo.published && !session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(demo)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { title, scenario, customer, description, published, personas, steps } = body

  // Update the demo core fields
  const demo = await prisma.demo.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(scenario !== undefined && { scenario }),
      ...(customer !== undefined && { customer }),
      ...(description !== undefined && { description }),
      ...(published !== undefined && { published }),
    },
  })

  // Replace personas if provided
  if (Array.isArray(personas)) {
    await prisma.persona.deleteMany({ where: { demoId: id } })
    if (personas.length > 0) {
      await prisma.persona.createMany({
        data: personas.map((p: Record<string, unknown>, i: number) => ({
          demoId: id,
          name: p.name as string,
          role: p.role as string | undefined,
          type: p.type as string | undefined,
          painPoints: p.painPoints as string | undefined,
          quote: p.quote as string | undefined,
          order: typeof p.order === 'number' ? p.order : i,
        })),
      })
    }
  }

  // Replace steps if provided
  if (Array.isArray(steps)) {
    await prisma.step.deleteMany({ where: { demoId: id } })
    if (steps.length > 0) {
      await prisma.step.createMany({
        data: steps.map((s: Record<string, unknown>, i: number) => ({
          demoId: id,
          order: typeof s.order === 'number' ? s.order : i,
          title: s.title as string,
          subtitle: s.subtitle as string | undefined,
          icon: s.icon as string | undefined,
          durationMins: s.durationMins as number | undefined,
          actLabel: s.actLabel as string | undefined,
          contentBlocks: typeof s.contentBlocks === 'string'
            ? s.contentBlocks
            : JSON.stringify(s.contentBlocks ?? []),
        })),
      })
    }
  }

  const updated = await prisma.demo.findUnique({
    where: { id },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.demo.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
