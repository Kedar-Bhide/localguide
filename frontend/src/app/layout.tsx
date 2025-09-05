import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

// Font will be loaded via CSS or can be added later
const calSans = {
  variable: '--font-cal-sans'
}

export const metadata: Metadata = {
  title: {
    default: 'LocalGuide - Connect with Local Experts',
    template: '%s | LocalGuide'
  },
  description: 'Discover authentic local experiences through connections with verified local experts worldwide. Chat, explore, and travel like a local.',
  keywords: ['travel', 'local experts', 'authentic experiences', 'local guides', 'travel recommendations'],
  authors: [{ name: 'LocalGuide Team' }],
  creator: 'LocalGuide',
  publisher: 'LocalGuide',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://localguide.app'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://localguide.app',
    title: 'LocalGuide - Connect with Local Experts',
    description: 'Discover authentic local experiences through connections with verified local experts worldwide.',
    siteName: 'LocalGuide',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LocalGuide - Connect with Local Experts'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LocalGuide - Connect with Local Experts',
    description: 'Discover authentic local experiences through connections with verified local experts worldwide.',
    creator: '@localguideapp',
    images: ['/twitter-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${calSans.variable}`}>
      <body className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 font-sans antialiased">
        <div className="relative flex min-h-screen flex-col">
          <div className="flex-1">
            {children}
          </div>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: '#1f2937',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.1)',
              padding: '16px',
              fontSize: '14px',
              maxWidth: '420px'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'white'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'white'
              }
            }
          }}
        />
      </body>
    </html>
  )
}