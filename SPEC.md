# darrickdevelops.com v4 — Design & Architecture Spec

## 1. Project Overview

A modern, minimal portfolio site for Darrick Develops showcasing web development skill through:
- 3 original portfolio web apps (TBD)
- A curated set of Frontend Mentor challenge completions
- A contact form
- A blog (scaffolded, content-light at launch)

**Tagline proposition:** *"Building the web the right way — fast, semantic, and shipped."*
Alternative: *"Full-stack developer. Clean code. Real products."*

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Modern CSS (custom properties, cascade layers, container queries, `@property`) |
| Interactivity | Vanilla JS + Datastar framework (SSE-driven reactivity) |
| Runtime | Node.js LTS (latest) |
| Server | Express.js with Server-Sent Events (SSE) |
| Database | Turso (LibSQL — edge SQLite) |
| Template Engine | Eta (lightweight, Express-compatible, `~` syntax) |
| Web Components | Native Custom Elements — used for interactive/reusable UI |
| Deployment | Railway (persistent HTTP connections — required for SSE) |

**Why Datastar + SSE:** This is a deliberate architectural differentiator. Datastar replaces the typical SPA/AJAX pattern with a hypermedia-over-SSE approach — the server streams HTML fragments and signals directly, keeping the client thin and the server in control. Worth calling out to technical visitors.

**Why Eta:** Minimal overhead, Express `res.render()` compatible, fast compilation, no magic — templates are plain HTML with `<%= %>` / `<%~ %>` tags. Partials and layouts work out of the box.

**Why Web Components:** Custom Elements let reusable UI pieces (`<project-card>`, `<tech-badge>`, `<fm-card>`) own their structure, style (via `::part` or encapsulated CSS), and behavior without a framework. Server renders the initial HTML; the component upgrades progressively. This pairs cleanly with Datastar — no competing reactivity models.

---

## 3. Site Structure

```
/                       → Homepage
/projects               → All portfolio projects listing
/projects/:slug         → Single project detail page
/fm-challenges          → Frontend Mentor challenge gallery
/fm-challenges/:slug    → Single FM challenge detail
/blog                   → Blog listing (scaffolded, minimal UI)
/blog/:slug             → Blog post (scaffolded)
/contact                → Contact (or section on homepage)
```

---

## 4. Pages & Sections

### 4.1 Homepage (`/`)

**Hero Section**
- Full-width, generous vertical padding
- Name: "Darrick Develops" or "Darrick Fauvel" (decide which to lead with)
- Proposed headline: *"Building the web the right way."*
- Subtext: *"Full-stack developer focused on semantic HTML, modern CSS, and real shipped products. No bloat. No frameworks for the sake of it."*
- CTA buttons: `View Projects` → `/projects` | `Get in Touch` → `#contact`
- No hero image required — strong typography carries the section

**About Section**
- 2–3 sentence professional bio
- Soft two-column layout: bio left, skills/stack right (or stacked on mobile)
- Tech stack overview here (see §4.4)

**Featured Projects Section**
- 3 project cards (pulled from Turso, rendered server-side via SSE stream)
- Each card: project name, one-line description, tech badge list, live/repo links
- "View all projects" link → `/projects`

**Frontend Mentor Section**
- Condensed gallery: 4–6 challenge thumbnails with difficulty badge and tech tags
- "View all challenges" link → `/fm-challenges`

**Tech Stack Section** (see §4.4)

**Contact Section** (`#contact`)
- Email form (see §4.5)
- GitHub, LinkedIn, and any other social links

**Blog Teaser** (minimal)
- 2 most recent post titles as a simple link list — or omit at launch if no posts exist
- "Coming soon" state acceptable

---

### 4.2 Projects (`/projects` and `/projects/:slug`)

**Listing Page**
- Grid of project cards
- Filter by tech tag (client-side signal via Datastar, no page reload)
- Each card: thumbnail/screenshot, title, one-liner, tech badges, links

**Detail Page (`/projects/:slug`)**

Each project detail page should cover:

| Field | Notes |
|---|---|
| `title` | Project name |
| `slug` | URL-safe identifier |
| `summary` | One-sentence description |
| `description` | Full markdown body (the story of the project) |
| `tech_stack` | Array of tech tags |
| `challenges` | What was hard — key learning moments |
| `solutions` | How challenges were resolved |
| `features` | Notable features list |
| `live_url` | Production URL (nullable) |
| `repo_url` | GitHub URL (nullable) |
| `thumbnail_url` | OG/card image |
| `screenshots` | Array of image URLs |
| `status` | `live` | `in-progress` | `archived` |
| `created_at` | Date |
| `featured` | Boolean — used to pin to homepage |

---

### 4.3 Frontend Mentor Challenges (`/fm-challenges` and `/fm-challenges/:slug`)

**Listing Page**
- Masonry or uniform grid of challenge cards
- Filterable by difficulty: `Newbie` | `Junior` | `Intermediate` | `Advanced` | `Guru`
- Filter via Datastar client-side signals (no reload)

**Detail Page (`/fm-challenges/:slug`)**

| Field | Notes |
|---|---|
| `title` | Challenge name |
| `slug` | URL-safe identifier |
| `difficulty` | FM difficulty tier |
| `tech_stack` | Array of tags |
| `solution_url` | Your live solution |
| `repo_url` | GitHub solution repo |
| `fm_url` | Link to the original FM challenge |
| `screenshot_url` | Desktop/mobile screenshots |
| `notes` | Brief reflection (optional) |
| `completed_at` | Date |
| `featured` | Boolean |

---

### 4.4 Tech Stack Section

Global "how I build" section on the homepage. Two display options — pick one:

**Option A: Icon grid with labels**
Six cells: HTML5, CSS3, JavaScript, Node.js, Datastar, Turso. Each with a small icon and 1-line description.

**Option B: Grouped list**
- Frontend: Semantic HTML, Modern CSS, Vanilla JS, Datastar
- Backend: Node.js LTS, Express, SSE
- Data: Turso (LibSQL), SQL

Recommended: Option B — more readable, easier to add nuance, visually distinct from a typical skills icon grid.

---

### 4.5 Contact

**Contact Form**
- Fields: Name, Email, Subject, Message
- Submission via SSE-powered Express route — Datastar posts, server responds with streamed HTML fragment (success/error state)
- Message persisted to Turso `contact_messages` table
- Server-side validation; client sees inline feedback via SSE fragment swap
- No third-party form service needed

**Social Links**
- GitHub
- LinkedIn
- Email (`darrick@darrickdevelops.com`)

---

### 4.6 Blog (Scaffolded)

Minimal at launch — full build when content is ready.

**Scaffold now:**
- Turso `posts` table with full schema
- Express routes: `GET /blog`, `GET /blog/:slug`
- Listing page: renders "No posts yet" gracefully if empty
- Post detail page: renders markdown body

**Post schema:**

| Field | Notes |
|---|---|
| `id` | Integer primary key |
| `title` | Post title |
| `slug` | URL-safe identifier |
| `excerpt` | 1–2 sentence summary |
| `body` | Markdown content |
| `tags` | Comma-separated or JSON array |
| `published` | Boolean |
| `published_at` | Timestamp (nullable) |
| `created_at` | Timestamp |

---

## 5. Design System

### 5.1 Color Palette

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f9f9f9` | Page background |
| `--color-surface` | `#ffffff` | Cards, panels |
| `--color-border` | `#e5e7eb` | Dividers, card borders |
| `--color-text-primary` | `#111827` | Body copy, headings |
| `--color-text-secondary` | `#6b7280` | Captions, metadata |
| `--color-accent` | `#1e3a5f` | Deep navy — CTAs, links, highlights |
| `--color-accent-hover` | `#16294a` | Hover state |
| `--color-success` | `#16a34a` | Form success |
| `--color-error` | `#dc2626` | Form error |

### 5.2 Typography

| Role | Font | Weight | Size |
|---|---|---|---|
| Display / H1 | Geometric sans (e.g. Inter, Plus Jakarta Sans) | 700–800 | `clamp(2.5rem, 5vw, 4rem)` |
| H2 | Same | 600 | `clamp(1.75rem, 3vw, 2.5rem)` |
| H3 | Same | 600 | `1.25rem` |
| Body | Same | 400 | `1rem` (16px base) |
| Code / Tech tags | Monospace (e.g. JetBrains Mono, Fira Code) | 400 | `0.875rem` |
| Caption / Meta | Same as body | 400 | `0.875rem` |

Use `@font-face` with `font-display: swap`. Host fonts locally or use Google Fonts with `preconnect`.

### 5.3 Spacing

Base unit: `0.25rem` (4px). Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
Defined as CSS custom properties: `--space-1` through `--space-32`.

### 5.4 Components

**Card**
- `background: var(--color-surface)`
- `border: 1px solid var(--color-border)`
- `border-radius: 0.75rem`
- `box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Hover: `box-shadow` lifts slightly, subtle `transform: translateY(-2px)`

**Tech Badge**
- Pill shape, `background: #f3f4f6`, `color: #374151`
- Monospace font, small size
- No border, relies on background differentiation

**Button (Primary)**
- `background: var(--color-accent)`, white text
- `border-radius: 0.5rem`, generous padding
- Hover: darken with `--color-accent-hover`

**Button (Secondary / Ghost)**
- Transparent background, `border: 1.5px solid var(--color-accent)`
- `color: var(--color-accent)`

---

## 6. Architecture

### 6.1 SSE + Datastar Pattern

```
Browser (Datastar signals)
    │
    ├─ GET /sse/stream  ──→  Express SSE endpoint
    │                         │
    │                         ├─ mergeFragments(html)  → replaces DOM node
    │                         ├─ mergeSignals(json)    → updates reactive state
    │                         └─ executeScript(js)     → one-shot scripts
    │
    └─ POST /contact    ──→  Express handler → Turso insert → SSE fragment response
```

Use Datastar's `data-on-submit` and `data-signals` attributes. Keep JS minimal — Datastar handles the plumbing, server owns the logic.

### 6.2 Folder Structure

```
darrickdevelops-website-v4/
├── src/
│   ├── server/
│   │   ├── index.js              # Express app entry
│   │   ├── routes/
│   │   │   ├── home.js
│   │   │   ├── projects.js
│   │   │   ├── fm-challenges.js
│   │   │   ├── blog.js
│   │   │   ├── contact.js
│   │   │   └── sse.js            # SSE stream endpoint
│   │   ├── db/
│   │   │   ├── client.js         # Turso client init
│   │   │   ├── schema.sql        # Source-of-truth DDL
│   │   │   └── queries/          # Named query functions per domain
│   │   └── lib/
│   │       ├── sse.js            # SSE helper (mergeFragments, mergeSignals)
│   │       └── markdown.js       # Markdown → HTML renderer
│   ├── public/
│   │   ├── css/
│   │   │   ├── tokens.css        # Custom properties
│   │   │   ├── reset.css         # Modern CSS reset
│   │   │   ├── base.css          # Typography, body
│   │   │   ├── layout.css        # Grid, containers
│   │   │   └── components/       # Card, badge, button, nav, footer, form
│   │   ├── js/
│   │   │   ├── main.js           # Datastar init, app bootstrap
│   │   │   └── components/       # Web Component definitions
│   │   │       ├── project-card.js
│   │   │       ├── fm-card.js
│   │   │       ├── tech-badge.js
│   │   │       └── contact-form.js
│   │   └── assets/
│   │       ├── fonts/
│   │       └── images/
│   └── views/
│       ├── layouts/
│       │   └── base.eta          # Base shell with <slot>-style includes
│       ├── partials/
│       │   ├── nav.eta
│       │   ├── footer.eta
│       │   └── head.eta          # <head> meta, OG tags, CSS links
│       └── pages/
│           ├── home.eta
│           ├── projects.eta
│           ├── project-detail.eta
│           ├── fm-challenges.eta
│           ├── fm-detail.eta
│           ├── blog.eta
│           ├── blog-post.eta
│           └── contact.eta
├── railway.toml                  # Railway deploy config
├── SPEC.md
├── package.json
└── .env.example
```

### 6.3 Turso Database Schema (DDL)

```sql
CREATE TABLE projects (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  summary      TEXT NOT NULL,
  description  TEXT,
  tech_stack   TEXT NOT NULL,  -- JSON array
  challenges   TEXT,
  solutions    TEXT,
  features     TEXT,           -- JSON array
  live_url     TEXT,
  repo_url     TEXT,
  thumbnail_url TEXT,
  screenshots  TEXT,           -- JSON array
  status       TEXT DEFAULT 'live' CHECK (status IN ('live','in-progress','archived')),
  featured     INTEGER DEFAULT 0,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE fm_challenges (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  title          TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  difficulty     TEXT NOT NULL CHECK (difficulty IN ('Newbie','Junior','Intermediate','Advanced','Guru')),
  tech_stack     TEXT NOT NULL,   -- JSON array
  solution_url   TEXT,
  repo_url       TEXT,
  fm_url         TEXT,
  screenshot_url TEXT,
  notes          TEXT,
  featured       INTEGER DEFAULT 0,
  completed_at   TEXT
);

CREATE TABLE posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT,
  body         TEXT,
  tags         TEXT,             -- JSON array
  published    INTEGER DEFAULT 0,
  published_at TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## 7. Web Components

Native Custom Elements — no Shadow DOM unless encapsulation is genuinely needed. Prefer Light DOM so global CSS applies naturally.

### Components to build

| Element | Description | Shadow DOM? |
|---|---|---|
| `<project-card>` | Renders a project summary card with title, tech badges, links | No |
| `<fm-card>` | FM challenge card with difficulty badge and screenshot | No |
| `<tech-badge>` | Single pill-shaped tech tag | No |
| `<contact-form>` | Form with Datastar `data-on-submit` wired to SSE | No |
| `<site-nav>` | Responsive navigation with mobile toggle | No |

### Pattern

Server renders the component markup inside the custom element tag (Eta template):
```html
<project-card data-slug="my-project">
  <h3 slot="title">My Project</h3>
  <p slot="summary">One-liner description.</p>
  <ul slot="tech">
    <tech-badge>Node.js</tech-badge>
    <tech-badge>Turso</tech-badge>
  </ul>
</project-card>
```

The JS class upgrades the element progressively — hover behavior, interaction, animation. Content is always present before JS loads (SSR-first). This means no flash of unstyled content and no hydration mismatch.

### Component file pattern (`/public/js/components/project-card.js`)
```js
class ProjectCard extends HTMLElement {
  connectedCallback() {
    // progressive enhancement only — markup already rendered by server
  }
}
customElements.define('project-card', ProjectCard);
```

---

## 8. Deployment (Railway)

### `railway.toml`
```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "node src/server/index.js"
restartPolicyType = "on_failure"
```

### Environment Variables (set in Railway dashboard)

| Variable | Notes |
|---|---|
| `PORT` | Set by Railway automatically |
| `TURSO_DATABASE_URL` | Turso DB URL (libsql://...) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `NODE_ENV` | `production` |

### SSE on Railway
Railway maintains persistent HTTP connections — SSE works without configuration. No timeout workarounds needed. Use `res.setHeader('X-Accel-Buffering', 'no')` to disable Nginx buffering if proxied.

---

## 9. SEO & Performance

- Semantic HTML: `<header>`, `<main>`, `<article>`, `<section>`, `<nav>`, `<footer>` — no div soup
- Every page: unique `<title>`, `<meta name="description">`, Open Graph tags
- Project and FM detail pages: auto-generated OG image or static thumbnail
- `rel="preconnect"` for fonts, `font-display: swap`
- CSS served as plain files — no runtime CSS-in-JS
- No client-side routing — full server-rendered pages with Datastar handling only progressive enhancements
- `sitemap.xml` generated from Turso data at build time or on request

---

## 10. Open Questions / Decisions Deferred

- [ ] Final tagline / hero copy — Darrick to decide or approve
- [ ] Font selection: Inter vs Plus Jakarta Sans vs other geometric sans
- [ ] Project #1, #2, #3 — names, descriptions, screenshots
- [ ] Which FM challenges to feature at launch
- [ ] GitHub and LinkedIn URLs
- [ ] Decide: single-page (sections) or multi-page for contact; currently spec'd as a `#contact` section on homepage *and* linked from nav

**Resolved:**
- [x] Template engine → **Eta**
- [x] Web Components → **Native Custom Elements, Light DOM, SSR-first**
- [x] Deployment → **Railway**

---

## 11. Out of Scope (v4)

- Authentication / admin dashboard (add projects via UI) — manage via SQL or a simple seed script for now
- Dark mode toggle — pure light mode for v4
- Analytics — can add Plausible or Fathom later
- RSS feed — scaffold with blog if needed
- Search across projects/posts
