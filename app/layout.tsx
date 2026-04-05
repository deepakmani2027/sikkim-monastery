import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/hooks/use-auth"
import { Suspense } from "react"
// @ts-expect-error - CSS imports in Next.js
import "./globals.css"
// @ts-expect-error - CSS imports in Next.js
import "leaflet/dist/leaflet.css"
import { Toaster } from "@/components/ui/sonner"
import { Watermark } from "@/components/branding/Watermark"
import ChatbotWidget from "@/components/ChatbotWidget"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DharmaTech - Connecting Sikkim to the World",
  description:
    "Explore the sacred monasteries of Sikkim with immersive virtual tours, cultural insights, and research archives",
  generator: "v0.app",
  icons: [
    { rel: "icon", url: "/darma.png" },
    { rel: "apple-touch-icon", url: "/darma.png" },
  ],
  openGraph: {
    title: "DharmaTech - Connecting Sikkim to the World",
    description:
      "Explore the sacred monasteries of Sikkim with immersive virtual tours, cultural insights, and research archives",
    images: [
      {
        url: "/darma.png",
        width: 1500,
        height: 700,
        alt: "DharmaTech",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DharmaTech - Connecting Sikkim to the World",
    description:
      "Explore the sacred monasteries of Sikkim with immersive virtual tours, cultural insights, and research archives",
    images: ["/darma.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/darma.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${inter.className}`}>
        <Watermark />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <AuthProvider>{children}</AuthProvider>
          </Suspense>
          <Analytics />
          <Toaster richColors position="top-center" />
          <ChatbotWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
