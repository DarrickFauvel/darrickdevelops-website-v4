import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { getDashboardCounts, getRecentMessages } from '../../db/queries/admin.js';

const router = Router();

router.get('/', async (req, res) => {
  const [counts, messages] = await Promise.all([
    getDashboardCounts(),
    getRecentMessages(10),
  ]);
  await render(res, 'pages/admin/dashboard', {
    title: 'Dashboard',
    activeNav: 'dashboard',
    counts,
    messages,
  });
});

export default router;
