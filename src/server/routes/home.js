import { Router } from 'express';
import { render } from '../lib/eta.js';
import { getFeaturedProjects } from '../db/queries/projects.js';
import { getFeaturedChallenges } from '../db/queries/fm-challenges.js';
import { getPublishedPosts } from '../db/queries/blog.js';

const router = Router();

router.get('/', async (req, res) => {
  const [projects, challenges, posts] = await Promise.all([
    getFeaturedProjects(),
    getFeaturedChallenges(),
    getPublishedPosts(2),
  ]);
  await render(res, 'pages/home', {
    title: 'Darrick Develops — Full-Stack Web Developer',
    description: 'Portfolio of Darrick Fauvel — building the web with semantic HTML, modern CSS, Node.js, and Datastar.',
    projects,
    challenges,
    posts,
  });
});

export default router;
