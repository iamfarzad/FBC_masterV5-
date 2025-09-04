import type React from "react"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Backend Testing Skeleton</title>
      </head>
      <body>
        <div style={{ padding: '20px' }}>
          <h1>Backend Testing Interface</h1>
          <hr />
          {children}
        </div>
      </body>
    </html>
  )
}

export const metadata = {
  title: "Backend Testing",
  description: "Minimal skeleton for testing backend functions"
}