# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is recruiters, hiring managers, and technical interviewers evaluating Dillo Raju for senior, staff, lead, and product-engineering roles. They arrive from a résumé, LinkedIn profile, or referral and are scanning for evidence of seniority, scope, and technical range within a few minutes.

## Product Purpose

A personal portfolio and career-marketing site for Dillo Raju, a senior software engineer and technical lead. Its job is to win a full-time engineering role: it presents his experience, technical range, and current focus (AI-enabled product development, agentic engineering workflows, application modernization) so a hiring manager can quickly judge fit and reach out. Success is a visitor messaging Dillo on LinkedIn.

## Positioning

Distinguishes Dillo from a general "senior engineer with 15 years of experience" profile by pairing two things most peers don't combine: hands-on legacy-modernization leadership (co-leading migration of ~20 Ruby applications to Java/Spring Boot/React) and applied AI-agent tooling built for that same modernization work (Codex/Claude Code skills that automate upgrades, adopted by 10+ developers). The Guides section backs this up with public, worked technical writing rather than just claims.

## Operating Context

- Homepage, About, Résumé, Guides, and Contact are the core surfaces; no blog, no separate Projects section (see Evidence on Hand).
- Résumé page embeds and links to a downloadable PDF (`public/resume.pdf`) — this is the canonical, most-trusted artifact on the site and is treated as a primary conversion point alongside LinkedIn.
- Guides is a core, ongoing content pillar (illustrated, multi-series technical explanations), not an occasional or experimental feature — expect continued investment: new series, new lessons, and it should carry equal structural weight to About/Résumé rather than reading as a side project.
- Contact is intentionally narrow: LinkedIn and Medium only. No email address and no contact form are exposed anywhere on the site — this is a deliberate choice, not a gap.

## Capabilities and Constraints

- Built with Next.js (App Router) + Tailwind CSS v4, MDX content, Framer Motion transitions, deployed on Vercel.
- Content-driven sections (Guides, and formerly Projects) are authored as MDX/data under `content/` and `lib/`, not a CMS.
- `content/projects/*.mdx` (two entries) exist but are intentionally unrendered — the Projects section was removed from the site on purpose while the write-ups were kept for possible future use. Do not treat their absence from navigation as a bug, and do not delete them as part of unrelated work.
- No user accounts, forms, or backend — fully static/content site with no data collection.

## Brand Commitments

- Name and identity: Dillo Raju, represented with a "DR" monogram mark in the nav.
- Contact is LinkedIn (`linkedin.com/in/dillo-raju`) and Medium (`@dilloshion`) only — no email, no contact form. This is a standing decision, not an omission to fix.
- Voice in existing copy is direct, technical, and outcome-specific (real org names, concrete scope like "~20 legacy Ruby applications," "10+ developers") rather than generic self-description — future copy should preserve that specificity rather than reverting to generic claims.

## Evidence on Hand

- Real, current résumé PDF at `public/resume.pdf`, embedded and downloadable from `/resume`.
- Real employment history with named organizations (Argonne National Laboratory, Panorama Education, GovCIO, RentPath) and dates, already reflected in `/about`.
- Two written project case studies exist in `content/projects/` (`cli-dev-toolkit.mdx`, `distributed-task-queue.mdx`) but are not currently linked from any page — do not present them as live/linked content, and do not fabricate additional case studies, testimonials, or metrics beyond what's in these files or the résumé.
- Guides content lives under `content/` and `lib/guides/`; treat only what's actually written there as real — don't invent guide topics, lesson counts, or outcomes not present in the code/content.

## Product Principles

1. Optimize every surface for a time-pressed hiring manager's scan, not for a browsing visitor — clarity and credibility beat cleverness.
2. Keep the résumé PDF and LinkedIn as the two paths to action; don't introduce competing or lower-intent contact mechanisms (email, forms) without an explicit decision to change this constraint.
3. Guides is real technical proof of expertise, not marketing filler — treat it as a durable, growing section deserving real craft, not an afterthought.
4. Preserve removed-but-kept content (`content/projects/`) as intentional inactive inventory, not dead code to clean up.
5. Never invent employers, metrics, testimonials, or outcomes; every claim on the site must trace to real content already in the repo or explicitly provided by Dillo.
