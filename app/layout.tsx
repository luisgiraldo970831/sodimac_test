import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import ArchModal from '@/components/ArchModal'

export const metadata: Metadata = {
  metadataBase: new URL('https://patitas.vercel.app'),
  title: {
    default: 'Patitas',
    template: '%s | Patitas',
  },
  description:
    'Guías de cuidado, salud y bienestar para perros, gatos y otras mascotas. Consejos prácticos de veterinarios y expertos.',
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'Patitas',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children}
        <ArchModal />
      </body>
    </html>
  )
}

