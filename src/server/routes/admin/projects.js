import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { slugify } from '../../lib/slugify.js';
import { screenshotUrl } from '../../lib/screenshot.js';
import { getAllProjects, getProjectById } from '../../db/queries/projects.js';
import { createProject, updateProject, deleteProject } from '../../db/queries/admin.js';

const router = Router();

function parseList(v) {
  if (!v?.trim()) return JSON.stringify([]);
  return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean));
}

const FLASH = {
  created:           'Project created.',
  'created-thumb':   'Project created with auto-generated thumbnail.',
  updated:           'Project updated.',
  'updated-thumb':   'Project updated with auto-generated thumbnail.',
  deleted:           'Project deleted.',
  'slug-taken':      'That slug is already in use — choose a different one.',
  'not-found':       'Project not found.',
  'thumb-failed':    'Project saved, but screenshot failed — check the live URL.',
  error:             'Something went wrong. Please try again.',
};

function getFlash(req) {
  if (req.query.success) return { type: 'success', message: FLASH[req.query.success] ?? 'Done.' };
  if (req.query.error)   return { type: 'error',   message: FLASH[req.query.error]   ?? 'Error.' };
  return null;
}

router.get('/', async (req, res) => {
  const projects = await getAllProjects();
  await render(res, 'pages/admin/projects/list', {
    title: 'Projects',
    activeNav: 'projects',
    headerAction: { href: '/admin/projects/new', label: '+ New Project' },
    flash: getFlash(req),
    projects,
  });
});

router.get('/new', async (req, res) => {
  await render(res, 'pages/admin/projects/form', {
    title: 'New Project',
    activeNav: 'projects',
    flash: getFlash(req),
    project: null,
    isEdit: false,
  });
});

router.post('/', async (req, res) => {
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  let thumbnail_url = b.thumbnail_url?.trim() || null;
  let thumbFailed   = false;

  if (b.auto_thumbnail === 'on' && b.live_url?.trim()) {
    try {
      thumbnail_url = await screenshotUrl(b.live_url.trim(), slug);
    } catch {
      thumbFailed = true;
    }
  }

  try {
    await createProject({
      title:         b.title?.trim(),
      slug,
      summary:       b.summary?.trim(),
      description:   b.description?.trim() || null,
      tech_stack:    parseList(b.tech_stack),
      challenges:    b.challenges?.trim() || null,
      solutions:     b.solutions?.trim() || null,
      features:      parseList(b.features),
      live_url:      b.live_url?.trim() || null,
      repo_url:      b.repo_url?.trim() || null,
      thumbnail_url,
      screenshots:   parseList(b.screenshots),
      status:        b.status ?? 'live',
      featured:      b.featured === 'on' ? 1 : 0,
    });
    const key = thumbFailed ? 'thumb-failed' : (thumbnail_url && b.auto_thumbnail === 'on' ? 'created-thumb' : 'created');
    res.redirect(`/admin/projects?success=${key}`);
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/projects/new?error=${key}`);
  }
});

router.get('/:id/edit', async (req, res) => {
  const project = await getProjectById(Number(req.params.id));
  if (!project) return res.redirect('/admin/projects?error=not-found');
  await render(res, 'pages/admin/projects/form', {
    title: 'Edit Project',
    activeNav: 'projects',
    flash: getFlash(req),
    project,
    isEdit: true,
  });
});

router.post('/:id', async (req, res) => {
  const id   = Number(req.params.id);
  const b    = req.body;
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  let thumbnail_url = b.thumbnail_url?.trim() || null;
  let thumbFailed   = false;

  if (b.auto_thumbnail === 'on' && b.live_url?.trim()) {
    try {
      thumbnail_url = await screenshotUrl(b.live_url.trim(), slug);
    } catch {
      thumbFailed = true;
    }
  }

  try {
    await updateProject(id, {
      title:         b.title?.trim(),
      slug,
      summary:       b.summary?.trim(),
      description:   b.description?.trim() || null,
      tech_stack:    parseList(b.tech_stack),
      challenges:    b.challenges?.trim() || null,
      solutions:     b.solutions?.trim() || null,
      features:      parseList(b.features),
      live_url:      b.live_url?.trim() || null,
      repo_url:      b.repo_url?.trim() || null,
      thumbnail_url,
      screenshots:   parseList(b.screenshots),
      status:        b.status ?? 'live',
      featured:      b.featured === 'on' ? 1 : 0,
    });
    const key = thumbFailed ? 'thumb-failed' : (thumbnail_url && b.auto_thumbnail === 'on' ? 'updated-thumb' : 'updated');
    res.redirect(`/admin/projects?success=${key}`);
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/projects/${id}/edit?error=${key}`);
  }
});

router.post('/:id/delete', async (req, res) => {
  await deleteProject(Number(req.params.id));
  res.redirect('/admin/projects?success=deleted');
});

export default router;
