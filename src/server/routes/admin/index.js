import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import authRouter      from './auth.js';
import dashboardRouter from './dashboard.js';
import projectsRouter  from './projects.js';
import fmRouter        from './fm-challenges.js';
import blogRouter      from './blog.js';
import contactRouter   from './contact.js';

const router = Router();

router.use('/', authRouter);

router.use(requireAuth);

router.use('/',              dashboardRouter);
router.use('/projects',      projectsRouter);
router.use('/fm-challenges', fmRouter);
router.use('/blog',          blogRouter);
router.use('/contact',       contactRouter);

export default router;
