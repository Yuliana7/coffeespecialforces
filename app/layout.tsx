import './globals.css'
import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coffee Special Forces',
  description: 'Volunteer hub'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
