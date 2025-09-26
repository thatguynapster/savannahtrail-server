import jwt, { Algorithm, SignOptions, Secret } from 'jsonwebtoken';

const ACCESS_SECRET = (process.env.JWT_ACCESS_SECRET ?? '').trim();
if (!ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET missing');
}

const ACCESS_TTL = (process.env.JWT_ACCESS_TTL as string) || '15m';
const REFRESH_TTL_DAYS = Number(process.env.JWT_REFRESH_TTL || 90);
const ALG: Algorithm = (process.env.jwt_ALG as Algorithm) || 'HS512';

export type AppJwtPayload = {
  sub: string;          // user id
  role: string;         // role
  perms?: string[];     // permissions
  tv?: number;          // tokenVersion
};

function signWithOpts(payload: object, expiresIn: string | number): string {
  const opts: SignOptions = { algorithm: ALG, expiresIn: expiresIn as SignOptions['expiresIn'] };
  // Cast secret to Secret so TS picks the correct overload (not the callback one)
  return jwt.sign(payload, ACCESS_SECRET as Secret, opts);
}

export function signAccessToken(payload: AppJwtPayload): string {
  return signWithOpts(payload, ACCESS_TTL);
}

export function signRefreshToken(payload: AppJwtPayload): string {
  return signWithOpts(payload, `${REFRESH_TTL_DAYS}d`);
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, ACCESS_SECRET as Secret, { algorithms: [ALG] }) as T;
}
