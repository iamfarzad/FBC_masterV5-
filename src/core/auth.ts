import { jwtVerify, SignJWT } from 'jose'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const secret = new TextEncoder().encode(JWT_SECRET)

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'user'
  exp: number
}

export async function createToken(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)

  return token
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: payload.role as 'admin' | 'user',
      exp: payload.exp as number
    }
  } catch (error) {
    return null
  }
}

export function getCurrentUser(request: Request): JWTPayload | null {
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')
  const role = request.headers.get('x-user-role') as 'admin' | 'user'

  if (!userId || !email || !role) {
    return null
  }

  return {
    userId,
    email,
    role,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  }
}
