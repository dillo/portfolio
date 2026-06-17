# Portfolio

Personal portfolio site built with Next.js 14, Tailwind CSS, and MDX.

## Stack

- **Framework** — Next.js 14 (App Router, fully static)
- **Styling** — Tailwind CSS v4 + `@tailwindcss/typography`
- **Content** — MDX files in `content/` parsed with `gray-matter` + `next-mdx-remote`
- **Animations** — Framer Motion (page transitions)
- **Hosting** — Vercel

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a project

Create a new file in `content/projects/your-project-name.mdx`:

```mdx
---
title: Your Project Title
description: One sentence description shown on the card.
tags: [TypeScript, Go, React]
date: 2024-01-15
github: https://github.com/you/your-repo # optional
live: https://yourproject.com # optional
featured: false
---

## Overview

Write your project write-up here in Markdown...
```

The slug is derived from the filename (`your-project-name` → `/projects/your-project-name`).

## Adding a blog post

Create a new file in `content/blog/your-post-slug.mdx`:

```mdx
---
title: Your Post Title
date: 2024-01-15
summary: One sentence shown on the post list card.
tags: [engineering, craft]
draft: false # set true to hide from the list
---

Write your post here in Markdown...
```

Set `draft: true` to write without publishing. Remove it (or set `false`) to publish.

## Updating the Vercel URL

Once deployed, replace `dillo.vercel.app` in these files with your real deployment URL:

- `app/layout.tsx` — `BASE_URL`
- `app/sitemap.ts` — `BASE_URL`
- `app/robots.ts` — `sitemap` field
- `app/opengraph-image.tsx` — the URL label in the OG image

## Scripts

| Command          | Description                        |
| ---------------- | ---------------------------------- |
| `npm run dev`    | Start dev server at localhost:3000 |
| `npm run build`  | Production build                   |
| `npm run lint`   | ESLint                             |
| `npm run format` | Prettier (auto-formats all files)  |
