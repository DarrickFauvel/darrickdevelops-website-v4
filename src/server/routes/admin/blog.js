import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { slugify } from '../../lib/slugify.js';
import { toHtml } from '../../lib/markdown.js';
import { getAllPosts, getPostById } from '../../db/queries/blog.js';
import {
  createPost, updatePost, deletePost, publishPost, unpublishPost,
} from '../../db/queries/admin.js';

const router = Router();

function parseList(v) {
  if (!v?.trim()) return JSON.stringify([]);
  return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean));
}

const FLASH = {
  created:      'Post created.',
  updated:      'Post updated.',
  deleted:      'Post deleted.',
  published:    'Post published.',
  unpublished:  'Post unpublished.',
  'slug-taken': 'That slug is already in use — choose a different one.',
  'not-found':  'Post not found.',
  error:        'Something went wrong. Please try again.',
};

function getFlash(req) {
  if (req.query.success) return { type: 'success', message: FLASH[req.query.success] ?? 'Done.' };
  if (req.query.error)   return { type: 'error',   message: FLASH[req.query.error]   ?? 'Error.' };
  return null;
}

router.get('/', async (req, res) => {
  const posts = await getAllPosts();
  await render(res, 'pages/admin/blog/list', {
    title: 'Blog Posts',
    activeNav: 'blog',
    headerAction: { href: '/admin/blog/new', label: '+ New Post' },
    flash: getFlash(req),
    posts,
  });
});

router.get('/new', async (req, res) => {
  await render(res, 'pages/admin/blog/form', {
    title: 'New Post',
    activeNav: 'blog',
    flash: getFlash(req),
    post: null,
    preview: null,
    isEdit: false,
  });
});

router.post('/preview', async (req, res) => {
  const markdown = req.body.blogBody ?? '';
  res.json({ html: toHtml(markdown) });
});

router.post('/', async (req, res) => {
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  try {
    await createPost({
      title:     b.title?.trim(),
      slug,
      excerpt:   b.excerpt?.trim() || null,
      body:      b.body?.trim() || null,
      tags:      parseList(b.tags),
      published: b.published === 'on' ? 1 : 0,
    });
    res.redirect('/admin/blog?success=created');
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/blog/new?error=${key}`);
  }
});

router.get('/:id/edit', async (req, res) => {
  const post = await getPostById(Number(req.params.id));
  if (!post) return res.redirect('/admin/blog?error=not-found');
  const postForForm = { ...post, tags: JSON.parse(post.tags ?? '[]') };
  await render(res, 'pages/admin/blog/form', {
    title: 'Edit Post',
    activeNav: 'blog',
    flash: getFlash(req),
    post: postForForm,
    preview: post.body ? toHtml(post.body) : null,
    isEdit: true,
  });
});

router.post('/:id', async (req, res) => {
  const id   = Number(req.params.id);
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  try {
    const existing     = await getPostById(id);
    const nowPublished = b.published === 'on' ? 1 : 0;
    const publishedAt  = nowPublished
      ? (existing?.published_at ?? new Date().toISOString())
      : null;
    await updatePost(id, {
      title:        b.title?.trim(),
      slug,
      excerpt:      b.excerpt?.trim() || null,
      body:         b.body?.trim() || null,
      tags:         parseList(b.tags),
      published:    nowPublished,
      published_at: publishedAt,
    });
    res.redirect('/admin/blog?success=updated');
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/blog/${id}/edit?error=${key}`);
  }
});

router.post('/:id/publish', async (req, res) => {
  await publishPost(Number(req.params.id));
  res.redirect('/admin/blog?success=published');
});

router.post('/:id/unpublish', async (req, res) => {
  await unpublishPost(Number(req.params.id));
  res.redirect('/admin/blog?success=unpublished');
});

router.post('/:id/delete', async (req, res) => {
  await deletePost(Number(req.params.id));
  res.redirect('/admin/blog?success=deleted');
});

export default router;
