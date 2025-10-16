import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Sistema de Gestão Imobiliária",
  description: "Sistema completo para gestão de imóveis, contratos e pagamentos",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
