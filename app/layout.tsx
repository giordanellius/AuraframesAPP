import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Aura Framing Calculator',
  description: 'Professional framing quote calculator for canvas and print framing',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Aura Framing Calculator',
    description: 'Professional framing quote calculator for canvas and print framing',
    images: ['/og-image.png'],
    type: 'website',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Aura Framing',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B2635',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-[#8B2635] text-white shadow-lg">
            <div className="container mx-auto px-4 py-4 flex items-center justify-center">
              <div className="relative w-48 h-16">
                <Image
                  src="/logo.png"
                  alt="Aura Framing"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-100 border-t border-gray-200 mt-8">
            <div className="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
              © {new Date().getFullYear()} Aura Framing. All rights reserved.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
