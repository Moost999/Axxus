import './globals.css'
import type { Metadata } from 'next'
import { Inter, Orbitron } from 'next/font/google'
import { Sidebar } from '@/components/sidebar'
import { Toaster } from "@/components/ui/toaster"
import { ProfileLabel } from '@/components/profile-label'

const inter = Inter({ subsets: ['latin'] })
const orbitron = Orbitron({ subsets: ['latin'], variable: '--font-orbitron' })

export const metadata: Metadata = {
  title: 'Axxus',
  description: 'AI-powered assistants for business communication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${orbitron.variable} bg-background text-foreground min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-end mb-4">
              <ProfileLabel />
            </div>
            {children}
          </div>
        </main>
        <Toaster />
      </body>
    </html>
  )
}

