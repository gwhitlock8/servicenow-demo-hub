import type { Metadata } from 'next'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { SessionProvider } from '@/components/SessionProvider'

export const metadata: Metadata = {
  title: 'ServiceNow Demo Hub',
  description: 'Interactive ServiceNow demo guides',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NavBar />
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  )
}
