import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { tokenStore, generateToken, getToken } from '../../middleware/auth.js';

const router = Router();

router.get('/login', async (req, res) => {
  const token = getToken(req);
  if (token && tokenStore.has(token)) return res.redirect('/admin');
  await render(res, 'pages/admin/login', {
    title: 'Admin Login',
    noSidebar: true,
    error: req.query.error ?? null,
  });
});

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password && password === process.env.ADMIN_PASSWORD) {
    const token = generateToken();
    tokenStore.add(token);
    res.setHeader('Set-Cookie',
      `admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=86400`
    );
    return res.redirect('/admin');
  }
  res.redirect('/admin/login?error=invalid');
});

router.post('/logout', (req, res) => {
  const token = getToken(req);
  if (token) tokenStore.delete(token);
  res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0');
  res.redirect('/admin/login');
});

export default router;
