import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DemoForm } from '@/components/DemoForm'

export default async function NewDemoPage() {
  const session = await auth()
  if (!session) redirect('/login?callbackUrl=/admin/demos/new')

  return <DemoForm />
}
