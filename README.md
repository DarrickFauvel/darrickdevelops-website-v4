# darrickdevelops.com v4

Personal portfolio site for [Darrick Fauvel](https://darrickdevelops.com) — built with Node.js, Express, Eta templates, and Turso (libSQL).

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js ≥ 22 (ESM) |
| Server | Express 5 |
| Templates | Eta v3 |
| Database | Turso (libSQL) — file-based locally, hosted in production |
| Image hosting | Cloudinary (private assets, signed URLs) |
| Styles | Vanilla CSS with custom properties |
| JS | Vanilla ES modules, no bundler |

## Local setup

**1. Install dependencies**

```bash
npm install
```

**2. Create `.env`**

```
PORT=3000
NODE_ENV=development

TURSO_DATABASE_URL=file:./dev.db
TURSO_AUTH_TOKEN=

ADMIN_PASSWORD=yourpassword

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

`TURSO_AUTH_TOKEN` can be left blank when using a local file DB.

**3. Run migrations**

```bash
npm run migrate
```

**4. (Optional) Seed sample data**

```bash
npm run seed
```

**5. Start dev server**

```bash
npm run dev
```

App runs at `http://localhost:3000`. The dev server restarts automatically on file changes via `node --watch`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with `node --watch` |
| `npm start` | Start production server |
| `npm run migrate` | Apply schema + additive ALTER TABLE migrations |
| `npm run seed` | Insert sample projects and FM challenges |

## Admin panel

`/admin` — password-protected via a session token stored in an in-memory `Set`. Login at `/admin/login`.

Thumbnail images are uploaded to Cloudinary as private assets. The editor saves pan/zoom/rotation transforms to the DB; the original asset is never cropped or re-encoded.

## Deployment

Hosted on Railway. Set all env vars listed above in the Railway service, pointing `TURSO_DATABASE_URL` at the production Turso instance.
