import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Generate a glowing orange dot for user avatar
  const { searchParams } = new URL(req.url)
  const size = searchParams.get('size') || '64'
  const numSize = parseInt(size)

  // Glowing orange dot SVG
  const glowingOrangeDot = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer glow -->
      <circle cx="${numSize/2}" cy="${numSize/2}" r="${numSize/2 - 2}" fill="#fb923c" opacity="0.3"/>
      <!-- Inner glow -->
      <circle cx="${numSize/2}" cy="${numSize/2}" r="${numSize/2 - 6}" fill="#fb923c" opacity="0.6"/>
      <!-- Core dot -->
      <circle cx="${numSize/2}" cy="${numSize/2}" r="${numSize/2 - 12}" fill="#ea580c"/>
    </svg>
  `.trim()

  return new NextResponse(glowingOrangeDot, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000'
    }
  })
}
