# {{APP_NAME}}

Built with the [rapid-react-skill](https://github.com/your-username/rapid-react-skill) starter.

## Develop

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build & Deploy

| Target | Command | Prereqs |
|---|---|---|
| Domo Custom App | `npm run deploy:domo` | `npm i -g ryuu-cli` then `domo login` |
| GitHub Pages | `npm run deploy:gh` | Set `package.json` `name` to your repo name |

Both commands handle building, manifest generation (Domo), and uploading.
You should not need to write any deploy plumbing.

## Project layout

- `src/App.jsx` — main app. Edit freely.
- `src/components/` — your components.
- `src/hooks/` — your hooks. `useFetch` is pre-built.
- `src/lib/domo.js` — Domo data API helpers.
- `tailwind.config.js` — design tokens.
- `scripts/` — deploy scripts (do not edit unless you know what you're doing).

## Notes

- This template uses **JavaScript**, not TypeScript, by design (velocity over types for prototyping).
- Tailwind is pre-wired. Use utility classes in JSX.
- For multi-page apps, install React Router: `npm install react-router-dom`.
