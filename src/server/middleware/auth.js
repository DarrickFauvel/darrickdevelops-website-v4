import { randomBytes } from 'crypto';

export const tokenStore = new Set();

export const generateToken = () => randomBytes(32).toString('hex');

export function getToken(req) {
  for (const pair of (req.headers.cookie ?? '').split(';')) {
    const eq = pair.indexOf('=');
    if (eq === -1) continue;
    const key = pair.slice(0, eq).trim();
    const val = pair.slice(eq + 1).trim();
    if (key === 'admin_token') return val;
  }
  return null;
}

export function requireAuth(req, res, next) {
  const token = getToken(req);
  if (token && tokenStore.has(token)) return next();
  res.redirect('/admin/login');
}
