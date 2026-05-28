import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { slugify } from '../../lib/slugify.js';
import { getAllChallenges, getChallengeById } from '../../db/queries/fm-challenges.js';
import { createChallenge, updateChallenge, deleteChallenge } from '../../db/queries/admin.js';

const router = Router();

function parseList(v) {
  if (!v?.trim()) return JSON.stringify([]);
  return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean));
}

const FLASH = {
  created:      'Challenge created.',
  updated:      'Challenge updated.',
  deleted:      'Challenge deleted.',
  'slug-taken': 'That slug is already in use — choose a different one.',
  'not-found':  'Challenge not found.',
  error:        'Something went wrong. Please try again.',
};

function getFlash(req) {
  if (req.query.success) return { type: 'success', message: FLASH[req.query.success] ?? 'Done.' };
  if (req.query.error)   return { type: 'error',   message: FLASH[req.query.error]   ?? 'Error.' };
  return null;
}

router.get('/', async (req, res) => {
  const challenges = await getAllChallenges();
  await render(res, 'pages/admin/fm-challenges/list', {
    title: 'FM Challenges',
    activeNav: 'fm-challenges',
    headerAction: { href: '/admin/fm-challenges/new', label: '+ New Challenge' },
    flash: getFlash(req),
    challenges,
  });
});

router.get('/new', async (req, res) => {
  await render(res, 'pages/admin/fm-challenges/form', {
    title: 'New Challenge',
    activeNav: 'fm-challenges',
    flash: getFlash(req),
    challenge: null,
    isEdit: false,
  });
});

router.post('/', async (req, res) => {
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  try {
    await createChallenge({
      title:          b.title?.trim(),
      slug,
      difficulty:     b.difficulty ?? 'Newbie',
      tech_stack:     parseList(b.tech_stack),
      solution_url:   b.solution_url?.trim() || null,
      repo_url:       b.repo_url?.trim() || null,
      fm_url:         b.fm_url?.trim() || null,
      screenshot_url: b.screenshot_url?.trim() || null,
      notes:          b.notes?.trim() || null,
      featured:       b.featured === 'on' ? 1 : 0,
      completed_at:   b.completed_at?.trim() || null,
    });
    res.redirect('/admin/fm-challenges?success=created');
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/fm-challenges/new?error=${key}`);
  }
});

router.get('/:id/edit', async (req, res) => {
  const challenge = await getChallengeById(Number(req.params.id));
  if (!challenge) return res.redirect('/admin/fm-challenges?error=not-found');
  await render(res, 'pages/admin/fm-challenges/form', {
    title: 'Edit Challenge',
    activeNav: 'fm-challenges',
    flash: getFlash(req),
    challenge,
    isEdit: true,
  });
});

router.post('/:id', async (req, res) => {
  const id   = Number(req.params.id);
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  try {
    await updateChallenge(id, {
      title:          b.title?.trim(),
      slug,
      difficulty:     b.difficulty ?? 'Newbie',
      tech_stack:     parseList(b.tech_stack),
      solution_url:   b.solution_url?.trim() || null,
      repo_url:       b.repo_url?.trim() || null,
      fm_url:         b.fm_url?.trim() || null,
      screenshot_url: b.screenshot_url?.trim() || null,
      notes:          b.notes?.trim() || null,
      featured:       b.featured === 'on' ? 1 : 0,
      completed_at:   b.completed_at?.trim() || null,
    });
    res.redirect('/admin/fm-challenges?success=updated');
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/fm-challenges/${id}/edit?error=${key}`);
  }
});

router.post('/:id/delete', async (req, res) => {
  await deleteChallenge(Number(req.params.id));
  res.redirect('/admin/fm-challenges?success=deleted');
});

export default router;
