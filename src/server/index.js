import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import homeRouter from './routes/home.js';
import projectsRouter from './routes/projects.js';
import fmRouter from './routes/fm-challenges.js';
import blogRouter from './routes/blog.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));

app.use('/', homeRouter);
app.use('/projects', projectsRouter);
app.use('/fm-challenges', fmRouter);
app.use('/blog', blogRouter);
app.use('/contact', contactRouter);
app.use('/admin', adminRouter);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
