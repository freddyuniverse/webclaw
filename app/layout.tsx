import type { Metadata } from "next"
import { JetBrains_Mono, EB_Garamond } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
})

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
})

export const metadata: Metadata = {
  title: "WebClaw",
  description: "a fast web client for OpenClaw",
  openGraph: {
    images: ["/cover.webp"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/cover.webp"],
  },
}

const themeScript = `
(() => {
  try {
    const stored = localStorage.getItem('chat-settings')
    let theme = 'system'
    if (stored) {
      const parsed = JSON.parse(stored)
      const storedTheme = parsed?.state?.settings?.theme
      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        theme = storedTheme
      }
    }
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      root.classList.remove('light', 'dark', 'system')
      root.classList.add(theme)
      if (theme === 'system' && media.matches) {
        root.classList.add('dark')
      }
    }
    apply()
    media.addEventListener('change', () => {
      if (theme === 'system') apply()
    })
  } catch {}
})()
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body
        className={`${jetbrainsMono.variable} ${ebGaramond.variable} font-sans`}
      >
        <div className="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  )
}
