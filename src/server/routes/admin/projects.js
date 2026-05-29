import { Router } from 'express';
import multer from 'multer';
import { render } from '../../lib/eta.js';
import { slugify } from '../../lib/slugify.js';
import { screenshotUrl } from '../../lib/screenshot.js';
import { hydrateProject, resolveUrl, isCloudinaryId, deleteAsset, uploadBuffer } from '../../lib/cloudinary.js';
import { getAllProjects, getProjectById } from '../../db/queries/projects.js';
import { createProject, updateProject, deleteProject } from '../../db/queries/admin.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();

function parseList(v) {
  if (!v?.trim()) return JSON.stringify([]);
  return JSON.stringify(v.split(',').map(s => s.trim()).filter(Boolean));
}

const VIEWPORTS = {
  desktop: { width: 1280, height: 800  },
  tablet:  { width: 768,  height: 1024 },
  mobile:  { width: 390,  height: 660  },
};
const VIEWPORT_NAMES = Object.keys(VIEWPORTS);

const screenshotFields = VIEWPORT_NAMES.map(vp => ({ name: `upload_${vp}`, maxCount: 1 }));

async function processImages(b, files, slug) {
  let thumbnail_url = null;
  let thumbFailed   = false;
  const generated   = [];

  for (const vp of VIEWPORT_NAMES) {
    const uploaded = files?.[`upload_${vp}`]?.[0];
    if (uploaded) {
      try {
        const id = await uploadBuffer(uploaded.buffer, slug, vp);
        generated.push(id);
        if (!thumbnail_url) thumbnail_url = id;
      } catch { thumbFailed = true; }
      continue;
    }
    if (b[`gen_${vp}`] === 'on' && b.live_url?.trim()) {
      try {
        const id = await screenshotUrl(b.live_url.trim(), slug, vp);
        generated.push(id);
        if (!thumbnail_url) thumbnail_url = id;
      } catch { thumbFailed = true; }
    }
  }

  return { thumbnail_url, generated, thumbFailed };
}

const FLASH = {
  created:           'Project created.',
  'created-thumb':   'Project created with auto-generated screenshots.',
  updated:           'Project updated.',
  'updated-thumb':   'Project updated with auto-generated screenshots.',
  deleted:           'Project deleted.',
  'slug-taken':      'That slug is already in use — choose a different one.',
  'not-found':       'Project not found.',
  'thumb-failed':      'Project saved, but screenshot failed — check the live URL.',
  'thumb-deleted':     'Thumbnail deleted.',
  error:               'Something went wrong. Please try again.',
};

function getFlash(req) {
  if (req.query.success) return { type: 'success', message: FLASH[req.query.success] ?? 'Done.' };
  if (req.query.error)   return { type: 'error',   message: FLASH[req.query.error]   ?? 'Error.' };
  return null;
}

router.get('/screenshot-preview', async (req, res) => {
  const { url, width = 1280, height = 800 } = req.query;
  if (!url) return res.status(400).end();
  try {
    const src = `https://image.thum.io/get/width/${width}/viewportWidth/${width}/crop/${height}/${url}`;
    const upstream = await fetch(src);
    if (!upstream.ok) return res.status(502).end();
    res.set('Content-Type', upstream.headers.get('content-type') || 'image/png');
    res.set('Cache-Control', 'private, max-age=300');
    const { Readable } = await import('stream');
    Readable.fromWeb(upstream.body).pipe(res);
  } catch {
    res.status(502).end();
  }
});

router.get('/', async (req, res) => {
  const projects = (await getAllProjects()).map(hydrateProject);
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

router.post('/', upload.fields(screenshotFields), async (req, res) => {
  const b    = req.body ?? {};
  const slug = b.slug?.trim() || slugify(b.title ?? '');
  const { thumbnail_url, generated, thumbFailed } = await processImages(b, req.files, slug);

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
      screenshots:   JSON.stringify(generated),
      status:        b.status ?? 'live',
      featured:      b.featured === 'on' ? 1 : 0,
    });
    const key = thumbFailed ? 'thumb-failed' : (generated.length ? 'created-thumb' : 'created');
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
    thumbnailPreview: resolveUrl(project.thumbnail_url),
    isEdit: true,
  });
});

router.post('/:id', upload.fields(screenshotFields), async (req, res) => {
  const id      = Number(req.params.id);
  const b       = req.body ?? {};
  const slug    = b.slug?.trim() || slugify(b.title ?? '');
  const current = await getProjectById(id);
  const { thumbnail_url: newThumb, generated, thumbFailed } = await processImages(b, req.files, slug);

  const thumbnail_url = newThumb ?? current?.thumbnail_url ?? null;

  const existingScreenshots = (current?.screenshots || [])
    .filter(s => !generated.some(g => s === g || s.endsWith(g.split('/').pop())));
  const mergedScreenshots = [...existingScreenshots, ...generated];

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
      screenshots:   JSON.stringify(mergedScreenshots),
      status:        b.status ?? 'live',
      featured:      b.featured === 'on' ? 1 : 0,
    });
    const key = thumbFailed ? 'thumb-failed' : (generated.length ? 'updated-thumb' : 'updated');
    res.redirect(`/admin/projects?success=${key}`);
  } catch (err) {
    const key = err.message?.includes('UNIQUE') ? 'slug-taken' : 'error';
    res.redirect(`/admin/projects/${id}/edit?error=${key}`);
  }
});

router.post('/:id/delete-thumbnail', async (req, res) => {
  const id      = Number(req.params.id);
  const project = await getProjectById(id);
  if (!project) return res.redirect('/admin/projects?error=not-found');
  if (project.thumbnail_url && isCloudinaryId(project.thumbnail_url)) {
    await deleteAsset(project.thumbnail_url).catch(() => {});
  }
  await updateProject(id, {
    ...project,
    thumbnail_url: null,
    tech_stack:    JSON.stringify(project.tech_stack),
    features:      JSON.stringify(project.features),
    screenshots:   JSON.stringify(project.screenshots),
  });
  res.redirect(`/admin/projects/${id}/edit?success=thumb-deleted`);
});

router.post('/:id/delete', async (req, res) => {
  await deleteProject(Number(req.params.id));
  res.redirect('/admin/projects?success=deleted');
});

export default router;
