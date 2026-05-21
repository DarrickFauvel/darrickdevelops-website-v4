import { Router } from 'express';
import { render } from '../lib/eta.js';
import { getAllProjects, getProjectBySlug } from '../db/queries/projects.js';

const router = Router();

router.get('/', async (req, res) => {
  const projects = await getAllProjects();
  const allTags = [...new Set(projects.flatMap(p => p.tech_stack))];
  await render(res, 'pages/projects', {
    title: 'Projects — Darrick Develops',
    description: 'Web applications built by Darrick Fauvel.',
    projects,
    allTags,
  });
});

router.get('/:slug', async (req, res) => {
  const project = await getProjectBySlug(req.params.slug);
  if (!project) return res.status(404).send('Not found');
  await render(res, 'pages/project-detail', {
    title: `${project.title} — Darrick Develops`,
    description: project.summary,
    project,
  });
});

export default router;
