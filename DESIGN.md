---
name: Dillo Raju — Portfolio
description: A field-notebook system — warm ledger paper, terracotta ink, and a faint graph-paper grid behind quiet, disciplined technical prose.
colors:
  terracotta: '#b4432a'
  terracotta-hover: '#842f20'
  terracotta-soft: '#f0d7bd'
  teal: '#226b5b'
  teal-soft: '#c7ded2'
  ochre: '#8a5a12'
  ochre-soft: '#f0e2c4'
  paper: '#f5f1e8'
  card: '#fffaf0'
  ink: '#17130f'
  ink-muted: '#6e6458'
  border: '#d8cab8'
  diagram-plum: '#7a3f6d'
  diagram-indigo: '#3d5a94'
typography:
  display:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 4.5rem)'
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: 'JetBrains Mono, ui-monospace, monospace'
    fontSize: '0.6875rem'
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: '0.02em'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
  full: '9999px'
spacing:
  xs: '8px'
  sm: '12px'
  md: '20px'
  lg: '32px'
  xl: '64px'
components:
  button-primary:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.paper}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
  button-primary-hover:
    backgroundColor: '{colors.terracotta}'
  button-secondary:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '12px 20px'
  button-secondary-hover:
    textColor: '{colors.terracotta}'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '24px'
  eyebrow-label:
    textColor: '{colors.terracotta}'
    typography: '{typography.label}'
---

# Design System: Dillo Raju — Portfolio

## Overview

**Creative North Star: "The Field Notebook"**

This is a working engineer's notebook, not a marketing brochure: warm ledger-paper surfaces, a faint graph-paper grid ruled behind everything, and mono-set labels that read like margin annotations rather than UI chrome. Terracotta is the primary ink; teal and ochre are secondary pens reserved for annotation (tips, warnings) rather than decoration. The voice is technical, disciplined, and quiet — it earns credibility through precision and restraint, not through flourish. Nothing here is loud; the loudest elements are oversized black display type and a single warm accent, used sparingly.

Density stays moderate-to-generous: sections breathe with real whitespace, but content itself (body copy, lesson text, toolbox chips) sits close and information-dense within its own block, the way handwritten notes are compact even on a spacious page. Depth comes from layered translucency and texture, not from shadow — surfaces are flat panels of tinted, blurred paper floating over a subtly textured backdrop.

**Key Characteristics:**

- Warm, ink-on-paper palette (cream, terracotta, ink-black) with teal/ochre as annotation-only secondary colors
- A ruled grid + soft radial color blooms sit fixed behind every page, visible through translucent panels
- Mono type (JetBrains Mono) exclusively for labels, eyebrows, timestamps, and code — never for prose
- Inter carries all reading type, from massive black display headlines to body copy
- Flat, bordered, backdrop-blurred cards; shadow is reserved for floating chrome only (nav, mobile menu)
- Dark mode inverts the paper (near-black ground) and brightens the inks so the same notebook reads at night

## Colors

A ledger-paper palette: one warm neutral scale for surfaces and ink, one confident primary (terracotta), and two secondary "annotation" colors (teal, ochre) used narrowly and only in specific contexts.

### Primary

- **Terracotta** (`#b4432a`, dark mode `#ff8a5b`): the system's one voice. Used on interactive text/links, active nav state accents, primary button hover, "Note" callouts, and the `01`/`02`/`03` index marks on feature cards. Hover state deepens to **Terracotta Hover** (`#842f20`, dark mode `#ffb088`). **Terracotta Soft** (`#f0d7bd`, dark mode `#3a241b`) is the tint used for the background color bloom behind the page and for soft accent chips — never for text.

### Secondary

- **Teal** (`#226b5b`, dark mode `#7bd0b4`): reserved for "Tip" callouts in Guides content and one of the two guide-series accent colors. Its soft tint (`#c7ded2` / dark `#17382f`) shows up as the second radial bloom in the page background.
- **Ochre** (`#8a5a12`, dark mode `#e0b062`): reserved for "Watch out" callouts in Guides content. Its soft tint (`#f0e2c4` / dark `#3a2e18`) is the callout's background wash.

### Tertiary (diagram palette — non-semantic)

- **Diagram Plum** (`#7a3f6d`, dark mode `#d79ac8`) and **Diagram Indigo** (`#3d5a94`, dark mode `#93aee8`): part of a five-color categorical set (with Terracotta, Teal, and Ochre reused as the other three) used only inside Guides lesson diagrams to distinguish unrelated concepts. These two carry no meaning outside diagrams — do not promote them to UI chrome.

### Neutral

- **Paper** (`#f5f1e8`, dark mode `#12100d`): the page background — warm cream in light mode, near-black warm in dark mode.
- **Card** (`#fffaf0`, dark mode `#1d1914`): the surface color for panels, cards, and code blocks — slightly lighter than Paper in light mode so panels read as sheets sitting on the desk.
- **Ink** (`#17130f`, dark mode `#f4ead8`): primary text and the fill color for solid dark UI (primary buttons, the inverted CTA band, the "DR" nav mark).
- **Ink Muted** (`#6e6458`, dark mode `#b4a895`): secondary text — descriptions, metadata, timestamps, body copy in Guides.
- **Border** (`#d8cab8`, dark mode `#332b22`): the single border color used everywhere; also the line color for the background grid texture (mixed at 56% opacity).

### Named Rules

**The One Ink Rule.** Terracotta is the only color that appears on interactive, non-Guides UI. Teal and ochre exist solely to distinguish Guides callout types and diagram categories — introducing either into nav, buttons, or marketing sections breaks the ink-vs-annotation distinction the whole system depends on.

**The Translucent Paper Rule.** Card and panel backgrounds are never fully opaque against the textured page (`bg-paper/58` through `bg-paper/82` are the observed range) — the background texture must remain faintly visible through every surface. A fully opaque card reads as a foreign, un-textured element.

## Typography

**Display/Body Font:** Inter (with system-ui, sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace fallback)

**Character:** Inter carries the entire reading experience — from massive black (900-weight) display headlines down to 16px body copy — so hierarchy comes from scale and weight, not from switching typefaces. JetBrains Mono is reserved entirely for the "margin annotation" register: uppercase eyebrow labels, timestamps, nav sub-labels, toolbox tags, and code. The pairing is the notebook's two inks — a bold hand for headlines, a precise monospace hand for notes.

### Hierarchy

- **Display** (900, `clamp(2.25rem, 5vw, 4.5rem)` / up to `text-7xl` on hero, line-height 0.95, tracking tight): page-level H1s — homepage hero, section leads on About/Guides/Contact.
- **Headline** (900, `text-3xl`/`text-5xl` depending on context, tracking tight): section H2s within a page (e.g. "What I build with.", "Fifteen years shipping production software.").
- **Title** (700, `text-lg`–`text-xl`, tracking tight): card-level headings (experience entries, feature-card titles, lesson section headings).
- **Body** (400, 16–16.5px, line-height 1.7–1.75, `text-muted` color): paragraph copy everywhere, including Guides lesson prose.
- **Label** (400, 11–13px, JetBrains Mono, uppercase, tracking slightly open): eyebrow tags ("About", "Contact"), nav sub-label, footer copyright line, toolbox chips, callout kickers, code.

### Named Rules

**The Two-Register Rule.** Every piece of text is either a headline register (Inter, bold-to-black, tight tracking, mixed case) or a label register (JetBrains Mono, regular weight, uppercase, wider tracking). There is no intermediate "medium-weight sans" register — semibold Inter appears only on buttons and nav active-state, never as a heading style.

## Layout

Content lives inside a single `max-w-7xl` container with responsive gutters (`px-4` → `sm:px-6` → `lg:px-8`), the same container width used for the nav, main content, and footer so all three edges align down the page. Vertical rhythm between major sections is generous (`gap-16`–`gap-20` at the page level); within a card, spacing tightens (`gap-3`–`gap-6`).

Grids are used for peer content (feature cards: `sm:grid-cols-3`; focus-area tiles: `sm:grid-cols-2 lg:grid-cols-3`) and asymmetric two-column splits pair a short label/heading column against a wider content column (`lg:grid-cols-[0.72fr_1.28fr]` on About's Experience and Toolbox sections). CTA bands use an end-aligned split (`lg:grid-cols-[1fr_auto] lg:items-end`) — heading grows to fill, action stays a fixed-width anchor at the trailing edge.

Nav is sticky (`sticky top-0`) but floats inset from the viewport edge (`px-4 pt-4`) rather than spanning full-bleed, so it reads as a panel resting on the page rather than a fixed toolbar.

## Elevation & Depth

Flat by default. Cards, sections, and content panels carry no `box-shadow` — depth comes entirely from a 1px `border-border` outline plus `backdrop-blur` over the textured page background (translucent `bg-paper/NN` or `bg-card/NN`). Shadow is reserved specifically for chrome that visually floats above the content stack: the sticky nav bar and its mobile dropdown menu.

### Shadow Vocabulary

- **Floating chrome** (`box-shadow: 0 18px 60px rgba(23,19,15,0.08)`): a very soft, warm-tinted ambient shadow (tinted with the Ink color, not neutral black) used only on the sticky nav pill and the mobile menu panel — signals "this sits above the page," never used on in-flow content.

### Named Rules

**The Floating-Chrome-Only Rule.** If an element scrolls with the page, it gets border + blur, never shadow. Shadow is the one visual signal reserved for elements that break out of normal flow (sticky/floating), so introducing it elsewhere would blur that signal.

## Shapes

Two radius steps cover nearly everything: `rounded-lg` (12px) for cards, panels, sections, and code blocks; `rounded-md` (8px) for buttons and small interactive controls. Toolbox/tag chips use `rounded-full` for a pill silhouette that visually distinguishes "a tag" from "a card." Guides callouts use `rounded-r-lg` only (right corners rounded, left corners square) because the square left edge meets a colored left border — see Components.

Borders are a consistent 1px `border-border`, used on essentially every panel, button (secondary), input-like surface, and the background grid texture itself — the same hairline that structures cards also structures the page backdrop, tying foreground and background together.

## Components

### Buttons

- **Shape:** `rounded-md` (8px), consistent across all variants.
- **Primary:** Ink background, Paper text, `px-5 py-3`, `text-sm font-semibold`; hover shifts the fill to Terracotta. Used for the single highest-intent action per section (résumé download, primary CTA).
- **Secondary/Outline:** transparent-to-translucent Card background (`bg-paper/70`), `border-border`, Ink text; hover shifts both border and text to Terracotta. Used for the lower-intent companion action next to a primary button.
- **Inverse (on dark CTA bands):** Paper background, Ink text, hover to Terracotta Soft — the primary button's colors flipped, used only inside sections that themselves use an Ink/foreground background.

### Chips / Tags

- **Style:** `rounded-full`, `border-border`, translucent Card background (`bg-paper/72`), JetBrains Mono uppercase text at `text-xs`. No fill variant — chips are always outline-style, used to list skills/tools (Toolbox) without implying selectability.

### Cards / Containers

- **Corner Style:** `rounded-lg` (12px) uniformly.
- **Background:** translucent Card or Paper tint (`bg-paper/58` through `bg-paper/78`, `bg-card/70`), always with `backdrop-blur` so the page texture shows through.
- **Shadow Strategy:** none — see Elevation & Depth. Depth comes from the border + blur combination only.
- **Border:** 1px `border-border`, present on nearly every card.
- **Internal Padding:** `p-5`–`p-8` depending on card size, generous relative to card width.

### Callouts (Guides — signature component)

Three tones (Tip / Note / Watch out) sharing one shape: `bg-card/70`, `rounded-r-lg` (right corners only), a 2px left border in the tone color (Teal / Terracotta / Ochre respectively), `px-5 py-4`. A mono, uppercase, tone-colored kicker line ("Tip · [title]") sits above the callout body. This left-border-plus-square-corner treatment is the one place in the system a colored border carries semantic meaning rather than being purely structural — reserve it for this component; do not reuse the pattern elsewhere as generic card styling.

### Code

- **Inline:** Card background, Terracotta text, `border-border`, `rounded` (4px), mono, sized to `0.85em` of surrounding text.
- **Block:** Card background, `border-border`, `rounded-lg`, Ink text, mono at 13px, horizontally scrollable.

### Navigation

- **Style:** sticky, inset from viewport edge, floating pill (`rounded-lg`, `border-border`, `bg-paper/82`, `backdrop-blur-xl`, floating-chrome shadow).
- **Logo mark:** solid Ink square (`rounded-md`) holding "DR" in mono bold — the one place a solid (non-translucent) Ink fill is used as a badge rather than a text/button color.
- **Link states:** default is muted mono-weight text; active route gets a solid Ink pill (`bg-foreground text-background`) matching the primary button treatment; hover (inactive) shifts to Card background.
- **Mobile:** hamburger toggle reveals a dropdown panel sharing the same floating-chrome treatment as the main nav bar (rounded, bordered, blurred, shadowed).

## Do's and Don'ts

### Do:

- **Do** keep the page's fixed grid-and-bloom background visible through every card via translucency + blur — it's the notebook-paper texture the whole system sits on, not incidental decoration.
- **Do** use JetBrains Mono exclusively for the label register (eyebrows, tags, timestamps, code); never set body or heading copy in it.
- **Do** reserve Teal and Ochre for Guides callouts and diagram categories only; keep all other interactive UI to the Terracotta/Ink pairing.
- **Do** use border + backdrop-blur, not box-shadow, for any new in-flow panel or card.
- **Do** keep copy specific and outcome-based (named orgs, real numbers) rather than generic self-description, matching the existing voice.

### Don't:

- **Don't** introduce a second accent color into nav, buttons, or non-Guides marketing sections — Terracotta stays the system's one voice.
- **Don't** add box-shadow to in-flow content cards or sections; shadow is reserved for the sticky nav and its mobile menu only.
- **Don't** reuse the colored-left-border callout treatment as generic card styling outside Guides callouts — it's a signature component, not a default card variant.
- **Don't** set prose or headings in JetBrains Mono, or labels/eyebrows in Inter — the two-register split is load-bearing for the "notebook" read.
