import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect, notFound } from 'next/navigation'
import { DemoForm } from '@/components/DemoForm'
import type { DemoData } from '@/types'

type Props = { params: Promise<{ id: string }> }

export default async function EditDemoPage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params

  const demo = await prisma.demo.findUnique({
    where: { id },
    include: {
      personas: { orderBy: { order: 'asc' } },
      steps: { orderBy: { order: 'asc' } },
    },
  })

  if (!demo) notFound()

  return <DemoForm initialData={demo as unknown as DemoData} />
}
