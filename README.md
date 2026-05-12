# Surprise & Delight — Todos

A small **todo list** app used to walk through a **product design process** end to end, with **GitHub** as the hub for issues, branches, pull requests, and reviews.

The UI is vanilla HTML/CSS/JS dressed up in the **Surprise & Delight Café** brand identity (cream + pink + cocoa palette, hand-drawn cookie/mug/heart/cake iconography, scalloped footer). Tasks persist in the browser via **`localStorage`** so you can focus on workflow and collaboration instead of backend setup.

## What's in the design

- **Brand-led visual language** — Caveat script wordmark, Nunito body, soft cream background with pink/tan blobs, scalloped pink footer with the brand tagline.
- **Heart-shaped completion** — checkboxes are circular hearts that fill pink with a satisfying pop animation when ticked.
- **Progress ring + encouragement** — live "X of Y done" with a circular progress dial and rotating playful copy ("halfway there — treat time soon.").
- **Optional task tags** — `love` 💗, `sip` ☕ (quick), `treat` 🍪, `slice` 🍰 (big task) — each with its own color chip.
- **Filter tabs with counts** — All / Active / Done with live numeric badges.
- **Search** — instant filter, focusable from anywhere with `/`, clearable with `Esc`.
- **Inline edit** — click a task's text or the pencil icon to rename in place (Enter to save, Esc to cancel).
- **Clear-done + undo** — one-tap bulk clear of finished tasks; deleting a single task surfaces an undo toast for ~4.5s.
- **Smart empty states** — different copy for "no tasks", "no matches", "all caught up", "nothing finished yet".
- **Keyboard niceties** — `/` focuses search; `Esc` clears search; `Enter`/`Esc` while editing.
- **Accessibility** — ARIA labels, `aria-pressed` on checkboxes, visible focus rings, reduced-motion fallback.
- **Mobile-friendly** — responsive layout collapses the add row vertically on narrow screens.

## Why this repo exists

Use it to practice or demonstrate:

- Turning a rough idea into scoped work (issues, labels, milestones).
- Iterating in branches and opening pull requests for design and implementation feedback.
- Reviewing changes in GitHub’s diff and preview flows alongside product notes.

The app itself is intentionally minimal so the **process** stays front and center.

## Getting started
 
1. Clone the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the URL shown in the terminal (by default [http://localhost:5173](http://localhost:5173)).

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the Vite dev server      |
| `npm run build`    | Production build to `dist/`   |
| `npm run preview`  | Serve the production build     |
| `npm run lint`     | Run ESLint on the project      |

## Tech notes

- **Vite** for local dev and builds.
- **No framework** — static page (`index.html`) + `src/main.js` + `src/styles.css`.
- All brand artwork (logo, category icons, empty-state mug, scalloped footer) is inline SVG — no image files to ship.
- Fonts are loaded from Google Fonts: **Caveat** (display) and **Nunito** (body).
- Todo payload is JSON under the `localStorage` key `demo-design-repo-todos`. Older `{ id, text, done }` payloads are upgraded automatically on load (the optional `tag` and `createdAt` fields are tolerated as missing).
