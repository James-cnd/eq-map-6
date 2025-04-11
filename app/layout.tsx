import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <div className="fixed bottom-4 left-4 space-x-2 z-[1000]">
          <OverlaySettingsButton />
          <NotificationSettingsButton /> {/* Your existing notification button */}
        </div>
      </body>
    </html>
  )
}
