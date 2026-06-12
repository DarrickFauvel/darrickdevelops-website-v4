# CLAUDE.md

## Project

Personal portfolio site — darrickdevelops.com v4. Node.js/Express, Eta templates, Turso (libSQL), Cloudinary for images. No build step, no bundler, no TypeScript.

## Commands

```bash
npm run dev       # start dev server (node --watch, auto-restarts)
npm run migrate   # apply schema + ALTER TABLE migrations
npm run seed      # insert sample data
npm start         # production server
```

Run migrations after any schema change. Migrations are additive-only (ALTER TABLE with try/catch — already-existing columns are silently ignored).

## File structure

```
src/
  server/
    index.js              # Express entry point
    db/
      schema.sql          # base CREATE TABLE statements
      migrate.js          # runs schema + alterations array
      queries/
        projects.js       # read-only queries (public routes)
        admin.js          # write queries (admin routes)
        blog.js / contact.js / fm-challenges.js
    lib/
      cloudinary.js       # upload, delete, signedUrl, hydrateProject
      auth.js             # in-memory token store, requireAuth middleware
      eta.js / markdown.js / slugify.js / screenshot.js / sse.js
    routes/
      home.js / projects.js / blog.js / contact.js / fm-challenges.js
      admin/              # protected routes for CMS features
  public/
    css/                  # vanilla CSS with custom properties (tokens.css)
    js/
      components/         # ES module web components + utilities
        image-editor.js   # thumbnail pan/zoom/rotate editor
  views/
    layouts/              # base.eta, admin.eta
    pages/                # one .eta per route
    partials/             # nav, footer, head, admin-flash
```

## Key conventions

**Templates** — Eta v3. Data passed as `it.*` inside templates. Layouts wrap pages via `<%~ includeFile(...) %>`.

**CSS** — Custom properties defined in `tokens.css`. No preprocessor. Component files in `css/components/`. `container-type: inline-size` is set on `project-card` — use `cqw` units for card-relative sizing.

**JS** — ESM throughout (server and client). No bundler. Client components are plain custom elements or module scripts imported in templates.

**DB** — Turso (`@libsql/client`). JSON arrays stored as TEXT, parsed in query helpers. New columns always go in the `alterations` array in `migrate.js`, never in `schema.sql` after initial deploy.

**Cloudinary** — Thumbnails stored as a `public_id` string (not a URL) in `thumbnail_url`. `hydrateProject()` in `cloudinary.js` resolves them to signed URLs before rendering. The original upload is never modified — pan/zoom/rotation are stored as four DB columns (`thumbnail_offset_x`, `thumbnail_offset_y`, `thumbnail_zoom_exp`, `thumbnail_rotation`) and applied via CSS `transform` at render time.

**Auth** — In-memory `Set` of random tokens. Tokens are lost on server restart (by design — dev only; production uses Railway's always-on instance). Password checked against `ADMIN_PASSWORD` env var.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `PORT` | no | defaults to 3000 |
| `NODE_ENV` | no | `development` locally |
| `TURSO_DATABASE_URL` | yes | `file:./dev.db` locally |
| `TURSO_AUTH_TOKEN` | prod only | blank for local file DB |
| `ADMIN_PASSWORD` | yes | admin panel login |
| `CLOUDINARY_CLOUD_NAME` | yes | image hosting |
| `CLOUDINARY_API_KEY` | yes | |
| `CLOUDINARY_API_SECRET` | yes | |

## Custom slash commands

`/ship` — branch, commit, push, PR, and squash-merge the current changes in one step. Defined in `.claude/commands/ship.md`.
