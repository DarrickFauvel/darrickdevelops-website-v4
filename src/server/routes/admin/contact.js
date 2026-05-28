import { Router } from 'express';
import { render } from '../../lib/eta.js';
import { getAllMessages, deleteMessage } from '../../db/queries/admin.js';

const router = Router();

const FLASH = {
  deleted: 'Message deleted.',
  error:   'Something went wrong. Please try again.',
};

function getFlash(req) {
  if (req.query.success) return { type: 'success', message: FLASH[req.query.success] ?? 'Done.' };
  if (req.query.error)   return { type: 'error',   message: FLASH[req.query.error]   ?? 'Error.' };
  return null;
}

router.get('/', async (req, res) => {
  const messages = await getAllMessages();
  await render(res, 'pages/admin/contact/list', {
    title: 'Contact Messages',
    activeNav: 'contact',
    flash: getFlash(req),
    messages,
  });
});

router.post('/:id/delete', async (req, res) => {
  await deleteMessage(Number(req.params.id));
  res.redirect('/admin/contact?success=deleted');
});

export default router;
