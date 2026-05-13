# Todo list demo

A deliberately small **todo list** app used to walk through a **product design process** end to end, with **GitHub** as the hub for issues, branches, pull requests, and reviews.

The UI is plain HTML (form, list, buttons, checkboxes) with a little vanilla JavaScript. Tasks are stored in the browser with **`localStorage`**, so you can focus on workflow and collaboration instead of backend setup.

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

| Command           | Description                 |
| ----------------- | --------------------------- |
| `npm run dev`     | Start the Vite dev server   |
| `npm run build`   | Production build to `dist/` |
| `npm run preview` | Serve the production build  |
| `npm run lint`    | Run ESLint on the project   |

## Tech notes

- **Vite** for local dev and builds.
- **No framework** — static page plus `src/main.js`.
- Todo payload is JSON under the `localStorage` key `demo-design-repo-todos`.
