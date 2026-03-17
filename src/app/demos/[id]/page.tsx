import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { notFound } from 'next/navigation'
import { DemoViewer } from '@/components/DemoViewer'
import type { DemoData } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function DemoPage({ params }: Props) {
  const { id } = await params
  const session = await auth()

  const demo = await prisma.demo.findUnique({
    where: { id },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
  })

  if (!demo) notFound()
  if (!demo.published && !session) notFound()

  return (
    <DemoViewer
      demo={demo as unknown as DemoData}
      isAdmin={!!session}
    />
  )
}
