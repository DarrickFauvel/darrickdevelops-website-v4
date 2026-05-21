import { Router } from 'express';
import { initSSE, mergeFragments, closeSSE } from '../lib/sse.js';
import { saveMessage } from '../db/queries/contact.js';

const router = Router();

router.post('/submit', async (req, res) => {
  initSSE(res);

  // Datastar sends signals nested under req.body.datastar; fall back to flat body
  const body = req.body?.datastar ?? req.body;
  const { contactName, contactEmail, contactSubject, contactMessage } = body;

  if (!contactName?.trim() || !contactEmail?.trim() || !contactMessage?.trim()) {
    mergeFragments(res, `
      <div id="contact-feedback" class="form-feedback form-feedback--error" role="alert">
        Please fill in your name, email, and message.
      </div>
    `);
    return closeSSE(res);
  }

  try {
    await saveMessage({
      name:    contactName.trim(),
      email:   contactEmail.trim(),
      subject: contactSubject?.trim() ?? '',
      message: contactMessage.trim(),
    });
    mergeFragments(res, `
      <div id="contact-feedback" class="form-feedback form-feedback--success" role="alert">
        Message sent — I'll get back to you soon.
      </div>
    `);
  } catch {
    mergeFragments(res, `
      <div id="contact-feedback" class="form-feedback form-feedback--error" role="alert">
        Something went wrong. Please try again or email directly.
      </div>
    `);
  }

  closeSSE(res);
});

export default router;
