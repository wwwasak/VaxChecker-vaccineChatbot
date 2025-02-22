import { AuthProvider } from '@/providers/AuthProvider';
import { UserProvider } from '@/contexts/UserContext';
import './globals.css'
import type { Metadata } from 'next'
import '../styles/datepicker.css'

export const metadata: Metadata = {
  title: 'Vaccine Information Assistant',
  description: 'Get the latest vaccine information and personalized recommendations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <AuthProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 