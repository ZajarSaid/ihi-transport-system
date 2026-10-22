import type { Metadata } from 'next'
import { Providers } from '@/src/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Transport Request System',
  description: 'Transport request and approval system for the Ifakara Health Institute.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
