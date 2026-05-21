import { Router } from 'express';
import { render } from '../lib/eta.js';
import { getAllChallenges, getChallengeBySlug } from '../db/queries/fm-challenges.js';

const router = Router();

router.get('/', async (req, res) => {
  const challenges = await getAllChallenges();
  await render(res, 'pages/fm-challenges', {
    title: 'Frontend Mentor Challenges — Darrick Develops',
    description: 'Frontend Mentor challenge solutions by Darrick Fauvel.',
    challenges,
  });
});

router.get('/:slug', async (req, res) => {
  const challenge = await getChallengeBySlug(req.params.slug);
  if (!challenge) return res.status(404).send('Not found');
  await render(res, 'pages/fm-detail', {
    title: `${challenge.title} — Darrick Develops`,
    description: `Frontend Mentor: ${challenge.title} (${challenge.difficulty})`,
    challenge,
  });
});

export default router;
