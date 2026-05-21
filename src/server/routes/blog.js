import { Router } from 'express';
import { render } from '../lib/eta.js';
import { getPublishedPosts, getPostBySlug } from '../db/queries/blog.js';
import { toHtml } from '../lib/markdown.js';

const router = Router();

router.get('/', async (req, res) => {
  const posts = await getPublishedPosts();
  await render(res, 'pages/blog', {
    title: 'Blog — Darrick Develops',
    description: 'Writing about web development by Darrick Fauvel.',
    posts,
  });
});

router.get('/:slug', async (req, res) => {
  const post = await getPostBySlug(req.params.slug);
  if (!post) return res.status(404).send('Not found');
  await render(res, 'pages/blog-post', {
    title: `${post.title} — Darrick Develops`,
    description: post.excerpt ?? '',
    post: { ...post, bodyHtml: toHtml(post.body) },
  });
});

export default router;
