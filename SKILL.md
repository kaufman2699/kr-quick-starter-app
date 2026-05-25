---
name: rapid-react-js
description: Scaffolds, builds, and deploys React + JavaScript (not TypeScript) single-page apps using Vite, Tailwind, and a pre-wired pipeline to Domo or GitHub Pages. Use this skill whenever the user wants to build a React app in JavaScript, mentions "starter kit," "boilerplate," "quick React app," "rapid prototyping," or wants to deploy a React app to Domo Custom Apps or GitHub Pages. Use it even when the user just describes a React-app idea (a dashboard, a CRUD tool, a viz) without explicitly asking for a starter kit — the goal of this skill is to let them skip the boilerplate. Do NOT use this skill for TypeScript projects, Next.js / SSR projects, React Native, or non-React frameworks.
---

# Rapid React (JS) Starter Kit

This skill helps you go from a user's app idea to a deployed React + JavaScript application with minimal friction. The user should never have to think about build config, manifest files, or deployment plumbing — your job is to handle all of that and let them focus on the problem they're solving.

## When to trigger

Use this skill when the user:
- Asks to build a React app, dashboard, internal tool, or data viz
- Mentions "starter kit," "boilerplate," "quick app," or "rapid prototype"
- Wants to deploy to Domo (as a Custom App) or GitHub Pages
- Describes an idea that maps cleanly to a single-page React app

Do **not** use this skill for: TypeScript projects, Next.js, React Native, server-rendered apps, or non-React frameworks. If the user asks for TypeScript specifically, tell them this skill is JS-only and ask whether they want to proceed in JS or skip the skill.

## Core principle

The template handles everything *around* the app. You handle the app itself. Concretely:

- **Edit freely**: `src/App.jsx`, `src/components/`, `src/hooks/`, `src/lib/` (except `domo.js`), `src/index.css`, `tailwind.config.js` (for theme tokens).
- **Do not touch** unless explicitly asked: `vite.config.js`, `scripts/`, `manifest.json`, `package.json` deps (you can *add* deps, don't remove the existing ones), `postcss.config.js`, ESLint config.

If the user asks for something that requires editing the "do not touch" list, do it — but explain what you're changing and why.

## Workflow

### Step 1: Scaffold (only if no project exists yet)

Check the current directory. If it's not already a project scaffolded from this template (look for `src/App.jsx` and our `scripts/deploy-domo.js`), scaffold one:

```bash
npx degit your-username/rapid-react-skill/template <app-name>
cd <app-name>
npm install
```

Replace `<app-name>` with a kebab-case name derived from what the user is building. If you're running inside an existing repo the user wants to use, ask them whether to scaffold into a subdirectory or skip scaffolding.

### Step 2: Understand the problem before writing code

Ask the user (or infer from context):
- What is the app *for*? Who uses it?
- What data does it need? Static, Domo dataset, external API?
- Roughly what does the UI need? (list view, dashboard, form, multi-page?)

Don't write code until you have a clear answer to the first two. If unclear, ask one focused question — don't waterfall a five-question survey.

### Step 3: Implement

Conventions to follow:

- **Components**: functional, hooks-based, `.jsx` extension. One component per file in `src/components/`. Default export, named the same as the file.
- **Styling**: Tailwind utility classes. If a style is reused 3+ times, extract a component or use `@apply` in `index.css` sparingly. Custom design tokens go in `tailwind.config.js` under `theme.extend`.
- **Data fetching**: use the included `useFetch` hook from `src/hooks/useFetch.js` for generic HTTP. For Domo datasets, use the helpers in `src/lib/domo.js`.
- **State**: `useState` / `useReducer` for local, `useContext` for app-wide. Don't reach for Redux unless the user explicitly asks.
- **Routing**: if more than one page is needed, install `react-router-dom` (`npm install react-router-dom`) and set up routes in `App.jsx`. Single-page apps don't need routing.

### Step 4: Show the user

Run `npm run dev`. The dev server lives on `http://localhost:5173`. Tell the user the URL and what they should see. If running headless (no browser), describe what the UI looks like so they can verify when they open it.

### Step 5: Deploy

Ask the user where to deploy — Domo or GitHub Pages. Don't assume.

**For Domo:**
```bash
npm run deploy:domo
```
Prerequisites: `ryuu-cli` installed globally and `domo login` completed. If the deploy script reports either is missing, walk the user through installation:
```bash
npm install -g ryuu-cli
domo login
```
The first deploy generates `manifest.json` automatically. See `references/domo-deployment.md` for advanced manifest options (datasets, OAuth scopes, sizing).

**For GitHub Pages:**
```bash
npm run deploy:gh
```
The script handles building and pushing to a `gh-pages` branch. The user must enable Pages in repo settings (source: `gh-pages` branch) one time.

## Reference files (load as needed)

- `references/domo-deployment.md` — Domo manifest fields, dataset wiring, sizing, common errors.
- `references/github-pages-deployment.md` — Pages config, custom domain, base URL pitfalls.
- `references/common-patterns.md` — Copy-paste recipes: fetch from Domo, forms, charts, tables, routing.
- `references/faq.md` — User troubleshooting (white screen, deploy fails, etc.)

## Things that commonly trip people up

- **Domo manifest `id`**: must be a stable UUID across deploys for the same app. The deploy script handles this — never regenerate it manually or you'll create a duplicate app in Domo.
- **GitHub Pages base path**: if the repo is at `user.github.io/repo-name`, `vite.config.js` needs `base: '/repo-name/'`. The GH Pages deploy script sets this automatically based on the `package.json` `name` field, but verify if the live site shows broken assets.
- **`.env` secrets**: the template's `.env.example` shows the expected vars. Never commit `.env`. Domo Custom Apps inject `window.domo` at runtime — no client-side secrets needed for Domo data access.
- **Platform-aware commands**: when telling the user to run shell commands, check whether they're on Windows. If so, use PowerShell-compatible syntax (`Remove-Item`, `Get-Content`, `Set-Content`, `Compress-Archive`) instead of `rm`, `sed`, `grep`, `zip`. The npm/npx/git commands work identically on all platforms. The deploy scripts themselves are cross-platform — they detect the OS and shell out correctly.

## When the user is done

Don't editorialize or summarize unprompted. Confirm the deploy succeeded, give them the live URL, and stop.
