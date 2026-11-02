import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

type Role = 'TOURIST' | 'RESEARCHER' | 'ADMIN'

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization
  if (!hdr) return res.status(401).json({ error: 'Missing token' })
  const token = hdr.replace('Bearer ', '')
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    ;(req as any).userId = payload.sub
    ;(req as any).role = payload.role as Role
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function researcherOrAdmin(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).role as Role
  if (role === 'RESEARCHER' || role === 'ADMIN') return next()
  return res.status(403).json({ error: 'Forbidden' })
}
