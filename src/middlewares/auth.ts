import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../functions/jwt';

export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers['authorization'];
  if (!hdr || !hdr.startsWith('Bearer ')) return res.status(401).json({ success: false, message: 'Missing Authentication' });
  const token = hdr.slice(7);
  try {
    const payload = verifyToken<any>(token);
    (req as any).user = payload;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).user?.role as string | undefined;
    if (!role || !roles.includes(role)) return res.status(403).json({ success: false, message: 'Forbidden' });
    next();
  };
}
