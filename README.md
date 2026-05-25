# Rapid React Starter Kit

> Go from idea to deployed React app in three commands. JavaScript only — no TypeScript ceremony.

A starter kit + Claude skill that automates everything *around* your React app so you can focus on the actual problem: the UI, the data, the logic. Boilerplate, build config, manifest files, bundling, and deployment to Domo or GitHub Pages are all handled.

---

## ⚡ Quick start (3 commands)

```bash
npx degit kaufman2699/kr-quick-starter-app my-dashboard
cd rapid-react-skill/template && npm install
npm run dev
```

That's it. You now have a running React + Vite + Tailwind app at `http://localhost:5173`.

When you're done building, ship it:

```bash
npm run deploy:domo        # to Domo as a Custom App
# or
npm run deploy:gh          # to GitHub Pages
```

The deploy scripts handle building, generating `manifest.json`, zipping, and uploading. You don't write any of that.

> **Works on macOS, Linux, and Windows.** All commands shown above are cross-platform. Windows users: run them in **PowerShell** (not `cmd.exe`). See [PUBLISHING.md](PUBLISHING.md#troubleshooting-windows-specific) for Windows-specific tips.

### Prerequisites

- **Node.js 18+** ([install](https://nodejs.org/))
- **Git** ([install](https://git-scm.com/downloads))
- For Domo deploys: `npm install -g ryuu` then `domo login` (one-time)
- For GH Pages deploys: a GitHub repo with Pages enabled

---

## What you get

| Concern | Handled by |
|---|---|
| Build tool | Vite (instant HMR) |
| UI framework | React 18 + plain `.jsx` |
| Styling | Tailwind CSS, pre-configured |
| Linting/formatting | ESLint + Prettier |
| Data fetching | `useFetch` hook + Domo Data API helper |
| Domo manifest | Auto-generated on first deploy |
| Domo upload | One command via `ryuu-cli` |
| GitHub Pages deploy | One command via `gh-pages` |
| Environment variables | `.env.example` → `.env` pattern |

**What you write**: `src/App.jsx`, your components, your hooks. That's it.

---

## Use it with Claude (recommended)

This repo doubles as a [Claude skill](https://docs.claude.com). Install the skill and Claude will scaffold projects, write components against the template's conventions, and run the deploy commands for you.

### Install the skill in Claude.ai

1. Download `rapid-react-skill.skill` from the [latest release](../../releases).
2. In Claude.ai, go to **Settings → Capabilities → Skills → Upload skill**.
3. Drop the `.skill` file in.

Now ask Claude things like:
- *"Build me a sales dashboard with a line chart and a filterable table, then deploy it to Domo."*
- *"Scaffold a new React app called inventory-tracker and add a CRUD form for products."*

Claude will use this skill end-to-end.

### Install in Claude Code

Clone this repo into your Claude Code skills directory or point Claude at the `SKILL.md` directly.

---

## Deploying to Domo

### One-time setup

```bash
npm install -g ryuu
domo login       # log in with your Domo instance
```

### Every deploy

```bash
npm run deploy:domo
```

What happens behind the scenes:
1. `vite build` produces optimized output in `dist/`.
2. `scripts/deploy-domo.js` creates `manifest.json` if missing (UUID, name, sizing, mapping all auto-filled with sensible defaults).
3. The `dist/` folder is published via `domo publish`.
4. You get a link to your live app in Domo.

The first deploy will prompt for `Domo Instance URL` and `App name` — after that they're remembered.

See [`references/domo-deployment.md`](references/domo-deployment.md) for advanced options (datasets, OAuth scopes, custom sizing).

---

## Deploying to GitHub Pages

```bash
npm run deploy:gh
```

Make sure your repo's Pages source is set to the `gh-pages` branch in GitHub repo settings. Static-only — no API access.

---

## Project layout (what you get after scaffolding)

```
my-app/
├── src/
│   ├── App.jsx              ← edit this
│   ├── main.jsx
│   ├── index.css
│   ├── components/          ← your components
│   ├── hooks/               ← your hooks (useFetch included)
│   └── lib/
│       └── domo.js          ← Domo Data API helper
├── public/
├── scripts/                 ← deploy scripts (do not edit)
├── manifest.json            ← auto-generated on first deploy
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env.example
```

You should rarely (if ever) need to touch anything outside `src/`.

---

## Common patterns

See [`references/common-patterns.md`](references/common-patterns.md) for copy-pasteable recipes:
- Fetching from a Domo dataset
- Routing with React Router
- Forms with controlled inputs
- Charts with Recharts
- Loading + error states

---

## Why JavaScript and not TypeScript?

Because the goal is **velocity**. TypeScript is great in long-lived production codebases, but for the "idea → deployed app" loop this kit is designed for, JS removes a tier of friction (type errors, generic gymnastics, `tsconfig.json` debugging). If your project graduates to needing TS later, migrating is straightforward; the build chain supports it.

---

## Contributing

PRs welcome. Particularly useful additions:
- New deploy targets (Vercel, Netlify, Cloudflare Pages)
- Additional reference recipes in `references/common-patterns.md`
- Improvements to the Domo manifest auto-generator

---

## License

MIT
